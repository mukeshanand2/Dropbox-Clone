const express = require("express");
const multer = require("multer");
const config = require("../config/config");
const { uploadFile, getFiles, downloadFile, viewFile, deleteFileHandler } = require("../controllers/fileController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), uploadFile);
router.get("/", getFiles);
router.get("/:id/download", downloadFile);
router.get("/:id/view", viewFile);
router.delete("/:id", deleteFileHandler);

module.exports = router;