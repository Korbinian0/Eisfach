let inventory = [];

async function loadInventory() {
    try {
        const res = await fetch("/api/lager/", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.status === 401) { logout(); return; }
        inventory = await res.json();
        renderInventory(inventory);
    } catch (err) {
        console.error("Fehler beim Laden", err);
    }
}

function renderInventory(items) {
    const tbody = document.getElementById("inventory-table-body");
    tbody.innerHTML = "";
    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Keine Artikel im Lager</td></tr>`;
        return;
    }
    items.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${item.id}</strong></td>
                <td><code>${item.barcode}</code></td>
                <td>${item.name}</td>
                <td><span class="badge bg-secondary badge-lager">${item.lagerort}</span></td>
                <td><span class="badge bg-primary fs-6">${item.menge}</span></td>
                <td>${item.einlager_datum}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger me-1" onclick="actionEntnahme('${item.id}')">➖ Entnahme</button>
                    <button class="btn btn-sm btn-outline-success" onclick="actionWeiteres('${item.id}')">➕ Weiteres</button>
                </td>
            </tr>
        `;
    });
}

function filterInventory() {
    const query = document.getElementById("search-input").value.toLowerCase();
    const filtered = inventory.filter(i => 
        i.name.toLowerCase().includes(query) || 
        i.barcode.toLowerCase().includes(query) || 
        i.lagerort.toLowerCase().includes(query) ||
        i.id.toLowerCase().includes(query)
    );
    renderInventory(filtered);
}

async function actionEntnahme(id) {
    try {
        const res = await fetch(`/api/lager/item/${id}/entnahme`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Fehler");
        loadInventory();
    } catch (err) { alert(err.message); }
}

async function actionWeiteres(id) {
    try {
        const res = await fetch(`/api/lager/item/${id}/weiteres`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Fehler");
        loadInventory();
    } catch (err) { alert(err.message); }
}
