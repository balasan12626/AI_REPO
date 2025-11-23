const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../data/videos.json');

// Helper functions
const readVideos = () => {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading videos:', error);
    return [];
  }
};

const writeVideos = (videos) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(videos, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing videos:', error);
    return false;
  }
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// GET all videos
router.get('/', (req, res) => {
  try {
    const videos = readVideos();
    const { category, search } = req.query;

    let filtered = videos;

    if (category && category !== 'all') {
      filtered = filtered.filter(v => v.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(v =>
        v.title.toLowerCase().includes(searchLower) ||
        v.description.toLowerCase().includes(searchLower)
      );
    }

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single video
router.get('/:id', (req, res) => {
  try {
    const videos = readVideos();
    const video = videos.find(v => v.id === req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    // Increment view count
    video.views = (video.views || 0) + 1;
    writeVideos(videos);

    res.json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create video
router.post('/', (req, res) => {
  try {
    const { title, description, url, thumbnail, category, duration } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        error: 'Title and URL are required'
      });
    }

    const videos = readVideos();
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

    videos.unshift(newVideo);
    writeVideos(videos);

    res.status(201).json({ success: true, data: newVideo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update video
router.put('/:id', (req, res) => {
  try {
    const videos = readVideos();
    const index = videos.findIndex(v => v.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    const { title, description, url, thumbnail, category, duration } = req.body;
    videos[index] = {
      ...videos[index],
      title: title || videos[index].title,
      description: description !== undefined ? description : videos[index].description,
      url: url || videos[index].url,
      thumbnail: thumbnail || videos[index].thumbnail,
      category: category || videos[index].category,
      duration: duration || videos[index].duration,
      updatedAt: new Date().toISOString()
    };

    writeVideos(videos);
    res.json({ success: true, data: videos[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST like/dislike video
router.post('/:id/reaction', (req, res) => {
  try {
    const { type } = req.body; // 'like' or 'dislike'
    const videos = readVideos();
    const video = videos.find(v => v.id === req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    if (type === 'like') {
      video.likes = (video.likes || 0) + 1;
    } else if (type === 'dislike') {
      video.dislikes = (video.dislikes || 0) + 1;
    }

    writeVideos(videos);
    res.json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE video
router.delete('/:id', (req, res) => {
  try {
    const videos = readVideos();
    const index = videos.findIndex(v => v.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    const deletedVideo = videos.splice(index, 1)[0];
    writeVideos(videos);

    res.json({ success: true, data: deletedVideo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET categories
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

module.exports = router;
