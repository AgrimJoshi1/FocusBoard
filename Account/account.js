const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    alert("Login required!");
    window.location.href = "/Login/login.html";
}

function showToast(msg) {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2800);
    }
 
    function togglePwd(id, icon) {
        const el = document.getElementById(id);
        if (el.type === 'password') { el.type = 'text'; icon.textContent = '︵'; }
        else { el.type = 'password'; icon.textContent = '👁'; }
    }
 
    function getUser() {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        return currentUser
    }
 
    function saveUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));

        let users = JSON.parse(localStorage.getItem("users")) || [];
        const index = users.findIndex(u => u.username === user.username);
        if (index !== -1) users[index] = user;
        localStorage.setItem("users", JSON.stringify(users));
    }
 
    function loadUser() {
        const user = getUser();
        document.getElementById('user-name').textContent = '👤 ' + (user.username || 'Guest');
        document.getElementById('display-name').textContent = user.username || 'Guest';
        document.getElementById('display-plan').textContent = user.plan || 'Free Plan';
        document.getElementById('field-firstname').value = user.firstName || '';
        document.getElementById('field-lastname').value  = user.lastName  || '';
        document.getElementById('field-username').value  = user.username  || '';
        document.getElementById('field-dob').value       = user.dob       || '';
        document.getElementById('field-bio').value       = user.bio       || '';
        document.getElementById('field-email').value    = user.email    || '';
        document.getElementById('field-phone').value    = user.phone    || '';
        document.getElementById('field-location').value = user.location || '';

        
        document.getElementById('stat-tasks').textContent = user.tasksCompleted || 0;

        

        document.getElementById('stat-streak').textContent = (user.streak || 0) + '🔥';

        setToggle('toggle-email',  user.prefEmail  !== false);
        setToggle('toggle-sound',  user.prefSound  !== false);
        setToggle('toggle-report', user.prefReport === true);
    }
 
    function setToggle(id, on) {
        const el = document.getElementById(id);
        if (on) el.classList.add('on'); else el.classList.remove('on');
    }
 
    function savePersonal() {
        const user = getUser();
        user.firstName = document.getElementById('field-firstname').value.trim();
        user.lastName  = document.getElementById('field-lastname').value.trim();
        user.dob = document.getElementById('field-dob').value;
        user.bio = document.getElementById('field-bio').value.trim();
        const newUsername = document.getElementById('field-username').value.trim();
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const taken = users.some(u => u.username === newUsername && u.username !== getUser().username);
        if (taken) { showToast('❌ Username already taken!'); return; }
        user.username = newUsername;
        saveUser(user);
        document.getElementById('display-name').textContent = user.username || 'Guest';
        document.getElementById('user-name').textContent = '👤 ' + (user.username || 'Guest');
        showToast('✅ Personal info saved!');
    }
 
    function resetPersonal() { loadUser(); showToast('↩️ Changes discarded'); }
 
    function saveContact() {
        const user = getUser();
        user.email    = document.getElementById('field-email').value.trim();
        user.phone    = document.getElementById('field-phone').value.trim();
        user.location = document.getElementById('field-location').value.trim();
        saveUser(user);
        showToast('✅ Contact info saved!');
    }
 
    function resetContact() { loadUser(); showToast('↩️ Changes discarded'); }
 
    function changePassword() {
        const cur  = document.getElementById('field-current-pwd').value;
        const nw   = document.getElementById('field-new-pwd').value;
        const conf = document.getElementById('field-confirm-pwd').value;
        const user = getUser();
        if (!cur) { showToast('⚠️ Enter your current password'); return; }
        if (user.password && cur !== user.password) { showToast('❌ Current password is wrong'); return; }
        if (nw.length < 6) { showToast('⚠️ Password must be 6+ characters'); return; }
        if (nw !== conf)   { showToast('❌ Passwords do not match'); return; }
        user.password = nw;
        saveUser(user);
        ['field-current-pwd','field-new-pwd','field-confirm-pwd'].forEach(id => document.getElementById(id).value = '');
        showToast('🔒 Password updated!');
    }
 
    function savePrefs() {
        const user = getUser();
        user.prefEmail  = document.getElementById('toggle-email').classList.contains('on');
        user.prefSound  = document.getElementById('toggle-sound').classList.contains('on');
        user.prefReport = document.getElementById('toggle-report').classList.contains('on');
        saveUser(user);
        showToast('⚙️ Preferences saved!');
    }
 
    function confirmDelete() {
        if (confirm('Are you sure? This cannot be undone.')) {
        const user = getUser();
        let users = JSON.parse(localStorage.getItem("users")) || [];
        users = users.filter(u => u.username !== user.username);
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.removeItem('currentUser');
        showToast('Account deleted. Redirecting...');
        setTimeout(() => window.location.href = '/Login/login.html', 1800);
        }
    }
 
    function logout() {
        localStorage.removeItem('currentUser');
        window.location.href = '/Login/login.html';
    }
 
    loadUser();