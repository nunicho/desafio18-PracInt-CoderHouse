const mongoose = require("mongoose");
const UsersRepository = require("../dao/repository/users.repository")
const UsuarioModelo = require("../dao/DB/models/users.modelo.js")

// DOTENV
const config = require("../config/config.js");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const CustomError = require("../utils/customError.js");
const tiposDeError = require("../utils/tiposDeError.js");

/*
const createUser = async (req, res) => {
  const userData = req.body;
  try {
    const user = await UsersRepository.createUser(userData);
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al crear usuario" });
  }
};
*/

const createUser = async (userData) => {
  try {
    const user = await UsersRepository.createUser(userData);
    return user;
  } catch (error) {
    throw new CustomError(
      "ERROR_CREAR_USUARIO",
      "Error al crear usuario",
      tiposDeError.ERROR_INTERNO_SERVIDOR,
      error.message
    );
  }
};


const getUserByEmail = async (email) => {
  try {
    const user = await UsersRepository.getUserByEmail(email);
    return user;
  } catch (error) {
    throw new CustomError(
      "ERROR_OBTENER_USUARIO",
      "Error al obtener usuario por correo electrónico",
      tiposDeError.ERROR_INTERNO_SERVIDOR,
      error.message
    );
  }
}

const getUserById = async (req, res, next) => {
  try {
    let id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new CustomError(
        "ERROR_DATOS",
        "ID inválido",
        tiposDeError.ERROR_DATOS,
        "El id proporcionado no es válido"
      );
    let usuarioDB = await UsersRepository.getUserById(id);
    if (!usuarioDB)
      throw new CustomError(
        "USUARIO_NO_ENCONTRADO",
        "Usuario no encontrado",
        tiposDeError.USUARIO_NO_ENCONTRADO,
        `El Usuario con ID ${id} no existe.`
      );

    res.locals.usuarioDB = usuarioDB;
    next();
  } catch (error) {
    res.status(tiposDeError.ERROR_INTERNO_SERVIDOR).json({
      mensaje: "Error interno del servidor",
    });
  }
};


const getUsers = async (req, res) => {
  try {
    const users = await UsersRepository.getUsers();
    res.status(200).json(users);
  } catch (error)  {
    throw new CustomError(
      "ERROR_OBTENER_USUARIOS",
      "Error al obtener usuarios",
      tiposDeError.ERROR_INTERNO_SERVIDOR,
      error.message
    );
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userData = req.body;
    const updatedUser = await UsersRepository.updateUser(userId, userData);
    if (!updatedUser) {
      throw new CustomError(
        "USUARIO_NO_ENCONTRADO",
        "Usuario no encontrado",
        tiposDeError.ERROR_RECURSO_NO_ENCONTRADO,
        `No se encontró un usuario con ID ${userId}`
      );
    } else {
      res.status(200).json(updatedUser);
    }
  } catch (error) {
    throw new CustomError(
      "ERROR_ACTUALIZAR_USUARIO",
      "Error al actualizar usuario",
      tiposDeError.ERROR_INTERNO_SERVIDOR,
      error.message
    );
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    await UsersRepository.deleteUser(userId);
    res.status(204).end();
  } catch (error) {
    throw new CustomError(
      "ERROR_ELIMINAR_USUARIO",
      "Error al eliminar usuario",
      tiposDeError.ERROR_INTERNO_SERVIDOR,
      error.message
    );
  }
};

const secret = config.SECRET;


const updatePassword = async (req, res) => {
  try {
    const token = req.params.token;
    const newPassword = req.body.newPassword;
    let errorMessage = null;

    const decodedToken = jwt.verify(token, secret);

if (decodedToken.exp < Date.now() / 1000) {
      errorMessage = "Error al actualizar la contraseña. - Token expirado";
      return res.redirect('/forgotPassword');
    }
    const user = await UsersRepository.getUserByEmail(decodedToken.email);

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      throw new CustomError(
        "CONTRASENA_ANTIGUA",
        "Contraseña igual a la actual",
        tiposDeError.ERROR_NO_AUTORIZADO,
        "La nueva contraseña no puede ser igual a la contraseña actual."
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.reset_password_token = null;
    user.reset_password_expires = null;

    await user.save();

    res.status(200).send("Contraseña actualizada correctamente.");
  } catch (error) {
    if (error.name === "TOKEN_EXPIRADO") {
      res
        .status(400)
        .send("Error al actualizar la contraseña. - Token expirado");
    } else if (error.name === "CONTRASENA_ANTIGUA") {
      res
        .status(400)
        .send("La nueva contraseña no puede ser igual a la contraseña actual.");
    } else {
      console.error(error);
      res.status(400).send("Error al actualizar la contraseña.");
    }
  }
};

const toggleUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { newRole } = req.body;

    if (!["user", "premium"].includes(newRole)) {
      throw new Error("Rol no válido");
    }
    const usuario = await UsuarioModelo.findById(userId);

  
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    usuario.role = newRole;

   
    await usuario.save();

    res.render("cambiaRole", {
      title: "Cambio de Rol Exitoso",
      success: true,
      message: `Se ha cambiado el rol del usuario ${usuario.nombre} a ${newRole}`,
    });
  } catch (error) {

    res.render("cambiaRole", {
      title: "Error al Cambiar el Rol",
      success: false,
      error: error.message,
    });
  }
};
const processUserRoleChange = async (req, res) => {
  try {
    const userId = req.params.id;
    const { newRole } = req.body;

    if (!["user", "premium"].includes(newRole)) {
      throw new Error("Rol no válido");
    }

    const usuario = await UsuarioModelo.findById(userId);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    usuario.role = newRole;

    await usuario.save();

    req.session.usuario.role = newRole;

    res.redirect(`/`);
  } catch (error) {
    
    res.render("cambiaRole", {
      title: "Error al Cambiar el Rol",
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
  updatePassword,
  toggleUserRole,
  processUserRoleChange,
};

