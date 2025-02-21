const express = require('express');
const path = require('path');
const { convertToFileSystem } = require('./utils/fileConverter');
const cors = require('cors');

const app = express();

// Configure CORS to allow all origins and methods
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const ROOT_PATH = path.resolve(__dirname, '../vue-file-manager');

// Existing files listing API
app.get('/api/files', (req, res) => {
  try {
    const fileSystem = convertToFileSystem(ROOT_PATH);
    res.json(fileSystem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New download API
app.get('/api/download', (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const fullPath = path.join(ROOT_PATH, filePath);

    // Security check to prevent directory traversal
    if (!fullPath.startsWith(ROOT_PATH)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.download(fullPath, path.basename(fullPath), (err) => {
      if (err) {
        res.status(404).json({ error: 'File not found' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});