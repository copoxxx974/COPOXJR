
const SUPABASE_URL = "https://aiwmxkmiroqaissxybac.supabase.co";
const SUPABASE_KEY = "sb_publishable__ZKfSrfvN-FY21E_O2NSTw_bP1-AUpI";

const starterApps = [
  { id: "demo-1", name: "Focus Notes", category: "Apps", version: "1.2.0", description: "A clean space for notes, ideas, and daily plans.", url: "", icon: "" },
  { id: "demo-2", name: "Pixel Racer", category: "Games", version: "2.0.1", description: "A fast arcade racing concept for your app library.", url: "", icon: "" },
  { id: "demo-3", name: "Device Toolkit", category: "Tools", version: "1.0.0", description: "Useful utilities collected in one simple listing.", url: "", icon: "" }
];

const STORE_KEY = "copoxjr-demo-apps-v1";
let apps = [];
let activeCategory = "All";
let isAdmin = false;

const grid = document.getElementById("appGrid");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("adminModal");
const list = document.getElementById("adminList");

function esc(s = "") {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  }[c]));
}

async function db(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  if (response.status === 204) return null;
  return response.json();
}

async function loadApps() {
  try {
    const rows = await db(
      "apps?select=id,name,category,version,description,url,icon&order=created_at.desc"
    );
    apps = rows || [];
  } catch (error) {
    console.error("Supabase load failed:", error);
    try {
      apps = JSON.parse(localStorage.getItem(STORE_KEY)) || starterApps;
    } catch {
      apps = starterApps;
    }
    alert("Could not load apps from Supabase. Check your database settings.");
  }
  render();
}

function render() {
  const q = searchInput.value.trim().toLowerCase();
  const shown = apps.filter(a =>
    (activeCategory === "All" || a.category === activeCategory) &&
    [a.name, a.category, a.description].join(" ").toLowerCase().includes(q)
  );

  grid.innerHTML = shown.length ? shown.map(a => `
    <article class="app-card">
      <div class="app-top">
        <div class="app-icon-box">
          ${a.icon ? `<img src="${esc(a.icon)}" alt="">` : "✦"}
        </div>
        <div>
          <h3 class="app-title">${esc(a.name)}</h3>
          <div class="app-meta">Version ${esc(a.version || "—")}</div>
        </div>
      </div>
      <p class="app-desc">${esc(a.description)}</p>
      <div class="card-bottom">
        <span class="pill">${esc(a.category)}</span>
        ${a.url
          ? `<a class="get-link" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">Download ↗</a>`
          : `<span class="app-meta">Coming soon</span>`}
      </div>
    </article>
  `).join("") : `<div class="empty">No apps found. Try another search or category.</div>`;

  renderAdmin();
}

function renderAdmin() {
  if (!list) return;

  list.innerHTML = apps.length ? apps.map(a => `
    <div class="admin-item">
      <span>${esc(a.name)} <span class="app-meta">(${esc(a.category)})</span></span>
      ${isAdmin ? `<button class="delete-btn" data-delete="${esc(a.id)}">Delete</button>` : ""}
    </div>
  `).join("") : "<p class='app-meta'>No apps added.</p>";

  list.querySelectorAll("[data-delete]").forEach(button => {
    button.addEventListener("click", async () => {
      if (!isAdmin) return;

      try {
        await db(`apps?id=eq.${encodeURIComponent(button.dataset.delete)}`, {
          method: "DELETE"
        });
        await loadApps();
      } catch (error) {
        console.error(error);
        alert("Delete failed. Check admin permissions in Supabase.");
      }
    });
  });
}

document.getElementById("filters")
  .querySelectorAll("button")
  .forEach(button => button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    document.querySelectorAll(".filter").forEach(item =>
      item.classList.toggle("active", item === button)
    );
    render();
  }));

searchInput.addEventListener("input", render);

document.getElementById("openAdmin").addEventListener("click", () => {
  modal.classList.remove("hidden");
});

document.getElementById("closeAdmin").addEventListener("click", () => {
  modal.classList.add("hidden");
});

modal.addEventListener("click", event => {
  if (event.target === modal) modal.classList.add("hidden");
});

document.getElementById("appForm").addEventListener("submit", async event => {
  event.preventDefault();

  if (!isAdmin) {
    alert("Admin login is not configured yet. Apps cannot be added securely.");
    return;
  }

  const app = {
    name: document.getElementById("appName").value.trim(),
    category: document.getElementById("appCategory").value,
    version: document.getElementById("appVersion").value.trim() || "1.0.0",
    description: document.getElementById("appDescription").value.trim(),
    url: document.getElementById("appUrl").value.trim() || null,
    icon: document.getElementById("appIcon").value.trim() || null
  };

  try {
    await db("apps", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(app)
    });
    event.target.reset();
    await loadApps();
    alert("App saved to Supabase.");
  } catch (error) {
    console.error(error);
    alert("Could not add app. Check Supabase admin permissions.");
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
loadApps();
