/**
 * Detects whether the client expects JSON instead of an HTML redirect.
 *
 * @param {import("express").Request} req Incoming request.
 * @returns {boolean} True when the preferred response is JSON.
 */
function wantsJson(req) {
  return req.xhr || req.accepts(["html", "json"]) === "json";
}

/**
 * Exposes the connected user to all EJS templates.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @param {Function} next Express next callback.
 * @returns {void}
 */
function exposeUser(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  next();
}

/**
 * Protects private application and API routes.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @param {Function} next Express next callback.
 * @returns {void}
 */
function requireAuth(req, res, next) {
  if (req.session.user) {
    return next();
  }

  if (wantsJson(req)) {
    return res.status(401).json({ error: "Authentification requise" });
  }

  req.session.flash = {
    type: "error",
    message: "Connectez-vous pour acceder au tableau de bord.",
  };
  return res.redirect("/");
}

/**
 * Moves a session flash message into the template locals.
 *
 * @param {import("express").Request} req Incoming request.
 * @param {import("express").Response} res Express response.
 * @param {Function} next Express next callback.
 * @returns {void}
 */
function exposeFlash(req, res, next) {
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
}

module.exports = {
  exposeFlash: exposeFlash,
  exposeUser: exposeUser,
  requireAuth: requireAuth,
  wantsJson: wantsJson,
};
