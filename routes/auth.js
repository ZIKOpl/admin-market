const router = require("express").Router();
const passport = require("passport");
const Log = require("../models/Log");

router.get("/discord", passport.authenticate("discord"));

router.get(
  "/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/auth/failed" }),
  async (req, res) => {
    try {
      await Log.create({
        type: "auth:login",
        message: "Connexion réussie",
        userId: req.user?.id || null
      });
    } catch (err) {
      console.error("❌ Erreur log login:", err.message);
    }

    res.redirect("/vouches.html");
  }
)

router.get("/failed", async (req, res) => {
  try {
    await Log.create({
      type: "auth:failed",
      message: "Échec de connexion Discord",
      userId: null
    });
  } catch (err) {
    console.error("❌ Erreur log failed:", err.message);
  }

  res.redirect("/");
});

router.get("/logout", async (req, res) => {
  try {
    if (req.user) {
      await Log.create({
        type: "auth:logout",
        message: "Déconnexion",
        userId: req.user.id
      });
    }
  } catch (err) {
    console.error("❌ Erreur log logout:", err.message);
  }

  req.logout(() => res.redirect("/"));
});

router.get("/me", async (req, res) => {
  if (!req.user) return res.json(null);
  res.json(req.user);
});

module.exports = router;
