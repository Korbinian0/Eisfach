async function evaluateBarcode(barcode, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<div class="text-center py-3"><div class="spinner-border spinner-border-sm"></div> Prüfe...</div>`;
    try {
        const res = await fetch(`${serverBaseUrl}/api/lager/scan`, {
            method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` }, body: JSON.stringify({ barcode })
        });
        if (res.ok) {
            const item = await res.json();
            container.innerHTML = `<div class="card p-3 bg-light border-success mt-3">
                <h5 class="text-success">✅ Gefunden</h5>
                <p class="mb-1"><strong>Name:</strong> ${item.name}</p>
                <p class="mb-1"><strong>Einlagerdatum:</strong> ${item.einlager_datum}</p>
                <p class="mb-1"><strong>Lagerort:</strong> ${item.lagerort}</p>
                <p class="mb-2"><strong>Menge:</strong> ${item.menge}</p>
                <div class="d-flex gap-2">
                    <button class="btn btn-danger flex-fill" onclick="itemActionEntnahme('${item.id}', '${containerId}')">Entnahme</button>
                    <button class="btn btn-success flex-fill" onclick="itemActionWeiteres('${item.id}', '${containerId}')">Weiteres</button>
                </div>
            </div>`;
        } else if (res.status === 404) {
            container.innerHTML = `<div class="card p-3 bg-light border-warning mt-3">
                <h5 class="text-warning">⚠️ Unbekannter Barcode</h5>
                <button class="btn btn-primary mb-2 w-100" onclick="showCreateMenu('${barcode}')">Neu erstellen</button>
                <button class="btn btn-secondary w-100" onclick="showLinkMenu('${barcode}')">Als bestehendes Produkt verknüpfen</button>
            </div>`;
        }
    } catch(e) { container.innerHTML = `<div class="alert alert-danger">Fehler.</div>`; }
}

async function itemActionEntnahme(id, containerId) {
    await fetch(`${serverBaseUrl}/api/lager/item/${id}/entnahme`, { method: "POST", headers: { "Authorization": `Bearer ${authToken}` } });
    document.getElementById(containerId).innerHTML = `<div class="alert alert-success mt-2">Entnahme ausgeführt!</div>`;
}

async function itemActionWeiteres(id, containerId) {
    await fetch(`${serverBaseUrl}/api/lager/item/${id}/weiteres`, { method: "POST", headers: { "Authorization": `Bearer ${authToken}` } });
    document.getElementById(containerId).innerHTML = `<div class="alert alert-success mt-2">Teil hinzugefügt!</div>`;
}

async function showCreateMenu(barcode) {
    const res = await fetch(`${serverBaseUrl}/api/lager/`, { headers: { "Authorization": `Bearer ${authToken}` } });
    if (res.ok) cachedInventory = await res.json();
    const locOpts = cachedLocations.map(l => `<option value="${l.name}">${l.name}</option>`).join("");
    showScreen('screen-action');
    document.getElementById("action-content-area").innerHTML = `
        <h5 class="mb-3">➕ Neues Produkt erstellen</h5>
        <form onsubmit="submitNewProductForm(event, '${barcode}')">
            <div class="mb-3"><label>Barcode</label><input type="text" class="form-control" value="${barcode}" disabled></div>
            <div class="mb-3"><label>Name</label><input type="text" id="new-name" class="form-control" required></div>
            <div class="mb-3"><label>Lagerort</label><select id="new-loc" class="form-select">${locOpts}</select></div>
            <div class="mb-3"><label>Menge</label><input type="number" id="new-menge" class="form-control" value="1" min="1" required></div>
            <button type="submit" class="btn btn-success w-100 py-2">Erstellen & Einlagern</button>
        </form>`;
}

async function submitNewProductForm(e, barcode) {
    e.preventDefault();
    const body = { barcode, name: document.getElementById("new-name").value, lagerort: document.getElementById("new-loc").value, menge: parseInt(document.getElementById("new-menge").value) };
    const res = await fetch(`${serverBaseUrl}/api/lager/create`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` }, body: JSON.stringify(body) });
    if (!res.ok) { alert("Fehler"); return; }
    alert("Erstellt!");
    showScreen('screen-menu');
}

async function showLinkMenu(barcode) {
    const res = await fetch(`${serverBaseUrl}/api/lager/`, { headers: { "Authorization": `Bearer ${authToken}` } });
    if (res.ok) cachedInventory = await res.json();
    const prodOpts = cachedInventory.map(i => `<option value="${i.id}">${i.name} (ID: ${i.id})</option>`).join("");
    showScreen('screen-action');
    document.getElementById("action-content-area").innerHTML = `
        <h5 class="mb-3">🔗 Verknüpfen</h5>
        <form onsubmit="submitLinkProductForm(event, '${barcode}')">
            <div class="mb-3"><label>Barcode</label><input type="text" class="form-control" value="${barcode}" disabled></div>
            <div class="mb-3"><label>Produkt</label><select id="link-id" class="form-select">${prodOpts}</select></div>
            <div class="mb-3"><label>Mehr Menge</label><input type="number" id="link-add" class="form-control" value="1" min="1" required></div>
            <button type="submit" class="btn btn-primary w-100 py-2">Verknüpfen</button>
        </form>`;
}

async function submitLinkProductForm(e, newBarcode) {
    e.preventDefault();
    const body = { existing_id: document.getElementById("link-id").value, new_barcode: newBarcode, additional_menge: parseInt(document.getElementById("link-add").value) };
    const res = await fetch(`${serverBaseUrl}/api/lager/link`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` }, body: JSON.stringify(body) });
    if (!res.ok) { alert("Fehler"); return; }
    alert("Verknüpft!");
    showScreen('screen-menu');
}
