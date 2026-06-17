var express = require("express");
var catwayController = require("../controllers/catwayController");
var asyncHandler = require("../middleware/asyncHandler");
var requireAuth = require("../middleware/auth").requireAuth;

var router = express.Router();

router.get("/catways", requireAuth, asyncHandler(catwayController.listCatways));
router.get("/catways/:id", requireAuth, asyncHandler(catwayController.getCatway));
router.post("/catways", requireAuth, asyncHandler(catwayController.createCatway));
router.put("/catways/:id", requireAuth, asyncHandler(catwayController.updateCatway));
router.delete("/catways/:id", requireAuth, asyncHandler(catwayController.deleteCatway));

module.exports = router;

