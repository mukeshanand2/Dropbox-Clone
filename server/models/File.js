const mongoose = require("mongoose");

//TODO: migrate to MongoDB instead of JSON storage
const fileSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  mimetype: String,
  size: Number,
  path: String,
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("File", fileSchema);