const router = require("express").Router();
const passport = require("passport");
const Log = require("../models/Log");

/**
 * 🔐 Redirection vers Discord
 */
router.get("/discord", passport.authenticate("discord"));

/**
 * ✅ Callback Discord (SUCCÈS)
 */
router.get(
  "/discord/callback",
  (req, res, next) => {
    console.log("🔁 Callback Discord reçu");
    next();
  },
  passport.authenticate("discord", { failureRedirect: "/auth/failed" }),
  async (req, res) => {
    console.log("✅ Auth Discord OK :", req.user?.id);

    // 🧾 LOG connexion réussie
    await Log.create({
      type: "auth:login",
      message: "Connexion réussie",
      userId: req.user.id
    });

    // ✅ REDIRECTION FINALE
    res.redirect("/vouches.html");
  }
);

/**
 * ❌ Connexion échouée
 */
router.get("/failed", async (req, res) => {
  console.log("❌ Échec authentification Discord");

  await Log.create({
    type: "auth:failed",
    message: "Échec de connexion Discord",
    userId: null
  });

  res.redirect("/");
});

/**
 * 🚪 Déconnexion
 */
router.get("/logout", async (req, res) => {
  if (req.user) {
    await Log.create({
      type: "auth:logout",
      message: "Déconnexion",
      userId: req.user.id
    });
  }

  req.logout(() => {
    res.redirect("/");
  });
});

/**
 * 👀 Infos utilisateur connecté
 */
router.get("/me", (req, res) => {
  res.json(req.user || null);
});

module.exports = router;
