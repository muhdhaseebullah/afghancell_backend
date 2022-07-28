const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    user_id: {
      type: Number,
    },
    username: {
      type: String,
      required: [true, "Please add a user name"],
    },
    displayname: {
      type: String,
      required: [true, "Please add a display name"],
    },
    contact: {
      type: String,
      required: [true, "Please add a phone number"],
    },
    password: {
      type: String,
      select: false,
      required: [true, "Please add a password"],
    },
    amount: {
      type: Number,
      default: 0,
      // required: [true, "Please add amount"],
    },
    country: {
      type: String,
      required: [true, "Please enter country"],
      // enum: ["AFN", "TL"],
    },
    state: {
      type: String,
      required: [true, "Please enter state"],
      // enum: ["AFN", "TL"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    role: {
      type: String,
      enum: ["admin", "distributor", "retailer"],
      default: "distributor",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
