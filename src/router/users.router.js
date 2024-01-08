const Router = require("express").Router;
const router = Router();

const UsersController = require("../controllers/users.controller.js");

router.get("/premium/:id", UsersController.getUserRoleById);


router.post(
  "/premium/:id/changeRole",  
  UsersController.changeUserRole
);

module.exports = router;
