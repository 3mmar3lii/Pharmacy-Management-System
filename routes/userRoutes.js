const express = require("express");
const { AuthMiddleware } = require("../middlewares/authMiddleware");
const {
  login,
  updatePassword,
  signup,
} = require("../controllers/authController");

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/update-password").post(AuthMiddleware, updatePassword);

module.exports = router;
