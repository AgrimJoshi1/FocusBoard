const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    document.getElementById("loginModal").style.display = "flex";
    const navbar = document.getElementById("navbar");
    navbar.style.backgroundColor = "black"; 
}
if (currentUser) {
    document.getElementById("user-name").textContent = "👤 " + currentUser.username;
    } else {
        document.getElementById("user-name").textContent = "👤 " + "Guest";
    }

const analyticsContent = document.getElementById("analyticsContent");
const analyticsPopup = document.getElementById("analyticsPopup");
const pomodoro = document.getElementById("pomodoroBtn");

const membership = currentUser?.plan || "Free";

if (membership === "Free") {
    pomodoro.style.background = "#E6C15A";
    analyticsContent.classList.add("locked");
    analyticsPopup.style.display = "block";
}    
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "/Login/login.html";
}
function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}

// TASK MANAGER
let tasks = JSON.parse(localStorage.getItem("tasksData")) || [];

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

addTaskBtn.onclick = addTask;

function saveTasks() {
    localStorage.setItem("tasksData", JSON.stringify(tasks));
}

function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    tasks.push({
        text,
        completed: false,
        startTime: Date.now(),
        endTime: null
    });

    taskInput.value = "";
    showToast("Task added!");
    saveTasks();
    renderTasks();
    renderTaskTimerUI();
    updateAnalytics();

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const index = users.findIndex(u => u.username === currentUser.username);
    if (index === -1) return;

    const now = Date.now();
    const lastActive = users[index].lastActiveDate || 0;
    const hoursPassed = (now - lastActive) / 3600000;

    if (lastActive === 0 || hoursPassed >= 24) {
        users[index].streak = (users[index].streak || 0) + 1;
        users[index].lastActiveDate = now;
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(users[index]));
    }

    
}

function toggleTask(index) {
    const task = tasks[index];
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (!task.completed) {
        task.completed = true;
        showToast("Task completed!");
        task.endTime = Date.now();
        if (currentUser) {
            const userIndex = users.findIndex(
                u => u.username === currentUser.username
            );
            if (userIndex !== -1) {
                users[userIndex].tasksCompleted =
                    (users[userIndex].tasksCompleted || 0) + 1;
                localStorage.setItem("users", JSON.stringify(users));
                localStorage.setItem("currentUser",JSON.stringify(users[userIndex]));
            }
        }

    } else {
       
        task.completed = false;
        task.endTime = null;
        showToast("Task marked active again");
    }

    saveTasks();
    renderTasks();
    renderTaskTimerUI();
    updateAnalytics();
}

function deleteTask(index) {
    showToast("Task removed");
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
    renderTaskTimerUI();
    updateAnalytics();
}

function renderTasks() {
    if (!taskList) return;

    taskList.innerHTML = "";

    tasks.forEach((t, i) => {
        let duration = "";
        if (t.endTime) {
            let sec = Math.floor((t.endTime - t.startTime) / 1000);
            duration = ` (${Math.floor(sec / 60)}m ${sec % 60}s)`;
        }

        const li = document.createElement("li");

        li.innerHTML = `
            <input type="checkbox" ${t.completed ? "checked" : ""}>
            <span class="${t.completed ? "completed" : ""}">
                ${t.text}${duration}
            </span>
            <button>❌</button>
        `;

        li.querySelector("input").onclick = () => toggleTask(i);
        li.querySelector("button").onclick = () => deleteTask(i);

        taskList.appendChild(li);
    });
}

// TIMER
let time = 0;
let timer = null;

const minutesInput = document.getElementById("minutesInput");
const display = document.getElementById("timerDisplay");

document.getElementById("startBtn").onclick = () => {
    if (timer) return;

    if (time === 0) {
        let m = +minutesInput.value;
        if (m <= 0) return showToast("Enter valid minutes");

        time = m * 60;
        updateTimer();
    }

    timer = setInterval(() => {
        if (time <= 0) {
            clearInterval(timer);
            timer = null;
            display.textContent = "00:00";
            showToast("Time's up!");
            return;
        }

        time--;
        updateTimer();
    }, 1000);
};

document.getElementById("pauseBtn").onclick = () => {
    clearInterval(timer);
    timer = null;
};

document.getElementById("resetBtn").onclick = () => {
    clearInterval(timer);
    timer = null;
    time = 0;
    display.style.color = "white";
    display.textContent = "00:00";
};

document.getElementById("pomodoroBtn").onclick = () => {
    if (membership==="Free"){
        return showToast("Pomodoro Timer is available for Pro & Premium only");
        
    }
    clearInterval(timer);
    timer = null;
    time = 25 * 60;
    minutesInput.value = 25;
    updateTimer();

    timer = setInterval(() => {
        if (time <= 0) {
            clearInterval(timer);
            timer = null;
            display.textContent = "00:00";
            showToast("Pomodoro complete! Break started");

            time = 5 * 60;
            display.style.color = "#32dc78";
            updateTimer();

            timer = setInterval(() => {
                if (time <= 0) {
                    clearInterval(timer);
                    timer = null;
                    display.textContent = "00:00";
                    display.style.color = "white";
                    showToast("Break over! Ready for next Pomodoro");
                    return;
                }
                time--;
                updateTimer();
            }, 1000);

            return;
        }
        time--;
        updateTimer();
    }, 1000);
};


function updateTimer() {
    if (!display) return;

    let m = Math.floor(time / 60);
    let s = time % 60;

    display.textContent =
        String(m).padStart(2, "0") + ":" +
        String(s).padStart(2, "0");
}
// TIMER TASK UI
function renderTaskTimerUI() {
    const container = document.getElementById("taskTimerList");
    if (!container) return;

    container.innerHTML = "";

    tasks.forEach(task => {
        let timeSpent = 0;

        if (task.endTime) {
            timeSpent = Math.floor((task.endTime - task.startTime) / 1000);
        }

        let mins = Math.floor(timeSpent / 60);
        let secs = timeSpent % 60;

        const div = document.createElement("div");
        div.className = "timer-task";

        div.innerHTML = `
            <span>${task.text}</span>
            <span>${mins}m ${secs}s</span>
            <span class="${task.completed ? "status-done" : "status-pending"}">
                ${task.completed ? "Done" : "Active"}
            </span>
        `;

        container.appendChild(div);
    });
}
// NOTES
const notesInput = document.getElementById("notesInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const tabs = document.getElementById("notesTabs");
const clearBtn = document.getElementById("clearNotesBtn");

let notes = JSON.parse(localStorage.getItem("notesList")) || [""];
let current = 0;

function saveNotes() {
    localStorage.setItem("notesList", JSON.stringify(notes));
}

function loadNote() {
    if (!notesInput) return;
    notesInput.value = notes[current];
}

function renderNotes() {
    if (!tabs) return;

    tabs.innerHTML = "";

    notes.forEach((_, i) => {
        const tab = document.createElement("div");
        tab.textContent = "Note " + (i + 1);
        tab.className = "note-tab" + (i === current ? " active" : "");

        tab.onclick = () => {
            current = i;
            loadNote();
            renderNotes();
        };

        tabs.appendChild(tab);
    });

    tabs.appendChild(addNoteBtn);
}

addNoteBtn.onclick = () => {
    notes.push("");
    showToast("New note created!");
    current = notes.length - 1;
    saveNotes();
    renderNotes();
    loadNote();
};

notesInput.oninput = () => {
    notes[current] = notesInput.value;
    saveNotes();
};

clearBtn.onclick = () => {
    if (notes.length === 1) {
        notes[0] = "";
        showToast("Note cleared");
    } else {
        notes.splice(current, 1);
        current = 0;
        showToast("Note deleted");
    }

    saveNotes();
    renderNotes();
    loadNote();
};
// ANALYTICS
function updateAnalytics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;

    let totalTime = 0;

    tasks.forEach(t => {
        if (t.completed && t.endTime) {
            totalTime += (t.endTime - t.startTime);
        }
    });

    totalTime = Math.floor(totalTime / 1000);

    const stat1 = document.getElementById("taskStats");
    const stat2 = document.getElementById("timeStats");
    const list = document.getElementById("analyticsList");

    if (stat1) stat1.textContent = `Tasks: ${completed}/${total}`;
    if (stat2) stat2.textContent = `Total Focus Time: ${Math.floor(totalTime / 60)} mins`;

    if (!list) return;

    list.innerHTML = "";

    const header = document.createElement("div");
    header.className = "analytics-row header";
    header.innerHTML = `
        <span>Task</span>
        <span>Time</span>
        <span>Status</span>
    `;
    list.appendChild(header);

    tasks.forEach(t => {
        let timeSpent = 0;

        if (t.endTime) {
            timeSpent = Math.floor((t.endTime - t.startTime) / 1000);
        }

        let mins = Math.floor(timeSpent / 60);
        let secs = timeSpent % 60;

        const row = document.createElement("div");
        row.className = "analytics-row";

        row.innerHTML = `
            <span>${t.text}</span>
            <span>${mins}m ${secs}s</span>
            <span class="${t.completed ? "status-done" : "status-pending"}">
                ${t.completed ? "Done" : "Active"}
            </span>
        `;
        list.appendChild(row);
    });
}

renderTasks();
renderTaskTimerUI();
renderNotes();
loadNote();
updateAnalytics();z