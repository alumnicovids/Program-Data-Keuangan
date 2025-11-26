document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.querySelector(".site-header .theme-toggle");
  const body = document.body;
  const navLinks = document.querySelectorAll(".side-nav a");
  const cards = document.querySelectorAll("main section");
  const inputForm = document.getElementById("input-form");
  const findDataBtn = document.getElementById("find-data-btn");
  const searchInput = document.getElementById("search-data");
  const addManageCategoryBtn = document.getElementById(
    "add-manage-category-btn"
  );
  const deleteManageCategoryBtn = document.getElementById(
    "delete-manage-category-btn"
  );
  const addWhislistBtn = document.getElementById("add-whislist-btn");
  const transactionList = document.getElementById("transaction-list");
  const whislistList = document.getElementById("whislist-list");
  const selectYear = document.getElementById("select-year");
  const selectMonth = document.getElementById("select-month");
  const financialChartCtx = document.getElementById("financial-chart");

  let financialChartInstance = null;

  const updateThemeToggleText = (theme) => {
    themeToggle.textContent =
      theme === "pink" ? "🌸 Pink Theme" : "🌙 Night Theme";
  };

  const loadTheme = () => {
    const savedTheme = localStorage.getItem("theme") || "night";
    body.classList.add(savedTheme);
    updateThemeToggleText(savedTheme);
  };

  const toggleTheme = () => {
    const currentTheme = body.classList.contains("pink") ? "pink" : "night";
    const newTheme = currentTheme === "pink" ? "night" : "pink";

    body.classList.remove(currentTheme);
    body.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeToggleText(newTheme);
  };

  const showCard = (targetId) => {
    cards.forEach((card) => {
      card.classList.remove("active-card");
    });

    const activeCard = document.querySelector(targetId);
    if (activeCard) {
      activeCard.classList.add("active-card");
    }

    navLinks.forEach((link) => {
      link.classList.remove("active-link");
    });
    document
      .querySelector(`.side-nav a[href="${targetId}"]`)
      .classList.add("active-link");

    if (targetId === "#manage-card") {
      updateManageView();
    } else if (targetId === "#list-card") {
      renderTransactionList(searchInput ? searchInput.value : "");
    } else if (targetId === "#whislist-card") {
      renderWishlist();
    }
  };

  const populateYears = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5;
    const endYear = currentYear + 5;

    selectYear.innerHTML = "";

    for (let year = startYear; year <= endYear; year++) {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      selectYear.appendChild(option);
    }
    selectYear.value = currentYear;
  };

  const getTransactions = () => {
    const data = localStorage.getItem("transactions");
    return data ? JSON.parse(data) : [];
  };

  const saveTransactions = (transactions) => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  };

  const getWishlists = () => {
    const data = localStorage.getItem("wishlists");
    return data ? JSON.parse(data) : [];
  };

  const saveWishlists = (wishlists) => {
    localStorage.setItem("wishlists", JSON.stringify(wishlists));
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case "Pemasukan":
        return "Income";
      case "Pengeluaran":
        return "Expense";
      case "Tarik Tunai":
        return "Cash Withdrawal";
      case "E-Wallet":
        return "E-Wallet";
      default:
        return type;
    }
  };

  const renderTransactionList = (searchQuery = "") => {
    const allTransactions = getTransactions();
    transactionList.innerHTML = "";

    const normalizedQuery = searchQuery.toLowerCase().trim();

    const transactions = normalizedQuery
      ? allTransactions.filter((t) => {
          const description = t.description || "";
          const typeLabel = getTransactionTypeLabel(t.type).toLowerCase();
          return (
            t.category.toLowerCase().includes(normalizedQuery) ||
            t.type.toLowerCase().includes(normalizedQuery) ||
            typeLabel.includes(normalizedQuery) ||
            description.toLowerCase().includes(normalizedQuery) ||
            t.method.toLowerCase().includes(normalizedQuery) ||
            // Tambahkan pencarian berdasarkan tanggal
            t.date.includes(normalizedQuery)
          );
        })
      : allTransactions;

    if (transactions.length === 0) {
      const message = normalizedQuery
        ? "⚠️ No transactions found matching your search."
        : "⚠️ No transactions recorded yet.";

      transactionList.innerHTML = `<li style="text-align: center; color: rgba(255,255,255,0.7);">${message}</li>`;
      return;
    }

    transactions
      .slice()
      .reverse()
      .forEach((t) => {
        const listItem = document.createElement("li");
        listItem.className = "transaction-item";

        let emoji = "";
        if (t.type === "Pemasukan") emoji = "⬆️";
        else if (t.type === "Pengeluaran") emoji = "⬇️";
        else if (t.type === "Tarik Tunai") emoji = "🏧";
        else if (t.type === "E-Wallet") emoji = "📱";

        const formattedTotal = formatRupiah(t.total);
        const typeLabel = getTransactionTypeLabel(t.type);

        listItem.innerHTML = `
                <span class="main-info" title="${typeLabel} - ${
          t.category
        }">${emoji} ${t.category} - ${formattedTotal}</span>
                <div class="detail-info">
                    🗓️ ${t.date} | 
                    Type: ${typeLabel} | 
                    Method: ${t.method} | 
                    Description: ${t.description || "-"}
                </div>
                <button class="edit-btn" data-id="${t.id}">✏️ Edit</button>
                <button class="delete-btn" data-id="${t.id}">🗑️ Delete</button>
            `;
        transactionList.appendChild(listItem);
      });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", handleDeleteTransaction);
    });
    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", handleEditTransaction);
    });
  };

  const handleDeleteTransaction = (e) => {
    const idToDelete = parseInt(e.target.dataset.id);
    let transactions = getTransactions();

    if (confirm("🚨 Are you sure you want to delete this transaction?")) {
      transactions = transactions.filter((t) => t.id !== idToDelete);
      saveTransactions(transactions);
      renderTransactionList(searchInput ? searchInput.value : "");
      updateChart(selectYear.value || new Date().getFullYear());
      alert("✅ Transaction successfully deleted.");
    }
  };

  const handleEditTransaction = (e) => {
    const idToEdit = parseInt(e.target.dataset.id);
    alert(
      `[PLH] 🚧 Edit functionality for Transaction ID: ${idToEdit} is not yet implemented.`
    );
  };

  const processChartData = (transactions, year) => {
    const monthlyData = Array(12)
      .fill(0)
      .map(() => ({ income: 0, expense: 0 }));

    transactions.forEach((t) => {
      const date = new Date(t.date);
      if (date.getFullYear() === parseInt(year)) {
        const monthIndex = date.getMonth();
        const amount = parseFloat(t.total);

        if (t.type === "Pemasukan") {
          monthlyData[monthIndex].income += amount;
        } else if (t.type === "Pengeluaran") {
          monthlyData[monthIndex].expense += amount;
        }
      }
    });

    const incomeData = monthlyData.map((m) => m.income);
    const expenseData = monthlyData.map((m) => m.expense);

    return { incomeData, expenseData };
  };

  const updateChart = (year) => {
    const transactions = getTransactions();
    const { incomeData, expenseData } = processChartData(transactions, year);

    const chartLabels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    if (financialChartInstance) {
      financialChartInstance.data.datasets[0].data = incomeData;
      financialChartInstance.data.datasets[1].data = expenseData;
      financialChartInstance.options.plugins.title.text = `Fund Flow Comparison Year ${year} 📈`;
      financialChartInstance.update();
    } else {
      const chartData = {
        labels: chartLabels,
        datasets: [
          {
            label: "Income 💰",
            data: incomeData,
            backgroundColor: "rgba(75, 192, 192, 0.8)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
          {
            label: "Expense 💸",
            data: expenseData,
            backgroundColor: "rgba(255, 99, 132, 0.8)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      };

      const config = {
        type: "bar",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Amount (IDR)",
              },
            },
          },
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: `Fund Flow Comparison Year ${year} 📈`,
            },
          },
        },
      };

      if (financialChartCtx && typeof Chart !== "undefined") {
        financialChartInstance = new Chart(financialChartCtx, config);
      }
    }
  };

  const renderSummaryDetails = (selectedYear, selectedMonth) => {
    const transactions = getTransactions();
    let totalIncome = 0;
    let totalExpense = 0;
    let totalCash = 0;
    let totalDebit = 0;
    let totalEWallet = 0;
    let totalCashWithdrawal = 0;

    const monthIndex = parseInt(selectedMonth) - 1;

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const transactionYear = date.getFullYear();
      const transactionMonth = date.getMonth();

      if (
        transactionYear === parseInt(selectedYear) &&
        transactionMonth === monthIndex
      ) {
        const amount = parseFloat(t.total);

        if (t.type === "Pemasukan") {
          totalIncome += amount;
        } else if (t.type === "Pengeluaran") {
          totalExpense += amount;
        } else if (t.type === "Tarik Tunai") {
          totalCashWithdrawal += amount;
        }

        if (t.method === "Tunai") {
          if (t.type === "Pemasukan") totalCash += amount;
          else if (t.type === "Pengeluaran") totalCash -= amount;
        } else if (t.method === "Debit") {
          if (t.type === "Pemasukan") totalDebit += amount;
          else if (t.type === "Pengeluaran") totalDebit -= amount;
        } else if (t.method === "E-Wallet") {
          if (t.type === "Pemasukan") totalEWallet += amount;
          else if (t.type === "Pengeluaran") totalEWallet -= amount;
        }
      }
    });

    const netBalance = totalIncome - totalExpense;

    document.querySelector(
      ".financial-summary p:nth-child(2)"
    ).textContent = `Total Balance: ${formatRupiah(netBalance)}`;
    document.querySelector(
      ".financial-summary p:nth-child(3)"
    ).textContent = `Total Cash: ${formatRupiah(totalCash)}`;
    document.querySelector(
      ".financial-summary p:nth-child(4)"
    ).textContent = `Total Debit: ${formatRupiah(totalDebit)}`;
    document.querySelector(
      ".financial-summary p:nth-child(5)"
    ).textContent = `Total E-Wallet: ${formatRupiah(totalEWallet)}`;

    document.querySelector(
      ".flow-summary p:nth-child(2)"
    ).textContent = `Total Income: ${formatRupiah(totalIncome)}`;
    document.querySelector(
      ".flow-summary p:nth-child(3)"
    ).textContent = `Total Expense: ${formatRupiah(totalExpense)}`;
    document.querySelector(
      ".flow-summary p:nth-child(4)"
    ).textContent = `Total Cash Withdrawal: ${formatRupiah(
      totalCashWithdrawal
    )}`;

    document.querySelector(
      "#manage-card h2"
    ).textContent = `📈 Management & Summary (${selectedMonth}/${selectedYear})`;
  };

  const updateManageView = () => {
    const selectedYear = selectYear.value || new Date().getFullYear();
    const selectedMonth =
      selectMonth.value || String(new Date().getMonth() + 1).padStart(2, "0");

    updateChart(selectedYear);
    renderSummaryDetails(selectedYear, selectedMonth);

    console.log(
      `[PLH] Summary Data and Chart updated for: Month ${selectedMonth} Year ${selectedYear}`
    );
  };

  const renderWishlist = () => {
    const wishlists = getWishlists();
    whislistList.innerHTML = "";

    if (wishlists.length === 0) {
      whislistList.innerHTML =
        '<li style="text-align: center; color: rgba(255,255,255,0.7);">✨ Add your dream items!</li>';
      return;
    }

    wishlists.forEach((w) => {
      const listItem = document.createElement("li");
      listItem.className = "whislist-item";

      const progress = (w.collected / w.price) * 100;
      const progressColor = progress >= 100 ? "color: #4caf50;" : "";

      listItem.innerHTML = `
                <div>
                    <strong style="${progressColor}">${
        w.item
      }</strong> (${formatRupiah(w.collected)} / ${formatRupiah(w.price)})
                </div>
                <progress value="${w.collected}" max="${w.price}"></progress>
                <span style="font-size:0.8em; ${progressColor}">${Math.round(
        progress
      )}%</span>
                <div>
                    <button class="add-amount-btn" data-id="${
                      w.id
                    }">➕ Fund</button>
                    <button class="edit-amount-btn" data-id="${
                      w.id
                    }">✏️ Edit Total</button>
                    <button class="delete-btn" data-id="${
                      w.id
                    }">🗑️ Delete</button>
                </div>
            `;
      whislistList.appendChild(listItem);
    });

    document.querySelectorAll(".add-amount-btn").forEach((button) => {
      button.addEventListener("click", handleAddWhislistAmount);
    });
    document.querySelectorAll(".edit-amount-btn").forEach((button) => {
      button.addEventListener("click", handleEditWhislistAmount);
    });
    document
      .querySelectorAll(".whislist-item .delete-btn")
      .forEach((button) => {
        button.addEventListener("click", handleDeleteWishlist);
      });
  };

  const handleAddWhislistAmount = (e) => {
    const id = parseInt(e.target.dataset.id);
    const amountStr = prompt("Enter amount to add:");
    const amount = parseFloat(amountStr);

    if (amount > 0 && !isNaN(amount)) {
      let wishlists = getWishlists();
      const index = wishlists.findIndex((w) => w.id === id);
      if (index !== -1) {
        wishlists[index].collected += amount;
        saveWishlists(wishlists);
        renderWishlist();
        alert(
          `🎉 ${formatRupiah(amount)} successfully added to ${
            wishlists[index].item
          }.`
        );
      }
    } else if (amountStr !== null) {
      alert("❌ Invalid input. Please enter a positive number.");
    }
  };

  const handleEditWhislistAmount = (e) => {
    const id = parseInt(e.target.dataset.id);
    let wishlists = getWishlists();
    const wishlist = wishlists.find((w) => w.id === id);

    if (wishlist) {
      const newAmountStr = prompt(
        `✏️ Edit total collected amount for ${
          wishlist.item
        }. Current: ${formatRupiah(wishlist.collected)}`
      );
      const newAmount = parseFloat(newAmountStr);

      if (!isNaN(newAmount) && newAmount >= 0) {
        wishlist.collected = newAmount;
        saveWishlists(wishlists);
        renderWishlist();
        alert(
          `👍 Collected fund for ${wishlist.item} updated to ${formatRupiah(
            newAmount
          )}.`
        );
      } else if (newAmountStr !== null) {
        alert("❌ Invalid input. Please enter a non-negative number.");
      }
    }
  };

  const handleDeleteWishlist = (e) => {
    const idToDelete = parseInt(e.target.dataset.id);
    let wishlists = getWishlists();

    if (confirm("🚨 Are you sure you want to delete this wishlist item?")) {
      wishlists = wishlists.filter((w) => w.id !== idToDelete);
      saveWishlists(wishlists);
      renderWishlist();
      alert("🗑️ Wishlist item successfully deleted.");
    }
  };

  loadTheme();
  populateYears();
  themeToggle.addEventListener("click", toggleTheme);

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      showCard(targetId);
    });
  });

  const initialCardId = navLinks[0]
    ? navLinks[0].getAttribute("href")
    : "#input-card";
  showCard(initialCardId);

  if (selectMonth && selectYear) {
    const handleManageViewChange = () => {
      updateManageView();
    };

    selectMonth.addEventListener("change", handleManageViewChange);
    selectYear.addEventListener("change", handleManageViewChange);

    const currentMonth = new Date().getMonth() + 1;
    selectMonth.value = String(currentMonth).padStart(2, "0");

    updateManageView();
  }

  inputForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const dateInput = document.getElementById("input-date").value;
    const typeInput = document.getElementById("input-type").value;
    const totalInput = document.getElementById("input-total").value;
    const categoryInput = document.getElementById("input-category").value;
    const descriptionInput = document.getElementById("input-description").value;
    const methodInput = document.getElementById("input-metode").value;

    if (
      !dateInput ||
      !typeInput ||
      !totalInput ||
      !categoryInput ||
      !methodInput
    ) {
      alert(
        "⚠️ Please complete all required fields (Date, Type, Amount, Category, Method)."
      );
      return;
    }

    const total = parseFloat(totalInput);
    if (isNaN(total) || total <= 0) {
      alert("❌ Transaction amount must be a positive number.");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      date: dateInput,
      type: typeInput,
      total: total,
      category: categoryInput,
      description: descriptionInput,
      method: methodInput,
    };

    const transactions = getTransactions();
    transactions.push(newTransaction);
    saveTransactions(transactions);

    alert(
      `✅ Transaction successfully added: ${categoryInput} - ${formatRupiah(
        total
      )}`
    );
    inputForm.reset();

    updateChart(new Date().getFullYear());
    renderTransactionList(searchInput ? searchInput.value : "");
  });

  if (findDataBtn) {
    findDataBtn.addEventListener("click", () => {
      const currentQuery = searchInput.value;
      alert(`[PLH] 🔍 Searching data with keyword: "${currentQuery}"`);
      renderTransactionList(currentQuery);
    });
    // Event listener untuk input langsung (real-time search)
    searchInput.addEventListener("input", (e) => {
      const currentQuery = e.target.value;
      renderTransactionList(currentQuery);
    });
  }

  if (addManageCategoryBtn) {
    addManageCategoryBtn.addEventListener("click", () => {
      const newCat = document.getElementById("add-manage-category").value;
      alert(`[PLH] ➕ Category "${newCat}" added.`);
    });
  }

  if (deleteManageCategoryBtn) {
    deleteManageCategoryBtn.addEventListener("click", () => {
      const delCat = document.getElementById("delete-manage-category").value;
      alert(`[PLH] ➖ Category "${delCat}" deleted.`);
    });
  }

  if (addWhislistBtn) {
    addWhislistBtn.addEventListener("click", () => {
      const item = document.getElementById("input-whislist-item").value;
      const priceStr = document.getElementById("input-whislist-price").value;

      const price = parseFloat(priceStr);

      if (!item || !priceStr) {
        alert("⚠️ Please complete item name and target price.");
        return;
      }
      if (isNaN(price) || price <= 0) {
        alert("❌ Target price must be a positive number.");
        return;
      }

      const newWishlist = {
        id: Date.now(),
        item: item,
        price: price,
        collected: 0,
      };

      const wishlists = getWishlists();
      wishlists.push(newWishlist);
      saveWishlists(wishlists);

      alert(
        `🎉 Wishlist successfully added: ${item} for ${formatRupiah(price)}`
      );
      document.getElementById("input-whislist-item").value = "";
      document.getElementById("input-whislist-price").value = "";

      renderWishlist();
    });
  }
});
