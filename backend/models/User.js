const mongoose = require("mongoose");

// Define the User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,  // Ensure email is unique
  },
  password: {
    type: String,
    required: true,
  },
  cartData: {
    type: Object,
    default: {},  // Cart data can be stored as an object
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = User;
