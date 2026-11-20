// 1. تحميل المصروفات المحفوظة من localStorage أو البدء بمصفوفة فاضية
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function addExpense() {
  let name = document.getElementById("name").value.trim();
  let amount = Number(document.getElementById("amount").value);
  let category = document.getElementById("category").value;

  // التحقق من إدخال اسم ومبلغ صحيح
  if (!name || isNaN(amount) || amount <= 0) {
    alert("Please enter expense name and valid amount");
    return;
  }

  // إنشاء كائن المصروف مباشرة بدون تغليفه بكائن إضافي
  let expense = {
    name: name,
    amount: amount,
    category: category
  };

  expenses.push(expense);

  // حفظ التحديث في localStorage
  localStorage.setItem("expenses", JSON.stringify(expenses));

  // تفريغ حقول الإدخال
  document.getElementById("name").value = "";
  document.getElementById("amount").value = "";

  // إعادة رسم القائمة والإجماليات
  render();
}

function render() {
  let list = document.getElementById("list");
  list.innerHTML = "";

  let total = 0;
  let foodTotal = 0;
  let transportTotal = 0;
  let entertainmentTotal = 0;

  // المرور على كل مصروف وحساب الإجماليات وعرضه
  expenses.forEach(function (exp, index) {
    total += exp.amount;

    let emoji = "💰";
    switch (exp.category) {
      case "Food":
        emoji = "🍔";
        foodTotal += exp.amount;
        break;
      case "Transport":
        emoji = "🚌";
        transportTotal += exp.amount;
        break;
      case "Entertainment":
        emoji = "🎮";
        entertainmentTotal += exp.amount;
        break;
      default:
        emoji = "💰";
    }

    let li = document.createElement("li");
    li.innerHTML = `${emoji} ${exp.name} - ${exp.amount} EGP (${exp.category}) <button onclick="deleteExpense(${index})">Delete</button>`;

    list.appendChild(li);
  });

  // تحديث الإجماليات بعد انتهاء اللفة على كل العناصر
  document.getElementById("total").textContent = total;
  document.getElementById("foodTotal").textContent = foodTotal;
  document.getElementById("transportTotal").textContent = transportTotal;
  document.getElementById("entertainmentTotal").textContent = entertainmentTotal;
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

// تشغيل العرض أول ما الصفحة تفتح
render();
