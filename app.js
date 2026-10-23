const starterApps = [
  {id:"demo-1",name:"Focus Notes",category:"Apps",version:"1.2.0",description:"A clean space for notes, ideas, and daily plans.",url:"",icon:""},
  {id:"demo-2",name:"Pixel Racer",category:"Games",version:"2.0.1",description:"A fast arcade racing concept for your app library.",url:"",icon:""},
  {id:"demo-3",name:"Device Toolkit",category:"Tools",version:"1.0.0",description:"Useful utilities collected in one simple listing.",url:"",icon:""}
];
const STORE_KEY = "copoxjr-demo-apps-v1";
let apps = loadApps();
let activeCategory = "All";
const grid = document.getElementById("appGrid");
const searchInput = document.getElementById("searchInput");
function loadApps(){try{const v=localStorage.getItem(STORE_KEY);return v?JSON.parse(v):starterApps;}catch(e){return starterApps;}}
function saveApps(){localStorage.setItem(STORE_KEY,JSON.stringify(apps));}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function render(){
  const q=searchInput.value.trim().toLowerCase();
  const shown=apps.filter(a=>(activeCategory==="All"||a.category===activeCategory)&&[a.name,a.category,a.description].join(" ").toLowerCase().includes(q));
  grid.innerHTML=shown.length?shown.map(a=>`<article class="app-card">
    <div class="app-top"><div class="app-icon-box">${a.icon?`<img src="${esc(a.icon)}" alt="">`:"✦"}</div><div><h3 class="app-title">${esc(a.name)}</h3><div class="app-meta">Version ${esc(a.version||"—")}</div></div></div>
    <p class="app-desc">${esc(a.description)}</p><div class="card-bottom"><span class="pill">${esc(a.category)}</span>${a.url?`<a class="get-link" href="${esc(a.url)}" target="_blank" rel="noopener">Download ↗</a>`:`<span class="app-meta">Coming soon</span>`}</div>
  </article>`).join(""):`<div class="empty">No apps found. Try another search or category.</div>`;
  renderAdmin();
}
function renderAdmin(){
  const list=document.getElementById("adminList");
  list.innerHTML=apps.length?apps.map(a=>`<div class="admin-item"><span>${esc(a.name)} <span class="app-meta">(${esc(a.category)})</span></span><button class="delete-btn" data-delete="${esc(a.id)}">Delete</button></div>`).join(""):"<p class='app-meta'>No apps added.</p>";
  list.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>{apps=apps.filter(a=>a.id!==b.dataset.delete);saveApps();render();}));
}
document.getElementById("filters").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{activeCategory=b.dataset.category;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));render();}));
searchInput.addEventListener("input",render);
const modal=document.getElementById("adminModal");
document.getElementById("openAdmin").addEventListener("click",()=>modal.classList.remove("hidden"));
document.getElementById("closeAdmin").addEventListener("click",()=>modal.classList.add("hidden"));
modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.add("hidden");});
document.getElementById("appForm").addEventListener("submit",e=>{
  e.preventDefault();
  const app={id:"app-"+Date.now(),name:document.getElementById("appName").value.trim(),category:document.getElementById("appCategory").value,version:document.getElementById("appVersion").value.trim()||"—",description:document.getElementById("appDescription").value.trim(),url:document.getElementById("appUrl").value.trim(),icon:document.getElementById("appIcon").value.trim()};
  apps.unshift(app);saveApps();e.target.reset();render();alert("Added to this browser only. A live site needs a secure backend and file storage.");
});
document.getElementById("year").textContent=new Date().getFullYear();
render();
