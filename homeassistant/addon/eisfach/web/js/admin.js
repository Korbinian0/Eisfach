let availableLocations = [];
async function loadLocations() {
    try {
        const res = await fetch("/api/locations/", { headers: { "Authorization": `Bearer ${token}` } });
        if (res.ok) { availableLocations = await res.json(); renderLocationsAdmin(availableLocations); }
    } catch (e) { console.error(e); }
}
function renderLocationsAdmin(locs) {
    const list = document.getElementById("locations-list");
    if (!list) return;
    list.innerHTML = "";
    locs.forEach(l => {
        list.innerHTML += `<li class="list-group-item d-flex justify-content-between">${l.name} <button class="btn btn-sm btn-outline-danger" onclick="deleteLocation(${l.id})">❌</button></li>`;
    });
}
async function createLocation() {
    const name = document.getElementById("new-location-input").value.trim();
    if (!name) return;
    await fetch("/api/locations/", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify({ name }) });
    loadLocations();
}
async function deleteLocation(id) {
    await fetch(`/api/locations/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
    loadLocations();
}
function openCreateModal(barcode) {
    let opts = availableLocations.map(l => `<option value="${l.name}">${l.name}</option>`).join("");
    document.getElementById("action-modal-content").innerHTML = `<div class="modal-header"><h5>Neues Produkt</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body"><form onsubmit="submitNewProduct(event, '${barcode}')">
        <div class="mb-3"><label>Barcode</label><input type="text" class="form-control" value="${barcode}" disabled></div>
        <div class="mb-3"><label>Name</label><input type="text" id="new-prod-name" class="form-control" required></div>
        <div class="mb-3"><label>Lagerort</label><select id="new-prod-location" class="form-select">${opts}</select></div>
        <div class="mb-3"><label>Menge</label><input type="number" id="new-prod-menge" class="form-control" value="1" min="1"></div>
        <button type="submit" class="btn btn-success w-100">Erstellen</button>
    </form></div>`;
    new bootstrap.Modal(document.getElementById("actionModal")).show();
}
async function submitNewProduct(e, barcode) {
    e.preventDefault();
    const body = { barcode, name: document.getElementById("new-prod-name").value, lagerort: document.getElementById("new-prod-location").value, menge: parseInt(document.getElementById("new-prod-menge").value) };
    const res = await fetch("/api/lager/create", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(body) });
    if (!res.ok) { alert("Fehler"); return; }
    bootstrap.Modal.getInstance(document.getElementById("actionModal")).hide();
    bootstrap.Modal.getInstance(document.getElementById("scanModal")).hide();
    loadInventory();
}
function openLinkModal(barcode) {
    let opts = inventory.map(i => `<option value="${i.id}">${i.name} (${i.id})</option>`).join("");
    document.getElementById("action-modal-content").innerHTML = `<div class="modal-header"><h5>Verknüpfen</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body"><form onsubmit="submitLinkProduct(event, '${barcode}')">
        <div class="mb-3"><label>Produkt</label><select id="link-target-id" class="form-select">${opts}</select></div>
        <div class="mb-3"><label>Menge</label><input type="number" id="link-add-menge" class="form-control" value="1" min="1"></div>
        <button type="submit" class="btn btn-primary w-100">Verknüpfen</button>
    </form></div>`;
    new bootstrap.Modal(document.getElementById("actionModal")).show();
}
async function submitLinkProduct(e, newBarcode) {
    e.preventDefault();
    const body = { existing_id: document.getElementById("link-target-id").value, new_barcode: newBarcode, additional_menge: parseInt(document.getElementById("link-add-menge").value) };
    const res = await fetch("/api/lager/link", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(body) });
    if (!res.ok) { alert("Fehler"); return; }
    bootstrap.Modal.getInstance(document.getElementById("actionModal")).hide();
    bootstrap.Modal.getInstance(document.getElementById("scanModal")).hide();
    loadInventory();
}
function showAdminTab() { document.getElementById("inventory-view").classList.add("d-none"); document.getElementById("admin-view").classList.remove("d-none"); }
function showInventoryTab() { document.getElementById("admin-view").classList.add("d-none"); document.getElementById("inventory-view").classList.remove("d-none"); loadInventory(); }
function generateBarcodesForPrint() {
    const n = parseInt(document.getElementById("barcode-count").value) || 5;
    let html = `<div class="d-flex flex-wrap gap-2">`;
    for (let i = 0; i < n; i++) {
        const code = "EF-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        html += `<div class="border p-2 text-center bg-light" style="width:130px"><small>${code}</small></div>`;
    }
    html += `</div><button class="btn btn-sm btn-secondary mt-2" onclick="window.print()">Drucken</button>`;
    document.getElementById("print-preview").innerHTML = html;
}
async function registerUser(e) {
    e.preventDefault();
    const body = { username: document.getElementById("new-username").value, password: document.getElementById("new-password").value, role: parseInt(document.getElementById("new-role").value) };
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(body) });
    if (!res.ok) { alert("Fehler"); return; }
    alert("Erstellt!");
    document.getElementById("register-user-form").reset();
}
