var Catway = require("../models/Catway");
var Reservation = require("../models/Reservation");
var auth = require("../middleware/auth");

/**
 * Converts the route catway id into a positive number.
 *
 * @param {string|number} value Route value.
 * @returns {number} Catway number.
 * @throws {Error} When the value is invalid.
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
 * Builds a safe catway payload from request body values.
 *
 * @param {object} body Request body.
 * @returns {{catwayNumber:number, catwayType:string, catwayState:string}} Validated payload.
 */
function buildCatwayPayload(body) {
  var catwayNumber = parseCatwayNumber(body.catwayNumber);
  var catwayType = String(body.catwayType || "").trim();
  var catwayState = String(body.catwayState || "").trim();

  if (catwayType !== "long" && catwayType !== "short") {
    var typeError = new Error("Le type doit etre long ou short");
    typeError.statusCode = 400;
    throw typeError;
  }

  if (catwayState.length < 3) {
    var stateError = new Error("L'etat du catway doit contenir au moins 3 caracteres");
    stateError.statusCode = 400;
    throw stateError;
  }

  return {
    catwayNumber: catwayNumber,
    catwayType: catwayType,
    catwayState: catwayState,
  };
}

/**
 * Lists every catway.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<void>}
 */
exports.listCatways = async function (req, res) {
  var catways = await Catway.find().sort({ catwayNumber: 1 }).lean();
  respond(req, res, "catways/list", {
    title: "Gestion des catways",
    catways: catways,
  });
};

/**
 * Shows one catway by its number.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<void>}
 */
exports.getCatway = async function (req, res) {
  var catwayNumber = parseCatwayNumber(req.params.id);
  var catway = await Catway.findOne({ catwayNumber: catwayNumber }).lean();

  if (!catway) {
    return res.status(404).render("error", {
      title: "Catway introuvable",
      message: "Catway introuvable",
    });
  }

  var reservations = await Reservation.find({ catwayNumber: catwayNumber })
    .sort({ startDate: 1 })
    .lean();

  respond(req, res, "catways/detail", {
    title: "Catway " + catwayNumber,
    catway: catway,
    reservations: reservations,
  });
};

/**
 * Creates a catway.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<void>}
 */
exports.createCatway = async function (req, res) {
  try {
    var catway = await Catway.create(buildCatwayPayload(req.body));

    if (auth.wantsJson(req)) {
      return res.status(201).json(catway);
    }

    req.session.flash = { type: "success", message: "Catway cree avec succes." };
    return res.redirect("/catways");
  } catch (error) {
    if (error.code === 11000) {
      error.statusCode = 409;
      error.message = "Ce numero de catway existe deja";
    }

    if (auth.wantsJson(req)) {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }

    req.session.flash = { type: "error", message: error.message };
    return res.redirect("/catways");
  }
};

/**
 * Updates only the state description of a catway.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<void>}
 */
exports.updateCatway = async function (req, res) {
  try {
    var catwayNumber = parseCatwayNumber(req.params.id);
    var catwayState = String(req.body.catwayState || "").trim();

    if (catwayState.length < 3) {
      throw new Error("L'etat du catway doit contenir au moins 3 caracteres");
    }

    var catway = await Catway.findOneAndUpdate(
      { catwayNumber: catwayNumber },
      { catwayState: catwayState },
      { new: true, runValidators: true }
    );

    if (!catway) {
      return res.status(404).json({ error: "Catway introuvable" });
    }

    if (auth.wantsJson(req)) {
      return res.json(catway);
    }

    req.session.flash = { type: "success", message: "Etat du catway mis a jour." };
    return res.redirect("/catways/" + catwayNumber);
  } catch (error) {
    if (auth.wantsJson(req)) {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }

    req.session.flash = { type: "error", message: error.message };
    return res.redirect("/catways/" + req.params.id);
  }
};

/**
 * Deletes a catway and its related reservations.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<void>}
 */
exports.deleteCatway = async function (req, res) {
  var catwayNumber = parseCatwayNumber(req.params.id);
  var catway = await Catway.findOneAndDelete({ catwayNumber: catwayNumber });

  if (!catway) {
    return res.status(404).json({ error: "Catway introuvable" });
  }

  await Reservation.deleteMany({ catwayNumber: catwayNumber });

  if (auth.wantsJson(req)) {
    return res.json({ message: "Catway supprime", catway: catway });
  }

  req.session.flash = { type: "success", message: "Catway supprime." };
  return res.redirect("/catways");
};

