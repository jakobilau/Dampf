const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const messageController = require("../controllers/message.controller");

router.get("/:friendId", auth, messageController.getMessages);

module.exports = router;