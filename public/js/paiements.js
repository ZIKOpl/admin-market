const list = document.getElementById("paiements");

function loadPaiements() {
  fetch("/api/paiements")
    .then(r => r.json())
    .then(ps => {
      list.innerHTML = "";
      ps.forEach(p => {
        const c = document.createElement("div");
        c.className = "card";
        c.innerHTML = `
          <strong>${p.name}</strong>
          <div style="float:right">
            <button class="btn edit" onclick="editPaiement('${p._id}', '${p.name}')">Modifier</button>
            <button class="btn delete" onclick="confirmDelete('${p._id}')">Supprimer</button>
          </div>
        `;
        list.appendChild(c);
      });
    });
}

function addPaiement() {
  const name = payName.value.trim();
  if (!name) return toast("Nom requis", "warning");

  fetch("/api/paiements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  })
  .then(r => r.json())
  .then(res => {
    if (res.duplicate) return toast(res.message, "warning");
    toast("Paiement ajouté");
    payName.value = "";
    loadPaiements();
  });
}

function editPaiement(id, old) {
  confirmModal(`Modifier "${old}" ?`, () => {
    const name = prompt("Nouveau nom", old);
    if (!name) return;

    fetch(`/api/paiements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    })
    .then(r => r.json())
    .then(res => {
      if (res.duplicate) return toast(res.message, "warning");
      toast("Paiement modifié");
      loadPaiements();
    });
  });
}

function confirmDelete(id) {
  confirmModal("Supprimer ce moyen de paiement ?", () => {
    fetch(`/api/paiements/${id}`, { method: "DELETE" })
      .then(() => {
        toast("Paiement supprimé");
        loadPaiements();
      });
  });
}

loadPaiements();
