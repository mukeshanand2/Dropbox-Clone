const fs = require("fs");
const path = require("path");

const STORAGE_FILE = path.join(__dirname, "..", "data", "files.json");

// make sure data dir exists
const dataDir = path.dirname(STORAGE_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(STORAGE_FILE)) {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify([], null, 2));
}

const readFiles = () => {
  try {
    const data = fs.readFileSync(STORAGE_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const writeFiles = (files) => {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(files, null, 2));
};

const getAllFiles = () => {
  // newest first
  return readFiles().sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
};

const getFileById = (id) => {
  const files = readFiles();
  return files.find(f => f._id === id);
};

const saveFile = (fileData) => {
  const files = readFiles();
  const newFile = {
    _id: fileData._id || Date.now().toString(),
    filename: fileData.filename,
    originalname: fileData.originalname,
    mimetype: fileData.mimetype,
    size: fileData.size,
    path: fileData.path,
    uploadedAt: fileData.uploadedAt || new Date().toISOString(),
  };
  files.push(newFile);
  writeFiles(files);
  return newFile;
};

const deleteFile = (id) => {
  const files = readFiles();
  const filtered = files.filter(f => f._id !== id);
  writeFiles(filtered);
  return files.length !== filtered.length;
};

module.exports = {
  getAllFiles,
  getFileById,
  saveFile,
  deleteFile,
};

