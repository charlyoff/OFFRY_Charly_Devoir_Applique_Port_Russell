require("dotenv").config({ quiet: true });

var fs = require("fs");
var path = require("path");
var bcrypt = require("bcrypt");
var mongoose = require("mongoose");
var connectDatabase = require("../src/config/database");
var Catway = require("../src/models/Catway");
var Reservation = require("../src/models/Reservation");
var User = require("../src/models/User");

/**
 * Reads and parses a JSON array from the data directory.
 *
 * @param {string} filename JSON file name.
 * @returns {Array<object>} Parsed JSON array.
 */
function readJsonArray(filename) {
  var filePath = path.join(__dirname, "..", "data", filename);
  var content = fs.readFileSync(filePath, "utf8");
  var data = JSON.parse(content);

  if (!Array.isArray(data)) {
    throw new Error(filename + " doit contenir un tableau JSON");
  }

  return data;
}

/**
 * Creates the default dashboard user when it does not exist yet.
 *
 * @returns {Promise<void>}
 */
async function seedAdminUser() {
  var email = (process.env.SEED_ADMIN_EMAIL || "admin@portrussell.local").toLowerCase();
  var existingUser = await User.findOne({ email: email }).lean();

  if (existingUser) {
    return;
  }

  await User.create({
    username: process.env.SEED_ADMIN_USERNAME || "capitainerie",
    email: email,
    password: await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || "Password123!", 10),
  });
}

/**
 * Imports the initial catways and reservations data.
 *
 * @returns {Promise<void>}
 */
async function runSeed() {
  await connectDatabase();

  var catways = readJsonArray("catways.json");
  var reservations = readJsonArray("reservations.json");

  await Catway.bulkWrite(
    catways.map(function (catway) {
      return {
        updateOne: {
          filter: { catwayNumber: catway.catwayNumber },
          update: { $set: catway },
          upsert: true,
        },
      };
    })
  );

  await Reservation.bulkWrite(
    reservations.map(function (reservation) {
      return {
        updateOne: {
          filter: {
            catwayNumber: reservation.catwayNumber,
            clientName: reservation.clientName,
            boatName: reservation.boatName,
            startDate: new Date(reservation.startDate),
            endDate: new Date(reservation.endDate),
          },
          update: {
            $set: {
              catwayNumber: reservation.catwayNumber,
              clientName: reservation.clientName,
              boatName: reservation.boatName,
              startDate: new Date(reservation.startDate),
              endDate: new Date(reservation.endDate),
            },
          },
          upsert: true,
        },
      };
    })
  );
  await seedAdminUser();

  console.log("Donnees importees avec succes.");
  console.log("Compte demo :", process.env.SEED_ADMIN_EMAIL || "admin@portrussell.local");
}

runSeed()
  .catch(function (error) {
    console.error("Import impossible :", error.message);
    process.exitCode = 1;
  })
  .finally(function () {
    mongoose.disconnect();
  });
