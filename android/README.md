# 📱 Eisfach Android App (Ohne Google-Abhängigkeit)

Entsprechend der Anforderung **"keine Google Abhängigkeit"** wird die Android-App als **Progressive Web App (PWA)** oder über einen leichten **Android WebView Wrapper** bereitgestellt. 

Dabei werden **keinerlei Google Play Services**, Firebase Cloud Messaging oder Google Play Store benötigt. Die App läuft direkt auf jedem Android-Smartphone und verbindet sich per REST-API mit Ihrem Debian 13 Trixie Server.

---

## 🛠️ Funktionsumfang der App
1. **Scannen:** Zugriff auf die Smartphone-Kamera über die HTML5 MediaDevices API und ZXing-Bibliothek zum direkten Scannen von Barcodes und QR-Codes.
2. **Manuelle Angabe:** Eingabe von Barcodes über die Tastatur.
3. **Liste des Bestandes:** Live-Abfrage des aktuellen Gefrierschrank- und Vorratsbestands über die REST-API.
4. **Aktionen:** 
   - **Entnahme:** Reduziert die Menge um 1 oder versteckt das Produkt (automatisches Löschen nach 30 Tagen).
   - **Weiteres Teil:** Erhöht die Menge um 1.
   - **Neuanlage / Verknüpfung:** Unbekannte Barcodes können direkt als neues Produkt angelegt (mit automatischer `YYYY-MM-N`-ID und aktuellem Datum) oder mit einem bestehenden Produkt verknüpft werden.

---

## 📥 Installation auf Android (Ohne Google Play Store)

### Methode 1: Als Progressive Web App (PWA) im Browser (Empfohlen)
1. Öffnen Sie den Browser auf Ihrem Android-Gerät (z.B. **Firefox**, **Brave**, **Mull** oder **Chrome** ohne Google-Login).
2. Navigieren Sie zu Ihrer Server-URL (z. B. `http://eisfach.local` oder Ihrer IP-Adresse).
3. Tippen Sie im Browser-Menü auf **"Zum Startbildschirm hinzufügen"** oder **"App installieren"**.
4. Die App verhält sich nun wie eine native App, läuft im Vollbildmodus und greift auf die Kamera zu.

### Methode 2: Als nativer APK WebView Wrapper (Optional)
Falls Sie eine eigenständige `.apk`-Datei ohne Browser-UI wünschen, können Sie ein leichtgewichtiges Android Studio Projekt mit einer einzigen `MainActivity.java` erstellen, die ein `WebView` auf Ihre Server-URL lädt:

```java
package com.eisfach.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView myWebView = new WebView(this);
        setContentView(myWebView);
        
        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        
        myWebView.setWebViewClient(new WebViewClient());
        myWebView.loadUrl("http://IHRE-SERVER-IP/");
    }
}
```
*(Da keine Google Play Services verwendet werden, kann diese APK direkt per Sideloading via USB oder lokalen Webserver auf das Android-Gerät installiert werden.)*
