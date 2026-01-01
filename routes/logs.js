const router = require("express").Router();
const Log = require("../models/Log");
const isAdmin = require("../middlewares/isAdmin");

router.get("/", isAdmin, async (req, res) => {
  const logs = await Log.find().limit(50);
  res.json(logs);
});

module.exports = router;
