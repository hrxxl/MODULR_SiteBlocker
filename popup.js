// popup.js — SiteBlock

/* ──────────────────────────────────────────
   DOM refs
────────────────────────────────────────── */
const masterToggle  = document.getElementById("masterToggle");
const masterLabel   = document.getElementById("masterLabel");
const siteInput     = document.getElementById("siteInput");
const addBtn        = document.getElementById("addBtn");
const siteList      = document.getElementById("siteList");
const emptyState    = document.getElementById("emptyState");
const listHeader    = document.getElementById("listHeader");
const clearAllBtn   = document.getElementById("clearAllBtn");
const inputError    = document.getElementById("inputError");
const statTotal     = document.getElementById("statTotal");
const statActive    = document.getElementById("statActive");
const statPaused    = document.getElementById("statPaused");
const appEl         = document.querySelector(".app");

/* ──────────────────────────────────────────
   State
────────────────────────────────────────── */
let sites         = [];   // [{ domain, enabled }]
let masterEnabled = true;

/* ──────────────────────────────────────────
   Storage helpers
────────────────────────────────────────── */
async function loadState() {
  const data = await chrome.storage.local.get(["sites", "masterEnabled"]);
  sites         = data.sites         ?? [];
  masterEnabled = data.masterEnabled ?? true;
}

async function saveState() {
  await chrome.storage.local.set({ sites, masterEnabled });
  chrome.runtime.sendMessage({ type: "SYNC_RULES" });
}

/* ──────────────────────────────────────────
   Domain utils
────────────────────────────────────────── */
function sanitizeDomain(raw) {
  let s = raw.trim().toLowerCase();
  s = s.replace(/^(https?:\/\/)?(www\.)?/, "");
  s = s.split("/")[0];
  s = s.split("?")[0];
  s = s.split("#")[0];
  return s;
}

function isValidDomain(domain) {
  // Basic hostname validation: at least one dot, no spaces, valid chars
  return /^[a-z0-9]([a-z0-9\-\.]*[a-z0-9])?(\.[a-z]{2,})$/.test(domain);
}

function domainLetter(domain) {
  return domain.charAt(0).toUpperCase();
}

/* ──────────────────────────────────────────
   Favicon: try Google S2 API; fallback letter
────────────────────────────────────────── */
function makeFaviconEl(domain) {
  const wrap = document.createElement("div");
  wrap.className = "site-avatar";

  const img = document.createElement("img");
  img.src = `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
  img.alt = "";
  img.onerror = () => {
    wrap.removeChild(img);
    wrap.textContent = domainLetter(domain);
  };
  wrap.appendChild(img);
  return wrap;
}

/* ──────────────────────────────────────────
   Render
────────────────────────────────────────── */
function updateStats() {
  const total   = sites.length;
  const active  = sites.filter(s => s.enabled).length;
  const paused  = total - active;
  statTotal.textContent  = total;
  statActive.textContent = masterEnabled ? active : 0;
  statPaused.textContent = masterEnabled ? paused : total;
}

function renderList() {
  siteList.innerHTML = "";
  updateStats();

  const hasItems = sites.length > 0;
  listHeader.style.display = hasItems ? "flex" : "none";
  emptyState.classList.toggle("visible", !hasItems);

  sites.forEach((site, idx) => {
    const item = document.createElement("div");
    item.className = "site-item" + (site.enabled ? "" : " disabled");
    item.dataset.idx = idx;

    // Avatar
    item.appendChild(makeFaviconEl(site.domain));

    // Info
    const info = document.createElement("div");
    info.className = "site-info";

    const domainEl = document.createElement("div");
    domainEl.className = "site-domain";
    domainEl.textContent = site.domain;

    const statusEl = document.createElement("div");
    statusEl.className = "site-status" + (site.enabled ? " blocking" : "");
    statusEl.innerHTML = site.enabled
      ? `<span class="status-dot active"></span>Blocking`
      : `<span class="status-dot"></span>Paused`;

    info.appendChild(domainEl);
    info.appendChild(statusEl);
    item.appendChild(info);

    // Toggle
    const toggle = document.createElement("button");
    toggle.className = "site-toggle" + (site.enabled ? "" : " off");
    toggle.setAttribute("role", "switch");
    toggle.setAttribute("aria-checked", site.enabled ? "true" : "false");
    toggle.innerHTML = `<span class="toggle-thumb"></span>`;
    toggle.addEventListener("click", () => toggleSite(idx));
    item.appendChild(toggle);

    // Delete
    const del = document.createElement("button");
    del.className = "delete-btn";
    del.setAttribute("aria-label", `Remove ${site.domain}`);
    del.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <line x1="1.5" y1="1.5" x2="10.5" y2="10.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        <line x1="10.5" y1="1.5" x2="1.5" y2="10.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      </svg>`;
    del.addEventListener("click", () => removeSite(idx));
    item.appendChild(del);

    siteList.appendChild(item);
  });

  // Master off tint
  appEl.classList.toggle("master-off", !masterEnabled);
}

function renderMasterToggle() {
  masterToggle.classList.toggle("off", !masterEnabled);
  masterLabel.textContent = masterEnabled ? "Active" : "Paused";
  masterLabel.classList.toggle("off", !masterEnabled);
}

/* ──────────────────────────────────────────
   Actions
────────────────────────────────────────── */
function showError(msg) {
  inputError.textContent = msg;
  inputError.classList.add("visible");
  setTimeout(() => inputError.classList.remove("visible"), 2400);
}

async function addSite() {
  const raw    = siteInput.value;
  const domain = sanitizeDomain(raw);

  if (!domain) return;

  if (!isValidDomain(domain)) {
    showError("Please enter a valid domain, e.g. twitter.com");
    return;
  }

  if (sites.find(s => s.domain === domain)) {
    showError(`${domain} is already in your list`);
    siteInput.select();
    return;
  }

  sites.unshift({ domain, enabled: true });
  siteInput.value = "";
  await saveState();
  renderList();
}

async function toggleSite(idx) {
  sites[idx].enabled = !sites[idx].enabled;
  await saveState();
  renderList();
}

async function removeSite(idx) {
  const item = siteList.querySelector(`.site-item[data-idx="${idx}"]`);
  if (item) {
    item.style.transition = "opacity 0.15s, transform 0.15s";
    item.style.opacity    = "0";
    item.style.transform  = "translateX(6px)";
    await new Promise(r => setTimeout(r, 150));
  }
  sites.splice(idx, 1);
  await saveState();
  renderList();
}

async function toggleMaster() {
  masterEnabled = !masterEnabled;
  await saveState();
  renderMasterToggle();
  renderList();
}

async function clearAll() {
  if (sites.length === 0) return;
  if (!confirm(`Remove all ${sites.length} blocked site${sites.length > 1 ? "s" : ""}?`)) return;
  sites = [];
  await saveState();
  renderList();
}

/* ──────────────────────────────────────────
   Event listeners
────────────────────────────────────────── */
masterToggle.addEventListener("click", toggleMaster);

addBtn.addEventListener("click", addSite);

siteInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addSite();
});

clearAllBtn.addEventListener("click", clearAll);

/* ──────────────────────────────────────────
   Init
────────────────────────────────────────── */
(async () => {
  await loadState();
  renderMasterToggle();
  renderList();
})();
