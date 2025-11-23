const express = require('express');
const path = require('path');
const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const router = express.Router();

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

// AWS DynamoDB Configuration
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_DYNAMODB_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);
const TABLE_NAME = process.env.DYNAMODB_TABLE_FILES || 'FileMetadata';

// Multer configuration for memory storage (for S3 upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Helper functions
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const getFileType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const typeMap = {
    '.pdf': 'pdf',
    '.doc': 'document',
    '.docx': 'document',
    '.txt': 'document',
    '.xls': 'spreadsheet',
    '.xlsx': 'spreadsheet',
    '.csv': 'spreadsheet',
    '.ppt': 'presentation',
    '.pptx': 'presentation',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.png': 'image',
    '.gif': 'image',
    '.svg': 'image',
    '.mp4': 'video',
    '.avi': 'video',
    '.mov': 'video',
    '.mp3': 'audio',
    '.wav': 'audio',
    '.zip': 'archive',
    '.rar': 'archive',
    '.7z': 'archive',
    '.js': 'code',
    '.ts': 'code',
    '.py': 'code',
    '.html': 'code',
    '.css': 'code',
    '.json': 'code'
  };
  return typeMap[ext] || 'other';
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// S3 Functions
const uploadToS3 = async (file, key) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });
  await s3Client.send(command);
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

const deleteFromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  await s3Client.send(command);
};

const getSignedDownloadUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

// DynamoDB Functions
const saveFileToDB = async (fileData) => {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: fileData,
  });
  await docClient.send(command);
  return fileData;
};

const getFileFromDB = async (id) => {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: { id },
  });
  const response = await docClient.send(command);
  return response.Item;
};

const getAllFilesFromDB = async () => {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
  });
  const response = await docClient.send(command);
  return response.Items || [];
};

const updateFileInDB = async (id, updates) => {
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

const deleteFileFromDB = async (id) => {
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { id },
  });
  await docClient.send(command);
};

// GET all files and folders
router.get('/', async (req, res) => {
  try {
    const files = await getAllFilesFromDB();
    const { folderId, search, type } = req.query;

    let filtered = files;

    // Filter by parent folder
    if (folderId) {
      filtered = filtered.filter(f => f.parentId === folderId);
    } else {
      filtered = filtered.filter(f => !f.parentId || f.parentId === 'root');
    }

    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = files.filter(f => f.name.toLowerCase().includes(searchLower));
    }

    // Filter by type
    if (type && type !== 'all') {
      filtered = filtered.filter(f => f.type === type || f.fileType === type);
    }

    // Sort: folders first, then by name
    filtered.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    console.error('DynamoDB Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET file/folder by ID
router.get('/:id', async (req, res) => {
  try {
    const file = await getFileFromDB(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    res.json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET download URL for file
router.get('/:id/download', async (req, res) => {
  try {
    const file = await getFileFromDB(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    if (file.type === 'folder') {
      return res.status(400).json({ success: false, error: 'Cannot download a folder' });
    }

    // Generate signed URL for download
    const signedUrl = await getSignedDownloadUrl(file.s3Key);
    res.json({ success: true, data: { url: signedUrl } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create folder
router.post('/folder', async (req, res) => {
  try {
    const { name, parentId } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Folder name is required' });
    }

    const newFolder = {
      id: generateId(),
      name,
      type: 'folder',
      parentId: parentId || 'root',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveFileToDB(newFolder);
    res.status(201).json({ success: true, data: newFolder });
  } catch (error) {
    console.error('DynamoDB Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST upload file to S3 and save metadata to DynamoDB
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { parentId } = req.body;

    // Generate unique S3 key
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const s3Key = `uploads/${uniqueSuffix}-${req.file.originalname}`;

    // Upload to S3
    const s3Url = await uploadToS3(req.file, s3Key);

    // Save metadata to DynamoDB
    const newFile = {
      id: generateId(),
      name: req.file.originalname,
      type: 'file',
      fileType: getFileType(req.file.originalname),
      size: req.file.size,
      sizeFormatted: formatFileSize(req.file.size),
      s3Key: s3Key,
      s3Url: s3Url,
      path: s3Url,
      parentId: parentId || 'root',
      mimeType: req.file.mimetype,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveFileToDB(newFile);
    res.status(201).json({ success: true, data: newFile });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT rename file/folder
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const file = await getFileFromDB(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    const updatedFile = await updateFileInDB(req.params.id, {
      name: name || file.name,
      updatedAt: new Date().toISOString()
    });

    res.json({ success: true, data: updatedFile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT move file/folder
router.put('/:id/move', async (req, res) => {
  try {
    const { parentId } = req.body;
    const file = await getFileFromDB(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    const updatedFile = await updateFileInDB(req.params.id, {
      parentId: parentId || 'root',
      updatedAt: new Date().toISOString()
    });

    res.json({ success: true, data: updatedFile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE file/folder
router.delete('/:id', async (req, res) => {
  try {
    const file = await getFileFromDB(req.params.id);

    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // If it's a file with S3 key, delete from S3
    if (file.s3Key) {
      try {
        await deleteFromS3(file.s3Key);
      } catch (s3Error) {
        console.error('S3 Delete Error:', s3Error);
      }
    }

    // If it's a folder, delete all children
    if (file.type === 'folder') {
      const allFiles = await getAllFilesFromDB();
      const deleteChildren = async (parentId) => {
        const children = allFiles.filter(f => f.parentId === parentId);
        for (const child of children) {
          if (child.type === 'folder') {
            await deleteChildren(child.id);
          }
          if (child.s3Key) {
            try {
              await deleteFromS3(child.s3Key);
            } catch (s3Error) {
              console.error('S3 Delete Error:', s3Error);
            }
          }
          await deleteFileFromDB(child.id);
        }
      };
      await deleteChildren(file.id);
    }

    await deleteFileFromDB(req.params.id);
    res.json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET breadcrumb path
router.get('/:id/path', async (req, res) => {
  try {
    const allFiles = await getAllFilesFromDB();
    const breadcrumb = [];

    let currentId = req.params.id;
    while (currentId && currentId !== 'root') {
      const folder = allFiles.find(f => f.id === currentId);
      if (folder) {
        breadcrumb.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentId;
      } else {
        break;
      }
    }

    res.json({ success: true, data: breadcrumb });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
