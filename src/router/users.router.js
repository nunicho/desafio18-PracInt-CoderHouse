const Router = require("express").Router;
const router = Router();
const multer = require("multer");

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
    // Manejar la lógica de la subida del documento aquí, si es necesario
    console.log(req.file); // Detalles del archivo subido
    console.log(req.body); // Datos del formulario, si los hay

    // Llamar a la función en tu controlador para manejar la lógica específica
    await UsersController.handleDocumentUpload(req.params.id, req.file);

    res.status(200).send("Documento procesado correctamente");
  } catch (error) {
    console.error("Error al procesar el documento:", error);
    res.status(500).send("Error interno del servidor");
  }
});


// ---------------- PREMIUM ----------------------------///


const UsersController = require("../controllers/users.controller.js");
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