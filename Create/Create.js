const form = document.getElementById("create-form");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.some(user => user.username === username);

    if (exists) {
        alert("Username already exists!");
        return;
    }
    users.push({
        username,
        password
    });

    localStorage.setItem("users", JSON.stringify(users));

    alert("Account Created!");
    window.location.href = "/Login/login.html";
});