var express = require("express");
var userController = require("../controllers/userController");
var asyncHandler = require("../middleware/asyncHandler");
var requireAuth = require("../middleware/auth").requireAuth;

var router = express.Router();

router.get("/users", requireAuth, asyncHandler(userController.listUsers));
router.get("/users/:email", requireAuth, asyncHandler(userController.getUser));
router.post("/users", requireAuth, asyncHandler(userController.createUser));
router.put("/users/:email", requireAuth, asyncHandler(userController.updateUser));
router.delete("/users/:email", requireAuth, asyncHandler(userController.deleteUser));

module.exports = router;

