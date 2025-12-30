const router = require("express").Router();
const Vouch = require("../models/Vouch");
const Log = require("../models/Log");
const admin = require("../middlewares/admin");

/* ===========================
   GET → liste des vouches
=========================== */
router.get("/", admin, async (req, res) => {
  try {
    const vouches = await Vouch.find({
      guildId: process.env.GUILD_ID
    }).sort({ createdAt: -1 });

    // 🧾 LOG
    await Log.create({
      type: "vouch:list",
      message: "Consultation des vouches",
      userId: req.user.id
    });

    res.json(vouches);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ===========================
   DELETE → supprimer un vouch
=========================== */
router.delete("/:id", admin, async (req, res) => {
  try {
    const vouch = await Vouch.findById(req.params.id);

    if (!vouch) {
      return res.status(404).json({ error: "Vouch introuvable" });
    }

    await Vouch.findByIdAndDelete(req.params.id);

    // 🗑️ LOG suppression
    await Log.create({
      type: "vouch:delete",
      message: `Suppression vouch #${vouch.vouchId} (vendeur: ${vouch.vendeurName})`,
      userId: req.user.id,
      targetId: req.params.id
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
