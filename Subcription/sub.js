const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
    alert("Login required!");
    window.location.href = "/Login/login.html";
}

if (currentUser) {
    document.getElementById("user-name").textContent = "👤 " + currentUser.username;
} else {
    document.getElementById("user-name").textContent = "👤 " + "Guest";
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "/Login/login.html";
}
function showToast(msg) {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2800);
    }
function updatePlan(selectedPlan) {
    const plans = ["Free", "Pro", "Premium"];
    const oldPlan = JSON.parse(localStorage.getItem("currentUser")).plan || "Free"; // ← read BEFORE saving
    const isUpgrade = plans.indexOf(selectedPlan) > plans.indexOf(oldPlan);

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const index = users.findIndex(u => u.username === currentUser.username);
    if (index === -1) return;

    users[index].plan = selectedPlan;
    localStorage.setItem("users", JSON.stringify(users));

    currentUser.plan = selectedPlan;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    showToast(isUpgrade ? '🚀 Upgraded to ' + selectedPlan + '!' : '⬇️ Downgraded to ' + selectedPlan);

    renderButtons();

    renderButtons();
}

function renderButtons() {
    const current = JSON.parse(localStorage.getItem("currentUser"));
    const plan = current.plan || "Free";

    const cards = document.querySelectorAll(".plan-card");
    const planNames = ["Free", "Pro", "Premium"];

    cards.forEach((card, i) => {
        const btn = card.querySelector("button");
        if (planNames[i] === plan) {
            btn.textContent = "Current Plan";
            btn.disabled = true;
            btn.style.opacity = "0.6";
            btn.onclick = null;
        } else {
            btn.textContent = planNames[i] === "Free" ? "Downgrade" : "Upgrade";
            btn.disabled = false;
            btn.style.opacity = "1";
            btn.onclick = () => updatePlan(planNames[i]);
        }
    });
}

renderButtons();