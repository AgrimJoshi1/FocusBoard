const form = document.getElementById("login-form");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

  
    const validUser = users.find(user =>
        ((user.username === username) || (user.email === username)) && (user.password === password)
    );


    if (validUser) {
        alert("Login Successful!");

        window.location.href = "/Home/home.html";
    } else {
        alert("Invalid Login Credentials");
    }
});