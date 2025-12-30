const router = require("express").Router();
const Paiement = require("../models/Paiement");
const Log = require("../models/Log");
const admin = require("../middlewares/admin");

/*
  GET → liste moyens de paiement
*/
router.get("/", admin, async (req, res) => {
  const paiements = await Paiement.find({
    guildId: process.env.GUILD_ID
  }).sort({ name: 1 });

  // 🧾 LOG
  await Log.create({
    type: "paiement:list",
    message: "Consultation des moyens de paiement",
    userId: req.user.id
  });

  res.json(paiements);
});

/*
  POST → ajout paiement
*/
router.post("/", admin, async (req, res) => {
  const { name, force } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Nom manquant" });
  }

  const exists = await Paiement.findOne({
    guildId: process.env.GUILD_ID,
    name
  });

  // ⚠️ Doublon détecté
  if (exists && !force) {
    await Log.create({
      type: "paiement:duplicate",
      message: `Tentative ajout paiement déjà existant : ${name}`,
      userId: req.user.id
    });

    return res.json({
      duplicate: true,
      message: "Ce moyen de paiement existe déjà"
    });
  }

  const paiement = await Paiement.create({
    guildId: process.env.GUILD_ID,
    name
  });

  // ✅ LOG ajout
  await Log.create({
    type: "paiement:add",
    message: `Ajout moyen de paiement : ${name}`,
    userId: req.user.id,
    targetId: paiement._id
  });

  res.json({ success: true });
});

/*
  PUT → modifier paiement
*/
router.put("/:id", admin, async (req, res) => {
  const { name } = req.body;

  const conflict = await Paiement.findOne({
    guildId: process.env.GUILD_ID,
    _id: { $ne: req.params.id },
    name
  });

  if (conflict) {
    await Log.create({
      type: "paiement:duplicate",
      message: `Conflit renommage paiement : ${name}`,
      userId: req.user.id
    });

    return res.json({
      duplicate: true,
      message: "Nom déjà utilisé"
    });
  }

  const old = await Paiement.findById(req.params.id);

  await Paiement.findByIdAndUpdate(req.params.id, { name });

  // ✏️ LOG modification
  await Log.create({
    type: "paiement:edit",
    message: `Paiement modifié : "${old.name}" → "${name}"`,
    userId: req.user.id,
    targetId: req.params.id
  });

  res.json({ success: true });
});

/*
  DELETE → supprimer paiement
*/
router.delete("/:id", admin, async (req, res) => {
  const paiement = await Paiement.findById(req.params.id);

  await Paiement.findByIdAndDelete(req.params.id);

  // 🗑️ LOG suppression
  await Log.create({
    type: "paiement:delete",
    message: `Suppression paiement : ${paiement?.name || "inconnu"}`,
    userId: req.user.id,
    targetId: req.params.id
  });

  res.json({ success: true });
});

module.exports = router;
