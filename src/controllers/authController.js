var bcrypt = require("bcrypt");
var User = require("../models/User");
var auth = require("../middleware/auth");

/**
 * Renders the public home page with the login form.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {void}
 */
exports.showHome = function (req, res) {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }

  return res.render("index", {
    title: "Port Russell - Connexion",
  });
};

/**
 * Authenticates a user and stores a safe user summary in the session.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {Promise<void>}
 */
exports.login = async function (req, res) {
  try {
    var email = String(req.body.email || "").trim().toLowerCase();
    var password = String(req.body.password || "");

    if (!email || !password) {
      throw new Error("Email et mot de passe obligatoires");
    }

    var user = await User.findOne({ email: email }).select("+password").lean();

    if (!user) {
      throw new Error("Identifiants incorrects");
    }

    var passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      throw new Error("Identifiants incorrects");
    }

    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    if (auth.wantsJson(req)) {
      return res.json({ message: "Connexion reussie", user: req.session.user });
    }

    return res.redirect("/dashboard");
  } catch (error) {
    if (auth.wantsJson(req)) {
      return res.status(401).json({ error: error.message });
    }

    req.session.flash = {
      type: "error",
      message: error.message,
    };
    return res.redirect("/");
  }
};

/**
 * Destroys the user session and redirects to the home page.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @returns {void}
 */
exports.logout = function (req, res) {
  req.session.destroy(function () {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
};

