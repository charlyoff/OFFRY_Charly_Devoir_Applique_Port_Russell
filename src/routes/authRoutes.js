var express = require("express");
var authController = require("../controllers/authController");
var asyncHandler = require("../middleware/asyncHandler");

var router = express.Router();

router.post("/login", asyncHandler(authController.login));
router.get("/logout", authController.logout);

module.exports = router;

