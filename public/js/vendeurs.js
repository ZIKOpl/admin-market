const list = document.getElementById("vendeurs");

function loadVendeurs() {
  fetch("/api/vendeurs")
    .then(r => r.json())
    .then(vs => {
      list.innerHTML = "";
      vs.forEach(v => {
        const c = document.createElement("div");
        c.className = "card";
        c.innerHTML = `
          <strong>${v.name}</strong> <span style="color:#aaa">(${v.discordId})</span>
          <div style="float:right">
            <button class="btn edit" onclick="editVendeur('${v._id}', '${v.name}', '${v.discordId}')">Modifier</button>
            <button class="btn delete" onclick="confirmDelete('${v._id}')">Supprimer</button>
          </div>
        `;
        list.appendChild(c);
      });
    });
}

function addVendeur() {
  const name = vendeurName.value.trim();
  const discordId = vendeurId.value.trim();
  if (!name || !discordId) return toast("Champs requis", "warning");

  fetch("/api/vendeurs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, discordId })
  })
  .then(r => r.json())
  .then(res => {
    if (res.duplicate) return toast(res.message, "warning");
    toast("Vendeur ajouté");
    vendeurName.value = vendeurId.value = "";
    loadVendeurs();
  });
}

function editVendeur(id, oldName, oldId) {
  confirmModal("Modifier ce vendeur ?", () => {
    const name = prompt("Nom", oldName);
    const discordId = prompt("ID Discord", oldId);
    if (!name || !discordId) return;

    fetch(`/api/vendeurs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, discordId })
    })
    .then(r => r.json())
    .then(res => {
      if (res.duplicate) return toast(res.message, "warning");
      toast("Vendeur modifié");
      loadVendeurs();
    });
  });
}

function confirmDelete(id) {
  confirmModal("Supprimer ce vendeur ?", () => {
    fetch(`/api/vendeurs/${id}`, { method: "DELETE" })
      .then(() => {
        toast("Vendeur supprimé");
        loadVendeurs();
      });
  });
}

loadVendeurs();
