const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/profile.controller");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/avatars");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${req.user.id}${ext}`);
    },
});

const upload = multer({ storage });

router.get("/:id", controller.getProfile);

router.patch("/", auth, controller.updateProfile);

router.patch(
    "/avatar",
    auth,
    upload.single("avatar"),
    controller.updateAvatar
);

module.exports = router;