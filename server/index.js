const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("./config/config");
const fileRoutes = require("./routes/fileRoutes");

const app = express();

// CORS - just allow everything for now
app.use(cors({ 
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use("/uploads", express.static(config.UPLOAD_DIR));

app.use("/api/files", fileRoutes);

app.listen(config.PORT, () => console.log(`🚀 Server running on port ${config.PORT}`));
