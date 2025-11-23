const express = require('express');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const router = express.Router();

// AWS DynamoDB Configuration
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_DYNAMODB_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);
const TABLE_NAME = process.env.DYNAMODB_TABLE_VIDEOS || 'VideoMetadata';

// Helper functions
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// DynamoDB Functions
const saveVideoToDB = async (videoData) => {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: videoData,
  });
  await docClient.send(command);
  return videoData;
};

const getVideoFromDB = async (id) => {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: { id },
  });
  const response = await docClient.send(command);
  return response.Item;
};

const getAllVideosFromDB = async () => {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
  });
  const response = await docClient.send(command);
  return response.Items || [];
};

const updateVideoInDB = async (id, updates) => {
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.keys(updates).forEach((key, index) => {
    updateExpressions.push(`#attr${index} = :val${index}`);
    expressionAttributeNames[`#attr${index}`] = key;
    expressionAttributeValues[`:val${index}`] = updates[key];
  });

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });

  const response = await docClient.send(command);
  return response.Attributes;
};

const deleteVideoFromDB = async (id) => {
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { id },
  });
  await docClient.send(command);
};

// GET all videos
router.get('/', async (req, res) => {
  try {
    const videos = await getAllVideosFromDB();
    const { category, search } = req.query;

    let filtered = videos;

    if (category && category !== 'all') {
      filtered = filtered.filter(v => v.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(v =>
        v.title.toLowerCase().includes(searchLower) ||
        (v.description && v.description.toLowerCase().includes(searchLower))
      );
    }

    // Sort by upload date (newest first)
    filtered.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    console.error('DynamoDB Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET categories (must be before /:id route)
router.get('/meta/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'all', name: 'All' },
      { id: 'music', name: 'Music' },
      { id: 'gaming', name: 'Gaming' },
      { id: 'education', name: 'Education' },
      { id: 'entertainment', name: 'Entertainment' },
      { id: 'sports', name: 'Sports' },
      { id: 'news', name: 'News' },
      { id: 'tech', name: 'Technology' },
      { id: 'other', name: 'Other' }
    ]
  });
});

// GET single video
router.get('/:id', async (req, res) => {
  try {
    const video = await getVideoFromDB(req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    // Increment view count
    const updatedVideo = await updateVideoInDB(req.params.id, {
      views: (video.views || 0) + 1
    });

    res.json({ success: true, data: updatedVideo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create video
router.post('/', async (req, res) => {
  try {
    const { title, description, url, thumbnail, category, duration } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        error: 'Title and URL are required'
      });
    }

    const newVideo = {
      id: generateId(),
      title,
      description: description || '',
      url,
      thumbnail: thumbnail || 'https://via.placeholder.com/320x180?text=Video',
      category: category || 'other',
      duration: duration || '0:00',
      views: 0,
      likes: 0,
      dislikes: 0,
      channel: 'My Channel',
      uploadedAt: new Date().toISOString()
    };

    await saveVideoToDB(newVideo);
    res.status(201).json({ success: true, data: newVideo });
  } catch (error) {
    console.error('DynamoDB Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update video
router.put('/:id', async (req, res) => {
  try {
    const video = await getVideoFromDB(req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    const { title, description, url, thumbnail, category, duration } = req.body;

    const updates = {
      title: title || video.title,
      description: description !== undefined ? description : video.description,
      url: url || video.url,
      thumbnail: thumbnail || video.thumbnail,
      category: category || video.category,
      duration: duration || video.duration,
      updatedAt: new Date().toISOString()
    };

    const updatedVideo = await updateVideoInDB(req.params.id, updates);
    res.json({ success: true, data: updatedVideo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST like/dislike video
router.post('/:id/reaction', async (req, res) => {
  try {
    const { type } = req.body; // 'like' or 'dislike'
    const video = await getVideoFromDB(req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    let updates = {};
    if (type === 'like') {
      updates.likes = (video.likes || 0) + 1;
    } else if (type === 'dislike') {
      updates.dislikes = (video.dislikes || 0) + 1;
    }

    const updatedVideo = await updateVideoInDB(req.params.id, updates);
    res.json({ success: true, data: updatedVideo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE video
router.delete('/:id', async (req, res) => {
  try {
    const video = await getVideoFromDB(req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    await deleteVideoFromDB(req.params.id);
    res.json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
