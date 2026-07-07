const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/requireRole");
const controller = require("../controllers/games.controller");

router.get("/", controller.getGames);
router.get("/:id", controller.getGame);



router.delete("/:id", auth, requireRole("admin"), controller.deleteGame);

module.exports = router;