const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const router = express.Router();

const dataPath = path.join(__dirname, '../data/files.json');

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

// Multer configuration for memory storage (for S3 upload)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Helper functions
const readFiles = () => {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading files:', error);
    return [];
  }
};

const writeFiles = (files) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(files, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing files:', error);
    return false;
  }
};

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

// Upload file to S3
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

// Delete file from S3
const deleteFromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
};

// Get signed URL for private file access
const getSignedDownloadUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour expiry
};

// GET all files and folders
router.get('/', (req, res) => {
  try {
    const files = readFiles();
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
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET file/folder by ID
router.get('/:id', (req, res) => {
  try {
    const files = readFiles();
    const file = files.find(f => f.id === req.params.id);

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
    const files = readFiles();
    const file = files.find(f => f.id === req.params.id);

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
router.post('/folder', (req, res) => {
  try {
    const { name, parentId } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Folder name is required' });
    }

    const files = readFiles();
    const newFolder = {
      id: generateId(),
      name,
      type: 'folder',
      parentId: parentId || 'root',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    files.push(newFolder);
    writeFiles(files);

    res.status(201).json({ success: true, data: newFolder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST upload file to S3
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { parentId } = req.body;
    const files = readFiles();

    // Generate unique S3 key
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const s3Key = `uploads/${uniqueSuffix}-${req.file.originalname}`;

    // Upload to S3
    const s3Url = await uploadToS3(req.file, s3Key);

    const newFile = {
      id: generateId(),
      name: req.file.originalname,
      type: 'file',
      fileType: getFileType(req.file.originalname),
      size: req.file.size,
      sizeFormatted: formatFileSize(req.file.size),
      s3Key: s3Key,
      s3Url: s3Url,
      path: s3Url, // For backward compatibility
      parentId: parentId || 'root',
      mimeType: req.file.mimetype,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    files.push(newFile);
    writeFiles(files);

    res.status(201).json({ success: true, data: newFile });
  } catch (error) {
    console.error('S3 Upload Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT rename file/folder
router.put('/:id', (req, res) => {
  try {
    const { name } = req.body;
    const files = readFiles();
    const index = files.findIndex(f => f.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    files[index].name = name || files[index].name;
    files[index].updatedAt = new Date().toISOString();

    writeFiles(files);
    res.json({ success: true, data: files[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT move file/folder
router.put('/:id/move', (req, res) => {
  try {
    const { parentId } = req.body;
    const files = readFiles();
    const index = files.findIndex(f => f.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    files[index].parentId = parentId || 'root';
    files[index].updatedAt = new Date().toISOString();

    writeFiles(files);
    res.json({ success: true, data: files[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE file/folder
router.delete('/:id', async (req, res) => {
  try {
    const files = readFiles();
    const index = files.findIndex(f => f.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    const deletedFile = files[index];

    // If it's a file with S3 key, delete from S3
    if (deletedFile.s3Key) {
      try {
        await deleteFromS3(deletedFile.s3Key);
      } catch (s3Error) {
        console.error('S3 Delete Error:', s3Error);
        // Continue even if S3 delete fails
      }
    }

    // If it's a folder, delete all children
    if (deletedFile.type === 'folder') {
      const deleteChildren = async (parentId) => {
        const children = files.filter(f => f.parentId === parentId);
        for (const child of children) {
          if (child.type === 'folder') {
            await deleteChildren(child.id);
          }
          // Delete from S3 if it has an S3 key
          if (child.s3Key) {
            try {
              await deleteFromS3(child.s3Key);
            } catch (s3Error) {
              console.error('S3 Delete Error:', s3Error);
            }
          }
          const childIndex = files.findIndex(f => f.id === child.id);
          if (childIndex !== -1) files.splice(childIndex, 1);
        }
      };
      await deleteChildren(deletedFile.id);
    }

    files.splice(index, 1);
    writeFiles(files);

    res.json({ success: true, data: deletedFile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET breadcrumb path
router.get('/:id/path', (req, res) => {
  try {
    const files = readFiles();
    const breadcrumb = [];

    let currentId = req.params.id;
    while (currentId && currentId !== 'root') {
      const folder = files.find(f => f.id === currentId);
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
