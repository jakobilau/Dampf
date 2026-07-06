const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const controller = require("../controllers/games.controller");

// public
router.get("/", controller.getGames);
router.get("/:id", controller.getGame);

// admin only funktioniert noch nich 
router.post("/", auth, admin, controller.createGame);
router.patch("/:id", auth, admin, controller.updateGame);
router.delete("/:id", auth, admin, controller.deleteGame);

module.exports = router;