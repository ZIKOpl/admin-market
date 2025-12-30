const router = require("express").Router();
const Log = require("../models/Log");
const admin = require("../middlewares/admin");

router.get("/", admin, async (req, res) => {
  const logs = await Log.find().limit(50);
  res.json(logs);
});

module.exports = router;
