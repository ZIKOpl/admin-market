const container = document.getElementById("logs");
const filter = document.getElementById("filter");

function loadLogs(type = "") {
  let url = "/api/logs";
  if (type) url += "?type=" + type;

  fetch(url)
    .then(r => r.json())
    .then(logs => {
      container.innerHTML = "";

      if (!logs.length) {
        container.innerHTML = "<p>Aucun log trouvé.</p>";
        return;
      }

      logs.forEach(l => {
        container.innerHTML += `
          <div class="log-card">
            <div class="log-type">${l.type}</div>
            <div class="log-msg">${l.message}</div>
            <div class="log-meta">
              ${l.user || "system"} • ${new Date(l.createdAt).toLocaleString()}
            </div>
          </div>
        `;
      });
    })
    .catch(() => {
      container.innerHTML = "<p>Erreur chargement logs</p>";
    });
}


filter.addEventListener("change", () => {
  loadLogs(filter.value);
});

loadLogs();
