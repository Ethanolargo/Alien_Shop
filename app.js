const KEY = 'alien_arsenal_cart_v1';
const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/* Product catalog */
const PRODUCTS = {
  'rs-1': { name: 'Reality Splitter Sword', price: 8800, img: 'images/reality-splitter.svg' },
  'bh-9': { name: 'Black Hole Projector',   price: 72000, img: 'images/black-hole-projector.svg' },
  'qe-4': { name: 'Quantum Entangler Net',  price: 5400,  img: 'images/quantum-entangler.svg' },
  'al-1': { name: 'Antimatter Lance',       price: 3499,  img: 'images/antimatter-lance.svg' },
  'ts-3': { name: 'Temporal Stasis Grenade',price: 1250,  img: 'images/temporal-stasis-grenade.svg' },
  'vw-8': { name: 'Void Whisperer Staff',   price: 9900,  img: 'images/void-whisperer-staff.svg' },
};

function loadCart(){ try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } }
function saveCart(cart){ localStorage.setItem(KEY, JSON.stringify(cart)); updateNavCount(); }
function updateNavCount(){
  const el = document.getElementById('nav-cart-count');
  if (!el) return;
  const count = loadCart().reduce((n,i)=>n+i.qty,0);
  el.textContent = String(count);
}

function addToCart(id){
  const cart = loadCart();
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += 1; else cart.push({ id, qty: 1 });
  saveCart(cart);
}

/* PDP Add to Cart */
(function wirePDP(){
  const btn = document.getElementById('add-to-cart');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const id = btn.dataset.id;
    if (!PRODUCTS[id]) return;
    addToCart(id);
    btn.textContent = 'Added!';
    setTimeout(() => (btn.textContent = 'Add to Cart'), 900);
  });
})();

/* Cart page rendering + controls */
(function renderCart(){
  const container = document.getElementById('cart-items');
  if (!container) { updateNavCount(); return; }
  const empty = document.getElementById('cart-empty');
  const summary = document.getElementById('cart-summary');

  const cart = loadCart();
  container.innerHTML = '';

  if (cart.length === 0){
    empty.classList.remove('hidden');
    summary.classList.add('hidden');
    updateNavCount();
    return;
  }
  empty.classList.add('hidden');
  summary.classList.remove('hidden');

  let subtotal = 0;

  cart.forEach(item => {
    const p = PRODUCTS[item.id];
    if (!p) return;
    subtotal += p.price * item.qty;

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="thumb"><img src="${p.img}" alt="${p.name}" style="max-width:100%;height:auto"/></div>
      <div>
        <div><strong>${p.name}</strong></div>
        <div class="muted small">${fmt.format(p.price)} each</div>
      </div>
      <div class="qty-controls" data-id="${item.id}">
        <button class="dec" aria-label="Decrease quantity">−</button>
        <span class="qty" aria-live="polite">${item.qty}</span>
        <button class="inc" aria-label="Increase quantity">+</button>
        <button class="rem" aria-label="Remove item">Remove</button>
      </div>`;
    container.appendChild(row);
  });

  const tax = subtotal * 0.03;
  const total = subtotal + tax;
  document.getElementById('subtotal').textContent = fmt.format(subtotal);
  document.getElementById('tax').textContent = fmt.format(tax);
  document.getElementById('total').textContent = fmt.format(total);

  container.addEventListener('click', (e) => {
    const box = e.target.closest('.qty-controls');
    if (!box) return;
    const id = box.dataset.id;
    const cart = loadCart();
    const idx = cart.findIndex(i => i.id === id);
    if (idx < 0) return;

    if (e.target.classList.contains('inc')) cart[idx].qty += 1;
    if (e.target.classList.contains('dec')) cart[idx].qty = Math.max(1, cart[idx].qty - 1);
    if (e.target.classList.contains('rem')) cart.splice(idx, 1);

    saveCart(cart);
    location.reload();
  });

  const clearBtn = document.getElementById('clear-cart');
  if (clearBtn) clearBtn.onclick = () => { saveCart([]); location.reload(); };

  updateNavCount();
})();

// Checkout
(function wireCheckout(){
  const form = document.getElementById('checkout-form');
  if (!form) { updateNavCount(); return; }

  const modal = document.getElementById('confirm-modal');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries());
    const nameEl = document.getElementById('conf-name');
    const emailEl = document.getElementById('conf-email');
    if (nameEl) nameEl.textContent = data.name || 'Commander';
    if (emailEl) emailEl.textContent = data.email || '';

    if (modal && typeof modal.showModal === 'function') modal.showModal();
    else alert('Order Received! Delivery ETA: 3.2 light years.');

    localStorage.setItem(KEY, JSON.stringify([]));
    updateNavCount();
    form.reset();
  });
})();
