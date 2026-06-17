var mongoose = require("mongoose");

/**
 * Reservation attached to a catway number.
 */
var reservationSchema = new mongoose.Schema(
  {
    catwayNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    boatName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

reservationSchema.index({ catwayNumber: 1, startDate: 1, endDate: 1 });

/**
 * Ensures reservation dates are coherent before saving.
 *
 * @returns {void}
 */
reservationSchema.pre("validate", function () {
  if (this.startDate && this.endDate && this.endDate <= this.startDate) {
    this.invalidate("endDate", "La date de fin doit etre posterieure a la date de debut");
  }
});

module.exports = mongoose.model("Reservation", reservationSchema);
