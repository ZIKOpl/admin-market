const router = require("express").Router();
const passport = require("passport");
const Log = require("../models/Log");

/**
 * 🔐 Redirection Discord
 */
router.get("/discord", passport.authenticate("discord"));

/**
 * ✅ Callback Discord (connexion réussie)
 */
router.get(
  "/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/auth/failed" }),
  async (req, res) => {

    // 🧾 LOG : connexion réussie
    await Log.create({
      type: "auth:login",
      message: "Connexion réussie",
      userId: req.user.id
    });

    res.redirect("/vouches.html");
  }
);

/**
 * ❌ Connexion échouée
 */
router.get("/failed", async (req, res) => {
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
 * 👀 Infos utilisateur
 */
router.get("/me", async (req, res) => {
  if (!req.user) return res.json(null);

  // 🧾 LOG (optionnel)
  await Log.create({
    type: "auth:me",
    message: "Consultation profil utilisateur",
    userId: req.user.id
  });

  res.json(req.user);
});

module.exports = router;
