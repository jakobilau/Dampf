const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/games.controller");

// public
router.get("/", controller.getGames);
router.get("/:id", controller.getGame);

module.exports = router;