const path = require("path");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// file types we can preview
const TEXT_MIME_TYPES = [
  "text/",
  "application/json",
  "application/javascript",
  "application/x-javascript",
  "application/xml",
  "application/x-sh",
  "application/x-csh",
  "application/x-python",
];

const TEXT_EXTENSIONS = [
  ".txt", ".js", ".jsx", ".ts", ".tsx", ".json", ".xml", ".html", ".htm",
  ".css", ".scss", ".sass", ".less", ".md", ".markdown", ".yml", ".yaml",
  ".csv", ".log", ".conf", ".config", ".env", ".gitignore", ".gitattributes",
  ".sh", ".bash", ".zsh", ".fish", ".py", ".rb", ".java", ".c", ".cpp",
  ".h", ".hpp", ".php", ".sql", ".vue", ".svelte", ".go", ".rs", ".swift",
  ".kt", ".dart", ".lua", ".pl", ".r", ".m", ".mm", ".gradle", ".properties",
];

const IMAGE_EXTENSIONS = [
  ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg", ".ico",
  ".tiff", ".tif", ".avif", ".heic", ".heif",
];

const PREVIEWABLE_MIME_TYPES = [
  "image/",
  "text/",
  "application/json",
  "application/javascript",
  "application/x-javascript",
  "application/xml",
  "application/x-sh",
  "application/x-csh",
  "application/x-python",
  "application/pdf",
  "video/",
  "audio/",
];

const isTextFile = (mimetype, ext) => {
  const isTextMime = TEXT_MIME_TYPES.some(mime => mimetype?.includes(mime));
  const isTextExt = TEXT_EXTENSIONS.includes(ext);
  return isTextMime || isTextExt;
};

const isPreviewableFile = (mimetype) => {
  return PREVIEWABLE_MIME_TYPES.some(mime => mimetype?.includes(mime));
};

const config = {
  PORT: process.env.PORT || 5000,
  UPLOAD_DIR: UPLOAD_DIR,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  TEXT_MIME_TYPES: TEXT_MIME_TYPES,
  TEXT_EXTENSIONS: TEXT_EXTENSIONS,
  IMAGE_EXTENSIONS: IMAGE_EXTENSIONS,
  PREVIEWABLE_MIME_TYPES: PREVIEWABLE_MIME_TYPES,
  isTextFile: isTextFile,
  isPreviewableFile: isPreviewableFile,
};

module.exports = config;