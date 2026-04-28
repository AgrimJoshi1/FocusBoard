const form = document.getElementById("create-form");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm  = document.getElementById("confirm-password").value;
    const plan = "Free";
    

    if (password !== confirm) {
        alert("Passwords do not match!");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
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

    users.push({ username, email, password, plan: plan, tasksCompleted: 0, hoursFocused: 0, streak: 0, firstName: "", lastName: "", dob: "", bio: "", phone: "", location: "" });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Account created! Welcome to FocusBoard 🎉");
    window.location.href = "/Login/login.html";
});