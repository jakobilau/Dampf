const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authmiddleware = require("../middleware/auth.middleware");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/me", authmiddleware, authController.me);
router.post("/logout", auth, controller.logout);

module.exports = router;