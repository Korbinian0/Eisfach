package com.eisfach.app

import android.content.Context
import android.content.SharedPreferences
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

object ApiHelper {
    private const val PREFS_NAME = "EisfachPrefs"
    
    fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun getServerUrl(context: Context): String {
        return getPrefs(context).getString("server_url", "http://10.0.2.2:8000") ?: "http://10.0.2.2:8000"
    }

    fun getToken(context: Context): String {
        return getPrefs(context).getString("auth_token", "") ?: ""
    }

    fun saveAuth(context: Context, url: String, token: String, username: String) {
        getPrefs(context).edit()
            .putString("server_url", url)
            .putString("auth_token", token)
            .putString("username", username)
            .apply()
    }

    fun client(): OkHttpClient = OkHttpClient()

    fun login(url: String, user: String, pass: String, callback: (Boolean, String?) -> Unit) {
        val client = OkHttpClient()
        val formBody = FormBody.Builder()
            .add("username", user)
            .add("password", pass)
            .build()

        val request = Request.Builder()
            .url("$url/api/auth/login")
            .post(formBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                callback(false, e.message)
            }
            override fun onResponse(call: Call, response: Response) {
                if (response.isSuccessful) {
                    val body = response.body?.string()
                    val json = JSONObject(body ?: "{}")
                    val token = json.optString("access_token")
                    callback(true, token)
                } else {
                    callback(false, "Login fehlgeschlagen (${response.code})")
                }
            }
        })
    }

    fun scanBarcode(context: Context, barcode: String, callback: (Int, String?) -> Unit) {
        val url = getServerUrl(context)
        val token = getToken(context)
        val json = JSONObject().put("barcode", barcode)
        val body = json.toString().toRequestBody("application/json; charset=utf-8".toMediaType())

        val request = Request.Builder()
            .url("$url/api/lager/scan")
            .addHeader("Authorization", "Bearer $token")
            .post(body)
            .build()

        client().newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                callback(500, e.message)
            }
            override fun onResponse(call: Call, response: Response) {
                val respStr = response.body?.string()
                callback(response.code, respStr)
            }
        })
    }

    fun getInventory(context: Context, callback: (Boolean, String?) -> Unit) {
        val url = getServerUrl(context)
        val token = getToken(context)
        val request = Request.Builder()
            .url("$url/api/lager/")
            .addHeader("Authorization", "Bearer $token")
            .get()
            .build()

        client().newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) { callback(false, null) }
            override fun onResponse(call: Call, response: Response) {
                callback(response.isSuccessful, response.body?.string())
            }
        })
    }

    fun getLocations(context: Context, callback: (String?) -> Unit) {
        val url = getServerUrl(context)
        val token = getToken(context)
        val request = Request.Builder()
            .url("$url/api/locations/")
            .addHeader("Authorization", "Bearer $token")
            .get()
            .build()

        client().newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) { callback(null) }
            override fun onResponse(call: Call, response: Response) {
                callback(response.body?.string())
            }
        })
    }

    fun itemAction(context: Context, id: String, action: String, callback: (Boolean) -> Unit) {
        val url = getServerUrl(context)
        val token = getToken(context)
        val request = Request.Builder()
            .url("$url/api/lager/item/$id/$action")
            .addHeader("Authorization", "Bearer $token")
            .post(RequestBody.create(null, byteArrayOf()))
            .build()

        client().newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) { callback(false) }
            override fun onResponse(call: Call, response: Response) { callback(response.isSuccessful) }
        })
    }
}
