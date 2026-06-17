var Catway = require("../models/Catway");
var Reservation = require("../models/Reservation");
var User = require("../models/User");

/**
 * Renders the private dashboard with current reservations and counters.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<void>}
 */
exports.showDashboard = async function (req, res) {
  var today = new Date();
  var currentReservations = await Reservation.find({
    startDate: { $lte: today },
    endDate: { $gte: today },
  })
    .sort({ endDate: 1 })
    .lean();

  var counts = {
    catways: await Catway.countDocuments(),
    reservations: await Reservation.countDocuments(),
    users: await User.countDocuments(),
  };

  res.render("dashboard", {
    title: "Tableau de bord",
    today: today,
    currentReservations: currentReservations,
    counts: counts,
  });
};

