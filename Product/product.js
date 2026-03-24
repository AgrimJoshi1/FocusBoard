// TASK MANAGER
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

addBtn.onclick = addTask;

taskInput.onkeypress = (e) => {
    if (e.key === "Enter") addTask();
};

function addTask() {
    if (taskInput.value.trim() === "") return;

    const li = document.createElement("li");

    li.innerHTML = `
        <input type="checkbox">
        <span>${taskInput.value}</span>
        <button>❌</button>
    `;

    // mark complete
    li.querySelector("input").onchange = function () {
        li.querySelector("span").classList.toggle("completed");
    };

    // delete task
    li.querySelector("button").onclick = function () {
        li.remove();
    };

    taskList.appendChild(li);
    taskInput.value = "";
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

        if (m <= 0) {
            alert("Enter valid minutes");
            return;
        }

        time = m * 60;
        update(); // show immediately
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
        update();
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

function update() {
    let m = Math.floor(time / 60);
    let s = time % 60;

    display.textContent =
        String(m).padStart(2, "0") + ":" +
        String(s).padStart(2, "0");
}

//NOTES
const notesInput = document.getElementById("notesInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const tabs = document.getElementById("notesTabs");
const clearBtn = document.getElementById("clearNotesBtn");

let notes = JSON.parse(localStorage.getItem("notesList")) || [""];
let current = 0;

// save
function save() {
    localStorage.setItem("notesList", JSON.stringify(notes));
}

// load current note
function load() {
    notesInput.value = notes[current];
}

// render tabs
function render() {
    tabs.innerHTML = "";

    notes.forEach((_, i) => {
        let t = document.createElement("div");
        t.textContent = "Note " + (i + 1);
        t.className = "note-tab" + (i === current ? " active" : "");

        t.onclick = () => {
            current = i;
            load();
            render();
        };

        tabs.appendChild(t);
    });

    tabs.appendChild(addBtn);
}
// add new note
addBtn.onclick = () => {
    notes.push("");
    current = notes.length - 1;
    save();
    render();
    load();
};
// typing → save
notesInput.oninput = () => {
    notes[current] = notesInput.value;
    save();
};
// delete current note
clearBtn.onclick = () => {
    if (notes.length === 1) {
        notes[0] = "";
    } else {
        notes.splice(current, 1);
        current = 0;
    }
    save();
    render();
    load();
}
// init
render();
load();