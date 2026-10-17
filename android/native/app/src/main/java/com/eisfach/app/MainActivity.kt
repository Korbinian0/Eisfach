package com.eisfach.app

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val tvUser = findViewById<TextView>(R.id.tvLoggedInUser)
        tvUser.text = "Eingeloggt als: ${ApiHelper.getPrefs(this).getString("username", "Admin")}"

        findViewById<Button>(R.id.btnScan).setOnClickListener {
            startActivity(Intent(this, ScanActivity::class.java).putExtra("mode", "scan"))
        }

        findViewById<Button>(R.id.btnManual).setOnClickListener {
            startActivity(Intent(this, ScanActivity::class.java).putExtra("mode", "manual"))
        }

        findViewById<Button>(R.id.btnInventory).setOnClickListener {
            startActivity(Intent(this, InventoryActivity::class.java))
        }

        findViewById<Button>(R.id.btnLogout).setOnClickListener {
            ApiHelper.saveAuth(this, ApiHelper.getServerUrl(this), "", "")
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }
}
