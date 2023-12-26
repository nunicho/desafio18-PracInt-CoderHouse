const Router = require("express").Router;
const router = Router();

const usersController = require("../controllers/users.controller.js");
const tiposDeError = require("../utils/tiposDeError.js");

//------------------------------------------------------------------------ PETICION GET

router.get("/", async (req, res) => {
  try {
    await usersController.getUsers(req, res);
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/:id", usersController.getUserById, (req, res) => {
  try {
    const usuarioDB = res.locals.usuarioDB;
    if (!usuarioDB) {
      return res.status(404).send("Usuario no encontrado");
    }
    res.header("Content-type", "application/json");
    res.status(200).json({ usuarioDB });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
/*
//------------------------------------------------------------------------ PETICION POST

router.post("/", async (req, res) => {
  try {
    await productosController.crearProducto(req, res);
  } catch (error) {
    res.status(500).json({ error: "Error inesperado", detalle: error.message });
  }
});

//------------------------------------------------------------------------ PETICION PUT

router.put("/:id", async (req, res) => {
  try {
    await productosController.editarProducto(req, res);
  } catch (error) {
    res.status(500).json({ error: "Error inesperado", detalle: error.message });
  }
});

//------------------------------------------------------------------------ PETICION DELETE

router.delete("/:id", async (req, res) => {
  try {
    await productosController.borrarProducto(req, res);
  } catch (error) {
    res.status(500).json({ error: "Error inesperado", detalle: error.message });
  }
});
*/
module.exports = router;
