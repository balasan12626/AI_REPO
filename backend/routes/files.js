const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();

const dataPath = path.join(__dirname, '../data/files.json');
const uploadsDir = path.join(__dirname, '../uploads');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

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

// POST upload file
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { parentId } = req.body;
    const files = readFiles();

    const newFile = {
      id: generateId(),
      name: req.file.originalname,
      type: 'file',
      fileType: getFileType(req.file.originalname),
      size: req.file.size,
      sizeFormatted: formatFileSize(req.file.size),
      path: `/uploads/${req.file.filename}`,
      parentId: parentId || 'root',
      mimeType: req.file.mimetype,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    files.push(newFile);
    writeFiles(files);

    res.status(201).json({ success: true, data: newFile });
  } catch (error) {
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
router.delete('/:id', (req, res) => {
  try {
    const files = readFiles();
    const index = files.findIndex(f => f.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    const deletedFile = files[index];

    // If it's a file with a physical file, delete it
    if (deletedFile.path) {
      const filePath = path.join(__dirname, '..', deletedFile.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // If it's a folder, delete all children
    if (deletedFile.type === 'folder') {
      const deleteChildren = (parentId) => {
        const children = files.filter(f => f.parentId === parentId);
        children.forEach(child => {
          if (child.type === 'folder') {
            deleteChildren(child.id);
          }
          if (child.path) {
            const childPath = path.join(__dirname, '..', child.path);
            if (fs.existsSync(childPath)) {
              fs.unlinkSync(childPath);
            }
          }
          const childIndex = files.findIndex(f => f.id === child.id);
          if (childIndex !== -1) files.splice(childIndex, 1);
        });
      };
      deleteChildren(deletedFile.id);
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
