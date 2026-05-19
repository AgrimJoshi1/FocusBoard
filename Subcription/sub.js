const currentUser = JSON.parse(localStorage.getItem("currentUser"));
let pendingPlan = null;

if (!currentUser) {
    document.getElementById("loginModal").style.display = "flex";
    const navbar = document.getElementById("navbar");
    navbar.style.backgroundColor = "black"; 
}

if (currentUser) {
    document.getElementById("user-name").textContent = "👤 " + currentUser.username;
} else {
    document.getElementById("user-name").textContent = "👤 Guest";
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
    const oldPlan = currentUser.plan || "Free";
    const isUpgrade = plans.indexOf(selectedPlan) > plans.indexOf(oldPlan);

    if (isUpgrade) {
        pendingPlan = selectedPlan;
        document.getElementById("payment-plan-text").textContent =
            "Upgrading to " + selectedPlan;
        document.getElementById("paymentModal").style.display = "flex";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const index = users.findIndex(u => u.username === currentUser.username);
    if (index === -1) return;

    users[index].plan = selectedPlan;
    localStorage.setItem("users", JSON.stringify(users));

    currentUser.plan = selectedPlan;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    showToast("Downgraded to " + selectedPlan);
    renderButtons();
}

function renderButtons() {
    const current = JSON.parse(localStorage.getItem("currentUser"));
    const plan = current.plan || "Free";

    const cards = document.querySelectorAll(".plan-card");
    const planNames = ["Free", "Pro", "Premium"];
    const currentIndex = planNames.indexOf(plan);

    cards.forEach((card, i) => {
        const btn = card.querySelector("button");
        card.classList.remove("highlight");

        if (planNames[i] === plan) {
            btn.textContent = "Current Plan";
            btn.disabled = true;
            btn.style.opacity = "0.6";
            btn.onclick = null;
            card.classList.add("highlight");
        } else if (i < currentIndex) {
            btn.textContent = "Downgrade";
            btn.disabled = false;
            btn.style.opacity = "1";
            btn.onclick = () => updatePlan(planNames[i]);
        } else {
            btn.textContent = "Upgrade";
            btn.disabled = false;
            btn.style.opacity = "1";
            btn.onclick = () => updatePlan(planNames[i]);
        }
    });
}

function closePaymentModal() {
    document.getElementById("paymentModal").style.display = "none";
    clearPaymentForm();
}

function togglePaymentFields() {
    const method = document.getElementById("paymentMethod").value;

    document.getElementById("cardFields").classList.add("hidden");
    document.getElementById("upiFields").classList.add("hidden");

    if (method === "card") {
        document.getElementById("cardFields").classList.remove("hidden");
    }

    if (method === "upi") {
        document.getElementById("upiFields").classList.remove("hidden");
    }
}

function clearPaymentForm() {
    document.getElementById("billingName").value = "";
    document.getElementById("billingAddress").value = "";
    document.getElementById("billingCity").value = "";
    document.getElementById("billingPin").value = "";
    document.getElementById("paymentMethod").value = "";
    document.getElementById("cardNumber").value = "";
    document.getElementById("cardExpiry").value = "";
    document.getElementById("cardCVV").value = "";
    document.getElementById("upiId").value = "";
    document.getElementById("cardFields").classList.add("hidden");
    document.getElementById("upiFields").classList.add("hidden");
}

function confirmPayment() {
    const name = document.getElementById("billingName").value.trim();
    const address = document.getElementById("billingAddress").value.trim();
    const city = document.getElementById("billingCity").value.trim();
    const pin = document.getElementById("billingPin").value.trim();
    const method = document.getElementById("paymentMethod").value;

    if (!name || !address || !city || !pin || !method) {
        showToast("Fill all required fields");
        return;
    }

    if (!pin) {
        showToast("Invalid PIN code");
        return;
    }

    if (method === "card") {
        const card = document.getElementById("cardNumber").value.trim();
        const expiry = document.getElementById("cardExpiry").value.trim();
        const cvv = document.getElementById("cardCVV").value.trim();

        if (!card) {
            showToast("Invalid card number");
            return;
        }

        if (!expiry) {
            showToast("Invalid expiry");
            return;
        }

        if (!cvv) {
            showToast("Invalid CVV");
            return;
        }
    }

    if (method === "upi") {
        const upi = document.getElementById("upiId").value.trim();

        if (!upi) {
            showToast("Invalid UPI ID");
            return;
        }
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const index = users.findIndex(u => u.username === currentUser.username);
    if (index === -1) return;

    users[index].plan = pendingPlan;
    localStorage.setItem("users", JSON.stringify(users));

    currentUser.plan = pendingPlan;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    closePaymentModal();
    showToast("Payment successful! Upgraded to " + pendingPlan);
    renderButtons();
}

renderButtons();