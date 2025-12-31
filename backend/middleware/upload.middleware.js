const multer = require("multer");

const storage = multer.memoryStorage(); // שמירת הקבצים בזיכרון לפני העיבוד

  const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('קובץ לא תקין. רק תמונות JPEG, PNG, WebP, GIF'), false);
    }
  };

  const upload = multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
      files: 1
    },
    fileFilter
  });

  module.exports = upload;
