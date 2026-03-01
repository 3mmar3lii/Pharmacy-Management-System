
const express = require("express");
const { AuthMiddleware } = require("../middlewares/authMiddleware");
const { login, updatePassword } = require("../controllers/authController");

const router = express.Router();

router.route("/login").post(login);
router.route("/update-password").post(AuthMiddleware,updatePassword);


module.exports = router;
