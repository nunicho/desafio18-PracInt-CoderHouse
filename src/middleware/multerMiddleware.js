const multer = require("multer");

const storageDocuments = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/documents");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const storageProducts = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/products");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now()+ "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const storageProfiles = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/profiles");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const uploadDocuments = multer({ storage: storageDocuments });
const uploadProducts = multer({ storage: storageProducts });
const uploadProfiles = multer({ storage: storageProfiles });

module.exports = {
  uploadDocuments,
  uploadProducts,
  uploadProfiles,
};
