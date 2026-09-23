// ─── LOAD CART FROM SESSION ───
let cart = JSON.parse(sessionStorage.getItem('tajCart')) || [{ id: 1, items: [] }];

const PHONE = '2348156137303';

// ─── RENDER ORDER SUMMARY ───
function renderCheckoutPacks() {
    const container = document.getElementById('checkoutPacks');
    container.innerHTML = '';

    let grandTotal = 0;

    cart.forEach((pack, packIndex) => {
        if (pack.items.length === 0) return;

        const subtotal = pack.items.reduce((s, i) => s + i.price * i.qty, 0);
        grandTotal += subtotal;

        const packEl = document.createElement('div');
        packEl.className = 'checkout-pack';
        packEl.innerHTML = `
            <div class="checkout-pack-header">
                <span class="checkout-pack-label">Pack ${packIndex + 1}</span>
                <span class="checkout-pack-subtotal">₦${subtotal.toLocaleString()}</span>
            </div>
            <div class="checkout-pack-items" id="packItems-${packIndex}">
                ${renderPackItems(pack, packIndex)}
            </div>
        `;
        container.appendChild(packEl);
    });

    document.getElementById('checkoutTotal').textContent = '₦' + grandTotal.toLocaleString();
}

function renderPackItems(pack, packIndex) {
    return pack.items.map(item => `
        <div class="checkout-item" data-pack="${packIndex}" data-name="${item.name}">
            <span class="checkout-item-name">${item.name}</span>
            <div class="checkout-item-qty">
                <button class="co-minus" onclick="adjustItem(${packIndex}, '${item.name.replace(/'/g, "\\'")}', -1)">−</button>
                <span class="co-count">${item.qty}</span>
                <button class="co-plus" onclick="adjustItem(${packIndex}, '${item.name.replace(/'/g, "\\'")}', 1)">+</button>
            </div>
            <span class="checkout-item-price">₦${(item.price * item.qty).toLocaleString()}</span>
        </div>
    `).join('');
}

function adjustItem(packIndex, name, delta) {
    const pack = cart[packIndex];
    const item = pack.items.find(i => i.name === name);
    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {
        pack.items = pack.items.filter(i => i.name !== name);
    }

    // Remove empty packs
    cart = cart.filter(p => p.items.length > 0);

    // If all packs empty, go back to menu
    if (cart.length === 0) {
        alert('Your cart is now empty. Going back to the menu.');
        window.location.href = 'index.html';
        return;
    }

    sessionStorage.setItem('tajCart', JSON.stringify(cart));
    renderCheckoutPacks();
}

// ─── CONFIRM ORDER → WHATSAPP ───
function confirmOrder() {
    const name    = document.getElementById('customerName').value.trim();
    const phone   = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    const notes   = document.getElementById('customerNotes').value.trim();
    const delivery = document.querySelector('input[name="deliveryType"]:checked').value;
    const errorEl  = document.getElementById('formError');
    const isPickup = delivery === 'Pickup';

    if (!name || !phone || (!isPickup && !address)) {
        errorEl.style.display = 'block';
        errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    errorEl.style.display = 'none';

    // Build WhatsApp message
    let message = `Hello TAJ Shawarma! \n\n`;
    message += `*Name:* ${name}\n`;
    message += `*Phone:* ${phone}\n`;
    message += `*${delivery} Address:* ${address}\n`;
    if (notes) message += `*Notes:* ${notes}\n`;
    message += `\n*─── ORDER DETAILS ───*\n\n`;

    cart.forEach((pack, packIndex) => {
        if (pack.items.length === 0) return;
        const subtotal = pack.items.reduce((s, i) => s + i.price * i.qty, 0);
        message += `*Pack ${packIndex + 1}:*\n`;
        pack.items.forEach(item => {
            message += `  • ${item.name} x${item.qty} — ₦${(item.price * item.qty).toLocaleString()}\n`;
        });
        message += `  Subtotal: ₦${subtotal.toLocaleString()}\n\n`;
    });

    const grand = cart.reduce((sum, p) =>
        sum + p.items.reduce((s, i) => s + i.price * i.qty, 0), 0);
    message += `*TOTAL: ₦${grand.toLocaleString()}*\n\n`;
    message += `Please confirm availability and payment details. Thank you!`;

    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function toggleAddress() {
    const isPickup = document.querySelector('input[name="deliveryType"]:checked').value === 'Pickup';
    const addressGroup = document.getElementById('addressGroup');
    const addressField = document.getElementById('customerAddress');

    if (isPickup) {
        addressGroup.style.display = 'none';
        addressField.value = 'Pickup';
    } else {
        addressGroup.style.display = 'flex';
        addressField.value = '';
    }
}

// ─── INIT ───
renderCheckoutPacks();