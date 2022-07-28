const mongoose = require("mongoose");

const rechargeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    recharged_user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    username: {
      type: String,
      required: [true, "Please add username"],
    },
    contact: {
      type: String,
      required: [true, "Please add contact"],
    },
    amount: {
      type: Number,
      required: [true, "Please add amount"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Recharge", rechargeSchema);
