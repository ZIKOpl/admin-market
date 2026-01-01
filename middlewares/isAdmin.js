const fetch = require("node-fetch");

module.exports = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Non connecté" });
  }

  // ✅ Déjà vérifié en session
  if (typeof req.session.isAdmin === "boolean") {
    if (req.session.isAdmin) return next();
    return res.status(403).json({ error: "Accès refusé" });
  }

  console.log("🔍 Vérif admin (1 seule fois) :", req.user.id);

  try {
    const response = await fetch(
      `https://discord.com/api/users/@me/guilds/${process.env.GUILD_ID}/member`,
      {
        headers: {
          Authorization: `Bearer ${req.user.accessToken}`
        }
      }
    );

    if (!response.ok) {
      console.error("❌ Discord API ERROR:", response.status);
      req.session.isAdmin = false;
      return res.status(403).json({ error: "Accès refusé" });
    }

    const member = await response.json();

    const isAdmin = member.roles.includes(process.env.ADMIN_ROLE_ID);

    req.session.isAdmin = isAdmin;

    if (!isAdmin) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    console.log("✅ Admin OK");
    next();

  } catch (err) {
    console.error("❌ isAdmin error:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
