// ==============================
// ダミーデータ層（本実装ではここをfetch('/api/cards')等に差し替える）
// ==============================
const STORAGE_KEY = "taskmanagement-mock-cards";

const COLUMNS = [
  { status: "todo", label: "To Do" },
  { status: "doing", label: "Doing" },
  { status: "done", label: "Done" },
];

const PRIORITY_LABEL = { high: "高", medium: "中", low: "低" };
const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 };

function loadCards() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  // orderはカード表示順（列内の並び）。値が小さいほど上に表示される
  return [
    { id: 1, title: "画面設計書を読む", priority: "high", dueDate: "2026-08-05", status: "todo", order: 0 },
    { id: 2, title: "要件定義書を書く", priority: "low", dueDate: "", status: "todo", order: 1 },
    { id: 3, title: "モック画面を作る", priority: "medium", dueDate: "2026-08-01", status: "doing", order: 0 },
    { id: 4, title: "API仕様書を書く", priority: "medium", dueDate: "2026-08-10", status: "done", order: 0 },
  ];
}

function saveCards() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

let cards = loadCards();
let nextId = cards.reduce((max, c) => Math.max(max, c.id), 0) + 1;

// data操作関数（APIを呼び出す実装に差し替える想定の箇所）
function apiGetCardsByStatus(status) {
  return cards.filter((c) => c.status === status).sort((a, b) => a.order - b.order);
}
function nextOrderFor(status) {
  const colCards = cards.filter((c) => c.status === status);
  if (colCards.length === 0) return 0;
  return Math.max(...colCards.map((c) => c.order)) + 1;
}
function apiAddCard(card) {
  card.order = nextOrderFor(card.status);
  cards.push(card);
  saveCards();
}
function apiUpdateCard(id, changes) {
  const target = cards.find((c) => c.id === id);
  Object.assign(target, changes);
  saveCards();
}
function apiDeleteCard(id) {
  cards = cards.filter((c) => c.id !== id);
  saveCards();
}
// ドラッグ&ドロップ後のDOM上の並び（列・順序）をそのままデータに反映する
function apiReorderFromDom(columnOrder) {
  columnOrder.forEach(({ status, ids }) => {
    ids.forEach((id, index) => {
      const card = cards.find((c) => c.id === id);
      if (card) {
        card.status = status;
        card.order = index;
      }
    });
  });
  saveCards();
}
// 優先度順・期限順に並び替え、その結果を新しい表示順として確定する
function apiSortColumn(status, mode) {
  const colCards = cards.filter((c) => c.status === status);
  const sorted = [...colCards].sort((a, b) => {
    if (mode === "priority") {
      return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    }
    // due: 期限日の昇順、未設定は末尾
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
  sorted.forEach((c, index) => {
    c.order = index;
  });
  saveCards();
}

// ==============================
// 描画
// ==============================
const board = document.getElementById("board");
const cardTemplate = document.getElementById("card-template");
const cardEditTemplate = document.getElementById("card-edit-template");
const cardAddTemplate = document.getElementById("card-add-template");

function render() {
  board.innerHTML = "";
  COLUMNS.forEach((col, colIndex) => {
    const columnEl = document.createElement("section");
    columnEl.className = "column";
    columnEl.dataset.status = col.status;

    const columnCards = apiGetCardsByStatus(col.status);

    const header = document.createElement("div");
    header.className = "column-header";
    header.innerHTML = `<span>${col.label}</span><span class="column-count">${columnCards.length}</span>`;
    columnEl.appendChild(header);

    const sortControls = document.createElement("div");
    sortControls.className = "sort-controls";
    const sortPriorityBtn = document.createElement("button");
    sortPriorityBtn.type = "button";
    sortPriorityBtn.className = "btn-sort";
    sortPriorityBtn.textContent = "優先度順";
    sortPriorityBtn.addEventListener("click", () => {
      apiSortColumn(col.status, "priority");
      render();
    });
    const sortDueBtn = document.createElement("button");
    sortDueBtn.type = "button";
    sortDueBtn.className = "btn-sort";
    sortDueBtn.textContent = "期限順";
    sortDueBtn.addEventListener("click", () => {
      apiSortColumn(col.status, "due");
      render();
    });
    sortControls.append(sortPriorityBtn, sortDueBtn);
    columnEl.appendChild(sortControls);

    const addBtn = document.createElement("button");
    addBtn.className = "btn-add";
    addBtn.type = "button";
    addBtn.textContent = "+ カード追加";
    addBtn.addEventListener("click", () => showAddForm(columnEl, col.status));
    columnEl.appendChild(addBtn);

    const list = document.createElement("div");
    list.className = "card-list";
    columnCards.forEach((card) => {
      list.appendChild(buildCardElement(card, colIndex));
    });
    columnEl.appendChild(list);

    setupDropZone(columnEl, col.status);
    board.appendChild(columnEl);
  });
}

function buildCardElement(card, colIndex) {
  const node = cardTemplate.content.firstElementChild.cloneNode(true);
  node.classList.add(`priority-${card.priority}`);
  node.dataset.id = card.id;

  node.querySelector(".card-title").textContent = card.title;
  node.querySelector(".card-priority").textContent = `優先度: ${PRIORITY_LABEL[card.priority]}`;
  node.querySelector(".card-due").textContent = card.dueDate ? `期限: ${formatDate(card.dueDate)}` : "";

  node.querySelector(".btn-edit").addEventListener("click", () => showEditForm(node, card));
  node.querySelector(".btn-delete").addEventListener("click", () => {
    apiDeleteCard(card.id);
    render();
  });

  const moveBtn = node.querySelector(".btn-move");
  if (colIndex >= COLUMNS.length - 1) {
    moveBtn.disabled = true;
    moveBtn.style.visibility = "hidden";
  } else {
    moveBtn.addEventListener("click", () => {
      const destStatus = COLUMNS[colIndex + 1].status;
      apiUpdateCard(card.id, { status: destStatus, order: nextOrderFor(destStatus) });
      render();
    });
  }

  node.addEventListener("dragstart", () => {
    // 描画をrequestAnimationFrameの後にずらし、ドラッグ中の見た目(dragging)が
    // すぐに消えてしまわないようにする
    requestAnimationFrame(() => node.classList.add("dragging"));
  });
  node.addEventListener("dragend", () => {
    node.classList.remove("dragging");
  });

  return node;
}

function formatDate(isoDate) {
  const [, month, day] = isoDate.split("-");
  return `${Number(month)}/${Number(day)}`;
}

// ==============================
// 追加フォーム
// ==============================
function showAddForm(columnEl, status) {
  if (columnEl.querySelector(".card-editing")) return;

  const formNode = cardAddTemplate.content.firstElementChild.cloneNode(true);
  columnEl.appendChild(formNode);
  formNode.querySelector(".input-title").focus();

  formNode.querySelector(".btn-save").addEventListener("click", () => {
    const title = formNode.querySelector(".input-title").value.trim();
    if (!title) {
      alert("タスク名を入力してください");
      return;
    }
    const priority = formNode.querySelector(".input-priority").value;
    const dueDate = formNode.querySelector(".input-due").value;

    apiAddCard({ id: nextId++, title, priority, dueDate, status });
    render();
  });

  formNode.querySelector(".btn-cancel").addEventListener("click", () => {
    render();
  });
}

// ==============================
// 編集フォーム
// ==============================
function showEditForm(cardNode, card) {
  const formNode = cardEditTemplate.content.firstElementChild.cloneNode(true);
  formNode.querySelector(".input-title").value = card.title;
  formNode.querySelector(".input-priority").value = card.priority;
  formNode.querySelector(".input-due").value = card.dueDate || "";

  cardNode.replaceWith(formNode);
  formNode.querySelector(".input-title").focus();

  formNode.querySelector(".btn-save").addEventListener("click", () => {
    const title = formNode.querySelector(".input-title").value.trim();
    if (!title) {
      alert("タスク名を入力してください");
      return;
    }
    apiUpdateCard(card.id, {
      title,
      priority: formNode.querySelector(".input-priority").value,
      dueDate: formNode.querySelector(".input-due").value,
    });
    render();
  });

  formNode.querySelector(".btn-cancel").addEventListener("click", () => {
    render();
  });
}

// ==============================
// ドラッグ&ドロップ（列間移動 + 列内の自由な並び替え）
// ==============================

// ドラッグ中のカードを、カーソル位置に応じて挿入すべき「直後の要素」を返す
// （nullなら一番下に挿入）
function getDragAfterElement(list, y) {
  const candidates = [...list.querySelectorAll(".card:not(.dragging)")];
  return candidates.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: null }
  ).element;
}

function setupDropZone(columnEl, status) {
  const list = columnEl.querySelector(".card-list");

  columnEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    columnEl.classList.add("drag-over");

    const dragging = document.querySelector(".dragging");
    if (!dragging) return;
    const afterElement = getDragAfterElement(list, e.clientY);
    if (afterElement == null) {
      list.appendChild(dragging);
    } else {
      list.insertBefore(dragging, afterElement);
    }
  });

  columnEl.addEventListener("dragleave", (e) => {
    if (!columnEl.contains(e.relatedTarget)) {
      columnEl.classList.remove("drag-over");
    }
  });

  columnEl.addEventListener("drop", (e) => {
    e.preventDefault();
    columnEl.classList.remove("drag-over");
    commitDomOrder();
    render();
  });
}

// 現在のDOM上の並び（全列）をそのままデータに反映する
function commitDomOrder() {
  const columnOrder = [...board.querySelectorAll(".column")].map((columnEl) => ({
    status: columnEl.dataset.status,
    ids: [...columnEl.querySelectorAll(".card[data-id]")].map((el) => Number(el.dataset.id)),
  }));
  apiReorderFromDom(columnOrder);
}

render();
