/* =========================
   TOAST
========================= */
function toast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const el = document.createElement("div");

  el.className = `toast ${type}`;
  el.innerText = message;

  container.appendChild(el);

  setTimeout(() => el.remove(), 3500);
}

/* =========================
   CONFIRM MODAL
========================= */
function confirmModal(message, onConfirm) {
  const bg = document.createElement("div");
  bg.className = "modal-bg";

  bg.innerHTML = `
    <div class="modal">
      <h3>Confirmation</h3>
      <p>${message}</p>
      <div class="modal-actions">
        <button class="btn delete">Annuler</button>
        <button class="btn add">Oui</button>
      </div>
    </div>
  `;

  document.body.appendChild(bg);

  bg.querySelector(".delete").onclick = () => bg.remove();
  bg.querySelector(".add").onclick = () => {
    bg.remove();
    onConfirm();
  };

  bg.onclick = e => {
    if (e.target === bg) bg.remove();
  };
}
/* =========================
   TOAST / NOTIFICATIONS
========================= */

const toastContainer = document.getElementById("toast-container") || (() => {
  const div = document.createElement("div");
  div.id = "toast-container";
  document.body.appendChild(div);
  return div;
})();

window.notify = function (message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close">&times;</button>
  `;

  toastContainer.appendChild(toast);

  // fermeture manuelle
  toast.querySelector(".toast-close").onclick = () => closeToast(toast);

  // auto close
  setTimeout(() => closeToast(toast), 3500);
};

function closeToast(toast) {
  toast.classList.add("hide");
  setTimeout(() => toast.remove(), 300);
}
