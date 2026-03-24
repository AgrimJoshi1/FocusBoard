// =======================
// TASK MANAGER
// =======================

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
    saveTasks();
    renderTasks();
    renderTaskTimerUI();
    updateAnalytics();
}

function toggleTask(index) {
    const task = tasks[index];

    task.completed = !task.completed;
    task.endTime = task.completed ? Date.now() : null;

    saveTasks();
    renderTasks();
    renderTaskTimerUI();
    updateAnalytics();
}

function deleteTask(index) {
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


// =======================
// TIMER
// =======================

let time = 0;
let timer = null;

const minutesInput = document.getElementById("minutesInput");
const display = document.getElementById("timerDisplay");

document.getElementById("startBtn").onclick = () => {
    if (timer) return;

    if (time === 0) {
        let m = +minutesInput.value;
        if (m <= 0) return alert("Enter valid minutes");

        time = m * 60;
        updateTimer(); // ✅ immediate update
    }

    timer = setInterval(() => {
        if (time <= 0) {
            clearInterval(timer);
            timer = null;
            display.textContent = "00:00";
            alert("⏰ Time's up!");
            return;
        }

        time--;
        updateTimer(); // ✅ ALWAYS updates UI
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
    display.textContent = "00:00";
};

function updateTimer() {
    if (!display) return;

    let m = Math.floor(time / 60);
    let s = time % 60;

    display.textContent =
        String(m).padStart(2, "0") + ":" +
        String(s).padStart(2, "0");
}


// =======================
// TIMER TASK UI
// =======================

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


// =======================
// NOTES
// =======================

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
    } else {
        notes.splice(current, 1);
        current = 0;
    }

    saveNotes();
    renderNotes();
    loadNote();
};


// =======================
// ANALYTICS
// =======================

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


// =======================
// INIT
// =======================

renderTasks();
renderTaskTimerUI();
renderNotes();
loadNote();
updateAnalytics();