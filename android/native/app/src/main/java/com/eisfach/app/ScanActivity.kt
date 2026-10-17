package com.eisfach.app

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.google.zxing.integration.android.IntentIntegrator
import org.json.JSONObject

class ScanActivity : AppCompatActivity() {
    private lateinit var llResult: LinearLayout
    private lateinit var etManualCode: EditText

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_scan)

        val mode = intent.getStringExtra("mode") ?: "scan"
        llResult = findViewById(R.id.llResultContainer)
        etManualCode = findViewById(R.id.etManualBarcode)
        val btnCheckManual = findViewById<Button>(R.id.btnCheckManual)
        val btnBack = findViewById<Button>(R.id.btnBackScan)

        btnBack.setOnClickListener { finish() }

        btnCheckManual.setOnClickListener {
            val code = etManualCode.text.toString().trim()
            if (code.isNotEmpty()) processBarcode(code)
        }

        if (mode == "scan") {
            startZxingScanner()
        }
    }

    private fun startZxingScanner() {
        val integrator = IntentIntegrator(this)
        integrator.setDesiredBarcodeFormats(IntentIntegrator.ALL_CODE_TYPES)
        integrator.setPrompt("Barcode / QR-Code scannen")
        integrator.setCameraId(0)
        integrator.setBeepEnabled(true)
        integrator.setBarcodeImageEnabled(false)
        integrator.initiateScan()
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        val result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data)
        if (result != null) {
            if (result.contents != null) {
                processBarcode(result.contents)
            } else {
                Toast.makeText(this, "Scan abgebrochen", Toast.LENGTH_SHORT).show()
            }
        } else {
            super.onActivityResult(requestCode, resultCode, data)
        }
    }

    private fun processBarcode(barcode: String) {
        llResult.removeAllViews()
        val tvLoading = TextView(this).apply { text = "Prüfe Barcode: $barcode ..." }
        llResult.addView(tvLoading)

        ApiHelper.scanBarcode(this, barcode) { code, respStr ->
            runOnUiThread {
                llResult.removeAllViews()
                if (code == 200 && respStr != null) {
                    val json = JSONObject(respStr)
                    val id = json.optString("id")
                    val name = json.optString("name")
                    val lagerort = json.optString("lagerort")
                    val menge = json.optInt("menge")
                    val einlagerDatum = json.optString("einlager_datum")

                    val tv = TextView(this).apply {
                        text = "✅ Produkt gefunden!\n\nName: $name\nEinlagerdatum: $einlagerDatum\nLagerort: $lagerort\nMenge: $menge"
                        textSize = 16f
                    }
                    llResult.addView(tv)

                    val btnEntnahme = Button(this).apply {
                        text = "Entnahme (1 abziehen / verstecken)"
                        setOnClickListener {
                            ApiHelper.itemAction(this@ScanActivity, id, "entnahme") { success ->
                                runOnUiThread {
                                    Toast.makeText(this@ScanActivity, if (success) "Entnahme erfolgreich" else "Fehler", Toast.LENGTH_SHORT).show()
                                    finish()
                                }
                            }
                        }
                    }
                    val btnWeiteres = Button(this).apply {
                        text = "Weiteres Teil (+1 Menge)"
                        setOnClickListener {
                            ApiHelper.itemAction(this@ScanActivity, id, "weiteres") { success ->
                                runOnUiThread {
                                    Toast.makeText(this@ScanActivity, if (success) "Menge erhöht" else "Fehler", Toast.LENGTH_SHORT).show()
                                    finish()
                                }
                            }
                        }
                    }
                    llResult.addView(btnEntnahme)
                    llResult.addView(btnWeiteres)

                } else if (code == 404) {
                    val tv = TextView(this).apply {
                        text = "⚠️ Unbekannter Barcode: $barcode\n\nNicht in der Datenbank gefunden."
                        textSize = 16f
                    }
                    llResult.addView(tv)

                    val btnCreate = Button(this).apply {
                        text = "Neu erstellen"
                        setOnClickListener {
                            startActivity(Intent(this@ScanActivity, CreateProductActivity::class.java).putExtra("barcode", barcode).putExtra("action_type", "create"))
                            finish()
                        }
                    }
                    val btnLink = Button(this).apply {
                        text = "Als bestehendes Produkt verknüpfen"
                        setOnClickListener {
                            startActivity(Intent(this@ScanActivity, CreateProductActivity::class.java).putExtra("barcode", barcode).putExtra("action_type", "link"))
                            finish()
                        }
                    }
                    llResult.addView(btnCreate)
                    llResult.addView(btnLink)
                } else {
                    Toast.makeText(this, "Fehler bei Verbindung ($code)", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
