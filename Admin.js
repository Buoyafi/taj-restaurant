/* ═══════════════════════════════════════
   TAJ SHAWARMA — ADMIN SCRIPT
   ═══════════════════════════════════════ */

// ─── PASSWORD GATE ───
const ADMIN_PASSWORD = 'taj2026';

(function () {
    const unlocked = sessionStorage.getItem('tajAdminUnlocked');
    if (unlocked === 'true') return;

    const entered = prompt('Enter admin password:');
    if (entered !== ADMIN_PASSWORD) {
        document.body.innerHTML = `
            <div style="
                display:flex;flex-direction:column;align-items:center;
                justify-content:center;height:100vh;background:#111110;
                font-family:'Manrope',sans-serif;gap:16px;
            ">
                <div style="font-size:40px;">🔒</div>
                <div style="color:#f0ebe4;font-size:18px;font-weight:700;">Access Denied</div>
                <div style="color:rgba(240,235,228,0.5);font-size:14px;">Wrong password</div>
                <a href="index.html" style="
                    margin-top:8px;color:#FF8C00;font-size:13px;
                    text-decoration:none;font-weight:600;
                ">← Back to site</a>
            </div>
        `;
        throw new Error('Access denied'); // stop rest of script
    }

    sessionStorage.setItem('tajAdminUnlocked', 'true');
})();

/* ═══════════════════════════════════════
   CONSTANTS & STATE
   ═══════════════════════════════════════ */
const STORAGE_KEY = 'tajMenuItems';

const CATEGORIES = [
    'Shawarma', 'Toast', 'Grilled Chicken', 'Wraps',
    'Crispy Chicken', 'Quesadillas', 'Noodles', 'Breakfast', 'Smile Grill', 'Drinks'
];

const DEFAULT_MENU = [
    { id: 'chicken-single',  name: 'Chicken Shawarma',         variant: 'Single', category: 'Shawarma',       price: 2200, desc: 'Thinly sliced marinated chicken with authentic spices and creamy tahini sauce',                                           image: 'https://i.ibb.co/KjhT3j0z/Chicken-Shawarma.jpg' },
    { id: 'chicken-double',  name: 'Chicken Shawarma',         variant: 'Double', category: 'Shawarma',       price: 2700, desc: 'Double portion — same authentic flavour, twice the satisfaction',                                                         image: 'https://images.bolt.eu/store/2024/2024-05-23/8cba39e0-ebcb-4081-8398-24c038b699c0.jpeg' },
    { id: 'beef-single',     name: 'Beef Shawarma',            variant: 'Single', category: 'Shawarma',       price: 2200, desc: 'Prime beef strips slow-roasted with middle-eastern herbs and fresh vegetables',                                           image: 'https://images.unsplash.com/photo-1719282432114-45fd6c6df642?auto=format&fit=crop&w=600&q=80' },
    { id: 'beef-double',     name: 'Beef Shawarma',            variant: 'Double', category: 'Shawarma',       price: 2500, desc: 'Double portion of slow-roasted prime beef',                                                                               image: 'https://i.ibb.co/Y7QQLrrd/Beef-Shawarma.jpg' },
    { id: 'special-mix',     name: 'Special Shawarma Mix',     variant: '',       category: 'Shawarma',       price: 3300, desc: 'Chicken + Beef blend — the best of both worlds',                                                                          image: 'https://tse3.mm.bing.net/th/id/OIP.FWAiS4ijzWME-Ws7s1Ph1wHaHa?rs=1&pid=ImgDetMain' },
    { id: 'toast-eggs',      name: 'Toast with Eggs',          variant: '',       category: 'Toast',          price: 800,  desc: 'Double layered toasted bread with fluffy scrambled eggs',                                                                 image: 'https://images.unsplash.com/photo-1617979417434-d80fbd960c90?auto=format&fit=crop&w=600&q=80' },
    { id: 'toast-chicken',   name: 'Toast with Chicken',       variant: '',       category: 'Toast',          price: 2000, desc: 'Shredded grilled chicken breast inside crisp buttery toast',                                                              image: 'https://i.ibb.co/bgL2cFb5/Toast.jpg' },
    { id: 'toast-cheese',    name: 'Toast with Cheese',        variant: '',       category: 'Toast',          price: 2500, desc: 'Premium melted cheddar and mozzarella blend on golden toast',                                                             image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=600&q=80' },
    { id: 'grilled-plain',   name: 'Freshly Grilled Chicken',  variant: '',       category: 'Grilled Chicken',price: 3500, desc: 'Signature spice rub, slow-grilled over open flames',                                                                      image: 'https://tse3.mm.bing.net/th/id/OIP.ZSlvjta1sApGPjA5KVGHiwHaHa?rs=1&pid=ImgDetMain' },
    { id: 'grilled-chips',   name: 'Grilled Chicken + Chips',  variant: '',       category: 'Grilled Chicken',price: 6000, desc: 'Succulent quarter chicken served with crispy salted fries',                                                               image: 'https://i.ibb.co/8nGn46Mm/Chicken-and-Chips.jpg' },
    { id: 'chicken-wrap',    name: 'Chicken Wrap',             variant: '',       category: 'Wraps',          price: 3500, desc: 'Classic rolled perfection',                                                                                               image: 'https://i.ibb.co/hRXfQtCL/Chicken-Wrap.jpg' },
    { id: 'wrap-cheese',     name: 'Wrap with Cheese',         variant: '',       category: 'Wraps',          price: 4500, desc: 'Extra melted cheddar layer',                                                                                              image: 'https://tse3.mm.bing.net/th/id/OIP.bn5Z5ETK8wUtoXwpkFj-nwHaI9?rs=1&pid=ImgDetMain' },
    { id: 'golden-pieces',   name: 'Golden Pieces',            variant: '',       category: 'Crispy Chicken', price: 4000, desc: 'Secret blend of herbs, fried to a perfect golden crust',                                                                  image: 'https://media.istockphoto.com/id/178381854/photo/three-pieces-of-fries-chicken-stacked-on-small-plate.jpg?s=170667a&w=0&k=20&c=hpvVls46t-u62W-ro908dzXBl8lhlgNxkOycTzVu4TY=' },
    { id: 'crispy-combo',    name: 'Crispy Chicken + Fries',   variant: '',       category: 'Crispy Chicken', price: 6500, desc: 'Served with garlic dip',                                                                                                  image: 'https://media.istockphoto.com/id/1339624193/photo/chicken-strips.jpg?s=612x612&w=0&k=20&c=Z1i3xsG1bmA7UM1FQBGSyPjNAF7vPN9T5usJ_Jv8PGA=' },
    { id: 'quesadilla',      name: 'Chicken Quesadilla',       variant: '',       category: 'Quesadillas',    price: 5000, desc: 'Grilled seasoned chicken in toasted flour tortilla with melted cheese',                                                   image: 'https://i.ibb.co/9zf8j9H/Quesadillas.jpg' },
    { id: 'extra-cheese',    name: 'Extra Cheese Add-on',      variant: '',       category: 'Quesadillas',    price: 1500, desc: '',                                                                                                                        image: 'https://images.unsplash.com/photo-1683314573424-b0da0c795a07?auto=format&fit=crop&w=600&q=80' },
    { id: 'noodles',         name: 'Spiced Noodles + Omelette',variant: '',       category: 'Noodles',        price: 1500, desc: '',                                                                                                                        image: 'https://i.ibb.co/nskr1y2n/Noodles-and-eggs.jpg' },
    { id: 'pancakes',        name: 'Pancakes with Eggs Sauce', variant: '',       category: 'Breakfast',      price: 2700, desc: 'Fluffy stacked pancakes with our signature savory egg sauce',                                                             image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80' },
    { id: 'grill-chicken',   name: 'Grill Chicken',            variant: '',       category: 'Smile Grill',    price: 3500,  desc: 'Tender marinated chicken lap flame-grilled with bold smoky taste',                                                       image: 'https://i.ibb.co/5g3PgL83/Grilled-chicken.jpg' },
    { id: 'full-chicken',    name: 'Full Chicken',             variant: '',       category: 'Smile Grill',    price: 15000, desc: 'Juicy flame-grilled full chicken with rich smoky flavour',                                                               image: 'https://tse1.mm.bing.net/th/id/OIP.4eDwaq710LGubCPSLOVScQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 'grill-fish',      name: 'Grill Fish Platter',       variant: '',       category: 'Smile Grill',    price: 3500,  desc: 'Flame-grilled fish with chips, sweet plantain, and spicy pepper sauce',                                                  image: 'https://i.ibb.co/tPp9rr2Q/Fish-platter.jpg' },
    { id: 'platter',         name: 'Platter',                  variant: '',       category: 'Smile Grill',    price: 35000, desc: 'Loaded platter with grilled chicken, fried bites, sausages, and peppered sides',                                         image: 'https://i.ibb.co/0Vsn3BzD/Platter.jpg' },
    { id: 'plate-of-asun',   name: 'Plate of Asun',            variant: '',       category: 'Smile Grill',    price: 2000, desc: 'Spicy smoky grilled meat tossed in rich pepper sauce',                                                                    image: 'https://i0.wp.com/palatablepastime.com/wp-content/uploads/2019/01/ethiopian-beef-siga-tibs-sq.jpg?w=1650&ssl=1'},
    { id: 'taj-juice',       name: 'Taj Juice',                variant: '',       category: 'Drinks',         price: 1500, desc: 'House secret blend, exotic and refreshing',                                                                               image: 'https://i.ibb.co/DDDJ3z2R/Taj-juice.jpg' },
    { id: 'iced-coffee',     name: 'Iced Coffee',              variant: '',       category: 'Drinks',         price: 2000, desc: 'Premium blend, double shot, served ice cold',                                                                             image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80' },
    { id: 'iced-choc',       name: 'Iced Chocolate',           variant: '',       category: 'Drinks',         price: 1500, desc: 'Silky smooth chocolate blend, chilled to perfection',                                                                     image: 'https://images.unsplash.com/photo-1515316416554-1af1fbca57a2?auto=format&fit=crop&w=600&q=80' },
    { id: 'hot-choc',        name: 'Hot Chocolate',            variant: '',       category: 'Drinks',         price: 700,  desc: '',                                                                                                                        image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80' },
    { id: 'hot-tea',         name: 'Hot Tea',                  variant: '',       category: 'Drinks',         price: 700,  desc: '',                                                                                                                        image: 'https://images.unsplash.com/photo-1610137312377-f2334bc3b279?auto=format&fit=crop&w=600&q=80' },
    { id: 'coke',            name: 'Coke',                     variant: '',       category: 'Drinks',         price: 500,  desc: '',                                                                                                                        image: 'https://blog.overnightprints.com/wp-content/uploads/2017/01/Coca-Cola-bottle_400x600.jpg' },
    { id: 'pepsi',           name: 'Pepsi',                    variant: '',       category: 'Drinks',         price: 500,  desc: '',                                                                                                                        image: 'https://tse3.mm.bing.net/th/id/OIP.O85fAbVot7SXPmT4Q4_SYwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 'fanta',           name: 'Fanta',                    variant: '',       category: 'Drinks',         price: 500,  desc: '',                                                                                                                        image: 'https://5.imimg.com/data5/SELLER/Default/2022/7/HQ/IH/YD/145631512/51k6u9u3nhl-sl1500--1000x1000.jpg' },
];

let menuItems      = [];
let activeCategory = 'all';
let editingId      = null;
let deleteTargetId = null;
let imageBase64    = null;

/* ═══════════════════════════════════════
   INIT
   ═══════════════════════════════════════ */
function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    menuItems   = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_MENU));
    if (!saved) saveToStorage();
    updateCounts();
    renderItems();
    attachEvents();
}

/* ═══════════════════════════════════════
   EVENT WIRING — all done in JS, no
   reliance on inline onclick= attributes
   ═══════════════════════════════════════ */
function attachEvents() {

    // Sidebar category buttons
    document.querySelectorAll('.sidebar-btn[data-cat]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.cat;
            renderItems();
        });
    });

    // Sidebar: open add modal
    document.getElementById('sidebarAddBtn').addEventListener('click', openAddModal);

    // Sidebar: reset
    document.getElementById('sidebarResetBtn').addEventListener('click', confirmResetMenu);

    // Main: add button
    document.getElementById('mainAddBtn').addEventListener('click', openAddModal);

    // Search
    document.getElementById('searchInput').addEventListener('input', renderItems);

    // Modal close — clicking the overlay background
    document.getElementById('modalOverlay').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });

    // Modal save button
    document.getElementById('modalSaveBtn').addEventListener('click', saveItem);

    // Modal cancel
    document.getElementById('modalCancelBtn').addEventListener('click', closeModal);

    // Modal close X
    document.getElementById('modalCloseX').addEventListener('click', closeModal);

    // Image file input
    document.getElementById('imageFileInput').addEventListener('change', handleImageFile);

    // Image URL field
    document.getElementById('fieldImageUrl').addEventListener('input', previewImageUrl);

    // Image upload area click → trigger file input
    document.getElementById('imgUploadArea').addEventListener('click', () => {
        document.getElementById('imageFileInput').click();
    });

    // Delete modal overlay click
    document.getElementById('deleteOverlay').addEventListener('click', function (e) {
        if (e.target === this) closeDeleteModal();
    });

    // Delete cancel
    document.getElementById('deleteCancelBtn').addEventListener('click', closeDeleteModal);

    // Delete close X
    document.getElementById('deleteCloseX').addEventListener('click', closeDeleteModal);

    // Delete confirm
    document.getElementById('confirmDeleteBtn').addEventListener('click', executeDelete);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('tajAdminUnlocked');
        window.location.href = '/';
    });
}

/* ═══════════════════════════════════════
   STORAGE
   ═══════════════════════════════════════ */
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menuItems));
}

/* ═══════════════════════════════════════
   COUNTS
   ═══════════════════════════════════════ */
function updateCounts() {
    const allCountEl = document.getElementById('countAll');
    if (allCountEl) allCountEl.textContent = menuItems.length;

    // Built-in categories
    CATEGORIES.forEach(cat => {
        const el = document.getElementById('count-' + cat.replace(/\s+/g, '-'));
        if (el) el.textContent = menuItems.filter(i => i.category === cat).length;
    });

    // Dynamic categories not in the default list
    const allCats = [...new Set(menuItems.map(i => i.category))];
    const newCats = allCats.filter(c => !CATEGORIES.includes(c));

    newCats.forEach(cat => {
        const existingId = 'count-' + cat.replace(/\s+/g, '-');
        if (!document.getElementById(existingId)) {
            // Add a new sidebar button for this category
            const sidebar = document.querySelector('.sidebar');
            const btn = document.createElement('button');
            btn.className = 'sidebar-btn';
            btn.dataset.cat = cat;
            btn.id = 'sidebarBtn-' + cat.replace(/\s+/g, '-');
            btn.innerHTML = `
                <i class="fa-solid fa-circle-dot"></i> ${cat}
                <span class="sidebar-count" id="${existingId}">
                    ${menuItems.filter(i => i.category === cat).length}
                </span>
            `;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = cat;
                renderItems();
            });

            // Insert before the Actions section
            const actionsSection = [...sidebar.querySelectorAll('.sidebar-section')]
                .find(s => s.textContent.trim() === 'Actions');
            sidebar.insertBefore(btn, actionsSection);
        } else {
            document.getElementById(existingId).textContent =
                menuItems.filter(i => i.category === cat).length;
        }
    });

    // Also add to the category dropdown if not already there
    const select = document.getElementById('fieldCategory');
    newCats.forEach(cat => {
        const exists = [...select.options].some(o => o.value === cat);
        if (!exists) {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            // Insert before the "Add New Category" option
            const newOpt = [...select.options].find(o => o.value === '__new__');
            select.insertBefore(opt, newOpt);
        }
    });
}

/* ═══════════════════════════════════════
   RENDER ITEMS
   ═══════════════════════════════════════ */
function renderItems() {
    const grid   = document.getElementById('itemsGrid');
    const search = document.getElementById('searchInput').value.toLowerCase().trim();

    grid.innerHTML = '';

    const filtered = menuItems.filter(item => {
        const matchCat    = activeCategory === 'all' || item.category === activeCategory;
        const matchSearch = !search
            || item.name.toLowerCase().includes(search)
            || item.category.toLowerCase().includes(search)
            || (item.variant && item.variant.toLowerCase().includes(search));
        return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-utensils"></i>
                <p>No items found</p>
            </div>`;
        return;
    }

    // Group by category
    const grouped = {};
    filtered.forEach(item => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    });

    Object.entries(grouped).forEach(([cat, items]) => {
        const label = document.createElement('div');
        label.className     = 'grid-category-label';
        label.textContent   = cat;
        grid.appendChild(label);

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.id        = 'card-' + item.id;

            const imgHtml = item.image
                ? `<img class="item-card-img" src="${item.image}" alt="${item.name}"
                       onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
                   <div class="item-card-img-placeholder" style="display:none;">
                       <i class="fa-solid fa-image"></i>
                   </div>`
                : `<div class="item-card-img-placeholder"><i class="fa-solid fa-image"></i></div>`;

            const variantHtml = item.variant
                ? `<span class="item-card-variant">${item.variant}</span>`
                : '';

            const descHtml = item.desc
                ? `<div class="item-card-desc">${item.desc}</div>`
                : `<div class="item-card-desc"></div>`;

            card.innerHTML = `
                ${imgHtml}
                <div class="item-card-body">
                    <div class="item-card-top">
                        <div class="item-card-name">${item.name}${variantHtml}</div>
                        <div class="item-card-price">₦${item.price.toLocaleString()}</div>
                    </div>
                    <div class="item-card-cat">${item.category}</div>
                    ${descHtml}
                    <div class="item-card-actions">
                        <button class="card-btn card-btn-edit" data-id="${item.id}">
                            <i class="fa-solid fa-pen"></i> Edit
                        </button>
                        <button class="card-btn card-btn-delete" data-id="${item.id}">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;

            // Wire edit and delete buttons
            card.querySelector('.card-btn-edit').addEventListener('click', () => openEditModal(item.id));
            card.querySelector('.card-btn-delete').addEventListener('click', () => openDeleteModal(item.id));

            grid.appendChild(card);
        });
    });
}

/* ═══════════════════════════════════════
   ADD MODAL
   ═══════════════════════════════════════ */
function openAddModal() {
    editingId   = null;
    imageBase64 = null;

    document.getElementById('modalTitle').textContent          = 'Add New Item';
    document.getElementById('modalSaveBtn').innerHTML          = '<i class="fa-solid fa-plus"></i> Add Item';
    document.getElementById('fieldName').value                 = '';
    document.getElementById('fieldVariant').value              = '';
    document.getElementById('fieldCategory').value             = '';
    document.getElementById('fieldPrice').value                = '';
    document.getElementById('fieldDesc').value                 = '';
    document.getElementById('fieldImageUrl').value             = '';
    document.getElementById('imgPreview').style.display        = 'none';
    document.getElementById('imgPlaceholder').style.display    = 'flex';
    document.getElementById('modalError').style.display        = 'none';
    document.getElementById('imageFileInput').value            = '';

    document.getElementById('modalOverlay').classList.add('open');
    document.getElementById('fieldName').focus();
}

/* ═══════════════════════════════════════
   EDIT MODAL
   ═══════════════════════════════════════ */
function openEditModal(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;

    editingId   = id;
    imageBase64 = null;

    document.getElementById('modalTitle').textContent          = 'Edit Item';
    document.getElementById('modalSaveBtn').innerHTML          = '<i class="fa-solid fa-floppy-disk"></i> Save Changes';
    document.getElementById('fieldName').value                 = item.name;
    document.getElementById('fieldVariant').value              = item.variant || '';
    document.getElementById('fieldCategory').value             = item.category;
    document.getElementById('fieldPrice').value                = item.price;
    document.getElementById('fieldDesc').value                 = item.desc || '';
    document.getElementById('fieldImageUrl').value             = item.image || '';
    document.getElementById('modalError').style.display        = 'none';
    document.getElementById('imageFileInput').value            = '';

    if (item.image) {
        document.getElementById('imgPreview').src              = item.image;
        document.getElementById('imgPreview').style.display    = 'block';
        document.getElementById('imgPlaceholder').style.display = 'none';
    } else {
        document.getElementById('imgPreview').style.display    = 'none';
        document.getElementById('imgPlaceholder').style.display = 'flex';
    }

    document.getElementById('modalOverlay').classList.add('open');
}

/* ═══════════════════════════════════════
   CLOSE MODAL
   ═══════════════════════════════════════ */
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
}

/* ═══════════════════════════════════════
   IMAGE HANDLERS
   ═══════════════════════════════════════ */
function handleImageFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader  = new FileReader();
    reader.onload = function (e) {
        imageBase64 = e.target.result;
        document.getElementById('imgPreview').src              = imageBase64;
        document.getElementById('imgPreview').style.display    = 'block';
        document.getElementById('imgPlaceholder').style.display = 'none';
        document.getElementById('fieldImageUrl').value         = '';
    };
    reader.readAsDataURL(file);
}

function previewImageUrl() {
    const url = document.getElementById('fieldImageUrl').value.trim();
    if (url) {
        imageBase64 = null;
        document.getElementById('imgPreview').src              = url;
        document.getElementById('imgPreview').style.display    = 'block';
        document.getElementById('imgPlaceholder').style.display = 'none';
    } else {
        document.getElementById('imgPreview').style.display    = 'none';
        document.getElementById('imgPlaceholder').style.display = 'flex';
    }
}

/* ═══════════════════════════════════════
   CATEGORY CHANGE
   ═══════════════════════════════════════ */

function handleCategoryChange() {
    const select = document.getElementById('fieldCategory');
    const newInput = document.getElementById('newCategoryInput');
    if (select.value === '__new__') {
        newInput.style.display = 'block';
        newInput.focus();
    } else {
        newInput.style.display = 'none';
        newInput.value = '';
    }
}

/* ═══════════════════════════════════════
   SAVE ITEM
   ═══════════════════════════════════════ */
function saveItem() {
    const name     = document.getElementById('fieldName').value.trim();
    const variant  = document.getElementById('fieldVariant').value.trim();
    const selectVal    = document.getElementById('fieldCategory').value;
    const newCatInput  = document.getElementById('newCategoryInput').value.trim();
    const category     = selectVal === '__new__' ? newCatInput : selectVal;
    const price    = parseInt(document.getElementById('fieldPrice').value);
    const desc     = document.getElementById('fieldDesc').value.trim();
    const urlField = document.getElementById('fieldImageUrl').value.trim();
    const image    = imageBase64 || urlField || '';
    const errorEl  = document.getElementById('modalError');

    if (!name || !category || category === '__new__' || isNaN(price) || price < 0) {
        errorEl.style.display = 'block';
        return;
    }

    errorEl.style.display = 'none';

    if (editingId) {
        const idx = menuItems.findIndex(i => i.id === editingId);
        if (idx !== -1) {
            menuItems[idx] = { ...menuItems[idx], name, variant, category, price, desc, image };
        }
        toast('✓ Item updated');
    } else {
        menuItems.push({
            id: 'item-' + Date.now(),
            name, variant, category, price, desc, image
        });
        toast('✓ Item added to menu');
    }

    saveToStorage();
    updateCounts();
    renderItems();
    closeModal();
}

/* ═══════════════════════════════════════
   DELETE
   ═══════════════════════════════════════ */
function openDeleteModal(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;
    deleteTargetId = id;
    document.getElementById('deleteItemName').textContent =
        item.name + (item.variant ? ' (' + item.variant + ')' : '');
    document.getElementById('deleteOverlay').classList.add('open');
}

function closeDeleteModal() {
    document.getElementById('deleteOverlay').classList.remove('open');
    deleteTargetId = null;
}

function executeDelete() {
    if (!deleteTargetId) return;
    menuItems      = menuItems.filter(i => i.id !== deleteTargetId);
    deleteTargetId = null;
    saveToStorage();
    updateCounts();
    renderItems();
    closeDeleteModal();
    toast('Item deleted');
}

/* ═══════════════════════════════════════
   RESET
   ═══════════════════════════════════════ */
function confirmResetMenu() {
    if (confirm('Reset the menu to defaults? All your changes will be lost.')) {
        menuItems = JSON.parse(JSON.stringify(DEFAULT_MENU));
        saveToStorage();
        updateCounts();
        renderItems();
        toast('Menu reset to defaults');
    }
}

/* ═══════════════════════════════════════
   TOAST
   ═══════════════════════════════════════ */
function toast(msg) {
    const el  = document.getElementById('adminToast');
    el.textContent = msg;
    el.style.display = 'block';
    clearTimeout(el._timer);
    el._timer = setTimeout(() => { el.style.display = 'none'; }, 3000);
}

/* ═══════════════════════════════════════
   START
   ═══════════════════════════════════════ */
init();