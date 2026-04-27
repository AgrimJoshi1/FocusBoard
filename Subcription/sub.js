const currentUser = JSON.parse(localStorage.getItem("currentUser"));
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