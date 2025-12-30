fetch("/api/config")
  .then(r => {
    if (!r.ok) throw new Error("Impossible de charger la configuration");
    return r.json();
  })
  .then(c => {
    document.getElementById("logChannel").value = c.logChannelId || "";
    document.getElementById("leaderboardChannel").value = c.leaderboardChannelId || "";
    document.getElementById("color").value = c.embedColor || "#5865F2";
    document.getElementById("colorPreview").style.background = c.embedColor;

    notify("Configuration chargée", "info");
  })
  .catch(() => {
    notify("Erreur lors du chargement de la configuration", "error");
  });

function save() {
  const embedColor = document.getElementById("color").value;
  const logChannelId = document.getElementById("logChannel").value.trim();
  const leaderboardChannelId = document.getElementById("leaderboardChannel").value.trim();

  fetch("/api/config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embedColor,
      logChannelId,
      leaderboardChannelId
    })
  })
    .then(r => {
      if (!r.ok) throw new Error("Erreur sauvegarde");
      return r.json();
    })
    .then(c => {
      document.getElementById("colorPreview").style.background = c.embedColor;
      notify("Configuration sauvegardée avec succès", "success");
    })
    .catch(() => {
      notify("Impossible de sauvegarder la configuration", "error");
    });
}
