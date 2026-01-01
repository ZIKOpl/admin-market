module.exports = (req, res, next) => {
  // ❌ Pas connecté
  if (!req.user) {
    return res.status(401).json({ error: "Non connecté" });
  }

  // ✅ Admin déjà validé en session
  if (req.session.isAdmin === true) {
    return next();
  }

  // ❌ Déjà refusé auparavant
  if (req.session.isAdmin === false) {
    return res.status(403).json({ error: "Accès refusé" });
  }

  /**
   * ⚠️ SÉCURITÉ :
   * À CE STADE, on NE DOIT PLUS appeler Discord
   * Les rôles doivent être définis AU LOGIN
   */

  console.warn("⚠️ Admin non initialisé en session");

  req.session.isAdmin = false;
  return res.status(403).json({
    error: "Accès refusé (admin non initialisé)"
  });
};
