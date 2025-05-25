const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});

const registrationSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  category: { type: String, required: true },
  members: [memberSchema],
});

module.exports = mongoose.model("Registration", registrationSchema);
