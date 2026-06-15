const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const auth = require("../middleware/auth.middleware");

// optional: nur logged in users dürfen suchen
router.get("/friends/search", auth, userController.searchUsers);

module.exports = router;