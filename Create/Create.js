const form = document.getElementById("create-form");


const strengthBar = document.getElementById("password-strength-bar");
const strengthText = document.getElementById("password-strength-text");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm-password").value;
    const plan = "Free";

    if (password !== confirm) {
        alert("Passwords do not match!");
        return;
    }

    const strongPassword =
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!strongPassword) {
        alert("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
        return;
    }

    if (!email.includes("@") || !email.includes(".")) {
        alert("Please enter a valid email address.");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.some(user => user.username === username || user.email === email);
    if (exists) {
        alert("Username or email already in use. Try another.");
        return;
    }

    users.push({
        username,
        email,
        password,
        plan: plan,
        tasksCompleted: 0,
        hoursFocused: 0,
        streak: 0,
        firstName: "",
        lastName: "",
        dob: "",
        bio: "",
        phone: "",
        location: ""
    });

    localStorage.setItem("users", JSON.stringify(users));

    alert("Account created! Welcome to FocusBoard 🎉");
    window.location.href = "/Login/login.html";
});

document.getElementById("password").addEventListener("input", function() {
    const password = document.getElementById("password").value;
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (password.length === 0) {
        strengthBar.style.width = "0%";
        strengthText.textContent = "";
        strengthBar.parentElement.style.display = "none";
        return;
    }
    strengthBar.parentElement.style.display = "block";
    if (score <= 2) {
        strengthBar.style.width = "33%";
        strengthBar.style.background = "#ff4d4d";
        strengthText.textContent = "Weak Password";
    } else if (score <= 4) {
        strengthBar.style.width = "66%";
        strengthBar.style.background = "#ffaa00";
        strengthText.textContent = "Medium Password";
    } else {
        strengthBar.style.width = "100%";
        strengthBar.style.background = "#00cc66";
        strengthText.textContent = "Strong Password";
    }
});