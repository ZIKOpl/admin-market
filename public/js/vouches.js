const container = document.getElementById("vouches");

fetch("/api/vouches")
  .then(r => r.json())
  .then(vouches => {
    if (!vouches.length) {
      container.innerHTML = `<p class="empty">Aucun vouch trouvé.</p>`;
      return;
    }

    container.innerHTML = "";

    vouches.forEach(v => {
      const card = document.createElement("div");
      card.className = "vouch-card";
      card.dataset.id = v._id;

      card.innerHTML = `
        <div class="vouch-header">
          <img src="${v.authorAvatar}" class="avatar">

          <div class="author">
            <strong>${v.anonyme ? "Anonyme" : v.authorTag}</strong>
            <span class="date">${new Date(v.createdAt).toLocaleString()}</span>
          </div>

          <div class="rating">${"⭐".repeat(v.note)}</div>

          <button class="btn delete small" onclick="confirmDeleteVouch('${v._id}')">
            Supprimer
          </button>
        </div>

        <div class="vouch-body">
          <div class="row"><span>Vendeur</span><b>${v.vendeurName}</b></div>
          <div class="row"><span>Item</span><b>${v.item}</b></div>
          <div class="row"><span>Prix</span><b>${v.prix}</b></div>
          <div class="row"><span>Paiement</span><b>${v.paiement}</b></div>
        </div>

        ${v.commentaire ? `
          <div class="comment">
            “${v.commentaire}”
          </div>
        ` : ""}
      `;

      container.appendChild(card);
    });
  });

function confirmDeleteVouch(id) {
  confirmModal("Supprimer ce vouch ?", () => {
    fetch("/api/vouches/" + id, { method: "DELETE" })
      .then(() => {
        const el = document.querySelector(`[data-id="${id}"]`);
        el.classList.add("fade-out");
        setTimeout(() => el.remove(), 300);
        notify("Vouch supprimé", "success");
      });
  });
}
