const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const messageController = require("../controllers/message.controller");

router.get("/:friendId", auth, messageController.getMessages);
router.post("/", auth, messageController.sendMessage);

module.exports = router;