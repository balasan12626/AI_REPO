const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../data/items.json');

// Helper function to read items from file
const readItems = () => {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading items:', error);
    return [];
  }
};

// Helper function to write items to file
const writeItems = (items) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(items, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing items:', error);
    return false;
  }
};

// Generate unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// GET all items
router.get('/', (req, res) => {
  try {
    const items = readItems();
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single item by ID
router.get('/:id', (req, res) => {
  try {
    const items = readItems();
    const item = items.find(i => i.id === req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new item
router.post('/', (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    const items = readItems();
    const newItem = {
      id: generateId(),
      title,
      description: description || '',
      status: status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    items.push(newItem);
    writeItems(items);

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update item
router.put('/:id', (req, res) => {
  try {
    const items = readItems();
    const index = items.findIndex(i => i.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    const { title, description, status } = req.body;
    items[index] = {
      ...items[index],
      title: title || items[index].title,
      description: description !== undefined ? description : items[index].description,
      status: status || items[index].status,
      updatedAt: new Date().toISOString()
    };

    writeItems(items);
    res.json({ success: true, data: items[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE item
router.delete('/:id', (req, res) => {
  try {
    const items = readItems();
    const index = items.findIndex(i => i.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    const deletedItem = items.splice(index, 1)[0];
    writeItems(items);

    res.json({ success: true, data: deletedItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
