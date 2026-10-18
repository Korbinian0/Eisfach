let token = localStorage.getItem("eisfach_token") || "";
let currentUser = localStorage.getItem("eisfach_user") || "";
let currentRole = parseInt(localStorage.getItem("eisfach_role") || "0");

document.addEventListener("DOMContentLoaded", () => {
    if (token) {
        showApp();
    } else {
        showLogin();
    }

    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const errDiv = document.getElementById("login-error");
        errDiv.classList.add("d-none");

        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData
            });
            if (!res.ok) throw new Error("Anmeldung fehlgeschlagen");
            const data = await res.json();
            token = data.access_token;
            currentUser = data.username;
            currentRole = data.role;
            localStorage.setItem("eisfach_token", token);
            localStorage.setItem("eisfach_user", currentUser);
            localStorage.setItem("eisfach_role", currentRole);
            showApp();
        } catch (err) {
            errDiv.textContent = "Ungültiger Benutzername oder Passwort";
            errDiv.classList.remove("d-none");
        }
    });
});

function showLogin() {
    document.getElementById("login-section").classList.remove("d-none");
    document.getElementById("app-section").classList.add("d-none");
}

function showApp() {
    document.getElementById("login-section").classList.add("d-none");
    document.getElementById("app-section").classList.remove("d-none");
    document.getElementById("user-display").textContent = `Eingeloggt: ${currentUser} (${currentRole === 1 ? 'Admin' : 'User'})`;
    if (currentRole === 1) {
        document.getElementById("admin-tab-btn").classList.remove("d-none");
    }
    loadInventory();
    loadLocations();
}

function logout() {
    localStorage.clear();
    token = "";
    currentUser = "";
    currentRole = 0;
    showLogin();
}
