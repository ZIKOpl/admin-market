const router = require("express").Router();
const Item = require("../models/Item");
const Log = require("../models/Log");
const isAdmin = require("../middlewares/isAdmin");

/*
|--------------------------------------------------------------------------
| GET — Liste des items
|--------------------------------------------------------------------------
*/
router.get("/", isAdmin, async (req, res) => {
  try {
    const items = await Item.find({
      guildId: process.env.GUILD_ID
    }).sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.error("❌ GET ITEMS:", err);
    res.status(500).json([]);
  }
});

/*
|--------------------------------------------------------------------------
| POST — Ajouter un item
|--------------------------------------------------------------------------
*/
router.post("/", isAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nom requis" });
    }

    const exists = await Item.findOne({
      guildId: process.env.GUILD_ID,
      name
    });

    if (exists) {
      return res.status(409).json({ error: "Item déjà existant" });
    }

    const item = await Item.create({
      guildId: process.env.GUILD_ID,
      name
    });

    await Log.create({
      guildId: process.env.GUILD_ID,
      type: "item:add",
      message: `Item ajouté : ${name}`,
      userId: req.user.id
    });

    res.json(item);
  } catch (err) {
    console.error("❌ ADD ITEM:", err);
    res.status(500).json({ error: "Erreur création item" });
  }
});

/*
|--------------------------------------------------------------------------
| PUT — Modifier un item
|--------------------------------------------------------------------------
*/
router.put("/:id", isAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nom requis" });
    }

    const item = await Item.findOne({
      _id: req.params.id,
      guildId: process.env.GUILD_ID
    });

    if (!item) {
      return res.status(404).json({ error: "Item introuvable" });
    }

    const exists = await Item.findOne({
      guildId: process.env.GUILD_ID,
      name,
      _id: { $ne: item._id }
    });

    if (exists) {
      return res.status(409).json({ error: "Nom déjà utilisé" });
    }

    const oldName = item.name;
    item.name = name;
    await item.save();

    await Log.create({
      guildId: process.env.GUILD_ID,
      type: "item:edit",
      message: `Item modifié : ${oldName} → ${name}`,
      userId: req.user.id
    });

    res.json(item);
  } catch (err) {
    console.error("❌ EDIT ITEM:", err);
    res.status(500).json({ error: "Erreur modification item" });
  }
});

/*
|--------------------------------------------------------------------------
| DELETE — Supprimer un item
|--------------------------------------------------------------------------
*/
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      guildId: process.env.GUILD_ID
    });

    if (!item) {
      return res.status(404).json({ error: "Item introuvable" });
    }

    await item.deleteOne();

    await Log.create({
      guildId: process.env.GUILD_ID,
      type: "item:delete",
      message: `Item supprimé : ${item.name}`,
      userId: req.user.id
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE ITEM:", err);
    res.status(500).json({ error: "Erreur suppression item" });
  }
});

module.exports = router;
