let codeReader = null;
let scannerControls = null;
let scannerStartId = 0;

document.getElementById("scanModal").addEventListener("shown.bs.modal", startScanner);
document.getElementById("scanModal").addEventListener("hidden.bs.modal", () => {
    stopScanner();
    document.getElementById("manual-barcode-input").value = "";
    document.getElementById("scan-result-area").replaceChildren();
});

function startScanner() {
    if (scannerControls) return;
    const startId = ++scannerStartId;
    const resultArea = document.getElementById("scan-result-area");
    if (!navigator.mediaDevices?.getUserMedia) {
        resultArea.innerHTML = `<div class="alert alert-warning">Kamerazugriff ist nicht verfügbar. Öffne Eisfach über HTTPS oder localhost und erlaube den Kamerazugriff.</div>`;
        return;
    }

    if (!codeReader) {
        codeReader = new ZXing.BrowserBarcodeReader();
    }
    codeReader.decodeFromVideoDevice(null, "video", (result, err) => {
        if (result) {
            document.getElementById("manual-barcode-input").value = result.text;
            processBarcode();
            stopScanner();
        }
    }).then(controls => {
        if (startId !== scannerStartId || !document.getElementById("scanModal").classList.contains("show")) {
            controls.stop();
            return;
        }
        scannerControls = controls;
    }).catch(err => {
        if (startId !== scannerStartId) return;
        console.error("Kamera-Fehler:", err);
        resultArea.innerHTML = `<div class="alert alert-danger">Kamera konnte nicht gestartet werden. Bitte erlaube den Kamerazugriff und versuche es erneut.</div>`;
    });
}

function stopScanner() {
    scannerStartId++;
    if (scannerControls) {
        scannerControls.stop();
        scannerControls = null;
    }
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
