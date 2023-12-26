

const express = require("express");
const swagger_jsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const http = require("http");
const socketIO = require("socket.io");
const MessageModel = require("./dao/DB/models/messages.modelo.js");

const moongose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");



const app = express();

//MANEJO DE ERRORES
const errorHandler = require("./middleware/errorHandler.js");

// DOTENV
const config = require("./config/config.js");


//SESSION
const session = require("express-session");
const ConnectMongo = require("connect-mongo");

//PASSPORT

const inicializaPassport = require("./config/passport.config.js");
const passport = require("passport");


// NODEMAILER y JWT
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const async = require("async");

// HANDLEBARS - importación
const handlebars = require("express-handlebars");

const PORT = config.PORT;


// LOGGER
const { middLog } = require("./util.js");
app.use(middLog);




//SWAGGER

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ecommerce Retro Gamer",
      version: "1.0.0",
      description: "Documentación del proyecto: productos y carritos de compra",
    },
  },
  apis: ["./docs/*.yaml"],
};

const specs = swagger_jsdoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//PARA SESSION Y LOGIN

const sessionStore = ConnectMongo.create({
  mongoUrl: `${config.MONGO_URL}&dbName=${config.DB_NAME}`,

  ttl: 3600,
});

app.use(
  session({
    secret: config.SESSIONS_PASSWORD,
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
  })
);

//PARA INICIAR PASSPORT

inicializaPassport();
app.use(passport.initialize());
app.use(passport.session());

// PARA EL MANEJO DE COOKIES
app.use(cookieParser());


// Routers de FileSystem (FS)
const FSproductsRouter = require("./dao/fileSystem/routes/FSproducts.router.js");
const FScartsRouter = require("./dao/fileSystem/routes/FScarts.router.js");

// Routers de MongoDB (DB)
const productsRouter = require("./router/products.router.js");
const cartsRouter = require("./router/carts.router.js");

// Router de Handlebars
const vistasRouter = require("./router/vistas.router.js");

// Router de Users
const usersRouter = require("./router/users.router.js");


// Router de Session
const sessionsRouter = require("./router/sessions.router.js");
const { json } = require("body-parser");
const { prototype } = require("module");

// Inicialización de routers
app.use("/api/fsproducts", FSproductsRouter);
app.use("/api/fscarts", FScartsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/users", usersRouter);
app.use("/", vistasRouter);

// HANDLEBARS - inicialización
const hbs = handlebars.create({
  helpers: {
    add: function (value, addition) {
      return value + addition;
    },
    subtract: function (value, subtraction) {
      return value - subtraction;
    },
    ifEquals: function (arg1, arg2, options) {
      return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    },
    json: function (context) {
      return JSON.stringify(context);
    },
    fileRead: function (filePath, options) {
      fs.readFile(filePath, "utf-8", (error, data) => {
        if (error) {
          console.error(
            `Error al leer el archivo ${filePath}: ${error.message}`
          );
          if (options && options.fn) {
            options.fn("Error al leer el archivo");
          }
        } else {
          if (options && options.fn) {
            options.fn(data);
          }
        }
      });
    },
    compareOwners: function (owner1, owner2, options) {
      if (owner1 === owner2) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },
  },
});
// NODEMAILER Y JWT PARA CAMBIO DE CONTRASEÑA
const UsersController= require("./controllers/users.controller.js")
// Configuración del transporte de nodemailer (usando un servicio de prueba)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.SMTP_USER, // Coloca tu dirección de correo aquí
    pass: config.SMTP_PASSWORD, // Coloca tu contraseña aquí
  },
});

const secret = config.SECRET;

const createResetToken = (user) => {
  const tokenObject = {
    email: user.email,
    id: user._id,
  };
  const expirationTime = 3600;
  const resetToken = jwt.sign(tokenObject, secret, {
    expiresIn: expirationTime,
  });
  return resetToken;
};

app.post("/forgotPassword", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UsersController.getUserByEmail(email);

    if (!user) {
      return res.status(404).send("Usuario no encontrado");
    }

    const resetToken = createResetToken(user, secret);
    user.reset_password_token = resetToken;
    user.reset_password_expires = Date.now() + 3600000; 

    await user.save();

    // Almacena el token completo en la sesión
    req.session.resetToken = resetToken;

    const resetLink = `http://localhost:${config.PORT}/resetPassword?token=${resetToken}`;
    const mailOptions = {
      from: "noresponder-ferreteriaeltornillo@gmail.com",
      to: user.email,
      subject: "Restablecimiento de contraseña",
      html: `Haga clic en el siguiente enlace para restablecer su contraseña: <a href="${resetLink}">${resetLink}</a>`,
    };

    await transporter.sendMail(mailOptions);

    res
   res.status(200).render("login", {
     successPasswordMessage:
       "Se ha enviado un correo con las instrucciones para restablecer la contraseña.",
     estilo: "login.css",
   });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error interno del servidor");
  }
});


// WEBSOCKET Y CHAT
app.engine("handlebars", hbs.engine);
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

//app.use(express.static(__dirname + "/public"));
app.use(express.static(path.join(__dirname, "public")));

const serverExpress = app.listen(PORT, () => {
  console.log(`Server escuchando en puerto ${PORT}`);
});

const serverSocket = socketIO(serverExpress);

serverSocket.on("connection", (socket) => {});

moongose
  .connect(config.MONGO_URL, { dbName: config.DB_NAME })
  .then(console.log("DB Conectada"))
  .catch((error) => console.log(error));

let mensajes = [
  {
    emisor: "Server",
    mensaje: "Bienvenido al chat de ferretería el Tornillo... !!!",
  },
];

let usuarios = [];

const serverSocketChat = socketIO(serverExpress);

serverSocketChat.on("connection", (socket) => {

  socket.on("id", (nombre) => {   

    usuarios.push({
      id: socket.id,
      nombre,
    });
    socket.emit("bienvenida", mensajes);
    socket.broadcast.emit("nuevoUsuario", nombre);
  });

  socket.on("nuevoMensaje", (mensaje) => {
    // Guarda el mensaje en MongoDB
    const newMessage = new MessageModel({
      user: mensaje.emisor,
      message: mensaje.mensaje,
    });

    newMessage.save().then(() => {     
    });

    mensajes.push(mensaje);
    serverSocketChat.emit("llegoMensaje", mensaje);
  });
  // PARA HACER UN USUARIO QUE SE DESCONECTÓ
  socket.on("disconnect", () => {
    let indice = usuarios.findIndex((usuario) => usuario.id === socket.id);
    let usuario = usuarios[indice];
    serverSocketChat.emit("usuarioDesconectado", usuario);    
    usuarios.splice(indice, 1);
  });

  socket.on("productoAgregado", (data) => {   
    serverSocket.emit("productoAgregado", data);
  });

  function getProducts() {
    const ruta = path.join(__dirname, "archivos", "productos.json");
    if (fs.existsSync(ruta)) {
      return JSON.parse(fs.readFileSync(ruta, "utf-8"));
    } else {
      return [];
    }
  }

  socket.on("eliminarProducto", (productId) => {
    const productos = getProducts();

    function saveProducts(products) {
      const ruta = path.join(__dirname, "archivos", "productos.json");
      try {
        fs.writeFileSync(ruta, JSON.stringify(products, null, 2), "utf8");
      } catch (error) {
        console.error("Error al guardar productos:", error);
      }
    }
    const productoIndex = productos.findIndex(
      (producto) => producto.id === productId
    );
    if (productoIndex !== -1) {
      productos.splice(productoIndex, 1);
      saveProducts(productos);
      serverSocket.emit("productosActualizados", productos);
    }
  });

  socket.emit("productosActualizados", getProducts());
});

app.use(errorHandler);
