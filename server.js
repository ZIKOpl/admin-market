require("dotenv").config();
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const path = require("path");

const app = express();

/* Mongo */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Mongo connecté"))
  .catch(console.error);

/* Middlewares */
app.use(express.json());

// ✅ FICHIERS STATIQUES (OBLIGATOIRE EN PREMIER)
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

/* Passport */
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK,
  scope: ["identify"]
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

/* Routes */
app.use("/auth", require("./routes/auth"));
app.use("/api/vouches", require("./routes/vouches"));
app.use("/api/items", require("./routes/items"));
app.use("/api/vendeurs", require("./routes/vendeurs"));
app.use("/api/paiements", require("./routes/paiements"));
app.use("/api/config", require("./routes/config"));
app.use("/api/logs", require("./routes/logs"));

/* ✅ ROUTE PRINCIPALE (MANQUANTE AVANT) */
app.get("/", (req, res) => {
  if (!req.user) {
    return res.sendFile(path.join(__dirname, "public", "login.html"));
  }
  res.sendFile(path.join(__dirname, "public", "vouches.html"));
});

/* Start */
app.listen(process.env.PORT, () =>
  console.log(`🚀 http://localhost:${process.env.PORT}/index.html`)
);
