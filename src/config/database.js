var mongoose = require("mongoose");

/**
 * Opens the MongoDB connection used by the application.
 *
 * @returns {Promise<void>} Resolves when Mongoose is connected.
 * @throws {Error} When the MONGODB_URI environment variable is missing.
 */
async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI n'est pas configure dans le fichier .env");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(process.env.MONGODB_URI);
}

module.exports = connectDatabase;

