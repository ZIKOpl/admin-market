fetch("/auth/me")
  .then(r => r.json())
  .then(user => {

    if (!user || user.error) {
      window.location.href = "/login.html";
      return;
    }

    fetch("/api/config")
      .then(r => {
        if (r.status === 403) {
          window.location.href = "/forbidden.html";
        }
      });

    const el = document.getElementById("user");
    if (!el) return;

    el.innerHTML = `
      <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png">
      <span>${user.username}</span>
      <a href="/auth/logout">Déconnexion</a>
    `;
  });
