const router = require("express").Router();
const Vouch = require("../models/Vouch");
const adminAuth = require("../middleware/adminAuth");

router.get("/", async (req, res) => {
  const vouches = await Vouch.find().sort({ createdAt: -1 });
  res.json(vouches);
});

router.delete("/:id", adminAuth, async (req, res) => {
  await Vouch.deleteOne({ _id: req.params.id });
  res.json({ success: true });
});

module.exports = router;
