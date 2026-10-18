let availableLocations = [];
let users = [];
async function loadLocations() {
    try {
        const res = await fetch(apiUrl("api/locations/"), { headers: userManagementHeaders() });
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
    await fetch(apiUrl("api/locations/"), { method: "POST", headers: userManagementHeaders(true), body: JSON.stringify({ name }) });
    loadLocations();
}
async function deleteLocation(id) {
    await fetch(apiUrl(`api/locations/${id}`), { method: "DELETE", headers: userManagementHeaders() });
    loadLocations();
}
function openCreateModal(barcode) {
    document.getElementById("action-modal-content").innerHTML = `<div class="modal-header"><h5>Neues Produkt</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body"><form id="new-product-form">
        <div class="mb-3"><label for="new-prod-barcode">Barcode</label><input type="text" id="new-prod-barcode" class="form-control" disabled></div>
        <div class="mb-3"><label>Name</label><input type="text" id="new-prod-name" class="form-control" required></div>
        <div class="mb-3"><label for="new-prod-location" class="form-label">Lagerort</label><select id="new-prod-location" class="form-select"></select>
            <button type="button" id="new-prod-custom-toggle" class="btn btn-sm btn-outline-secondary mt-2">Benutzerdefiniert</button>
            <input type="text" id="new-prod-custom-location" class="form-control mt-2 d-none" maxlength="255" placeholder="Eigenen Lagerort eingeben">
        </div>
        <div class="mb-3"><label>Menge</label><input type="number" id="new-prod-menge" class="form-control" value="1" min="1"></div>
        <button type="submit" class="btn btn-success w-100">Erstellen</button>
    </form></div>`;
    document.getElementById("new-prod-barcode").value = barcode;
    setupLocationSelector("new-prod-location", "new-prod-custom-toggle", "new-prod-custom-location");
    document.getElementById("new-product-form").addEventListener("submit", event => submitNewProduct(event, barcode));
    new bootstrap.Modal(document.getElementById("actionModal")).show();
}

function setupLocationSelector(selectId, toggleId, customInputId, selectedLocation = "") {
    const select = document.getElementById(selectId);
    const toggle = document.getElementById(toggleId);
    const customInput = document.getElementById(customInputId);
    select.replaceChildren();
    availableLocations.forEach(location => {
        const option = document.createElement("option");
        option.value = location.name;
        option.textContent = location.name;
        select.append(option);
    });

    const useCustomInitially = !availableLocations.length ||
        (selectedLocation && !availableLocations.some(location => location.name === selectedLocation));
    if (!availableLocations.length) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Kein gespeicherter Lagerort";
        select.append(option);
    }
    if (useCustomInitially) {
        customInput.value = selectedLocation || "";
        customInput.required = true;
        customInput.classList.remove("d-none");
        toggle.classList.add("active");
    } else {
        select.required = true;
        if (selectedLocation) select.value = selectedLocation;
    }

    toggle.addEventListener("click", () => {
        const useCustom = customInput.classList.contains("d-none");
        customInput.classList.toggle("d-none", !useCustom);
        customInput.required = useCustom;
        select.required = !useCustom;
        toggle.classList.toggle("active", useCustom);
        if (useCustom) customInput.focus();
    });
}

function getSelectedLocation(selectId, customInputId) {
    const customInput = document.getElementById(customInputId);
    return customInput.classList.contains("d-none")
        ? document.getElementById(selectId).value
        : customInput.value.trim();
}

async function submitNewProduct(e, barcode) {
    e.preventDefault();
    const body = { barcode, name: document.getElementById("new-prod-name").value, lagerort: getSelectedLocation("new-prod-location", "new-prod-custom-location"), menge: parseInt(document.getElementById("new-prod-menge").value) };
    const res = await fetch(apiUrl("api/lager/create"), { method: "POST", headers: userManagementHeaders(true), body: JSON.stringify(body) });
    if (!res.ok) { alert("Fehler"); return; }
    bootstrap.Modal.getInstance(document.getElementById("actionModal")).hide();
    bootstrap.Modal.getInstance(document.getElementById("scanModal")).hide();
    loadInventory();
}

function openItemLocationModal(itemId) {
    const item = inventory.find(entry => entry.id === itemId);
    if (!item) return;

    document.getElementById("action-modal-content").innerHTML = `<div class="modal-header"><h5>Lagerort ändern</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body"><form id="edit-item-location-form">
        <p id="edit-item-name" class="mb-3"></p>
        <div class="mb-3"><label for="edit-item-location" class="form-label">Lagerort</label><select id="edit-item-location" class="form-select"></select>
            <button type="button" id="edit-item-custom-toggle" class="btn btn-sm btn-outline-secondary mt-2">Benutzerdefiniert</button>
            <input type="text" id="edit-item-custom-location" class="form-control mt-2 d-none" maxlength="255" placeholder="Eigenen Lagerort eingeben">
        </div>
        <button type="submit" class="btn btn-primary w-100">Speichern</button>
    </form></div>`;
    document.getElementById("edit-item-name").textContent = item.name;
    setupLocationSelector("edit-item-location", "edit-item-custom-toggle", "edit-item-custom-location", item.lagerort);
    document.getElementById("edit-item-location-form").addEventListener("submit", event => saveItemLocation(event, item.id));
    new bootstrap.Modal(document.getElementById("actionModal")).show();
}

async function saveItemLocation(e, itemId) {
    e.preventDefault();
    const lagerort = getSelectedLocation("edit-item-location", "edit-item-custom-location");
    if (!lagerort) {
        alert("Bitte einen Lagerort auswählen oder eingeben.");
        return;
    }
    const res = await fetch(apiUrl(`api/lager/item/${itemId}/location`), {
        method: "PUT",
        headers: userManagementHeaders(true),
        body: JSON.stringify({ lagerort })
    });
    if (!res.ok) { alert(await getAdminError(res)); return; }
    bootstrap.Modal.getInstance(document.getElementById("actionModal")).hide();
    await loadInventory();
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
    const res = await fetch(apiUrl("api/lager/link"), { method: "POST", headers: userManagementHeaders(true), body: JSON.stringify(body) });
    if (!res.ok) { alert("Fehler"); return; }
    bootstrap.Modal.getInstance(document.getElementById("actionModal")).hide();
    bootstrap.Modal.getInstance(document.getElementById("scanModal")).hide();
    loadInventory();
}
function showAdminTab() {
    document.getElementById("inventory-view").classList.add("d-none");
    document.getElementById("admin-view").classList.remove("d-none");
    loadUsers();
}
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
    const body = { username: document.getElementById("new-username").value.trim(), password: document.getElementById("new-password").value, role: parseInt(document.getElementById("new-role").value, 10) };
    const res = await fetch(apiUrl("api/auth/register"), { method: "POST", headers: userManagementHeaders(true), body: JSON.stringify(body) });
    if (!res.ok) { alert(await getAdminError(res)); return; }
    document.getElementById("register-user-form").reset();
    await loadUsers();
}

function userManagementHeaders(json = false) {
    const headers = json ? { "Content-Type": "application/json" } : {};
    if (token) headers.Authorization = "Bearer " + token;
    return headers;
}

async function loadUsers() {
    const res = await fetch(apiUrl("api/auth/users"), { headers: userManagementHeaders() });
    if (!res.ok) { alert(await getAdminError(res)); return; }
    users = await res.json();
    renderUsersAdmin();
}

function renderUsersAdmin() {
    const list = document.getElementById("users-list");
    if (!list) return;
    list.replaceChildren();
    users.forEach(user => {
        const row = document.createElement("tr");
        const username = document.createElement("td");
        username.textContent = user.username;
        const role = document.createElement("td");
        role.textContent = user.role === 1 ? "Admin" : "Benutzer";
        const actions = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-sm btn-outline-primary me-2";
        editButton.textContent = "Bearbeiten";
        editButton.addEventListener("click", () => openEditUserModal(user.id));
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-sm btn-outline-danger";
        deleteButton.textContent = "Löschen";
        deleteButton.disabled = user.username === currentUser;
        deleteButton.addEventListener("click", () => deleteUser(user.id, user.username));
        actions.append(editButton, deleteButton);
        row.append(username, role, actions);
        list.append(row);
    });
}

function openEditUserModal(userId) {
    const user = users.find(item => item.id === userId);
    if (!user) return;
    document.getElementById("edit-user-id").value = user.id;
    document.getElementById("edit-username").value = user.username;
    document.getElementById("edit-role").value = user.role;
    document.getElementById("edit-password").value = "";
    new bootstrap.Modal(document.getElementById("edit-user-modal")).show();
}

async function updateUser(e) {
    e.preventDefault();
    const id = document.getElementById("edit-user-id").value;
    const body = {
        username: document.getElementById("edit-username").value.trim(),
        role: parseInt(document.getElementById("edit-role").value, 10)
    };
    const password = document.getElementById("edit-password").value;
    if (password) body.password = password;
    const res = await fetch(apiUrl("api/auth/users/" + id), {
        method: "PUT",
        headers: userManagementHeaders(true),
        body: JSON.stringify(body)
    });
    if (!res.ok) { alert(await getAdminError(res)); return; }
    bootstrap.Modal.getInstance(document.getElementById("edit-user-modal")).hide();
    await loadUsers();
}

async function deleteUser(userId, username) {
    if (!confirm("Benutzer \"" + username + "\" wirklich löschen?")) return;
    const res = await fetch(apiUrl("api/auth/users/" + userId), {
        method: "DELETE",
        headers: userManagementHeaders()
    });
    if (!res.ok) { alert(await getAdminError(res)); return; }
    await loadUsers();
}

async function getAdminError(res) {
    try {
        const error = await res.json();
        if (error.detail) return error.detail;
    } catch {}
    return `Aktion fehlgeschlagen (${res.status})`;
}

document.getElementById("register-user-form").addEventListener("submit", registerUser);
document.getElementById("edit-user-form").addEventListener("submit", updateUser);
