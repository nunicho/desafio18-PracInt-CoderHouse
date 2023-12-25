
const dotenv = require("dotenv");
const { Command, Option } = require("commander");


let program = new Command();

program
  .addOption(
    new Option("-m, --mode <modo>", "Modo en que corre el app")
      .choices(["development", "production"])
      .default("production")
  )
  //.parse();
  .option("--exit", "Forzar salida después de las pruebas")
  .parse(process.argv);

let entorno = program.opts().mode;
dotenv.config({
  path: entorno === "production" ? "./.env.production" : "./.env.development",
  override: true,
});



const config = {
  PORT: process.env.PORT || 3000,
  MONGO_URL: process.env.MONGO_URL,
  DB_NAME: process.env.DB_NAME,
  ADMIN_USER: process.env.ADMIN_USER,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRECT: process.env.CLIENT_SECRECT,
  CALLBACK_URL: process.env.CALLBACK_URL,
  SESSIONS_PASSWORD: process.env.SESSIONS_PASSWORD,
  MODO: process.env.MODO,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SECRET: process.env.SECRET,
  RESET_LINK: process.env.RESET_LINK,
  DIRECCION_TEST_LOCALHOST: process.env. DIRECCION_TEST_LOCALHOST,
  PRODUCTO_TEST_EJEMPLO: process.env.PRODUCTO_TEST_EJEMPLO
};

const modo = config.MODO


module.exports = config


