const fs = require("fs");
const path = require("path");
const config = require("../config/config");
const { getAllFiles, getFileById, saveFile, deleteFile } = require("../utils/fileStorage");

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const fileData = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    };
    
    const savedFile = saveFile(fileData);
    res.json({ message: "File uploaded successfully", file: savedFile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFiles = async (req, res) => {
  try {
    const files = getAllFiles();
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const downloadFile = async (req, res) => {
  try {
    const file = getFileById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    const filePath = path.resolve(file.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on disk" });
    }
    res.download(filePath, file.originalname);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Determine how to serve the file based on its type
const getFileServingStrategy = (mimetype, ext) => {
  const isText = config.isTextFile(mimetype, ext);
  const isImage = mimetype?.startsWith("image/");
  
  return {
    encoding: isText ? "utf8" : null,
    contentType: mimetype || (isText ? "text/plain" : "application/octet-stream"),
    charset: isText ? "; charset=utf-8" : "",
  };
};

const viewFile = async (req, res) => {
  try {
    const file = getFileById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    
    const filePath = path.resolve(file.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on disk" });
    }

    const ext = path.extname(file.originalname || "").toLowerCase();
    const mimetype = file.mimetype || "";

    if (!config.isPreviewableFile(mimetype)) {
      return res.status(400).json({ 
        error: "Cannot preview this file type. Supported types: images, text files, PDF, video, and audio files." 
      });
    }

    try {
      const strategy = getFileServingStrategy(mimetype, ext);
      const contentType = strategy.contentType + strategy.charset;
      
      if (strategy.encoding === "utf8") {
        const data = fs.readFileSync(filePath, strategy.encoding);
        res.setHeader("Content-Type", contentType);
        res.send(data);
      } else {
        const fileBuffer = fs.readFileSync(filePath);
        res.type(contentType);
        res.setHeader("Content-Length", fileBuffer.length);
        res.send(fileBuffer);
      }
    } catch (readErr) {
      res.status(400).json({ 
        error: `Cannot read file: ${readErr.message}` 
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteFileHandler = async (req, res) => {
  try {
    const file = getFileById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const deleted = deleteFile(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "File not found in storage" });
    }

    // also delete the actual file
    const filePath = path.resolve(file.path);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.error("Error deleting file from disk:", unlinkErr);
      }
    }

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { uploadFile, getFiles, downloadFile, viewFile, deleteFileHandler };