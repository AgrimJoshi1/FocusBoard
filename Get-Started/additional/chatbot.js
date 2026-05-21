/* ============================================================
   FocusBoard Chatbot Widget - FIXED PART 1
   ============================================================ */

(function () {

const OPENROUTER_API_KEY = "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";
const MODEL = "arcee-ai/trinity-large-thinking:free";

function getCurrentPage() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes("home")) return "Home";
  if (path.includes("sub")) return "Subscription";
  if (path.includes("product")) return "Tools";
  if (path.includes("meditate")) return "Relax";
  if (path.includes("contact")) return "Contact";
  if (path.includes("account")) return "Account";
  return "FocusBoard";
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser")) || null;
  } catch {
    return null;
  }
}

function getUserPlan() {
  const user = getUser();
  return user ? (user.plan || "Free") : "Guest";
}

function isPremium() {
  return getUserPlan() === "Premium";
}

function buildSystemPrompt() {
  const user = getUser();
  const username = user ? user.username : "Guest";

  return `
You are FocusBoard Assistant.

User: ${username}
Plan: ${getUserPlan()}
Page: ${getCurrentPage()}

RULES:
- Help users with FocusBoard only.
- Greetings are allowed.
- Be short and friendly.
- Never return empty response.

NAVIGATION:
Plans/subscription/pricing:
[ACTION:navigate:/Subcription/sub.html]

Tools/tasks/productivity:
[ACTION:navigate:/Product/product.html]

Relax/breathing/meditation:
[ACTION:navigate:/Meditate/meditate.html]

Account/profile/settings/stats:
[ACTION:navigate:/Account/account.html]

Contact/support/help:
[ACTION:navigate:/Contact-us/contact.html]

TASK ADD:
If user asks to add a task:
[ACTION:addtask:task text]
`;
}

let history = [];
const MAX_HISTORY = 10;

function cleanHistory() {
  history = history.filter(msg =>
    msg &&
    typeof msg.content === "string" &&
    msg.content.trim()
  );

  if (history.length > MAX_HISTORY) {
    history = history.slice(-MAX_HISTORY);
  }
}

function detectIntent(text) {
  const lower = text.toLowerCase();

  if (
    lower.includes("plan") ||
    lower.includes("subscription") ||
    lower.includes("pricing") ||
    lower.includes("upgrade")
  ) {
    return "[ACTION:navigate:/Subcription/sub.html]";
  }

  if (
    lower.includes("tools") ||
    lower.includes("task manager") ||
    lower.includes("productivity")
  ) {
    return "[ACTION:navigate:/Product/product.html]";
  }

  if (
    lower.includes("relax") ||
    lower.includes("breathing") ||
    lower.includes("meditate")
  ) {
    return "[ACTION:navigate:/Meditate/meditate.html]";
  }

  if (
    lower.includes("account") ||
    lower.includes("profile") ||
    lower.includes("stats") ||
    lower.includes("settings")
  ) {
    return "[ACTION:navigate:/Account/account.html]";
  }

  if (
    lower.includes("contact") ||
    lower.includes("support") ||
    lower.includes("help")
  ) {
    return "[ACTION:navigate:/Contact-us/contact.html]";
  }

  if (lower.includes("add task")) {
    const task = text.replace(/add task/i, "").trim() || "New Task";
    return `[ACTION:addtask:${task}]`;
  }

  return null;
}

function handleActions(text) {
  if (!text) {
    return "I'm here to help with FocusBoard.";
  }

  const navMatch = text.match(/\[ACTION:navigate:\s*([^\]]+)\]/i);

  if (navMatch) {
    const path = navMatch[1].trim();

    setTimeout(() => {
      window.location.href = path;
    }, 700);

    return "Taking you there...";
  }

  const taskMatch = text.match(/\[ACTION:addtask:([^\]]+)\]/i);

  if (taskMatch) {
    const taskText = taskMatch[1].trim();

    if (!window.location.pathname.toLowerCase().includes("product")) {
      sessionStorage.setItem("focusboard_pending_task", taskText);

      setTimeout(() => {
        window.location.href = "/Product/product.html";
      }, 700);

      return "Opening tools and adding your task...";
    }

    const taskInput = document.getElementById("taskInput");
    const addBtn = document.getElementById("addTaskBtn");

    if (taskInput && addBtn) {
      taskInput.value = taskText;
      addBtn.click();
      return `Task added: ${taskText}`;
    }
  }

  return text.replace(/\[ACTION:[^\]]+\]/gi, "").trim();
}

async function askAI(userMessage) {
  const directIntent = detectIntent(userMessage);

  if (directIntent) {
    return handleActions(directIntent);
  }

  history.push({
    role: "user",
    content: userMessage
  });

  cleanHistory();

  const messages = [
    {
      role: "system",
      content: buildSystemPrompt()
    },
    ...history
  ];

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENROUTER_API_KEY,
        "HTTP-Referer": window.location.origin,
        "X-Title": "FocusBoard"
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 250,
        temperature: 0.7
      })
    });

    const data = await res.json();

    if (!res.ok) {
  console.log("OPENROUTER ERROR:", data);
  return data?.error?.message || "AI failed.";
}
    let reply =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      "";

    if (!reply.trim()) {
      return "I'm here to help with FocusBoard.";
    }

    reply = handleActions(reply);

    if (reply.trim()) {
      history.push({
        role: "assistant",
        content: reply
      });

      cleanHistory();
    }

    return reply;

  } catch {
    return "Connection failed. Please try again.";
  }
}

function showUpgradeToast() {
  let toast = document.getElementById("focusbot-toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "focusbot-toast";
    document.body.appendChild(toast);
  }

  toast.textContent =
    "You need a Premium plan to use the FocusBoard Assistant.";

  toast.classList.add("focusbot-toast-show");

  setTimeout(() => {
    toast.classList.remove("focusbot-toast-show");
  }, 3200);
}
function buildUI() {
  const style = document.createElement("style");

  style.textContent = `
    #focusbot-btn {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7B61FF, #5a47d6);
      border: none;
      cursor: pointer;
      font-size: 26px;
      color: white;
      box-shadow: 0 6px 24px rgba(123,97,255,0.55);
      z-index: 99999;
      transition: 0.25s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #focusbot-btn.locked {
      background: linear-gradient(135deg, #E6C15A, #c9a83e);
      box-shadow: 0 6px 24px rgba(230,193,90,0.55);
    }

    #focusbot-btn:hover {
      transform: translateY(-3px) scale(1.07);
    }

    #focusbot-window {
      position: fixed;
      bottom: 100px;
      right: 28px;
      width: 340px;
      height: 480px;
      background: #111;
      border: 1px solid rgba(123,97,255,0.35);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.7);
      display: none;
      flex-direction: column;
      z-index: 99998;
      overflow: hidden;
      font-family: 'Poppins', sans-serif;
    }

    #focusbot-window.open {
      display: flex;
    }

    #focusbot-header {
      background: linear-gradient(135deg, #7B61FF, #5a47d6);
      padding: 14px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    #focusbot-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #focusbot-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    #focusbot-title {
      font-size: 14px;
      font-weight: 600;
      color: white;
    }

    #focusbot-status {
      font-size: 11px;
      color: rgba(255,255,255,0.7);
    }

    #focusbot-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
    }

    #focusbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #0d0d0d;
    }

    .focusbot-msg {
      max-width: 82%;
      padding: 10px 13px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.5;
      color: #eee;
    }

    .focusbot-msg.bot {
      background: rgba(123,97,255,0.14);
      border: 1px solid rgba(123,97,255,0.25);
      align-self: flex-start;
    }

    .focusbot-msg.user {
      background: linear-gradient(135deg, #7B61FF, #5a47d6);
      color: white;
      align-self: flex-end;
    }

    .focusbot-typing {
      display: flex;
      gap: 5px;
      padding: 10px 13px;
    }

    .focusbot-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #7B61FF;
      animation: bounce 1.1s infinite ease-in-out;
    }

    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-6px); }
    }

    #focusbot-quick {
      padding: 8px 12px;
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      background: #0d0d0d;
    }

    .focusbot-quick-btn {
      background: rgba(123,97,255,0.12);
      border: 1px solid rgba(123,97,255,0.3);
      color: #b09fff;
      padding: 4px 10px;
      border-radius: 20px;
      cursor: pointer;
    }

    #focusbot-input-area {
      display: flex;
      gap: 8px;
      padding: 10px 12px;
      background: #111;
    }

    #focusbot-input {
      flex: 1;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 9px 12px;
      color: white;
    }

    #focusbot-send {
      background: linear-gradient(135deg, #7B61FF, #5a47d6);
      border: none;
      border-radius: 8px;
      padding: 0 14px;
      color: white;
      cursor: pointer;
    }

    #focusbot-toast {
      position: fixed;
      bottom: 100px;
      right: 28px;
      background: rgba(230,193,90,0.15);
      border: 1px solid #E6C15A;
      padding: 13px 20px;
      border-radius: 50px;
      color: #f5d87a;
      opacity: 0;
      transition: 0.4s;
      z-index: 999999;
    }

    #focusbot-toast.focusbot-toast-show {
      opacity: 1;
    }
  `;

  document.head.appendChild(style);

  const btn = document.createElement("button");
  btn.id = "focusbot-btn";
  btn.textContent = "🗨️";

  if (!isPremium()) {
    btn.classList.add("locked");
  }

  document.body.appendChild(btn);

  const toast = document.createElement("div");
  toast.id = "focusbot-toast";
  document.body.appendChild(toast);

  const win = document.createElement("div");
  win.id = "focusbot-window";

  win.innerHTML = `
    <div id="focusbot-header">
      <div id="focusbot-header-left">
        <div id="focusbot-avatar">🤖</div>
        <div>
          <div id="focusbot-title">FocusBoard Assistant</div>
          <div id="focusbot-status">There to help you out</div>
        </div>
      </div>
      <button id="focusbot-close">✕</button>
    </div>

    <div id="focusbot-messages"></div>

    <div id="focusbot-quick">
      <button class="focusbot-quick-btn" data-msg="Show plans">Plans</button>
      <button class="focusbot-quick-btn" data-msg="Open tools">Tools</button>
      <button class="focusbot-quick-btn" data-msg="Open account">Account</button>
      <button class="focusbot-quick-btn" data-msg="Contact support">Contact</button>
    </div>

    <div id="focusbot-input-area">
      <input id="focusbot-input" type="text" placeholder="Ask me anything...">
      <button id="focusbot-send">➤</button>
    </div>
  `;

  document.body.appendChild(win);

  function appendMessage(text, role) {
    const container = document.getElementById("focusbot-messages");
    const div = document.createElement("div");
    div.className = "focusbot-msg " + role;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function showTyping() {
    const container = document.getElementById("focusbot-messages");
    const div = document.createElement("div");
    div.className = "focusbot-typing";
    div.id = "focusbot-typing";
    div.innerHTML = `
      <div class="focusbot-dot"></div>
      <div class="focusbot-dot"></div>
      <div class="focusbot-dot"></div>
    `;
    container.appendChild(div);
  }

  function removeTyping() {
    const el = document.getElementById("focusbot-typing");
    if (el) el.remove();
  }

  async function sendMessage(forcedText) {
    const input = document.getElementById("focusbot-input");
    const text = forcedText || input.value.trim();

    if (!text) return;

    input.value = "";
    appendMessage(text, "user");
    showTyping();

    const reply = await askAI(text);

    removeTyping();
    appendMessage(reply, "bot");
  }

  btn.addEventListener("click", () => {
    if (!isPremium()) {
      showUpgradeToast();
      return;
    }

    win.classList.toggle("open");
  });

  document.getElementById("focusbot-close").addEventListener("click", () => {
    win.classList.remove("open");
  });

  document.getElementById("focusbot-send").addEventListener("click", () => {
    sendMessage();
  });

  document.getElementById("focusbot-input").addEventListener("keydown", e => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  document.querySelectorAll(".focusbot-quick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      sendMessage(btn.dataset.msg);
    });
  });

  window.addEventListener("load", () => {
    const pending = sessionStorage.getItem("focusboard_pending_task");

    if (pending && window.location.pathname.toLowerCase().includes("product")) {
      const taskInput = document.getElementById("taskInput");
      const addBtn = document.getElementById("addTaskBtn");

      if (taskInput && addBtn) {
        taskInput.value = pending;
        addBtn.click();
        sessionStorage.removeItem("focusboard_pending_task");
      }
    }
  });

  window.addEventListener("focus", () => {
    if (isPremium()) {
      btn.classList.remove("locked");
    } else {
      btn.classList.add("locked");
    }
  });
}

buildUI();

})();