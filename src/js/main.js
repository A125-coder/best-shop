/* exported BASE, loadProducts, createProductCard, getCart, saveCart, addToCart, defaultSize, shuffle, renderStars, EMAIL_REGEX */
(function initMenu() {
  const burger = document.getElementById('nav-burger');
  const nav = document.getElementById('site-nav');
  if (!burger || !nav) return;

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    burger.firstElementChild.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  };

  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      burger.focus();
    }
  });

  matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });
})();

const BASE = location.pathname.includes('/html/') ? '../' : './';

async function loadProducts() {
  const response = await fetch(`${BASE}assets/data.json`);
  if (!response.ok) throw new Error('Cannot load products');
  const { data } = await response.json();
  return data;
}

function createProductCard(product, { withCart = false } = {}) {
  const item = document.createElement('li');
  item.className = 'product-item';

  const url = `${BASE}html/product.html?id=${product.id}`;

  const action = withCart
    ? '<button class="btn" type="button">Add To Cart</button>'
    : `<a class="btn" href="${url}">View Product</a>`;

  item.innerHTML = `
    <article class="product-card">
      <figure class="product-figure">
        <a class="product-link" href="${url}" aria-label="${product.name}">
          <img class="product-image" src="${BASE}${product.imageUrl}" alt="${product.name}" />
        </a>
        ${product.salesStatus ? '<figcaption class="product-badge">Sale</figcaption>' : ''}
      </figure>
      <h3 class="product-title"><a href="${url}">${product.name}</a></h3>
      <p class="product-price">$${product.price}</p>
      ${action}
    </article>
  `;

  if (withCart) {
    item.querySelector('.btn').addEventListener('click', () =>
      addToCart(product.id, 1, defaultSize(product), product.color)
    );
  }
  return item;
}

const CART_KEY = 'cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const badge = document.querySelector('.cart-count');
  if (!badge) return;

  const total = getCart().reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = total;
  badge.hidden = total === 0;
  badge.parentElement.setAttribute('aria-label', total ? `Cart, ${total} items` : 'Cart');
}

function defaultSize(product) {
  return product.size.split(',')[0].trim();
}

function addToCart(id, qty = 1, size = '', color = '') {
  const cart = getCart();
  const item = cart.find(
    (entry) => entry.id === id && entry.size === size && entry.color === color
  );

  if (item) {
    item.qty = Math.min(99, item.qty + qty);   
  } else {
    cart.push({ id, size, color, qty });       
  }
  saveCart(cart);
}

window.addEventListener('storage', updateCartCount);
updateCartCount();

const loginDialog = document.getElementById('login-dialog');
const loginForm = document.getElementById('login-form');

function setLoginError(input, message) {
  document.getElementById(`${input.id}-error`).textContent = message;
  input.classList.toggle('is-invalid', Boolean(message));
  input.setAttribute('aria-invalid', String(Boolean(message)));
  return !message;
}

function validateLoginEmail(input) {
  const value = input.value.trim();
  if (!value) return setLoginError(input, 'Please enter your email.');
  if (!EMAIL_REGEX.test(value)) return setLoginError(input, 'Please enter a valid email address.');
  return setLoginError(input, '');
}

function validateLoginPassword(input) {
  return setLoginError(input, input.value ? '' : 'Please enter your password.');
}

function resetLoginForm() {
  loginForm.reset();
  loginForm.querySelectorAll('.form-input').forEach((input) => {
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    document.getElementById(`${input.id}-error`).textContent = '';
  });
  setPasswordVisible(false);
}

function setPasswordVisible(visible) {
  const input = document.getElementById('login-password');
  const toggle = loginForm.querySelector('.password-toggle');
  input.type = visible ? 'text' : 'password';
  toggle.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
  toggle.firstElementChild.className = visible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
}

if (loginDialog && loginForm) {
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  document.querySelector('[data-open-login]')?.addEventListener('click', () => {
    loginDialog.showModal();
  });

  loginDialog.addEventListener('click', (event) => {
    if (event.target === loginDialog) loginDialog.close();
  });

  loginDialog.addEventListener('close', resetLoginForm);

  emailInput.addEventListener('input', () => validateLoginEmail(emailInput));
  emailInput.addEventListener('blur', () => validateLoginEmail(emailInput));
  passwordInput.addEventListener('input', () => validateLoginPassword(passwordInput));

  loginForm.querySelector('.password-toggle').addEventListener('click', () => {
    setPasswordVisible(passwordInput.type === 'password');
  });

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const emailOk = validateLoginEmail(emailInput);
    const passwordOk = validateLoginPassword(passwordInput);

    if (!emailOk) return emailInput.focus();
    if (!passwordOk) return passwordInput.focus();

    loginDialog.close();   // validation is successful - window is closing
  });
}
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function renderStars(rating) {
  const full = Math.round(rating);
  return Array.from({ length: 5 }, (_, i) =>
    `<i class="${i < full ? 'fa-solid' : 'fa-regular'} fa-star"></i>`
  ).join('');
}