// تحميل البيانات المحفوظة من localStorage
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let budgetConfig = JSON.parse(localStorage.getItem("masrofy_budget")) || {
  period: "monthly",
  amount: 0
};

function getTodayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getCategoryEmoji(category) {
  switch (category) {
    case "Food":
      return "🍔";
    case "Transport":
      return "🚌";
    case "Entertainment":
      return "🎮";
    case "Other":
      return "💰";
    default:
      return "🏷️";
  }
}

// إظهار أو إخفاء حقل الفئة المخصصة
const categorySelect = document.getElementById("category");
const customCategoryInput = document.getElementById("customCategory");
const customCategoryGroup = document.getElementById("customCategoryGroup");
const dateInput = document.getElementById("date");

if (dateInput && !dateInput.value) {
  dateInput.value = getTodayDateString();
}

if (categorySelect && customCategoryInput) {
  categorySelect.addEventListener("change", function () {
    if (categorySelect.value === "custom") {
      if (customCategoryGroup) customCategoryGroup.classList.remove("hidden");
      customCategoryInput.classList.remove("hidden");
      customCategoryInput.focus();
    } else {
      if (customCategoryGroup) customCategoryGroup.classList.add("hidden");
      customCategoryInput.classList.add("hidden");
      customCategoryInput.value = "";
    }
  });
}

function addExpense() {
  const nameEl = document.getElementById("name");
  const amountEl = document.getElementById("amount");
  const dateEl = document.getElementById("date");
  const catEl = document.getElementById("category");
  const customCatEl = document.getElementById("customCategory");

  const name = nameEl ? nameEl.value.trim() : "";
  const amount = amountEl ? Number(amountEl.value) : NaN;
  const date = dateEl && dateEl.value ? dateEl.value : getTodayDateString();

  let category = catEl ? catEl.value : "Other";
  if (category === "custom") {
    const customName = customCatEl ? customCatEl.value.trim() : "";
    if (!customName) {
      alert("Please enter your custom category name");
      return;
    }
    category = customName;
  }

  if (!name || isNaN(amount) || amount <= 0) {
    alert("Please enter expense name and valid amount");
    return;
  }

  const expense = {
    name: name,
    amount: amount,
    category: category,
    date: date
  };

  expenses.push(expense);
  localStorage.setItem("expenses", JSON.stringify(expenses));

  if (nameEl) nameEl.value = "";
  if (amountEl) amountEl.value = "";
  if (dateEl) dateEl.value = getTodayDateString();
  if (customCatEl) {
    customCatEl.value = "";
    customCatEl.classList.add("hidden");
  }
  if (customCategoryGroup) {
    customCategoryGroup.classList.add("hidden");
  }
  if (catEl && catEl.value === "custom") {
    catEl.value = "Food";
  }

  render();
}

function getPeriodSpent(period) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  if (period === "weekly") {
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return expenses.reduce((sum, exp) => {
      const parts = (exp.date || "").split("-");
      if (parts.length !== 3) return sum;
      const expDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (expDate >= startOfWeek && expDate < endOfWeek) {
        return sum + Number(exp.amount || 0);
      }
      return sum;
    }, 0);
  }

  // الافتراضي: شهري (نفس الشهر والسنة الحاليين)
  return expenses.reduce((sum, exp) => {
    const parts = (exp.date || "").split("-");
    if (parts.length !== 3) return sum;
    const y = Number(parts[0]);
    const m = Number(parts[1]) - 1;
    if (y === currentYear && m === currentMonth) {
      return sum + Number(exp.amount || 0);
    }
    return sum;
  }, 0);
}

function renderBudgetStatus() {
  const statusEl = document.getElementById("budgetStatus");
  if (!statusEl) return;

  if (!budgetConfig.amount || budgetConfig.amount <= 0) {
    statusEl.className = "budget-alert hidden";
    statusEl.textContent = "";
    return;
  }

  const period = budgetConfig.period || "monthly";
  const spent = getPeriodSpent(period);
  const limit = Number(budgetConfig.amount);
  const remaining = limit - spent;
  const label = period === "weekly" ? "Weekly" : "Monthly";

  statusEl.classList.remove("hidden", "budget-ok", "budget-warn", "budget-over");

  if (spent > limit) {
    statusEl.classList.add("budget-over");
    statusEl.textContent = `⚠️ ${label} limit exceeded! Spent ${spent} / ${limit} EGP (Over by ${Math.abs(remaining)} EGP)`;
  } else if (spent >= limit * 0.8) {
    statusEl.classList.add("budget-warn");
    statusEl.textContent = `⚡ Approaching ${label} limit: Spent ${spent} / ${limit} EGP (${remaining} EGP left)`;
  } else {
    statusEl.classList.add("budget-ok");
    statusEl.textContent = `✅ Within ${label} limit: Spent ${spent} / ${limit} EGP (${remaining} EGP left)`;
  }
}

function renderAnalyticsPage() {
  const limitPeriodEl = document.getElementById("limitPeriod");
  const limitAmountEl = document.getElementById("limitAmount");
  const saveLimitBtn = document.getElementById("saveLimitBtn");
  const limitSummaryEl = document.getElementById("limitSummary");
  const chartBarsEl = document.getElementById("chartBars");

  if (!limitPeriodEl && !chartBarsEl) return;

  if (limitPeriodEl && budgetConfig.period) {
    limitPeriodEl.value = budgetConfig.period;
  }
  if (limitAmountEl && budgetConfig.amount > 0) {
    limitAmountEl.value = budgetConfig.amount;
  }

  if (saveLimitBtn && limitPeriodEl && limitAmountEl) {
    saveLimitBtn.addEventListener("click", function () {
      const val = Number(limitAmountEl.value);
      if (isNaN(val) || val <= 0) {
        alert("Please enter a valid spending limit greater than 0");
        return;
      }
      budgetConfig = {
        period: limitPeriodEl.value,
        amount: val
      };
      localStorage.setItem("masrofy_budget", JSON.stringify(budgetConfig));
      renderAnalyticsPage();
    });
  }

  if (limitSummaryEl) {
    if (!budgetConfig.amount || budgetConfig.amount <= 0) {
      limitSummaryEl.textContent = "No spending limit set yet. Choose Weekly or Monthly and enter an amount.";
    } else {
      const period = budgetConfig.period || "monthly";
      const spent = getPeriodSpent(period);
      const limit = Number(budgetConfig.amount);
      const diff = limit - spent;
      const periodText = period === "weekly" ? "This Week" : "This Month";
      limitSummaryEl.innerHTML =
        `<strong>Period:</strong> ${periodText}<br>` +
        `<strong>Spent in period:</strong> ${spent} EGP / ${limit} EGP<br>` +
        `<strong>Status:</strong> ${diff >= 0 ? `${diff} EGP remaining` : `${Math.abs(diff)} EGP over limit`}`;
    }
  }

  if (chartBarsEl) {
    chartBarsEl.innerHTML = "";

    if (expenses.length === 0) {
      chartBarsEl.innerHTML = "<p>No expenses recorded yet to draw a chart.</p>";
      return;
    }

    const totalsByCat = {};
    let grandTotal = 0;

    expenses.forEach((exp) => {
      const cat = exp.category || "Other";
      const amt = Number(exp.amount || 0);
      totalsByCat[cat] = (totalsByCat[cat] || 0) + amt;
      grandTotal += amt;
    });

    Object.keys(totalsByCat).forEach((cat) => {
      const amt = totalsByCat[cat];
      const pct = grandTotal > 0 ? Math.round((amt / grandTotal) * 100) : 0;
      const emoji = getCategoryEmoji(cat);

      const row = document.createElement("div");
      row.className = "bar-row";
      row.innerHTML = `
        <div class="bar-label">
          <span>${emoji} ${cat}</span>
          <span>${amt} EGP (${pct}%)</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${pct}%;"></div>
        </div>
      `;
      chartBarsEl.appendChild(row);
    });
  }
}

function render() {
  const list = document.getElementById("list");
  if (list) {
    list.innerHTML = "";

    let total = 0;
    let foodTotal = 0;
    let transportTotal = 0;
    let entertainmentTotal = 0;
    let otherTotal = 0;

    expenses.forEach(function (exp, index) {
      const amt = Number(exp.amount || 0);
      total += amt;

      const cat = exp.category || "Other";
      const emoji = getCategoryEmoji(cat);

      if (cat === "Food") {
        foodTotal += amt;
      } else if (cat === "Transport") {
        transportTotal += amt;
      } else if (cat === "Entertainment") {
        entertainmentTotal += amt;
      } else {
        otherTotal += amt;
      }

      const expDateText = exp.date ? ` • 📅 ${exp.date}` : "";
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <span>${emoji} <strong>${exp.name}</strong> - ${amt} EGP</span>
          <span class="exp-meta">Category: ${cat}${expDateText}</span>
        </div>
        <button type="button" onclick="deleteExpense(${index})">Delete</button>
      `;
      list.appendChild(li);
    });

    const totalEl = document.getElementById("total");
    const foodEl = document.getElementById("foodTotal");
    const transportEl = document.getElementById("transportTotal");
    const entEl = document.getElementById("entertainmentTotal");
    const otherEl = document.getElementById("otherTotal");

    if (totalEl) totalEl.textContent = total;
    if (foodEl) foodEl.textContent = foodTotal;
    if (transportEl) transportEl.textContent = transportTotal;
    if (entEl) entEl.textContent = entertainmentTotal;
    if (otherEl) otherEl.textContent = otherTotal;

    renderBudgetStatus();
  }

  renderAnalyticsPage();
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  render();
}

function clearAll() {
  expenses = [];
  localStorage.removeItem("expenses");
  render();
}

render();

// --- إعداد الدارك مود وحفظه في localStorage ---
const themeToggleBtn = document.getElementById("themeToggle");

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
    if (themeToggleBtn) {
      themeToggleBtn.textContent = "Light Mode";
    }
  } else {
    document.body.classList.remove("dark");
    if (themeToggleBtn) {
      themeToggleBtn.textContent = "Dark Mode";
    }
  }
}

const savedTheme = localStorage.getItem("masrofy_theme") || "light";
applyTheme(savedTheme);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", function () {
    const isDark = document.body.classList.contains("dark");
    const nextTheme = isDark ? "light" : "dark";
    localStorage.setItem("masrofy_theme", nextTheme);
    applyTheme(nextTheme);
  });
}