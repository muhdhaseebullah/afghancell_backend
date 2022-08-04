const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    operataor: {
      type: String,
      required: [true, "Please add operator"],
    },
    topup_no: {
      type: String,
      required: [true, "Please add topup no"],
    },
    amount: {
      type: Number,
      default: 0,
    },
    date: {
      type: String,
    },

    action: {
      type: String,
      enum: ["pending", "approve", "deny"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
