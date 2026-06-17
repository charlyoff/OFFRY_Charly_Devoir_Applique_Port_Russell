var bcrypt = require("bcrypt");
var User = require("../models/User");
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
 * Validates and normalizes an email parameter.
 *
 * @param {string} email Raw email.
 * @returns {string} Normalized email.
 */
function normalizeEmail(email) {
  var cleanEmail = String(email || "").trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    var error = new Error("Adresse email invalide");
    error.statusCode = 400;
    throw error;
  }

  return cleanEmail;
}

/**
 * Hashes a plain password after basic strength validation.
 *
 * @param {string} password Plain password.
 * @returns {Promise<string>} Bcrypt hash.
 */
async function hashPassword(password) {
  var plainPassword = String(password || "");

  if (plainPassword.length < 8) {
    var error = new Error("Le mot de passe doit contenir au moins 8 caracteres");
    error.statusCode = 400;
    throw error;
  }

  return bcrypt.hash(plainPassword, 10);
}

/**
 * Lists users.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<void>}
 */
exports.listUsers = async function (req, res) {
  var users = await User.find().sort({ username: 1 }).lean();
  respond(req, res, "users/list", {
    title: "Gestion des utilisateurs",
    users: users,
  });
};

/**
 * Shows one user by email.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<void>}
 */
exports.getUser = async function (req, res) {
  var email = normalizeEmail(req.params.email);
  var user = await User.findOne({ email: email }).lean();

  if (!user) {
    return res.status(404).render("error", {
      title: "Utilisateur introuvable",
      message: "Utilisateur introuvable",
    });
  }

  respond(req, res, "users/detail", {
    title: user.username,
    user: user,
  });
};

/**
 * Creates a user.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<void>}
 */
exports.createUser = async function (req, res) {
  try {
    var user = await User.create({
      username: String(req.body.username || "").trim(),
      email: normalizeEmail(req.body.email),
      password: await hashPassword(req.body.password),
    });

    if (auth.wantsJson(req)) {
      return res.status(201).json(user);
    }

    req.session.flash = { type: "success", message: "Utilisateur cree." };
    return res.redirect("/users");
  } catch (error) {
    if (error.code === 11000) {
      error.statusCode = 409;
      error.message = "Cette adresse email est deja utilisee";
    }

    if (auth.wantsJson(req)) {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }

    req.session.flash = { type: "error", message: error.message };
    return res.redirect("/users");
  }
};

/**
 * Updates a user by email.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<void>}
 */
exports.updateUser = async function (req, res) {
  try {
    var currentEmail = normalizeEmail(req.params.email);
    var update = {
      username: String(req.body.username || "").trim(),
      email: normalizeEmail(req.body.email),
    };

    if (req.body.password) {
      update.password = await hashPassword(req.body.password);
    }

    var user = await User.findOneAndUpdate({ email: currentEmail }, update, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      var missingError = new Error("Utilisateur introuvable");
      missingError.statusCode = 404;
      throw missingError;
    }

    if (req.session.user && req.session.user.email === currentEmail) {
      req.session.user.username = user.username;
      req.session.user.email = user.email;
    }

    if (auth.wantsJson(req)) {
      return res.json(user);
    }

    req.session.flash = { type: "success", message: "Utilisateur mis a jour." };
    return res.redirect("/users/" + encodeURIComponent(user.email));
  } catch (error) {
    if (error.code === 11000) {
      error.statusCode = 409;
      error.message = "Cette adresse email est deja utilisee";
    }

    if (auth.wantsJson(req)) {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }

    req.session.flash = { type: "error", message: error.message };
    return res.redirect("/users/" + encodeURIComponent(req.params.email));
  }
};

/**
 * Deletes a user by email.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<void>}
 */
exports.deleteUser = async function (req, res) {
  var email = normalizeEmail(req.params.email);

  if (req.session.user && req.session.user.email === email) {
    if (auth.wantsJson(req)) {
      return res.status(409).json({ error: "Vous ne pouvez pas supprimer votre propre compte connecte" });
    }

    req.session.flash = {
      type: "error",
      message: "Vous ne pouvez pas supprimer votre propre compte connecte.",
    };
    return res.redirect("/users");
  }

  var user = await User.findOneAndDelete({ email: email });

  if (!user) {
    return res.status(404).json({ error: "Utilisateur introuvable" });
  }

  if (auth.wantsJson(req)) {
    return res.json({ message: "Utilisateur supprime", user: user });
  }

  req.session.flash = { type: "success", message: "Utilisateur supprime." };
  return res.redirect("/users");
};

