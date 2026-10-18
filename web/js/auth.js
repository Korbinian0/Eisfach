let token = localStorage.getItem("eisfach_token") || "";
let currentUser = localStorage.getItem("eisfach_user") || "";
let currentRole = parseInt(localStorage.getItem("eisfach_role") || "0");
let authenticationDisabled = false;

function apiUrl(path) {
    const pathname = window.location.pathname;
    const ingressPath = pathname.match(/^\/api\/hassio_ingress\/[^/]+/);
    const basePath = ingressPath
        ? `${ingressPath[0]}/`
        : pathname.endsWith("/")
            ? pathname
            : pathname.slice(0, pathname.lastIndexOf("/") + 1);
    return `${basePath}${path.replace(/^\/+/, "")}`;
}

document.addEventListener("DOMContentLoaded", () => {
    authenticationDisabled = /^\/api\/hassio_ingress\/[^/]+(?:\/|$)/.test(window.location.pathname);
    if (authenticationDisabled) {
        token = "";
        currentUser = "Home Assistant";
        currentRole = 1;
        localStorage.removeItem("eisfach_token");
        localStorage.removeItem("eisfach_user");
        localStorage.removeItem("eisfach_role");
        showApp();
    } else if (token) {
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
            const res = await fetch(apiUrl("api/auth/login"), {
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
    } else {
        document.getElementById("admin-tab-btn").classList.add("d-none");
    }
    document.getElementById("logout-button").classList.toggle("d-none", authenticationDisabled);
    loadInventory();
    loadLocations();
}

function logout() {
    if (authenticationDisabled) return;
    localStorage.clear();
    token = "";
    currentUser = "";
    currentRole = 0;
    showLogin();
}
