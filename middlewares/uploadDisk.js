const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Safely ensure the target directory exists
const uploadDir = path.join(__dirname, "../static/uploads/prescriptions");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `prescription_${req.userId || 'guest'}_${Date.now()}${ext}`);
  }
});

const uploadDisk = multer({ storage: storage });
module.exports = uploadDisk;
