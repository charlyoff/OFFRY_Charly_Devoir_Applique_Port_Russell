var express = require("express");
var authController = require("../controllers/authController");
var dashboardController = require("../controllers/dashboardController");
var asyncHandler = require("../middleware/asyncHandler");
var requireAuth = require("../middleware/auth").requireAuth;

var router = express.Router();

router.get("/", authController.showHome);
router.get("/login", authController.showHome);
router.get("/home", authController.showHome);
router.get("/accueil", authController.showHome);
router.get("/dashboard", requireAuth, asyncHandler(dashboardController.showDashboard));
router.get("/documentation", function (req, res) {
  res.render("api-docs", { title: "Documentation API" });
});

module.exports = router;
