package com.eisfach.app

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class LoginActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        if (ApiHelper.getToken(this).isNotEmpty()) {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
            return
        }

        setContentView(R.layout.activity_login)

        val etUrl = findViewById<EditText>(R.id.etServerUrl)
        val etUser = findViewById<EditText>(R.id.etUsername)
        val etPass = findViewById<EditText>(R.id.etPassword)
        val btnLogin = findViewById<Button>(R.id.btnLogin)

        btnLogin.setOnClickListener {
            val url = etUrl.text.toString().trim().removeSuffix("/")
            val user = etUser.text.toString().trim()
            val pass = etPass.text.toString().trim()

            ApiHelper.login(url, user, pass) { success, tokenOrErr ->
                runOnUiThread {
                    if (success && tokenOrErr != null) {
                        ApiHelper.saveAuth(this, url, tokenOrErr, user)
                        startActivity(Intent(this, MainActivity::class.java))
                        finish()
                    } else {
                        Toast.makeText(this, tokenOrErr ?: "Login fehlgeschlagen", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }
}
