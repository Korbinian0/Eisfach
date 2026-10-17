package com.eisfach.app

import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONArray

class InventoryActivity : AppCompatActivity() {
    private lateinit var llList: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_inventory)

        llList = findViewById(R.id.llInventoryList)
        findViewById<Button>(R.id.btnBackInv).setOnClickListener { finish() }

        loadInventory()
    }

    private fun loadInventory() {
        llList.removeAllViews()
        ApiHelper.getInventory(this) { success, resp ->
            runOnUiThread {
                if (success && resp != null) {
                    val arr = JSONArray(resp)
                    for (i in 0 until arr.length()) {
                        val obj = arr.getJSONObject(i)
                        val id = obj.optString("id")
                        val name = obj.optString("name")
                        val menge = obj.optInt("menge")
                        val lagerort = obj.optString("lagerort")
                        val barcode = obj.optString("barcode")

                        val card = LinearLayout(this).apply {
                            orientation = LinearLayout.VERTICAL
                            setPadding(16, 16, 16, 16)
                            setBackgroundColor(0xFFEFEFEF.toInt())
                        }
                        val tv = TextView(this).apply {
                            text = "📦 $name\nMenge: $menge | Ort: $lagerort\nBarcode: $barcode"
                        }
                        card.addView(tv)

                        val btnRow = LinearLayout(this).apply {
                            orientation = LinearLayout.HORIZONTAL
                        }
                        val btnEntnahme = Button(this).apply {
                            text = "➖ Entnahme"
                            setOnClickListener {
                                ApiHelper.itemAction(this@InventoryActivity, id, "entnahme") { loadInventory() }
                            }
                        }
                        val btnWeiteres = Button(this).apply {
                            text = "➕ Weiteres"
                            setOnClickListener {
                                ApiHelper.itemAction(this@InventoryActivity, id, "weiteres") { loadInventory() }
                            }
                        }
                        btnRow.addView(btnEntnahme)
                        btnRow.addView(btnWeiteres)
                        card.addView(btnRow)

                        llList.addView(card)
                    }
                } else {
                    Toast.makeText(this, "Fehler beim Laden des Bestands", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
