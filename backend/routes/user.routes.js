const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/requireRole");

router.get("/friends/search", auth, userController.searchUsers);
router.get("/", auth, userController.getUsers);
router.delete("/:id", auth,requireRole("admin"), userController.deleteUser);

module.exports = router;