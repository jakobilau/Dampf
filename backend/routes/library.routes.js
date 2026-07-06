const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/library.controller");


router.get("/", auth, controller.getLibrary);
router.post("/:gameId", auth, controller.addToLibrary);
router.delete("/:gameId", auth, controller.removeFromLibrary);
router.patch("/:gameId/favorite", auth, controller.toggleFavorite);
router.patch("/:gameId/playtime", auth, controller.addPlaytime);

module.exports = router;