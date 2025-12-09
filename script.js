// بيانات تجريبية (يتم استبدالها بال LocalStorage)
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];

// 1. Splash Screen Logic
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('splash-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        updateDashboard();
    }, 2500); // تظهر لمدة 2.5 ثانية
});

// Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    toggleMenu(false); // Close menu if open
    
    if(pageId === 'inventory') renderInventory();
    if(pageId === 'sales') prepareSalesDropdown();
}

function toggleMenu(forceClose) {
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('overlay');
    if (forceClose === false || menu.classList.contains('open')) {
        menu.classList.remove('open');
        overlay.style.display = 'none';
    } else {
        menu.classList.add('open');
        overlay.style.display = 'block';
    }
}

// --- 7) Auto Calculator (حاسبة الوزن والسعر) ---
function calculateSteel() {
    const density = parseFloat(document.getElementById('calc-type').value);
    const l = parseFloat(document.getElementById('calc-l').value); // متر
    const w = parseFloat(document.getElementById('calc-w').value); // متر
    const t = parseFloat(document.getElementById('calc-t').value); // مم
    const priceKg = parseFloat(document.getElementById('calc-price-kg').value) || 0;

    if (l && w && t) {
        // المعادلة: الطول * العرض * السمك * الكثافة
        const weight = l * w * t * density;
        let resultHTML = `<strong>الوزن:</strong> ${weight.toFixed(2)} كجم<br>`;
        
        if (priceKg > 0) {
            const totalPrice = weight * priceKg;
            resultHTML += `<strong>سعر اللوح:</strong> ${totalPrice.toFixed(2)} ج.م`;
        }
        
        document.getElementById('calc-result').innerHTML = resultHTML;
        document.getElementById('calc-result').style.display = 'block';
    }
}

// --- 1) إدارة المخزون (Inventory) ---
function addToInventory() {
    const name = document.getElementById('inv-name').value;
    const thickness = document.getElementById('inv-thickness').value;
    const qty = parseFloat(document.getElementById('inv-qty').value);
    const price = parseFloat(document.getElementById('inv-price').value);

    if (name && qty) {
        const newItem = { 
            id: Date.now(), 
            name, 
            thickness, 
            qty, 
            price 
        };
        inventory.push(newItem);
        saveData();
        renderInventory();
        alert('تمت الإضافة بنجاح');
        // تفريغ الحقول
        document.getElementById('inv-name').value = '';
    }
}

function renderInventory() {
    const tbody = document.querySelector('#inventory-table tbody');
    tbody.innerHTML = '';
    inventory.forEach(item => {
        const row = `<tr>
            <td>${item.name}</td>
            <td>${item.thickness} مم</td>
            <td>${item.qty}</td>
            <td>${item.price}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// --- 2) تسجيل المبيعات ---
function prepareSalesDropdown() {
    const select = document.getElementById('sale-item');
    select.innerHTML = '<option value="">اختر الصنف...</option>';
    inventory.forEach(item => {
        select.innerHTML += `<option value="${item.id}">${item.name} (${item.thickness}مم) - متاح: ${item.qty}</option>`;
    });
}

function recordSale() {
    const itemId = parseInt(document.getElementById('sale-item').value);
    const qty = parseFloat(document.getElementById('sale-qty').value);
    const sellPrice = parseFloat(document.getElementById('sale-price').value);

    const itemIndex = inventory.findIndex(i => i.id === itemId);

    if (itemIndex > -1 && qty > 0) {
        if (inventory[itemIndex].qty >= qty) {
            // خصم من المخزون
            inventory[itemIndex].qty -= qty;
            
            // تسجيل البيع
            sales.push({
                date: new Date().toLocaleDateString(),
                itemId,
                itemName: inventory[itemIndex].name,
                qty,
                total: qty * sellPrice
            });

            saveData();
            alert('تم تسجيل البيع وخصم الكمية!');
            showPage('dashboard');
            updateDashboard();
        } else {
            alert('الكمية في المخزون غير كافية!');
        }
    } else {
        alert('تأكد من البيانات');
    }
}

// --- Dashboard & Alerts ---
function updateDashboard() {
    // حساب مبيعات اليوم
    const today = new Date().toLocaleDateString();
    const todaySales = sales
        .filter(s => s.date === today)
        .reduce((sum, s) => sum + s.total, 0);
    
    document.getElementById('daily-sales').innerText = todaySales.toLocaleString() + ' ج.م';

    // حساب إجمالي المخزون (كعدد)
    const totalStock = inventory.reduce((sum, i) => sum + i.qty, 0);
    document.getElementById('total-stock').innerText = totalStock;

    // تنبيه النواقص (Low Stock Alert)
    const lowStock = inventory.some(i => i.qty < 5); // لو أقل من 5
    document.getElementById('stock-alerts').style.display = lowStock ? 'block' : 'none';
}

function saveData() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('sales', JSON.stringify(sales));
}
