// Get seat number from URL and display it
const urlParams = new URLSearchParams(window.location.search);
const seatNumber = urlParams.get('seat');
document.getElementById('seatNumber').textContent = seatNumber;

// Item prices dictionary (updated menu)
const itemPrices = {
    // Ice cream scoops
    "Red velvet": 150,
    "Tender coconut": 150,
    "Kulfi": 150,
    "Cotton candy": 150,
    "Caramel Latte": 150,
    "Spanish delight": 150,
    "Black currant": 140,
    "Butter scotch": 120,
    "Chocolate (Ice Cream)": 120,
    "Pista": 120,
    "Mango (Ice Cream)": 120,
    "Strawberry (Ice Cream)": 90,
    "Vannila (Ice Cream)": 90,

    // Milkshakes
    "Cold coffee shake": 150,
    "Oreo shake": 160,
    "Boost shake": 160,
    "Blackcurrant shake": 160,
    "Butterscotch shake": 150,
    "Chocolate (Shake)": 150,
    "Pista shake": 150,
    "Mango (Shake)": 150,
    "Strawberry (Shake)": 120,
    "Vannila (Shake)": 120,

    // Mini falooda
    "Mini falooda - Fruits": 120,
    "Mini falooda - Vannila": 120,
    "Mini falooda - Strawberry": 120,

    // Simplified category entries (single-button variants)
    "Mini falooda - 120": 120,
    "Special mini falooda - 150": 150,
    "Chocolate falooda - 180": 180,
    "Special fruit falooda - 180": 180,
    "Hot choco brownie sundae - 199": 199,

    // Special mini falooda
    "Special mini falooda - Fruits": 150,
    "Special mini falooda - Strawberry": 150,
    "Special mini falooda - Mango": 150,
    "Special mini falooda - Nuts": 150,

    // Chocolate falooda
    "Chocolate falooda - Choco brownie": 180,
    "Chocolate falooda - Chocolate": 180,
    "Chocolate falooda - Vannila": 180,

    // Special fruit falooda
    "Special fruit falooda - Fruits": 180,
    "Special fruit falooda - Strawberry": 180,
    "Special fruit falooda - Mango": 180,
    "Special fruit falooda - Pista": 180,
    "Special fruit falooda - Butterscotch": 180,
    "Special fruit falooda - Nuts": 180,

    // Brownie with
    "Brownie with Vannila": 120,
    "Brownie with Butterscotch": 140,
    "Brownie with Chocolate": 150,

    // Hot choco brownie sundae
    "Hot choco brownie - Hot chocolate": 199,
    "Hot choco brownie - Brownie": 199,
    "Hot choco brownie - Chocolate": 199,
    "Hot choco brownie - Vannila": 199,
    "Hot choco brownie - Nuts": 199,

    // Special
    "Puttu ice cream": 299,
    "Titanic icecream": 299,
    "Gulab jamun ice cream": 199,
    "Rainbow ice cream": 299,
    "Dry fruit sundae": 199,

    // Burgers
    "Veg burger": 150,
    "Chicken burger": 150,
    "Fried chicken burger": 200,

    // Sandwich
    "Veg sandwich": 150,
    "Chicken sandwich": 150,
    "Peri peri chicken sandwich": 180,

    // Chicken
    "Fried chicken": 200,
    "Chicken strips": 200,
    "Chicken loaded": 200,
    "Chicken wings": 200,
    "Chicken lollipop": 200,
    "Chicken popcorn": 200,

    // Starters
    "French fries": 110,
    "Smiley": 110,
    "Veg nuggets": 110,
    "Veg momo": 120,
    "Chicken nuggets": 150,
    "Chicken momo": 140,

    // Mocktail
    "Ice blue": 100,
    "Lemon mint": 100,
    "Strawberry mocktail": 100,
    "Watermelon": 100
};

const cart = {};

// Thermal printer settings
const THERMAL_WIDTH = 40;
const SHOP_INFO = { name: 'Moonlight Icecream Parlour', address: 'Trichy Road Dindigul', location: '', contact: '7708946529' };

function formatLine(left, right = '', width = THERMAL_WIDTH) {
    left = String(left);
    right = String(right);
    const gap = width - left.length - right.length;
    if (gap >= 0) return left + ' '.repeat(gap) + right;
    // if overflow, truncate left
    const maxLeft = Math.max(0, width - right.length - 1);
    return left.slice(0, maxLeft) + ' ' + right;
}

function buildKOTText(items) {
    let out = '';
    out += `KOT - ${SHOP_INFO.name}\n`;
    out += `Table: ${seatNumber || ''}\n`;
    out += `------------------------------\n`;
    items.forEach(i => {
        const name = i.name.length > 30 ? i.name.slice(0, 30) + '…' : i.name;
        out += formatLine(name, `x${i.qty}`) + '\n';
    });
    out += `------------------------------\n`;
    out += `\n`;
    return out;
}

function buildBillText(items, total) {
    const width = THERMAL_WIDTH;
    const now = new Date();
    const dateOnly = now.toLocaleDateString();
    const timeOnly = now.toLocaleTimeString();

    // column widths (chars)
    const qtyW = 3; // e.g. ' 2'
    const priceW = 8; // e.g. '₹9999.00'
    const nameW = Math.max(10, width - qtyW - priceW - 2); // remaining for name

    let out = '';
    // three centered header lines: name, address, location
    function centerLine(text) {
        if (!text) return '';
        const pad = Math.max(0, Math.floor((width - text.length) / 2));
        return ' '.repeat(pad) + text + '\n';
    }
    out += centerLine(SHOP_INFO.name || '');
    out += centerLine(SHOP_INFO.address || '');
    out += centerLine(SHOP_INFO.location || '');

    // date left, time right
    out += formatLine('Date: ' + dateOnly, 'Time: ' + timeOnly) + '\n';
    out += '-'.repeat(width) + '\n';

    // header columns
    const hdr = (('QTY'.padEnd(qtyW)) + ' ' + 'ITEM'.padEnd(nameW) + ' ' + 'PRICE'.padStart(priceW)).slice(0, width);
    out += hdr + '\n';
    out += '-'.repeat(width) + '\n';

    items.forEach(i => {
        const qtyStr = String(i.qty || '');
        let itemName = i.name || '';
        if (itemName.length > nameW) itemName = itemName.slice(0, nameW - 1) + '…';
        const priceStr = `₹${i.total}`;
        const left = qtyStr.padEnd(qtyW) + ' ' + itemName.padEnd(nameW);
        const line = left + ' ' + priceStr.padStart(priceW);
        out += line.slice(0, width) + '\n';
    });

    out += '-'.repeat(width) + '\n';
    out += formatLine('TOTAL', `₹${total}`) + '\n';
    out += '\nThank you!\n';
    return out;
}

// Ensure QZ Tray websocket is connected (auto-connect). Resolves when connected or rejects on timeout/error.
function ensureQzConnected(timeout = 5000) {
    return new Promise((resolve, reject) => {
        if (!(window.qz && qz.websocket)) return reject('QZ library not loaded');
        try {
            if (typeof qz.websocket.isActive === 'function' && qz.websocket.isActive()) return resolve();

            // Try to connect; qz.websocket.connect() itself returns a promise
            const connectPromise = qz.websocket.connect();
            let finished = false;

            connectPromise.then(() => {
                finished = true;
                return resolve();
            }).catch((err) => {
                // fallback to checking isActive for a short period
                console.warn('qz.connect() failed, will poll isActive briefly', err);
            });

            const start = Date.now();
            const iv = setInterval(() => {
                if (typeof qz.websocket.isActive === 'function' && qz.websocket.isActive()) {
                    clearInterval(iv);
                    if (!finished) finished = true;
                    return resolve();
                }
                if (Date.now() - start > timeout) {
                    clearInterval(iv);
                    return reject('QZ connect timeout');
                }
            }, 200);
        } catch (e) {
            return reject(e);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadCartFromStorage();
    updateCart();

    // Add item to cart on click
    document.querySelectorAll('.subitems button').forEach(button => {
        button.addEventListener('click', () => {
            const itemName = button.textContent.trim();
            addToCart(itemName);
        });
    });

    // Save cart
    document.getElementById("saveBtn")?.addEventListener("click", () => {
        saveCartToStorage();
        alert("Cart saved successfully!");
    });

    // Go back
    document.getElementById("goBackBtn")?.addEventListener("click", () => {
        window.history.back();
    });

    // Delete all
    document.getElementById("deleteAllBtn")?.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete all items?")) {
            Object.keys(cart).forEach(item => delete cart[item]);
            saveCartToStorage();
            updateCart();
        }
    });

    // Print KOT
    document.getElementById("kotBtn")?.addEventListener("click", printKOT);

    // Print Bill
    document.getElementById("printBtn")?.addEventListener("click", printBill);

    // Global search (filters categories and subitems)
    const globalSearch = document.getElementById('globalSearch');
    const globalSearchBtn = document.getElementById('globalSearchBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    function performGlobalSearch(query) {
        const q = (query || '').trim().toLowerCase();
        document.querySelectorAll('.totalitems').forEach(cat => {
            let anyVisible = false;
            cat.querySelectorAll('.subitems button').forEach(b => {
                const txt = b.textContent.trim().toLowerCase();
                const show = !q || txt.includes(q);
                b.style.display = show ? '' : 'none';
                if (show) anyVisible = true;
            });
            cat.style.display = anyVisible ? '' : 'none';
        });
    }

    if (globalSearch) {
        globalSearch.addEventListener('input', (e) => performGlobalSearch(e.target.value));
        globalSearch.addEventListener('keypress', (e) => { if (e.key === 'Enter') performGlobalSearch(globalSearch.value); });
    }
    globalSearchBtn?.addEventListener('click', () => performGlobalSearch(globalSearch?.value || ''));
    clearSearchBtn?.addEventListener('click', () => { if (globalSearch) { globalSearch.value = ''; performGlobalSearch(''); } });
});

// Add item to cart
function addToCart(itemName) {
    if (cart[itemName]) {
        cart[itemName]++;
    } else {
        cart[itemName] = 1;
    }
    saveCartToStorage();
    updateCart();
}

// Remove item from cart
function removeFromCart(itemName) {
    if (cart[itemName]) {
        cart[itemName]--;
        if (cart[itemName] <= 0) delete cart[itemName];
        saveCartToStorage();
        updateCart();
    }
}

// Update cart display
function updateCart() {
    const cartContainer = document.querySelector('.middle');
    cartContainer.innerHTML = '';
    let total = 0;

    for (let item in cart) {
        const qty = cart[item];
        const price = itemPrices[item] || 0;
        const itemTotal = qty * price;
        total += itemTotal;

        cartContainer.innerHTML += `
            <div>
                ${item} x ${qty} - ₹${itemTotal}
                <button onclick="removeFromCart('${item}')">❌</button>
            </div>
        `;
    }

    document.querySelector('.total').textContent = `Total: ₹${total}`;
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem(`icecream_cart_${seatNumber}`, JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem(`icecream_cart_${seatNumber}`);
    if (savedCart) {
        const parsed = JSON.parse(savedCart);
        Object.assign(cart, parsed);
    }
}

// Disable buttons temporarily (used during printing)
function disableButtons(disable) {
    const elKot = document.getElementById("kotBtn"); if (elKot) elKot.disabled = !!disable;
    const elSave = document.getElementById("saveBtn"); if (elSave) elSave.disabled = !!disable;
    const elPrint = document.getElementById("printBtn"); if (elPrint) elPrint.disabled = !!disable;
}

// Open a printable HTML window with a table layout for the bill (fallback/preview)
function openPrintWindow(items, total) {
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();
    const w = window.open('', '', 'width=600,height=800');
    if (!w) {
        // Popup blocked — fall back to inline preview
        showInlinePreview(items, total, dateStr, timeStr);
        return null;
    }
    const doc = w.document;
    doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Bill</title><style>
        body{font-family:Arial,Helvetica,sans-serif;color:#000;padding:20px}
        h1{text-align:center;margin:0 0 4px}
        .datetime{text-align:center;font-size:12px;color:#333;margin-bottom:10px}
        .sep{border-bottom:1px dotted #000;margin:8px 0}
        table{width:100%;border-collapse:collapse}
        th,td{padding:8px;text-align:left;border-bottom:1px solid #eee}
        th{background:#f6f6f6}
        .right{text-align:right}
    </style></head><body>`);
    doc.write(`<h1>${SHOP_INFO.name}</h1>`);
    doc.write(`<div class="datetime">date: ${dateStr} &nbsp;&nbsp; time: ${timeStr}</div>`);
    doc.write('<div class="sep"></div>');
    doc.write('<table><thead><tr><th>Items</th><th class="right">Count</th><th class="right">Price</th></tr></thead><tbody>');
    items.forEach(it => {
        doc.write(`<tr><td>${it.name}</td><td class="right">${it.qty}</td><td class="right">₹${it.total}</td></tr>`);
    });
    doc.write(`</tbody><tfoot><tr><th colspan="2">TOTAL</th><th class="right">₹${total}</th></tr></tfoot></table>`);
    doc.write('<div style="margin-top:16px;text-align:center">Thank you!</div>');
    doc.write('</body></html>');
    doc.close();
    w.focus();
    try { w.print(); } catch (e) { console.warn('Preview print failed', e); }
    return w;
}

// Show an inline modal preview when popups are blocked
function showInlinePreview(items, total, dateStr, timeStr) {
    // remove existing preview if present
    const existing = document.getElementById('inline-print-preview');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'inline-print-preview';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,0.6)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 9999;

    const panel = document.createElement('div');
    panel.style.width = '720px';
    panel.style.maxWidth = '95%';
    panel.style.maxHeight = '90%';
    panel.style.overflow = 'auto';
    panel.style.background = '#fff';
    panel.style.color = '#000';
    panel.style.padding = '20px';
    panel.style.borderRadius = '8px';

    const title = document.createElement('h1');
    title.textContent = SHOP_INFO.name;
    title.style.textAlign = 'center';
    title.style.margin = '0 0 4px';
    panel.appendChild(title);

    const dt = document.createElement('div');
    dt.textContent = `date: ${dateStr}    time: ${timeStr}`;
    dt.style.textAlign = 'center';
    dt.style.fontSize = '13px';
    dt.style.marginBottom = '12px';
    panel.appendChild(dt);

    const hr = document.createElement('div'); hr.style.borderBottom = '1px dotted #000'; hr.style.margin = '8px 0'; panel.appendChild(hr);

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th style="text-align:left;padding:8px">Items</th><th style="text-align:right;padding:8px">Count</th><th style="text-align:right;padding:8px">Price</th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    items.forEach(it => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td style="padding:8px">${it.name}</td><td style="padding:8px;text-align:right">${it.qty}</td><td style="padding:8px;text-align:right">₹${it.total}</td>`;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    const tfoot = document.createElement('tfoot');
    tfoot.innerHTML = `<tr><th colspan="2" style="padding:8px;text-align:left">TOTAL</th><th style="padding:8px;text-align:right">₹${total}</th></tr>`;
    table.appendChild(tfoot);
    panel.appendChild(table);

    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '8px';
    btns.style.justifyContent = 'center';
    btns.style.marginTop = '12px';
    const printBtn = document.createElement('button');
    printBtn.textContent = 'Print';
    printBtn.className = 'button-18';
    printBtn.onclick = () => { window.print(); };
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.className = 'button-18';
    closeBtn.style.background = '#666';
    closeBtn.onclick = () => { overlay.remove(); };
    btns.appendChild(printBtn); btns.appendChild(closeBtn);
    panel.appendChild(btns);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
}

// Simulated KOT print (can be replaced with QZ Tray logic)
function printKOT() {
    disableButtons(true);
    const items = Object.keys(cart).map(name => ({ name, qty: cart[name] }));
    const kotText = buildKOTText(items);

    // Use browser print flow (popup) — if popup blocked show inline preview
    const w = window.open('', '', 'width=400,height=600');
    if (w) {
        const pre = w.document.createElement('pre');
        pre.textContent = kotText;
        w.document.body.appendChild(pre);
        try { w.print(); } catch (e) { console.warn('KOT print failed', e); }
        try { w.close(); } catch (e) { /* ignore */ }
        disableButtons(false);
        return;
    }

    // Popup blocked — reuse inline preview to show KOT items
    const mapped = items.map(i => ({ name: i.name, qty: i.qty, total: '' }));
    showInlinePreview(mapped, '', new Date().toLocaleDateString(), new Date().toLocaleTimeString());
    disableButtons(false);
}


// Function to print the bill
function printBill() {
    disableButtons(true);

    let total = 0;
    let printData = '';

    printData += `Moon Light Ice Cream Parlour\n`;
    printData += `Trichy Road\n`;
    printData += `Dindigul\n`;
    printData += `------------------------------\n`;
    printData += `Table: ${seatNumber}\n\n`;

    // collect current items
    if (!Array.isArray(window._currentPrintItems)) window._currentPrintItems = [];
    window._currentPrintItems.length = 0;

    for (let item in cart) {
        const qty = cart[item];
        const price = itemPrices[item] || 0;
        const itemTotal = qty * price;
        total += itemTotal;
        printData += `${item.padEnd(25)} x ${qty.toString().padStart(2)} - ₹${itemTotal.toString().padStart(4)}\n`;
        window._currentPrintItems.push({ name: item, qty: qty, price: price, total: itemTotal });
    }

    printData += `------------------------------\n`;
    printData += `Total: ₹${total}\n`;

    const data = [{ type: 'TEXT', value: printData }];

    // Save transaction regardless of printer availability
    try {
        const salesKey = 'sales_summary';
        const existing = localStorage.getItem(salesKey);
        const sales = existing ? JSON.parse(existing) : [];
        const txn = {
            table: seatNumber || 'Unknown',
            timestamp: new Date().toISOString(),
            items: Array.isArray(window._currentPrintItems) ? window._currentPrintItems.slice() : [],
            total: total
        };
        if (txn.items && txn.items.length > 0) {
            sales.push(txn);
            localStorage.setItem(salesKey, JSON.stringify(sales));
            console.log('Transaction saved to sales_summary', txn);
        } else {
            console.log('No items to save for transaction');
        }
        window._currentPrintItems = [];
    } catch (e) {
        console.error('Failed to store sales summary', e);
    }

    // build thermal bill text
    const itemsForPrint = Object.keys(cart).map(name => ({ name, qty: cart[name], price: itemPrices[name] || 0, total: (itemPrices[name] || 0) * cart[name] }));
    const thermalText = buildBillText(itemsForPrint, total);
    const dataToPrint = [{ type: 'TEXT', value: thermalText }];

    console.log("Thermal print data:\n" + thermalText);

    // If no items, abort and inform the user
    if (!itemsForPrint || itemsForPrint.length === 0) {
        alert('No items in cart to print.');
        disableButtons(false);
        return;
    }

    // Open printable preview (popup or inline). User will print manually like KOT.
    const previewWindow = openPrintWindow(itemsForPrint, total);
    if (!previewWindow) {
        console.warn('Print preview opened inline (popup was blocked).');
    }

    disableButtons(false);
}

