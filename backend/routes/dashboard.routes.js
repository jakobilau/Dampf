const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/requireRole");
const controller = require("../controllers/dashboard.controller");

// Publisher Dashboard
router.get(
  "/publisher",
  auth,
  requireRole("publisher"),
  controller.getPublisherDashboard
);

module.exports = router;