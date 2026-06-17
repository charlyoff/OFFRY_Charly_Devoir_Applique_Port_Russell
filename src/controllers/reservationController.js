var mongoose = require("mongoose");
var Catway = require("../models/Catway");
var Reservation = require("../models/Reservation");
var auth = require("../middleware/auth");

/**
 * Sends JSON for API clients or renders an EJS view for browsers.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @param {string} view EJS view name.
 * @param {object} data View or JSON payload.
 * @param {number} [statusCode=200] HTTP status code.
 * @returns {void}
 */
function respond(req, res, view, data, statusCode) {
  if (auth.wantsJson(req)) {
    return res.status(statusCode || 200).json(data);
  }

  return res.status(statusCode || 200).render(view, data);
}

/**
 * Converts a catway route parameter into a positive number.
 *
 * @param {string|number} value Route value.
 * @returns {number} Catway number.
 * @throws {Error} When the number is invalid.
 */
function parseCatwayNumber(value) {
  var catwayNumber = Number.parseInt(value, 10);

  if (!Number.isInteger(catwayNumber) || catwayNumber < 1) {
    var error = new Error("Numero de catway invalide");
    error.statusCode = 400;
    throw error;
  }

  return catwayNumber;
}

/**
 * Parses a date input and rejects invalid dates.
 *
 * @param {string} value Date input.
 * @param {string} fieldName Human field name.
 * @returns {Date} Parsed date.
 */
function parseDate(value, fieldName) {
  var date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    var error = new Error(fieldName + " invalide");
    error.statusCode = 400;
    throw error;
  }

  return date;
}

/**
 * Builds a validated reservation payload.
 *
 * @param {number} catwayNumber Catway number from the route.
 * @param {object} body Request body.
 * @returns {{catwayNumber:number, clientName:string, boatName:string, startDate:Date, endDate:Date}} Reservation payload.
 */
function buildReservationPayload(catwayNumber, body) {
  var clientName = String(body.clientName || "").trim();
  var boatName = String(body.boatName || "").trim();
  var startDate = parseDate(body.startDate, "Date de debut");
  var endDate = parseDate(body.endDate, "Date de fin");

  if (clientName.length < 2) {
    throw new Error("Le nom du client doit contenir au moins 2 caracteres");
  }

  if (boatName.length < 2) {
    throw new Error("Le nom du bateau doit contenir au moins 2 caracteres");
  }

  if (endDate <= startDate) {
    throw new Error("La date de fin doit etre posterieure a la date de debut");
  }

  return {
    catwayNumber: catwayNumber,
    clientName: clientName,
    boatName: boatName,
    startDate: startDate,
    endDate: endDate,
  };
}

/**
 * Ensures the catway exists before a reservation operation.
 *
 * @param {number} catwayNumber Catway number.
 * @returns {Promise<object>} Existing catway.
 */
async function requireCatway(catwayNumber) {
  var catway = await Catway.findOne({ catwayNumber: catwayNumber }).lean();

  if (!catway) {
    var error = new Error("Catway introuvable");
    error.statusCode = 404;
    throw error;
  }

  return catway;
}

/**
 * Checks whether another reservation overlaps the requested period.
 *
 * @param {object} payload Reservation payload.
 * @param {string} [ignoredReservationId] Reservation id ignored during update.
 * @returns {Promise<void>}
 */
async function ensureNoOverlap(payload, ignoredReservationId) {
  var query = {
    catwayNumber: payload.catwayNumber,
    startDate: { $lt: payload.endDate },
    endDate: { $gt: payload.startDate },
  };

  if (ignoredReservationId) {
    query._id = { $ne: ignoredReservationId };
  }

  var existingReservation = await Reservation.findOne(query).lean();

  if (existingReservation) {
    var error = new Error("Ce catway est deja reserve sur cette periode");
    error.statusCode = 409;
    throw error;
  }
}

/**
 * Lists all reservations for the dedicated reservations page.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<void>}
 */
exports.listAllReservations = async function (req, res) {
  var reservations = await Reservation.find().sort({ startDate: 1 }).lean();
  var catways = await Catway.find().sort({ catwayNumber: 1 }).lean();

  respond(req, res, "reservations/list", {
    title: "Gestion des reservations",
    reservations: reservations,
    catways: catways,
    selectedCatway: null,
  });
};

/**
 * Lists reservations for one catway.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<void>}
 */
exports.listReservationsByCatway = async function (req, res) {
  var catwayNumber = parseCatwayNumber(req.params.id);
  var catway = await requireCatway(catwayNumber);
  var reservations = await Reservation.find({ catwayNumber: catwayNumber })
    .sort({ startDate: 1 })
    .lean();
  var catways = await Catway.find().sort({ catwayNumber: 1 }).lean();

  respond(req, res, "reservations/list", {
    title: "Reservations du catway " + catwayNumber,
    reservations: reservations,
    catways: catways,
    selectedCatway: catway,
  });
};

/**
 * Shows one reservation.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<void>}
 */
exports.getReservation = async function (req, res) {
  var catwayNumber = parseCatwayNumber(req.params.id);
  var reservationId = req.params.reservationId;

  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    return res.status(400).json({ error: "Identifiant de reservation invalide" });
  }

  var reservation = await Reservation.findOne({
    _id: reservationId,
    catwayNumber: catwayNumber,
  }).lean();

  if (!reservation) {
    return res.status(404).render("error", {
      title: "Reservation introuvable",
      message: "Reservation introuvable",
    });
  }

  var catways = await Catway.find().sort({ catwayNumber: 1 }).lean();

  respond(req, res, "reservations/detail", {
    title: "Reservation",
    reservation: reservation,
    catways: catways,
  });
};

/**
 * Creates a reservation on a catway.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<void>}
 */
exports.createReservation = async function (req, res) {
  try {
    var catwayNumber = parseCatwayNumber(req.params.id);
    await requireCatway(catwayNumber);
    var payload = buildReservationPayload(catwayNumber, req.body);
    await ensureNoOverlap(payload);
    var reservation = await Reservation.create(payload);

    if (auth.wantsJson(req)) {
      return res.status(201).json(reservation);
    }

    req.session.flash = { type: "success", message: "Reservation creee." };
    return res.redirect("/reservations");
  } catch (error) {
    if (auth.wantsJson(req)) {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }

    req.session.flash = { type: "error", message: error.message };
    return res.redirect("/reservations");
  }
};

/**
 * Updates an existing reservation.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<void>}
 */
exports.updateReservation = async function (req, res) {
  try {
    var catwayNumber = parseCatwayNumber(req.params.id);
    var reservationId = req.params.reservationId || req.body.reservationId;

    if (!mongoose.Types.ObjectId.isValid(reservationId)) {
      var idError = new Error("Identifiant de reservation invalide");
      idError.statusCode = 400;
      throw idError;
    }

    await requireCatway(catwayNumber);
    var payload = buildReservationPayload(catwayNumber, req.body);
    await ensureNoOverlap(payload, reservationId);

    var reservation = await Reservation.findOneAndUpdate(
      { _id: reservationId },
      payload,
      { new: true, runValidators: true }
    );

    if (!reservation) {
      var missingError = new Error("Reservation introuvable");
      missingError.statusCode = 404;
      throw missingError;
    }

    if (auth.wantsJson(req)) {
      return res.json(reservation);
    }

    req.session.flash = { type: "success", message: "Reservation mise a jour." };
    return res.redirect("/catways/" + catwayNumber + "/reservations/" + reservationId);
  } catch (error) {
    if (auth.wantsJson(req)) {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }

    req.session.flash = { type: "error", message: error.message };
    return res.redirect("/reservations");
  }
};

/**
 * Deletes a reservation.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<void>}
 */
exports.deleteReservation = async function (req, res) {
  var catwayNumber = parseCatwayNumber(req.params.id);
  var reservationId = req.params.reservationId;

  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    return res.status(400).json({ error: "Identifiant de reservation invalide" });
  }

  var reservation = await Reservation.findOneAndDelete({
    _id: reservationId,
    catwayNumber: catwayNumber,
  });

  if (!reservation) {
    return res.status(404).json({ error: "Reservation introuvable" });
  }

  if (auth.wantsJson(req)) {
    return res.json({ message: "Reservation supprimee", reservation: reservation });
  }

  req.session.flash = { type: "success", message: "Reservation supprimee." };
  return res.redirect("/reservations");
};
