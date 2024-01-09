const Router = require("express").Router;
const router = Router();
const multer = require("multer");
const UsersController = require("../controllers/users.controller.js");


// ---------------- MULTER ----------------------------///

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
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
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


router.post("/:id/documents", uploadDocuments.single("foto"), async (req, res) => {
  try {
    const userId = req.params.id;
    const file = req.file;

    const updatedUser = await UsersController.handleDocumentUpload(
      userId,
      file
    );

    res
      .status(200)
      .json({ message: "Documento subido exitosamente", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post("/:id/documents/products", uploadProducts.single("foto"), async (req, res) => {
  try {
    const userId = req.params.id;
    const file = req.file;

    const updatedUser = await UsersController.handleProductUpload(
      userId,
      file
    );

    res
      .status(200)
      .json({ message: "Producto subido exitosamente", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post("/:id/documents/profiles", uploadProfiles.single("foto"), async (req, res) => {
    try {
      const userId = req.params.id;
      const file = req.file;

      const updatedUser = await UsersController.handleProductUpload(
        userId,
        file
      );

      res
        .status(200)
        .json({ message: "Profile subido exitosamente", user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ---------------- PREMIUM ----------------------------///



router.get("/premium/:id", UsersController.getUserRoleById);

router.post("/premium/:id/changeRole", UsersController.changeUserRole);


module.exports = router;


/*
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/"); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/:id/documents", upload.single("foto"), async (req, res) => {
  try {
    const userId = req.params.id;
    const file = req.file;

    const updatedUser = await UsersController.handleDocumentUpload(userId, file);

    res.status(200).json({ message: "Documento subido exitosamente", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/