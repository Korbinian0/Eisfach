let serverBaseUrl = localStorage.getItem("eisfach_server") || "http://localhost:8000";
let authToken = localStorage.getItem("eisfach_token") || "";
let currentUsername = localStorage.getItem("eisfach_user") || "";
let activeBarcode = "";
let codeReader = null;
let cachedInventory = [];
let cachedLocations = [];

document.getElementById("server-url").value = serverBaseUrl;
if (authToken) { showScreen('screen-menu'); loadLocations(); }

function showScreen(screenId) {
    ['screen-login', 'screen-menu', 'screen-scan', 'screen-manual', 'screen-inventory', 'screen-action'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

async function doLogin() {
    serverBaseUrl = document.getElementById("server-url").value.trim().replace(/\/$/, "");
    const user = document.getElementById("login-user").value;
    const pass = document.getElementById("login-pass").value;
    const errDiv = document.getElementById("login-err");
    errDiv.classList.add("hidden");

    const formData = new URLSearchParams();
    formData.append("username", user);
    formData.append("password", pass);

    try {
        const res = await fetch(`${serverBaseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData
        });
        if (!res.ok) throw new Error("Login fehlgeschlagen");
        const data = await res.json();
        authToken = data.access_token;
        currentUsername = data.username;
        localStorage.setItem("eisfach_server", serverBaseUrl);
        localStorage.setItem("eisfach_token", authToken);
        localStorage.setItem("eisfach_user", currentUsername);
        document.getElementById("lbl-username").textContent = currentUsername;
        showScreen('screen-menu');
        loadLocations();
    } catch (e) {
        errDiv.textContent = "Verbindung oder Login fehlgeschlagen!";
        errDiv.classList.remove("hidden");
    }
}

function doLogout() {
    localStorage.clear();
    authToken = "";
    showScreen('screen-login');
}

async function loadLocations() {
    try {
        const res = await fetch(`${serverBaseUrl}/api/locations/`, { headers: { "Authorization": `Bearer ${authToken}` } });
        if (res.ok) cachedLocations = await res.json();
    } catch(e) {}
}

function openScannerSection() {
    showScreen('screen-scan');
    document.getElementById("scan-result-container").innerHTML = "";
    startCamera();
}

function openManualSection() {
    showScreen('screen-manual');
    document.getElementById("manual-code-input").value = "";
    document.getElementById("manual-result-container").innerHTML = "";
}

async function openInventorySection() {
    showScreen('screen-inventory');
    const container = document.getElementById("inv-list-container");
    container.innerHTML = `<div class="text-center"><div class="spinner-border"></div></div>`;
    try {
        const res = await fetch(`${serverBaseUrl}/api/lager/`, { headers: { "Authorization": `Bearer ${authToken}` } });
        if (!res.ok) throw new Error();
        cachedInventory = await res.json();
        renderAppInventory(cachedInventory);
    } catch(e) { container.innerHTML = `<div class="alert alert-danger">Fehler beim Laden</div>`; }
}

function renderAppInventory(items) {
    const container = document.getElementById("inv-list-container");
    if (items.length === 0) { container.innerHTML = `<p class="text-muted text-center">Keine Artikel</p>`; return; }
    let html = "";
    items.forEach(i => {
        html += `<div class="card mb-2 p-3 shadow-sm">
            <div class="d-flex justify-content-between"><strong>${i.name}</strong><span class="badge bg-primary">Menge: ${i.menge}</span></div>
            <small class="text-muted">ID: ${i.id} | Ort: ${i.lagerort}</small>
            <small class="text-muted">Barcode: ${i.barcode} | Einlagerung: ${i.einlager_datum}</small>
            <div class="mt-2 d-flex gap-2">
                <button class="btn btn-sm btn-outline-danger flex-fill" onclick="appEntnahme('${i.id}')">➖ Entnahme</button>
                <button class="btn btn-sm btn-outline-success flex-fill" onclick="appWeiteres('${i.id}')">➕ Weiteres</button>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

function filterAppInventory() {
    const q = document.getElementById("inv-search").value.toLowerCase();
    const filtered = cachedInventory.filter(i => i.name.toLowerCase().includes(q) || i.barcode.toLowerCase().includes(q) || i.lagerort.toLowerCase().includes(q));
    renderAppInventory(filtered);
}

async function appEntnahme(id) {
    await fetch(`${serverBaseUrl}/api/lager/item/${id}/entnahme`, { method: "POST", headers: { "Authorization": `Bearer ${authToken}` } });
    openInventorySection();
}

async function appWeiteres(id) {
    await fetch(`${serverBaseUrl}/api/lager/item/${id}/weiteres`, { method: "POST", headers: { "Authorization": `Bearer ${authToken}` } });
    openInventorySection();
}

function startCamera() {
    if (!codeReader) codeReader = new ZXing.BrowserBarcodeReader();
    codeReader.decodeFromVideoDevice(null, 'scanner-video', (result, err) => {
        if (result) { document.getElementById("scanned-code-input").value = result.text; stopCamera(); processBarcode(); }
    }).catch(e => console.error(e));
}

function stopCamera() { if (codeReader) codeReader.reset(); }
function processBarcode() { const code = document.getElementById("scanned-code-input").value.trim(); if (!code) return; activeBarcode = code; evaluateBarcode(code, "scan-result-container"); }
function processManualBarcode() { const code = document.getElementById("manual-code-input").value.trim(); if (!code) return; activeBarcode = code; evaluateBarcode(code, "manual-result-container"); }
