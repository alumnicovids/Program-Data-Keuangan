import {
  formatRp,
  getLS,
  setLS,
  typeIcons,
  typeMap,
  months,
} from "../javascript/utils.js";
import { els, getChartInstance, setChartInstance } from "../javascript/dom.js";

let editingId = null;

const setSubmitButtonText = (isEditing) => {
  if (els.submitBtn) {
    els.submitBtn.textContent = isEditing
      ? "✅ Update Transaction"
      : "➕ Add New Transaction";
  }
};

export const switchToInputCard = () => {
  els.cards.forEach((c) => c.classList.remove("active-card"));
  document.querySelector("#input-card").classList.add("active-card");
  els.navLinks.forEach((n) => n.classList.remove("active-link"));
  const inputLink = document.querySelector('.side-nav a[href="#input-card"]');
  if (inputLink) inputLink.classList.add("active-link");
};

export const populateDates = () => {
  const y = new Date().getFullYear();
  months.forEach((m, i) =>
    els.selMonth.add(new Option(m, String(i + 1).padStart(2, "0")))
  );
  for (let i = y - 2; i <= y + 2; i++) els.selYear.add(new Option(i, i));
  els.selMonth.value = String(new Date().getMonth() + 1).padStart(2, "0");
  els.selYear.value = y;
};

export const renderList = (q = "") => {
  const txs = getLS("transactions").reverse();
  const qLower = q.toLowerCase();
  const translatedType = typeMap[qLower] || q;

  const filtered = q
    ? txs.filter(
        (t) =>
          t.category.toLowerCase().includes(qLower) ||
          t.desc.toLowerCase().includes(qLower) ||
          t.method.toLowerCase().includes(qLower) ||
          t.date.includes(q) ||
          t.type.toLowerCase().includes(qLower) ||
          t.type.includes(translatedType)
      )
    : txs;

  els.list.innerHTML =
    filtered
      .map((t) => {
        return `
          <li class="transaction-item">
              <span class="main-info">${typeIcons[t.type] || "📄"} ${
          t.category
        } - ${formatRp(t.total)}</span>
              <div class="detail-info">🗓️ ${t.date} | 💳 ${t.method} | 📝 ${
          t.desc
        }</div>
              <div class="action-buttons">
                  <button class="edit-btn" data-id="${t.id}">✏️ Edit</button>
                  <button class="delete-btn" data-id="${
                    t.id
                  }">🗑️ Delete</button>
              </div>
          </li>`;
      })
      .join("") ||
    '<li style="text-align:center; opacity:0.7">⚠️ No data found</li>';
};

export const setupTransactionForm = (renderAll) => {
  els.form.onsubmit = (e) => {
    e.preventDefault();

    const formData = {
      date: document.getElementById("input-date").value,
      type: document.getElementById("input-type").value,
      total: parseFloat(document.getElementById("input-total").value),
      category: document.getElementById("input-category").value,
      desc: document.getElementById("input-description").value,
      method: document.getElementById("input-metode").value,
    };

    let txs = getLS("transactions");

    if (editingId !== null) {
      const index = txs.findIndex((t) => t.id === editingId);
      if (index !== -1) {
        txs[index] = { id: editingId, ...formData };
        alert("✅ Transaction Updated!");
      }
      editingId = null;
      setSubmitButtonText(false);
    } else {
      txs.push({ id: Date.now(), ...formData });
      alert("✅ Transaction Saved!");
    }

    setLS("transactions", txs);
    els.form.reset();
    renderAll();
  };
  setSubmitButtonText(false);
};

export const setupTransactionListHandlers = (renderAll) => {
  els.list.onclick = (e) => {
    const id = parseInt(e.target.dataset.id);

    if (e.target.classList.contains("delete-btn")) {
      if (confirm("🚨 Delete this transaction?")) {
        setLS(
          "transactions",
          getLS("transactions").filter((t) => t.id !== id)
        );
        renderAll();
      }
    } else if (e.target.classList.contains("edit-btn")) {
      editingId = id;
      const txs = getLS("transactions");
      const transactionToEdit = txs.find((t) => t.id === id);

      if (transactionToEdit) {
        document.getElementById("input-date").value = transactionToEdit.date;
        document.getElementById("input-type").value = transactionToEdit.type;
        document.getElementById("input-total").value = transactionToEdit.total;
        document.getElementById("input-category").value =
          transactionToEdit.category;
        document.getElementById("input-description").value =
          transactionToEdit.desc;
        document.getElementById("input-metode").value =
          transactionToEdit.method;

        setSubmitButtonText(true);
        switchToInputCard();
      }
    }
  };
};

export const updateSummary = () => {
  const txs = getLS("transactions");
  const y = els.selYear.value,
    m = parseInt(els.selMonth.value) - 1;

  let sums = {
    inc: 0,
    exp: 0,
    cash: 0,
    debit: 0,
    ewallet: 0,
    "Food & Drink": 0,
    "Hangout & Snacks": 0,
    Transportation: 0,
    "Shopping & Dorm Needs": 0,
    Entertainment: 0,
  };

  const monthlyTxs = txs.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() == y && d.getMonth() == m;
  });

  monthlyTxs.forEach((t) => {
    if (t.type === "Pemasukan") sums.inc += t.total;

    if (t.type === "Pengeluaran") {
      sums.exp += t.total;
      if (sums.hasOwnProperty(t.category)) {
        sums[t.category] += t.total;
      }
    }

    if (t.type === "Tarik Tunai") {
      sums.debit -= t.total;
      sums.cash += t.total;
    } else if (t.type === "Pemasukan") {
      if (t.method === "Tunai") sums.cash += t.total;
      if (t.method === "Debit") sums.debit += t.total;
      if (t.method === "E-Wallet") sums.ewallet += t.total;
    } else if (t.type === "Pengeluaran") {
      if (t.method === "Tunai") sums.cash -= t.total;
      if (t.method === "Debit") sums.debit -= t.total;
      if (t.method === "E-Wallet") sums.ewallet -= t.total;
    }
  });

  const chartData = Array(12)
    .fill(0)
    .map(() => ({ inc: 0, exp: 0 }));
  txs.forEach((t) => {
    const d = new Date(t.date);
    if (d.getFullYear() == y) {
      if (t.type === "Pemasukan") chartData[d.getMonth()].inc += t.total;
      if (t.type === "Pengeluaran") chartData[d.getMonth()].exp += t.total;
    }
  });

  const currentChartInstance = getChartInstance();
  if (currentChartInstance) currentChartInstance.destroy();
  setChartInstance(
    new Chart(els.chartCtx, {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          {
            label: "Income 💰",
            data: chartData.map((d) => d.inc),
            backgroundColor: "#4bc0c0",
          },
          {
            label: "Expense 💸",
            data: chartData.map((d) => d.exp),
            backgroundColor: "#ff6384",
          },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false },
    })
  );

  document.querySelector("#sum-balance .value").textContent = formatRp(
    sums.inc - sums.exp
  );
  document.querySelector("#sum-cash .value").textContent = formatRp(sums.cash);
  document.querySelector("#sum-debit .value").textContent = formatRp(
    sums.debit
  );
  document.querySelector("#sum-ewallet .value").textContent = formatRp(
    sums.ewallet
  );
  document.querySelector("#sum-income .value").textContent = formatRp(sums.inc);
  document.querySelector("#sum-expense .value").textContent = formatRp(
    sums.exp
  );

  document.querySelector("#sum-food-drink .value").textContent = formatRp(
    sums["Food & Drink"]
  );
  document.querySelector("#sum-hangout .value").textContent = formatRp(
    sums["Hangout & Snacks"]
  );
  document.querySelector("#sum-transportation .value").textContent = formatRp(
    sums["Transportation"]
  );
  document.querySelector("#sum-shopping-dorm .value").textContent = formatRp(
    sums["Shopping & Dorm Needs"]
  );
  document.querySelector("#sum-entertainment .value").textContent = formatRp(
    sums["Entertainment"]
  );
};
