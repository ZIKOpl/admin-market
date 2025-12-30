const Log = require("../models/Log");

module.exports = async function log(type, message, user = "system") {
  try {
    await Log.create({ type, message, user });
  } catch (e) {
    console.error("LOG ERROR", e);
  }
};
