/* ═══════════════════════════════════════
   TAJ SHAWARMA — MAIN SCRIPT
   ═══════════════════════════════════════ */

// ─── BUILD MENU FROM LOCALSTORAGE ───
function buildMenuFromStorage() {
    const saved = localStorage.getItem('tajMenuItems');
    if (!saved) return;

    const items = JSON.parse(saved);

    // Group items by category
    const grouped = {};
    items.forEach(item => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    });

    // Category to existing HTML section ID map
    const categoryIdMap = {
        'Shawarma':        'shawarma',
        'Toast':           'toast',
        'Grilled Chicken': 'grilled-chicken',
        'Wraps':           'chicken-wraps',
        'Crispy Chicken':  'crispy-chicken',
        'Quesadillas':     'quesadillas',
        'Noodles':         'noodles-eggs',
        'Breakfast':       'breakfast-delight',
        'Smile Grill':     'smie-grill',
        'Drinks':          'drinks'
    };

    // Helper to build a single <li> element
    function buildItemLi(item) {
        const variantHtml = item.variant
            ? `<span class="item-variant">${item.variant}</span>`
            : '';
        const descHtml = item.desc
            ? `<p class="item-desc">${item.desc}</p>`
            : '';

        const li = document.createElement('li');
        li.className     = 'has-img';
        li.style.cssText = `--item-bg: url('${item.image || ''}')`;
        li.dataset.name  = item.name + (item.variant ? ' ' + item.variant : '');
        li.dataset.price = item.price;

        li.innerHTML = `
            <div class="item-body">
                <div class="item-top">
                    <span class="item-name">${item.name}${variantHtml}</span>
                    <span class="item-price">₦${item.price.toLocaleString()}</span>
                </div>
                ${descHtml}
                <div class="item-add-btn" data-price="₦${item.price.toLocaleString()}">
                    <div class="qty-box">
                        <button class="qty-minus" style="display:none">−</button>
                        <span class="qty-count" style="display:none">0</span>
                        <button class="qty-plus">+</button>
                    </div>
                </div>
            </div>
        `;
        return li;
    }

    const nav = document.querySelector('.menu-nav');

    // ─── STEP 1: Update existing category sections ───
    Object.entries(grouped).forEach(([category, catItems]) => {
        const sectionId = categoryIdMap[category];
        if (!sectionId) return; // new category — handled in step 2

        const section = document.getElementById(sectionId);
        if (!section) return;

        const ul = section.querySelector('ul');
        if (!ul) return;

        ul.innerHTML = '';
        catItems.forEach(item => ul.appendChild(buildItemLi(item)));
    });

    // ─── STEP 2: Create brand new category sections ───
    Object.entries(grouped).forEach(([category, catItems]) => {
        const sectionId = categoryIdMap[category];
        if (sectionId) return; // already handled above

        const newId = category.toLowerCase().replace(/\s+/g, '-');
        let section  = document.getElementById(newId);

        if (!section) {
            // Create the section
            section = document.createElement('div');
            section.className = 'menu-category';
            section.id        = newId;
            section.innerHTML = `
                <div class="category-header">
                    <h3>${category}</h3>
                </div>
                <ul></ul>
            `;
            document.getElementById('menu').appendChild(section);

            // Add nav pill
            if (nav) {
                const pill = document.createElement('a');
                pill.href        = '#' + newId;
                pill.className   = 'menu-nav-btn';
                pill.textContent = category;
                nav.appendChild(pill);
            }
        }

        const ul = section.querySelector('ul');
        ul.innerHTML = '';
        catItems.forEach(item => ul.appendChild(buildItemLi(item)));
    });

    // ─── STEP 3: Show/hide existing nav pills based on content ───
    if (nav) {
        nav.querySelectorAll('.menu-nav-btn').forEach(btn => {
            const href      = btn.getAttribute('href').replace('#', '');
            const sectionEl = document.getElementById(href);
            if (!sectionEl) return;
            const ul = sectionEl.querySelector('ul');
            btn.style.display = (!ul || ul.children.length === 0) ? 'none' : 'inline-block';
        });
    }
}

buildMenuFromStorage();

/* ═══════════════════════════════════════
   HERO SLIDER
   ═══════════════════════════════════════ */
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots   = document.querySelectorAll('.dot');
let autoPlay = setInterval(() => changeSlide(1), 5000);

function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function changeSlide(direction) {
    clearInterval(autoPlay);
    let next = (currentSlide + direction + slides.length) % slides.length;
    goToSlide(next);
    autoPlay = setInterval(() => changeSlide(1), 5000);
}

/* ═══════════════════════════════════════
   CART SYSTEM
   ═══════════════════════════════════════ */
let cart      = [{ id: 1, items: [] }];
let packCount = 1;
let activePack = 0;

document.addEventListener('click', function(e) {
    const btn = e.target;

    if (btn.classList.contains('qty-plus')) {
        const row   = btn.closest('[data-name]');
        const name  = row.dataset.name;
        const price = parseInt(row.dataset.price);
        addToCart(name, price);
        updateRowUI(row);
    }

    if (btn.classList.contains('qty-minus')) {
        const row  = btn.closest('[data-name]');
        const name = row.dataset.name;
        removeFromCart(name);
        updateRowUI(row);
    }
});

function addToCart(name, price) {
    const pack     = cart[activePack];
    const existing = pack.items.find(i => i.name === name);
    if (existing) {
        existing.qty++;
    } else {
        pack.items.push({ name, price, qty: 1 });
    }
    syncCartUI();
}

function removeFromCart(name) {
    const pack     = cart[activePack];
    const existing = pack.items.find(i => i.name === name);
    if (!existing) return;
    if (existing.qty > 1) {
        existing.qty--;
    } else {
        pack.items = pack.items.filter(i => i.name !== name);
    }
    syncCartUI();
    if (totalItemCount() === 0) hideCartBar();
}

function updateRowUI(row) {
    const name     = row.dataset.name;
    const pack     = cart[activePack];
    const item     = pack.items.find(i => i.name === name);
    const qty      = item ? item.qty : 0;
    const countEl  = row.querySelector('.qty-count');
    const minusBtn = row.querySelector('.qty-minus');

    countEl.textContent = qty;

    if (qty > 0) {
        countEl.style.display  = 'inline-block';
        minusBtn.style.display = 'flex';
    } else {
        countEl.style.display  = 'none';
        minusBtn.style.display = 'none';
    }
}

function syncCartUI() {
    document.querySelectorAll('[data-name]').forEach(row => updateRowUI(row));
    renderCartBar();
    renderCartDrawer();
    if (totalItemCount() > 0) showCartBar();
}

function totalItemCount() {
    return cart.reduce((sum, pack) =>
        sum + pack.items.reduce((s, i) => s + i.qty, 0), 0);
}

function totalPrice() {
    return cart.reduce((sum, pack) =>
        sum + pack.items.reduce((s, i) => s + i.price * i.qty, 0), 0);
}

function packSubtotal(pack) {
    return pack.items.reduce((s, i) => s + i.price * i.qty, 0);
}

function addPack() {
    packCount++;
    cart.push({ id: packCount, items: [] });
    activePack = cart.length - 1;

    document.querySelectorAll('[data-name]').forEach(row => updateRowUI(row));
    renderCartDrawer();

    closeCart();
    showToast(`Pack ${activePack + 1} added — pick items for this pack`);

    setTimeout(() => {
        document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

function duplicatePack(packIndex) {
    packCount++;
    const clone = {
        id:    packCount,
        items: cart[packIndex].items.map(i => ({ ...i }))
    };
    cart.splice(packIndex + 1, 0, clone);
    renderCartBar();
    renderCartDrawer();
}

function removePack(packIndex) {
    if (cart.length === 1) {
        cart[0].items = [];
        activePack    = 0;
    } else {
        cart.splice(packIndex, 1);
        if (activePack >= cart.length) activePack = cart.length - 1;
    }
    syncCartUI();
    if (totalItemCount() === 0) hideCartBar();
}

function switchToPack(packIndex) {
    activePack = packIndex;
    document.querySelectorAll('[data-name]').forEach(row => updateRowUI(row));
    renderCartDrawer();

    closeCart();
    showToast(`Switched to Pack ${packIndex + 1} — add more items`);

    setTimeout(() => {
        document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

function showToast(message) {
    const existing = document.getElementById('taj-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'taj-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: #111;
        color: white;
        padding: 12px 24px;
        border-radius: 99px;
        font-size: 13px;
        font-weight: 700;
        font-family: 'Manrope', sans-serif;
        z-index: 9999;
        border: 1px solid rgba(255,140,0,0.3);
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        white-space: nowrap;
        animation: toastIn 0.3s ease;
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function changePackItemQty(packIndex, name, delta) {
    const pack = cart[packIndex];
    const item = pack.items.find(i => i.name === name);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) pack.items = pack.items.filter(i => i.name !== name);
    syncCartUI();
    if (totalItemCount() === 0) hideCartBar();
}

function renderCartBar() {
    document.getElementById('cartBarCount').textContent =
        totalItemCount();
    document.getElementById('cartTotal').textContent =
        '₦' + totalPrice().toLocaleString();

    const checkoutBtn = document.querySelector('.cart-checkout');
    if (checkoutBtn) {
        checkoutBtn.disabled = totalItemCount() === 0;
    }
}

function renderCartDrawer() {
    const body = document.getElementById('cartDrawerBody');
    body.innerHTML = '';

    if (cart.every(p => p.items.length === 0)) {
        body.innerHTML = '<p style="text-align:center;color:#aaa;padding:40px 0;font-size:15px;">Your cart is empty.<br>Tap + on any item to add.</p>';
        return;
    }

    cart.forEach((pack, packIndex) => {
        const packEl  = document.createElement('div');
        packEl.className = 'cart-pack';

        const isActive = packIndex === activePack;
        const isEmpty  = pack.items.length === 0;

        if (isActive) packEl.style.border = '1.5px solid var(--orange)';

        packEl.innerHTML = `
            <div class="cart-pack-header">
                <div class="cart-pack-label-row">
                    <span class="cart-pack-label">Pack ${packIndex + 1}</span>
                    ${isActive ? '<span style="font-size:11px;background:var(--orange);color:white;padding:2px 10px;border-radius:99px;font-weight:700;">Active</span>' : ''}
                </div>
                <div class="cart-pack-actions">
                    ${!isActive ? `<button class="cart-pack-duplicate" onclick="switchToPack(${packIndex})">Switch</button>` : ''}
                    <button class="cart-pack-duplicate" onclick="duplicatePack(${packIndex})">Duplicate</button>
                    <button class="cart-pack-remove"    onclick="removePack(${packIndex})">Remove</button>
                </div>
            </div>

            ${isEmpty ? `
                <div style="padding:16px;text-align:center;color:#aaa;font-size:13px;">
                    Close cart and add items to this pack
                </div>
            ` : `
                <div class="cart-pack-items">
                    ${pack.items.map(item => `
                        <div class="cart-pack-item">
                            <span class="cart-pack-item-name">${item.name}</span>
                            <div class="cart-pack-item-qty">
                                <button onclick="changePackItemQty(${packIndex}, '${item.name.replace(/'/g, "\\'")}', -1)">−</button>
                                <span>${item.qty}</span>
                                <button onclick="changePackItemQty(${packIndex}, '${item.name.replace(/'/g, "\\'")}', 1)">+</button>
                            </div>
                            <span class="cart-pack-item-price">₦${(item.price * item.qty).toLocaleString()}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="cart-pack-subtotal">
                    <span>Pack ${packIndex + 1} subtotal</span>
                    <span>₦${packSubtotal(pack).toLocaleString()}</span>
                </div>
            `}
        `;

        body.appendChild(packEl);
    });
}

function showCartBar() {
    document.getElementById('cartBar').classList.add('visible');
}

function hideCartBar() {
    document.getElementById('cartBar').classList.remove('visible');
}

function openCart() {
    document.getElementById('cartDrawer').classList.add('open');
    document.getElementById('cartOverlay').classList.add('active');
}

function closeCart() {
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('active');
}

function goToCheckout() {
    if (totalItemCount() === 0) return;
    sessionStorage.setItem('tajCart', JSON.stringify(cart));
    sessionStorage.setItem('tajPackCount', packCount);
    window.location.href = '/checkout';
}

// ─── HAMBURGER MENU ───
const hamburgerBtn      = document.getElementById('hamburgerBtn');
const mobileNav         = document.getElementById('mobileNav');
const mobileNavOverlay  = document.getElementById('mobileNavOverlay');

function openHamburger() {
    hamburgerBtn.classList.add('open');
    mobileNav.classList.add('open');
    mobileNavOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeHamburger() {
    hamburgerBtn.classList.remove('open');
    mobileNav.classList.remove('open');
    mobileNavOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

hamburgerBtn.addEventListener('click', () => {
    if (mobileNav.classList.contains('open')) {
        closeHamburger();
    } else {
        openHamburger();
    }
});

// Close when overlay is tapped
mobileNavOverlay.addEventListener('click', closeHamburger);

// Close when any nav link is tapped
document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeHamburger);
});