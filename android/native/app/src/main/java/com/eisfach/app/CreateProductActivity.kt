package com.eisfach.app

import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class CreateProductActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val barcode = intent.getStringExtra("barcode") ?: ""
        val actionType = intent.getStringExtra("action_type") ?: "create"

        val layout = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(32, 32, 32, 32) }
        val tvTitle = TextView(this).apply { text = if (actionType == "create") "➕ Neues Produkt" else "🔗 Verknüpfen"; textSize = 18f }
        layout.addView(tvTitle)

        if (actionType == "create") {
            val etName = EditText(this).apply { hint = "Name (Bezeichnung)" }
            val spLagerort = Spinner(this)
            val etMenge = EditText(this).apply { hint = "Menge"; inputType = android.text.InputType.TYPE_CLASS_NUMBER; setText("1") }
            val btnSubmit = Button(this).apply { text = "Erstellen & Einlagern" }

            layout.addAll(etName, TextView(this).apply { text = "Lagerort:" }, spLagerort, etMenge, btnSubmit)
            // Fix addAll helper or add individually
            layout.removeAllViews()
            layout.addView(tvTitle)
            layout.addView(etName)
            layout.addView(TextView(this).apply { text = "Lagerort:" })
            layout.addView(spLagerort)
            layout.addView(etMenge)
            layout.addView(btnSubmit)

            ApiHelper.getLocations(this) { resp ->
                if (resp != null) {
                    val arr = JSONArray(resp)
                    val locs = mutableListOf<String>()
                    for (i in 0 until arr.length()) locs.add(arr.getJSONObject(i).getString("name"))
                    runOnUiThread { spLagerort.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, locs) }
                }
            }

            btnSubmit.setOnClickListener {
                val json = JSONObject().put("barcode", barcode).put("name", etName.text.toString()).put("lagerort", spLagerort.selectedItem?.toString() ?: "Standard").put("menge", etMenge.text.toString().toIntOrNull() ?: 1)
                val body = json.toString().toRequestBody("application/json; charset=utf-8".toMediaType())
                val req = Request.Builder().url("${ApiHelper.getServerUrl(this)}/api/lager/create").addHeader("Authorization", "Bearer ${ApiHelper.getToken(this)}").post(body).build()
                ApiHelper.client().newCall(req).enqueue(object : Callback {
                    override fun onFailure(call: Call, e: IOException) {}
                    override fun onResponse(call: Call, response: Response) { runOnUiThread { Toast.makeText(this@CreateProductActivity, "Erstellt", Toast.LENGTH_SHORT).show(); finish() } }
                })
            }
        } else {
            val spProducts = Spinner(this)
            val etAddMenge = EditText(this).apply { hint = "Menge hinzufügen"; inputType = android.text.InputType.TYPE_CLASS_NUMBER; setText("1") }
            val btnSubmit = Button(this).apply { text = "Verknüpfen" }

            layout.addView(TextView(this).apply { text = "Produkt wählen:" })
            layout.addView(spProducts)
            layout.addView(etAddMenge)
            layout.addView(btnSubmit)

            ApiHelper.getInventory(this) { success, resp ->
                if (success && resp != null) {
                    val arr = JSONArray(resp)
                    val prodList = mutableListOf<String>()
                    val idList = mutableListOf<String>()
                    for (i in 0 until arr.length()) {
                        val obj = arr.getJSONObject(i)
                        prodList.add("${obj.getString("name")} (ID: ${obj.getString("id")})")
                        idList.add(obj.getString("id"))
                    }
                    runOnUiThread {
                        spProducts.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, prodList)
                        btnSubmit.setOnClickListener {
                            val idx = spProducts.selectedItemPosition
                            if (idx >= 0 && idx < idList.size) {
                                val json = JSONObject().put("existing_id", idList[idx]).put("new_barcode", barcode).put("additional_menge", etAddMenge.text.toString().toIntOrNull() ?: 1)
                                val body = json.toString().toRequestBody("application/json; charset=utf-8".toMediaType())
                                val req = Request.Builder().url("${ApiHelper.getServerUrl(this)}/api/lager/link").addHeader("Authorization", "Bearer ${ApiHelper.getToken(this)}").post(body).build()
                                ApiHelper.client().newCall(req).enqueue(object : Callback {
                                    override fun onFailure(call: Call, e: IOException) {}
                                    override fun onResponse(call: Call, response: Response) { runOnUiThread { Toast.makeText(this@CreateProductActivity, "Verknüpft", Toast.LENGTH_SHORT).show(); finish() } }
                                })
                            }
                        }
                    }
                }
            }
        }
        setContentView(layout)
    }
}
