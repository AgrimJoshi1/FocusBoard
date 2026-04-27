const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (currentUser) {
    document.getElementById("user-name").textContent = "👤 " + currentUser.username;
    } else {
        document.getElementById("user-name").textContent = "👤 " + "Guest";
    }
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "/Login/login.html";
}


const form = document.querySelector(".contact-form");
form.addEventListener("submit", function (e) {
    e.preventDefault(); 
    const firstName = form.querySelector('input[placeholder="FIRST NAME"]').value;
    const lastName = form.querySelector('input[placeholder="LAST NAME"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const phone = form.querySelector('input[type="tel"]').value;

    const contactData = {
        firstName,
        lastName,
        email,
        phone
    };
    let contacts = JSON.parse(localStorage.getItem("contacts")) || [];
    contacts.push(contactData);
    localStorage.setItem("contacts", JSON.stringify(contacts));
    alert("Your message has been sent successfully!");

    form.reset();
});