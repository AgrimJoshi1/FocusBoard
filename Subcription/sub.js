const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (currentUser) {
    document.getElementById("user-name").textContent = "👤 " + currentUser.username;
    } else {
        document.getElementById("user-name").textContent = "👤 " + "Guest";
    }
function currentuser() {
    if (!currentUser) {
        alert("Login required!");
        window.location.href = "/Login/login.html";
    }
}
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "/Login/login.html";
}