const API = "/api/todos";
let allTodos = [];
let currentFilter = "all";

window.onload = function () {
  setGreeting();
  setDate();
  loadTodos();

  document.getElementById("todoInput").addEventListener("keypress", function (e) {
    if (e.key === "Enter") addTodo();
  });
};

function setGreeting() {
  const h = new Date().getHours();
  const g = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  document.getElementById("greeting").textContent = g;
}

function setDate() {
  const now = new Date();
  const opts = { weekday: 'short', month: 'short', day: 'numeric' };
  document.getElementById("date-badge").textContent = now.toLocaleDateString('en-US', opts);
}

function loadTodos() {
  fetch(API)
    .then(res => res.json())
    .then(todos => {
      allTodos = todos;
      updateCounts();
      renderTodos();
    })
    .catch(() => renderTodos());
}

function updateCounts() {
  const total   = allTodos.length;
  const done    = allTodos.filter(t => t.completed).length;
  const pending = total - done;

  document.getElementById("count-all").textContent     = total;
  document.getElementById("count-pending").textContent = pending;
  document.getElementById("count-done").textContent    = done;

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  document.getElementById("progress-pct").textContent  = pct + "%";
  document.getElementById("progress-fill").style.width = pct + "%";
}

function renderTodos() {
  const list  = document.getElementById("todoList");
  const empty = document.getElementById("empty");
  const meta  = document.getElementById("task-meta");
  const label = document.getElementById("section-label");

  let filtered = allTodos;
  if (currentFilter === "pending") filtered = allTodos.filter(t => !t.completed);
  if (currentFilter === "done")    filtered = allTodos.filter(t => t.completed);

  const labels = { all: "All Tasks", pending: "Pending", done: "Completed" };
  label.textContent = labels[currentFilter];
  meta.textContent  = filtered.length + " task" + (filtered.length !== 1 ? "s" : "");

  list.innerHTML = "";

  if (filtered.length === 0) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  filtered.forEach((todo, i) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.style.animationDelay = (i * 0.04) + "s";
    li.innerHTML = `
      <div class="custom-check ${todo.completed ? 'checked' : ''}"
           onclick="toggleTodo(${todo.id}, ${todo.completed}, '${escHtml(todo.title)}')">
        <svg viewBox="0 0 12 12" fill="none">
          <polyline points="1.5 6 4.5 9 10.5 3"/>
        </svg>
      </div>
      <span class="todo-title ${todo.completed ? 'done' : ''}">${escHtml(todo.title)}</span>
      <span class="todo-tag ${todo.completed ? 'tag-done' : 'tag-pending'}">
        ${todo.completed ? 'Done' : 'Pending'}
      </span>
      <button class="del-btn" onclick="deleteTodo(${todo.id})" title="Delete">
        <svg viewBox="0 0 24 24" fill="none">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14H6L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
      </button>
    `;
    list.appendChild(li);
  });
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function addTodo() {
  const input = document.getElementById("todoInput");
  const title = input.value.trim();
  if (!title) { input.focus(); return; }

  fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title, completed: false })
  })
  .then(res => res.json())
  .then(() => { input.value = ""; loadTodos(); });
}

function deleteTodo(id) {
  fetch(`${API}/${id}`, { method: "DELETE" })
    .then(() => loadTodos());
}

function toggleTodo(id, completed, title) {
  fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title, completed: !completed })
  })
  .then(() => loadTodos());
}

function filterTodos(type, el) {
  currentFilter = type;
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  if (el) el.classList.add("active");
  renderTodos();
}