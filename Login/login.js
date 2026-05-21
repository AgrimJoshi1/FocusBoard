const form = document.getElementById("login-form");
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

function showToast(msg) {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2800);
    }
function redirsignup(){
    showToast("Redirecting...");
    setTimeout(() => window.location.href = '/Create/Create.html', 1800);
}
function redirguest(){
    if (currentUser){
        showToast("Already Logged In!. Redirecting...");
    }
    else{
    showToast("Redirecting...");
    }
    setTimeout(() => window.location.href = '/Home/home.html', 1800);
}
form.addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

  
    const validUser = users.find(user =>
        ((user.username === username) || (user.email === username)) && (user.password === password)
    );


    if (validUser) {
        showToast("Login Successful!. Redirecting...");
        localStorage.setItem("currentUser", JSON.stringify(validUser));
        setTimeout(() => window.location.href = '/Home/home.html', 1800);

    } else {
        showToast("Invalid Login Credentials");
    }
});
function togglePassword() {
    const passwordInput = document.getElementById("password");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
}