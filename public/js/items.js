const list = document.getElementById("items");

function loadItems() {
  fetch("/api/items")
    .then(r => r.json())
    .then(items => {
      list.innerHTML = "";
      items.forEach(i => {
        const c = document.createElement("div");
        c.className = "card";
        c.innerHTML = `
          <strong>${i.name}</strong>
          <div style="float:right">
            <button class="btn edit" onclick="editItem('${i._id}', '${i.name}')">Modifier</button>
            <button class="btn delete" onclick="confirmDelete('${i._id}')">Supprimer</button>
          </div>
        `;
        list.appendChild(c);
      });
    });
}

function addItem() {
  const name = itemName.value.trim();
  if (!name) return toast("Nom requis", "warning");

  fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  })
  .then(r => r.json())
  .then(res => {
    if (res.duplicate) return toast(res.message, "warning");
    toast("Item ajouté");
    itemName.value = "";
    loadItems();
  });
}

function editItem(id, old) {
  confirmModal(`Modifier "${old}" ?`, () => {
    const name = prompt("Nouveau nom", old);
    if (!name) return;

    fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    })
    .then(r => r.json())
    .then(res => {
      if (res.duplicate) return toast(res.message, "warning");
      toast("Item modifié");
      loadItems();
    });
  });
}

function confirmDelete(id) {
  confirmModal("Supprimer cet item ?", () => {
    fetch(`/api/items/${id}`, { method: "DELETE" })
      .then(() => {
        toast("Item supprimé");
        loadItems();
      });
  });
}

loadItems();
