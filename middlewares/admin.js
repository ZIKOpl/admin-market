module.exports = async (req, res, next) => {
  if (!req.user) {
    console.log("❌ Pas connecté");
    return res.sendStatus(401);
  }

  const userId = req.user.id;
  const guildId = process.env.GUILD_ID;

  console.log("🔍 Vérif admin pour", userId);

  const response = await fetch(
    `https://discord.com/api/guilds/${guildId}/members/${userId}`,
    {
      headers: {
        Authorization: `Bot ${process.env.BOT_TOKEN}`
      }
    }
  );

  if (!response.ok) {
    console.log("❌ Discord API ERROR:", response.status);
    return res.sendStatus(403);
  }

  const member = await response.json();

  console.log("🎭 Rôles utilisateur :", member.roles);

  if (!member.roles.includes(process.env.ADMIN_ROLE_ID)) {
    console.log("❌ Rôle admin manquant");
    return res.sendStatus(403);
  }

  console.log("✅ Admin OK");
  next();
};
