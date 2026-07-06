const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const auth = require("../middleware/auth.middleware");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/me", auth, authController.me);

router.post("/logout", authController.logout);

module.exports = router;