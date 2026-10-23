// ==========================================
// COPOXJR — Supabase App Library
// ==========================================

const SUPABASE_URL = "https://aiwmxkmiroqaissxybac.supabase.co";
const SUPABASE_KEY = "sb_publishable__ZKfSrfvN-FY21E_O2NSTw_bP1-AUpI";

const STORE_KEY = "copoxjr-demo-apps-v1";

const starterApps = [
  {
    id: "demo-1",
    name: "Focus Notes",
    category: "Apps",
    version: "1.2.0",
    description: "A clean space for notes, ideas, and daily plans.",
    url: "",
    icon: ""
  },
  {
    id: "demo-2",
    name: "Pixel Racer",
    category: "Games",
    version: "2.0.1",
    description: "A fast arcade racing concept for your app library.",
    url: "",
    icon: ""
  },
  {
    id: "demo-3",
    name: "Device Toolkit",
    category: "Tools",
    version: "1.0.0",
    description: "Useful utilities collected in one simple listing.",
    url: "",
    icon: ""
  }
];

let apps = [];
let activeCategory = "All";
let isAdmin = false;

const grid = document.getElementById("appGrid");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("adminModal");
const list = document.getElementById("adminList");

// ------------------------------------------
// HTML escaping
// ------------------------------------------

function esc(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

// ------------------------------------------
// Supabase request
// ------------------------------------------

async function db(path, options = {}) {
  let response;

  try {
    response = await fetch(
      `${SUPABASE_URL}/rest/v1/${path}`,
      {
        ...options,
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          ...options.headers
        }
      }
    );
  } catch (error) {
    throw new Error(
      "Network error: Supabase-এ সংযোগ করা যাচ্ছে না। " +
      "ইন্টারনেট ও Project URL পরীক্ষা করো।"
    );
  }

  const body = await response.text();

  if (!response.ok) {
    let message = body;

    try {
      const data = JSON.parse(body);
      message =
        data.message ||
        data.msg ||
        data.error_description ||
        body;
    } catch {}

    throw new Error(
      `HTTP ${response.status}: ${message}`
    );
  }

  if (!body) return null;

  try {
    return JSON.parse(body);
  } catch {
    throw new Error(
      "Supabase থেকে সঠিক JSON ডেটা পাওয়া যায়নি।"
    );
  }
}

// ------------------------------------------
// Load apps from Supabase
// ------------------------------------------

async function loadApps() {
  try {
    apps = await db(
      "apps?select=id,name,category,version,description,url,icon&order=created_at.desc"
    );

    if (!Array.isArray(apps)) {
      throw new Error(
        "apps টেবিল থেকে প্রত্যাশিত তালিকা পাওয়া যায়নি।"
      );
    }

    render();

  } catch (error) {
    console.error("COPOXJR Supabase error:", error);

    // Local fallback: display saved or demo apps.
    try {
      const saved = localStorage.getItem(STORE_KEY);
      apps = saved ? JSON.parse(saved) : starterApps;
    } catch {
      apps = starterApps;
    }

    render();

    alert(
      "COPOXJR Supabase Error\n\n" +
      error.message +
      "\n\nSupabase URL, Publishable Key, " +
      "apps table এবং RLS policies পরীক্ষা করো। " +
      "নমুনা অ্যাপ দেখালেও Supabase সংযোগ ঠিক হয়েছে " +
      "এমন নয়।"
    );
  }
}

// ------------------------------------------
// Render app cards
// ------------------------------------------

function render() {
  if (!grid || !searchInput) return;

  const q = searchInput.value.trim().toLowerCase();

  const shown = apps.filter(app =>
    (activeCategory === "All" ||
      app.category === activeCategory) &&
    [
      app.name,
      app.category,
      app.description
    ].join(" ").toLowerCase().includes(q)
  );

  grid.innerHTML = shown.length
    ? shown.map(app => `
      <article class="app-card">
        <div class="app-top">
          <div class="app-icon-box">
            ${
              app.icon
                ? `<img src="${esc(app.icon)}" alt="">`
                : "✦"
            }
          </div>

          <div>
            <h3 class="app-title">${esc(app.name)}</h3>
            <div class="app-meta">
              Version ${esc(app.version || "—")}
            </div>
          </div>
        </div>

        <p class="app-desc">${esc(app.description)}</p>

        <div class="card-bottom">
          <span class="pill">${esc(app.category)}</span>

          ${
            app.url
              ? `<a class="get-link"
                    href="${esc(app.url)}"
                    target="_blank"
                    rel="noopener noreferrer">
                    Download ↗
                 </a>`
              : `<span class="app-meta">Coming soon</span>`
          }
        </div>
      </article>
    `).join("")
    : `<div class="empty">
         No apps found. Try another search or category.
       </div>`;

  renderAdmin();
}

// ------------------------------------------
// Admin list
// ------------------------------------------

function renderAdmin() {
  if (!list) return;

  list.innerHTML = apps.length
    ? apps.map(app => `
        <div class="admin-item">
          <span>
            ${esc(app.name)}
            <span class="app-meta">
              (${esc(app.category)})
            </span>
          </span>

          ${
            isAdmin
              ? `<button class="delete-btn"
                    data-delete="${esc(app.id)}">
                    Delete
                 </button>`
              : ""
          }
        </div>
      `).join("")
    : "<p class='app-meta'>No apps added.</p>";

  list.querySelectorAll("[data-delete]")
    .forEach(button => {
      button.addEventListener("click", async () => {
        if (!isAdmin) {
          alert("Admin login is not configured.");
          return;
        }

        try {
          await db(
            `apps?id=eq.${encodeURIComponent(button.dataset.delete)}`,
            { method: "DELETE" }
          );

          await loadApps();

        } catch (error) {
          console.error("Delete error:", error);
          alert("Delete failed:\n" + error.message);
        }
      });
    });
}

// ------------------------------------------
// Category filters
// ------------------------------------------

const filters = document.getElementById("filters");

if (filters) {
  filters.querySelectorAll("button")
    .forEach(button => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.category;

        document.querySelectorAll(".filter")
          .forEach(item => {
            item.classList.toggle(
              "active",
              item === button
            );
          });

        render();
      });
    });
}

// ------------------------------------------
// Search
// ------------------------------------------

if (searchInput) {
  searchInput.addEventListener("input", render);
}

// ------------------------------------------
// Admin modal
// ------------------------------------------

if (modal) {
  document.getElementById("openAdmin")
    ?.addEventListener("click", () => {
      modal.classList.remove("hidden");
    });

  document.getElementById("closeAdmin")
    ?.addEventListener("click", () => {
      modal.classList.add("hidden");
    });

  modal.addEventListener("click", event => {
    if (event.target === modal) {
      modal.classList.add("hidden");
    }
  });
}

// ------------------------------------------
// Add app
// ------------------------------------------

const appForm = document.getElementById("appForm");

if (appForm) {
  appForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!isAdmin) {
      alert(
        "Admin login এখনো সেটআপ করা হয়নি। " +
        "নিরাপদভাবে অ্যাপ যোগ করার আগে লগইন ব্যবস্থা " +
        "তৈরি করতে হবে।"
      );
      return;
    }

    const app = {
      name: document.getElementById("appName").value.trim(),
      category: document.getElementById("appCategory").value,
      version:
        document.getElementById("appVersion").value.trim()
        || "1.0.0",
      description:
        document.getElementById("appDescription").value.trim(),
      url:
        document.getElementById("appUrl").value.trim()
        || null,
      icon:
        document.getElementById("appIcon").value.trim()
        || null
    };

    try {
      await db("apps", {
        method: "POST",
        headers: {
          Prefer: "return=minimal"
        },
        body: JSON.stringify(app)
      });

      appForm.reset();

      await loadApps();

      alert("App saved to Supabase.");

    } catch (error) {
      console.error("Add app error:", error);

      alert(
        "Could not add app:\n" +
        error.message
      );
    }
  });
}

// ------------------------------------------
// Footer year
// ------------------------------------------

const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}

// ------------------------------------------
// Start website
// ------------------------------------------

loadApps();
