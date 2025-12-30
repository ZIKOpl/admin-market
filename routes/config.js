const router = require("express").Router();
const Config = require("../models/Config");
const Log = require("../models/Log");
const admin = require("../middlewares/admin");

/**
 * 📥 GET CONFIG
 */
router.get("/", admin, async (req, res) => {
  let config = await Config.findOne({ guildId: process.env.GUILD_ID });

  if (!config) {
    config = await Config.create({ guildId: process.env.GUILD_ID });
  }

  // 🧾 LOG : consultation config
  await Log.create({
    type: "config:view",
    message: "Configuration consultée",
    userId: req.user.id
  });

  res.json(config);
});

/**
 * ✏️ UPDATE CONFIG
 */
router.put("/", admin, async (req, res) => {
  const { embedColor, logChannelId, leaderboardChannelId } = req.body;

  const config = await Config.findOneAndUpdate(
    { guildId: process.env.GUILD_ID },
    { embedColor, logChannelId, leaderboardChannelId },
    { upsert: true, new: true }
  );

  // 🧾 LOG : modification config
  await Log.create({
    type: "config:update",
    message: `Configuration modifiée (couleur=${embedColor}, logs=${logChannelId}, leaderboard=${leaderboardChannelId})`,
    userId: req.user.id
  });

  res.json(config);
});

module.exports = router;
