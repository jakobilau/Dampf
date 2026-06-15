const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const friendController = require("../controllers/friend.controller");

router.get("/", auth, friendController.getFriends);

module.exports = router;