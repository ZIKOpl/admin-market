module.exports = (req, res, next) => {
  if (!req.session?.isAdmin) {
    return res.status(403).json({ error: "Accès refusé" });
  }
  next();
};
