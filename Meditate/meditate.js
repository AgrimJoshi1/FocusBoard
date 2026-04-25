/* ── Box Breathing Engine ── */

const PHASES = [
    { name: 'Inhale',  duration: 4, orbClass: 'expand',     corner: 0, edgeId: 'edge-top',    edgeDir: 'h' },
    { name: 'Hold',    duration: 4, orbClass: 'hold-full',  corner: 1, edgeId: 'edge-right',  edgeDir: 'v' },
    { name: 'Exhale',  duration: 4, orbClass: 'shrink',     corner: 2, edgeId: 'edge-bottom', edgeDir: 'h-rev'},
    { name: 'Hold',    duration: 4, orbClass: 'hold-empty', corner: 3, edgeId: 'edge-left',   edgeDir: 'v-rev' },
];

let running       = false;
let phaseIndex    = 0;
let countdown     = 0;
let cycles        = 0;
let sessionSecs   = 0;
let targetMins    = 5;   // 0 = infinite
let masterTimer   = null;
let edgeTimer     = null;
let edgeStart     = null;
let edgeDuration  = 0;

const orb         = document.getElementById('orb');
const phaseLabel  = document.getElementById('phaseLabel');
const phaseCount  = document.getElementById('phaseCount');
const cycleEl     = document.getElementById('cycleCount');
const timeEl      = document.getElementById('sessionTime');
const startBtn    = document.getElementById('startBtn');
const btnText     = document.getElementById('btnText');
const boxDiagram  = document.getElementById('boxDiagram');

/* ── helpers ── */
function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
}

function setOrbPhase(cls) {
    orb.classList.remove('expand', 'hold-full', 'shrink', 'hold-empty');
    if (cls) orb.classList.add(cls);
}

function setActiveCorner(idx) {
    document.querySelectorAll('.box-corner').forEach((el, i) => {
        el.classList.toggle('active-phase', i === idx);
    });
}

function resetEdges() {
    document.querySelectorAll('.edge-progress').forEach(ep => {
        ep.style.transition = 'none';
        ep.style.width  = '0%';
        ep.style.height = '0%';
    });
}

function animateEdge(edgeId, dir, duration) {
    cancelAnimationFrame(edgeTimer);
    const edge = document.getElementById(edgeId);
    if (!edge) return;
    const ep = edge.querySelector('.edge-progress');
    ep.style.transition = 'none';

    if (dir === 'h')     { ep.style.width = '0%';   ep.style.height = '100%'; ep.style.left = '0';    ep.style.right = 'auto'; }
    if (dir === 'h-rev') { ep.style.width = '0%';   ep.style.height = '100%'; ep.style.right = '0';   ep.style.left = 'auto';  }
    if (dir === 'v')     { ep.style.height = '0%';  ep.style.width = '100%';  ep.style.top = '0';     ep.style.bottom = 'auto';}
    if (dir === 'v-rev') { ep.style.height = '0%';  ep.style.width = '100%';  ep.style.bottom = '0';  ep.style.top = 'auto';   }

    void ep.offsetWidth;
    ep.style.transition = `${duration}s linear`;
    if (dir === 'h' || dir === 'h-rev') ep.style.width  = '100%';
    else                                ep.style.height = '100%';
}

function tick() {
    if (!running) return;

    sessionSecs++;
    timeEl.textContent = fmt(sessionSecs);

    // Check session cap
    if (targetMins > 0 && sessionSecs >= targetMins * 60) {
        endSession();
        return;
    }

    countdown--;
    if (countdown > 0) {
        phaseCount.textContent = countdown;
        return;
    }

    // Move to next phase
    phaseIndex = (phaseIndex + 1) % PHASES.length;
    if (phaseIndex === 0) {
        cycles++;
        cycleEl.textContent = cycles;
    }
    startPhase();
}

function startPhase() {
    const ph = PHASES[phaseIndex];
    countdown = ph.duration;

    phaseLabel.textContent = ph.name;
    phaseCount.textContent = countdown;

    setOrbPhase(ph.orbClass);
    setActiveCorner(ph.corner);
    resetEdges();
    animateEdge(ph.edgeId, ph.edgeDir, ph.duration);
}

/* ── session control ── */
function toggleSession() {
    if (running) {
        stopSession();
    } else {
        startSession();
    }
}

function startSession() {
    running      = true;
    phaseIndex   = 0;
    sessionSecs  = 0;
    cycles       = 0;
    cycleEl.textContent  = '0';
    timeEl.textContent   = '0:00';

    boxDiagram.classList.add('active-session');
    startBtn.classList.add('running');
    btnText.textContent = 'End Session';

    startPhase();
    masterTimer = setInterval(tick, 1000);
}

function stopSession() {
    running = false;
    clearInterval(masterTimer);
    resetEdges();
    setOrbPhase(null);
    setActiveCorner(-1);
    boxDiagram.classList.remove('active-session');
    startBtn.classList.remove('running');
    btnText.textContent  = 'Begin Session';
    phaseLabel.textContent = 'Ready';
    phaseCount.textContent = '—';
}

function endSession() {
    stopSession();
    showToast(`Session complete · ${cycles} cycles · ${fmt(sessionSecs)}`);
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

/* ── duration picker ── */
function setDuration(btn, mins) {
    if (running) return; // lock while running
    targetMins = mins;
    document.querySelectorAll('.picker-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}