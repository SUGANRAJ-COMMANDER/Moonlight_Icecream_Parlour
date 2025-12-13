// Get seat number from URL and display it
const urlParams = new URLSearchParams(window.location.search);
const seatNumber = urlParams.get('seat');
document.getElementById('seatNumber').textContent = seatNumber;

// Item prices dictionary
const itemPrices = {
    "COMBO 399": 399, "COMBO 499": 499, "COMBO 799": 799,
    "vennila": 60, "strawberry": 60, "mango": 60, "butterscotch": 60, "chocolate": 60,
    "pista": 60, "blackcurrant": 60, "spanish delight": 90, "caramel latte": 90,
    "cotton candy": 90, "cookies cream": 90, "choco chip": 90, "kulfi": 90,
    "tender coconut": 90, "red velvet": 90, "mango passion": 100, "choco passion": 100,
    "strawberry passion": 100, "pineapple": 100, "brownie w vennila": 120,
    "brownie w b.scotch": 120, "brownie w chocolate": 120, "triple classic brownie": 150,
    "triple classic sundae": 120, "choco brownie sundae": 120, "choco cookie sundae": 120,
    "dry fruits sundae": 120, "cold coffe shake": 100, "boost choco shake": 100,
    "horlicks shake": 100, "oreo shake": 110, "kitkat shake": 110, "ice blue": 80,
    "lemon": 80, "green apple": 80, "mango": 80, "pine apple": 80, "water melon": 80,
    "chicken bites": 150, "chicken wings": 150, "drumstick": 150,
    "nutty vannila delight": 110, "nutty choco delight": 110, "hot chocolate crunch": 130,
    "kulfi choco crunch": 130, "mini falooda": 90, "mango madness": 110,
    "butterscotch bliss": 110, "chocolate bliss": 110, "arabian nights": 130,
    "ml special falooda": 150, "gulabjamun ice": 100, "cream": 80,
    "puttu ice cream": 130, "titanic ice cream": 140, "briyani ice cream": 150,
    "rainbow delight": 120, "french fries": 70, "veg roll": 60, "veg momo": 60,
    "smiley": 60, "nuggets": 70, "chicken pops": 90, "chicken momo": 90, "chicken roll": 90
};

const cart = {};

// Thermal printer settings
const THERMAL_WIDTH = 40;
const SHOP_INFO = { name: 'MOON LIGHT', location: 'Dindigul', contact: '7708946529' };

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
    let out = '';
    out += `${SHOP_INFO.name}\n`;
    out += `${SHOP_INFO.location}\n`;
    out += `Contact: ${SHOP_INFO.contact}\n`;
    out += `------------------------------\n`;
    out += `Table: ${seatNumber || ''}\n`;
    out += `Date: ${new Date().toLocaleString()}\n`;
    out += `------------------------------\n`;
    items.forEach(i => {
        const name = i.name.length > 20 ? i.name.slice(0, 20) + '…' : i.name;
        const priceStr = `₹${i.price}`;
        const totalStr = `₹${i.total}`;
        // print name and price on first line, qty and line total on second if needed
        out += formatLine(name + ' ' + priceStr, '') + '\n';
        out += formatLine(`x${i.qty}`, totalStr) + '\n';
    });
    out += `------------------------------\n`;
    out += formatLine('TOTAL', `₹${total}`) + '\n';
    out += `\nThank you!\n`;
    return out;
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
    document.getElementById("kotBtn").disabled = disable;
    document.getElementById("saveBtn").disabled = disable;
    document.getElementById("printBtn").disabled = disable;
}

// Simulated KOT print (can be replaced with QZ Tray logic)
function printKOT() {
    disableButtons(true);
    const items = Object.keys(cart).map(name => ({ name, qty: cart[name] }));
    const kotText = buildKOTText(items);

    // If QZ available, use it; otherwise fallback to window print
    if (window.qz && qz.websocket && typeof qz.websocket.isActive === 'function' && qz.websocket.isActive()) {
        const data = [{ type: 'TEXT', value: kotText }];
        qz.printers.getDefault().then(function (printerName) {
            const config = qz.configs.create(printerName);
            return qz.print(config, data);
        }).then(() => {
            alert('KOT printed successfully');
        }).catch(err => {
            console.error('KOT print error', err);
            alert('KOT print error: ' + err);
        }).finally(() => disableButtons(false));
    } else {
        const w = window.open('', '', 'width=400,height=600');
        if (w) {
            const pre = w.document.createElement('pre');
            pre.textContent = kotText;
            w.document.body.appendChild(pre);
            w.print();
            w.close();
        } else {
            alert('Unable to open print window for KOT');
        }
        disableButtons(false);
    }
}


// Function to print the bill
function printBill() {
    disableButtons(true);

    let total = 0;
    let printData = '';

    printData += `Moon Light Ice Cream Parlour\n`;
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

    // If QZ is unavailable, inform user but keep saved transaction
    if (!(window.qz && qz.websocket && typeof qz.websocket.isActive === 'function' && qz.websocket.isActive())) {
        alert('Transaction saved locally. QZ Tray is not connected, printing skipped.');
        disableButtons(false);
        return;
    }

    // Print via QZ
    qz.printers.getDefault().then(function (printerName) {
        const config = qz.configs.create(printerName);
        return qz.print(config, dataToPrint);
    }).then(() => {
        alert('Printing successful!');
    }).catch(function (error) {
        console.error('Print error:', error);
        alert('Print error: ' + error);
    }).finally(() => {
        disableButtons(false);
    });
}

