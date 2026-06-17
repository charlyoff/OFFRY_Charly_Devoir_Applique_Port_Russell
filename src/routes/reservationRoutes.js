var express = require("express");
var reservationController = require("../controllers/reservationController");
var asyncHandler = require("../middleware/asyncHandler");
var requireAuth = require("../middleware/auth").requireAuth;

var router = express.Router();

router.get("/reservations", requireAuth, asyncHandler(reservationController.listAllReservations));
router.get(
  "/catways/:id/reservations",
  requireAuth,
  asyncHandler(reservationController.listReservationsByCatway)
);
router.get(
  "/catways/:id/reservations/:reservationId",
  requireAuth,
  asyncHandler(reservationController.getReservation)
);
router.get(
  "/catway/:id/reservations/:reservationId",
  requireAuth,
  asyncHandler(reservationController.getReservation)
);
router.post(
  "/catways/:id/reservations",
  requireAuth,
  asyncHandler(reservationController.createReservation)
);
router.put(
  "/catways/:id/reservations",
  requireAuth,
  asyncHandler(reservationController.updateReservation)
);
router.put(
  "/catways/:id/reservations/:reservationId",
  requireAuth,
  asyncHandler(reservationController.updateReservation)
);
router.delete(
  "/catways/:id/reservations/:reservationId",
  requireAuth,
  asyncHandler(reservationController.deleteReservation)
);
router.delete(
  "/catway/:id/reservations/:reservationId",
  requireAuth,
  asyncHandler(reservationController.deleteReservation)
);

module.exports = router;
