/**
 * Wraps async Express handlers and forwards errors to the central error handler.
 *
 * @param {Function} handler Async route handler.
 * @returns {Function} Express-compatible route handler.
 */
module.exports = function asyncHandler(handler) {
  return function (req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

