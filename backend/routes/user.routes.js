const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/requireRole");

// search (logged in users)
router.get(
    "/friends/search", 
    auth, 
    userController.searchUsers
);

// alle User bekommen (Admin)
router.get(
    "/",
    auth,
    userController.getUsers
);

// DELETE USER (admin only)
router.delete(
    "/:id",
    auth,
    requireRole("admin"),
    userController.deleteUser
);

module.exports = router;