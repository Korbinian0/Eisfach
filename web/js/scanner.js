let codeReader = null;

function startScanner() {
    if (!codeReader) {
        codeReader = new ZXing.BrowserBarcodeReader();
    }
    codeReader.decodeFromVideoDevice(null, 'video', (result, err) => {
        if (result) {
            document.getElementById("manual-barcode-input").value = result.text;
            processBarcode();
            stopScanner();
        }
    }).catch(err => console.error("Kamera-Fehler:", err));
}

function stopScanner() {
    if (codeReader) {
        codeReader.reset();
    }
}

async function processBarcode() {
    const barcode = document.getElementById("manual-barcode-input").value.trim();
    if (!barcode) return;
    const resultArea = document.getElementById("scan-result-area");
    resultArea.innerHTML = `<div class="spinner-border spinner-border-sm text-primary"></div> Prüfe Barcode...`;

    try {
        const res = await fetch(apiUrl("api/lager/scan"), {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ barcode })
        });

        if (res.ok) {
            const item = await res.json();
            resultArea.innerHTML = `
                <div class="alert alert-success">
                    <h5>✅ ${item.name}</h5>
                    <p class="mb-1"><strong>Ort:</strong> ${item.lagerort} | <strong>Menge:</strong> ${item.menge}</p>
                    <button class="btn btn-danger btn-sm me-2" onclick="actionEntnahme('${item.id}'); bootstrap.Modal.getInstance(document.getElementById('scanModal')).hide(); loadInventory();">Entnahme</button>
                    <button class="btn btn-success btn-sm" onclick="actionWeiteres('${item.id}'); bootstrap.Modal.getInstance(document.getElementById('scanModal')).hide(); loadInventory();">Weiteres (+1)</button>
                </div>
            `;
        } else if (res.status === 404) {
            resultArea.innerHTML = `
                <div class="alert alert-warning">
                    <h5>⚠️ Unbekannter Barcode</h5>
                    <button class="btn btn-primary btn-sm me-2" onclick="openCreateModal('${barcode}')">Neu erstellen</button>
                    <button class="btn btn-secondary btn-sm" onclick="openLinkModal('${barcode}')">Mit bestehendem verknüpfen</button>
                </div>
            `;
        }
    } catch (err) {
        resultArea.innerHTML = `<div class="alert alert-danger">Fehler: ${err.message}</div>`;
    }
}
