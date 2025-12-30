const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  type: { type: String, required: true }, // ex: vendeur:add
  message: { type: String, required: true },
  user: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Log", LogSchema);
