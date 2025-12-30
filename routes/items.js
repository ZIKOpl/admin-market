const router = require("express").Router();
const Item = require("../models/Item");
const Log = require("../models/Log");
const admin = require("../middlewares/admin");

/*
|--------------------------------------------------------------------------
| GET — Liste des items
|--------------------------------------------------------------------------
*/
router.get("/", admin, async (req, res) => {
  const items = await Item.find().sort({ createdAt: -1 });
  res.json(items);
});

/*
|--------------------------------------------------------------------------
| POST — Ajouter un item
|--------------------------------------------------------------------------
*/
router.post("/", admin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Nom requis" });

  // ❌ Doublon
  const exists = await Item.findOne({ name });
  if (exists) {
    return res.status(409).json({ error: "Item déjà existant" });
  }

  const item = await Item.create({ name });

  // 🧾 LOG
  await Log.create({
    type: "item:add",
    message: `Item ajouté : ${name}`,
    userId: req.user.id
  });

  res.json(item);
});

/*
|--------------------------------------------------------------------------
| PUT — Modifier un item
|--------------------------------------------------------------------------
*/
router.put("/:id", admin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Nom requis" });

  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ error: "Item introuvable" });

  // ❌ Doublon
  const exists = await Item.findOne({ name });
  if (exists && exists._id.toString() !== item._id.toString()) {
    return res.status(409).json({ error: "Nom déjà utilisé" });
  }

  const oldName = item.name;
  item.name = name;
  await item.save();

  // 🧾 LOG
  await Log.create({
    type: "item:edit",
    message: `Item modifié : ${oldName} → ${name}`,
    userId: req.user.id
  });

  res.json(item);
});

/*
|--------------------------------------------------------------------------
| DELETE — Supprimer un item
|--------------------------------------------------------------------------
*/
router.delete("/:id", admin, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ error: "Item introuvable" });

  await item.deleteOne();

  // 🧾 LOG
  await Log.create({
    type: "item:delete",
    message: `Item supprimé : ${item.name}`,
    userId: req.user.id
  });

  res.json({ success: true });
});

module.exports = router;
