const Router = require("express").Router;
const router = Router();
const multer = require("multer");
const UsersController = require("../controllers/users.controller.js");

// ---------------- MULTER ----------------------------///

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/"); // Asegúrate de tener un directorio 'uploads' en tu proyecto
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Ruta para subir documentos
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


// ---------------- PREMIUM ----------------------------///



router.get("/premium/:id", UsersController.getUserRoleById);

router.post("/premium/:id/changeRole", UsersController.changeUserRole);


module.exports = router;


/*
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const uploadConStorage = multer({ storage: storage });

router.post("/:id/documents", uploadConStorage.single("foto"), (req, res) => {
  // req.file is the `avatar` file
  console.log(req.file);

  res.status(200).send("Imagen procesada");
});

*/