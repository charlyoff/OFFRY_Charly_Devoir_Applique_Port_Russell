var app = require("./app");
var connectDatabase = require("./config/database");

var port = process.env.PORT || 3000;

/**
 * Starts the MongoDB connection and HTTP server.
 *
 * @returns {Promise<void>} Resolves when the server is listening.
 */
async function startServer() {
  await connectDatabase();

  app.listen(port, function () {
    console.log("Port Russell lance sur http://localhost:" + port);
  });
}

startServer().catch(function (error) {
  console.error("Demarrage impossible :", error.message);
  process.exit(1);
});

