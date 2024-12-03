const mongoose = require("mongoose");

// User schema for storing user details
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email is unique for each user
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt fields automatically

module.exports = mongoose.model("User", userSchema);
