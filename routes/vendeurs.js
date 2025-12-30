const router = require("express").Router();
const Vendeur = require("../models/Vendeur");
const Vouch = require("../models/Vouch");
const Log = require("../models/Log");
const admin = require("../middlewares/admin");

/* ===========================
   GET → tous les vendeurs
=========================== */
router.get("/", admin, async (req, res) => {
  const vendeurs = await Vendeur.find({
    guildId: process.env.GUILD_ID
  }).sort({ name: 1 });

  // 🧾 LOG
  await Log.create({
    type: "vendeur:list",
    message: "Consultation liste vendeurs",
    userId: req.user.id
  });

  res.json(vendeurs);
});

/* ===========================
   POST → créer vendeur
=========================== */
router.post("/", admin, async (req, res) => {
  const { name, discordId, force } = req.body;

  if (!name || !discordId) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  const exists = await Vendeur.findOne({
    guildId: process.env.GUILD_ID,
    $or: [{ name }, { discordId }]
  });

  if (exists && !force) {
    await Log.create({
      type: "vendeur:duplicate",
      message: `Tentative ajout vendeur existant (${name} / ${discordId})`,
      userId: req.user.id
    });

    return res.json({
      duplicate: true,
      message: "Nom ou ID Discord déjà utilisé"
    });
  }

  const vendeur = await Vendeur.create({
    guildId: process.env.GUILD_ID,
    name,
    discordId
  });

  // ✅ LOG ajout
  await Log.create({
    type: "vendeur:add",
    message: `Ajout vendeur : ${name} (${discordId})`,
    userId: req.user.id,
    targetId: vendeur._id
  });

  res.json(vendeur);
});

/* ===========================
   PUT → modifier vendeur
=========================== */
router.put("/:id", admin, async (req, res) => {
  const { name, discordId } = req.body;

  const conflict = await Vendeur.findOne({
    guildId: process.env.GUILD_ID,
    _id: { $ne: req.params.id },
    $or: [{ name }, { discordId }]
  });

  if (conflict) {
    await Log.create({
      type: "vendeur:duplicate",
      message: `Conflit modification vendeur (${name} / ${discordId})`,
      userId: req.user.id
    });

    return res.json({
      duplicate: true,
      message: "Nom ou ID Discord déjà utilisé"
    });
  }

  const old = await Vendeur.findById(req.params.id);

  await Vendeur.findByIdAndUpdate(req.params.id, { name, discordId });

  // ✏️ LOG modification
  await Log.create({
    type: "vendeur:edit",
    message: `Vendeur modifié : "${old.name}" → "${name}"`,
    userId: req.user.id,
    targetId: req.params.id
  });

  res.json({ success: true });
});

/* ===========================
   DELETE → supprimer vendeur
   + clear vouches
=========================== */
router.delete("/:id", admin, async (req, res) => {
  const vendeur = await Vendeur.findById(req.params.id);

  const deletedVouches = await Vouch.deleteMany({
    vendeurId: vendeur.discordId,
    guildId: process.env.GUILD_ID
  });

  await Vendeur.findByIdAndDelete(req.params.id);

  // 🧾 LOG clear vouches
  await Log.create({
    type: "vendeur:clear",
    message: `Clear ${deletedVouches.deletedCount} vouches du vendeur ${vendeur.name}`,
    userId: req.user.id,
    targetId: req.params.id
  });

  // 🗑️ LOG suppression vendeur
  await Log.create({
    type: "vendeur:delete",
    message: `Suppression vendeur : ${vendeur.name}`,
    userId: req.user.id,
    targetId: req.params.id
  });

  res.json({ success: true });
});

module.exports = router;
