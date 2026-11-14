/* global BASE, loadProducts, getCart, saveCart */
const SHIPPING = 30;
const DISCOUNT_LIMIT = 3000;
const DISCOUNT_RATE = 0.1;
const EMPTY_TEXT = 'Your cart is empty. Use the catalog to add new items.';
const THANKS_TEXT = 'Thank you for your purchase.';

const els = {
  content: document.getElementById('cart-content'),
  body: document.getElementById('cart-body'),
  status: document.getElementById('cart-status'),
  subtotal: document.getElementById('cart-subtotal'),
  discount: document.getElementById('cart-discount'),
  shipping: document.getElementById('cart-shipping'),
  total: document.getElementById('cart-total'),
};

let products = [];

const money = (n) => `$${+n.toFixed(2)}`;
const keyOf = (item) => `${item.id}|${item.size || ''}|${item.color || ''}`;

function showStatus(text) {
  els.content.hidden = true;
  els.status.textContent = text;
  els.status.hidden = false;
}

function renderRow(item, product) {
  const row = document.createElement('tr');
  row.dataset.key = keyOf(item);

  const details = [item.size, item.color].filter(Boolean).join(', ');

  row.innerHTML = `
    <td data-label="Image">
      <img class="cart-image" src="${BASE}${product.imageUrl}" alt="${product.name}" />
    </td>
    <th scope="row" data-label="Product name">
      <a href="${BASE}html/product.html?id=${product.id}">${product.name}</a>
      ${details ? `<small class="cart-variant">${details}</small>` : ''}
    </th>
    <td data-label="Price">${money(product.price)}</td>
    <td data-label="Quantity">
      <span class="cart-qty">
        <button type="button" data-action="dec" aria-label="Decrease quantity">-</button>
        <output>${item.qty}</output>
        <button type="button" data-action="inc" aria-label="Increase quantity">+</button>
      </span>
    </td>
    <td data-label="Total">${money(product.price * item.qty)}</td>
    <td data-label="Delete">
      <button class="cart-remove" type="button" data-action="remove" aria-label="Remove ${product.name}">
        <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
      </button>
    </td>
  `;
  return row;
}

function render() {
  const cart = getCart().filter((item) => products.some((p) => p.id === item.id));

  if (!cart.length) {
    showStatus(EMPTY_TEXT);
    return;
  }

  els.status.hidden = true;
  els.content.hidden = false;

  let subtotal = 0;
  const rows = cart.map((item) => {
    const product = products.find((p) => p.id === item.id);
    subtotal += product.price * item.qty;
    return renderRow(item, product);
  });
  els.body.replaceChildren(...rows);

  const discount = subtotal > DISCOUNT_LIMIT ? subtotal * DISCOUNT_RATE : 0;
  const total = subtotal - discount + SHIPPING;

  els.subtotal.textContent = money(subtotal);
  els.shipping.textContent = money(SHIPPING);
  els.total.textContent = money(total);
  els.discount.textContent = money(discount);
  document.querySelectorAll('.cart-discount').forEach((el) => (el.hidden = discount === 0));
}

function changeCart(key, change) {
  const cart = getCart();
  const index = cart.findIndex((item) => keyOf(item) === key);
  if (index === -1) return;

  if (change === 'remove') {
    cart.splice(index, 1);
  } else {
    const qty = cart[index].qty + (change === 'inc' ? 1 : -1);
    cart[index].qty = Math.min(99, Math.max(1, qty));
  }
  saveCart(cart); 
  render();
}

els.body.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  changeCart(button.closest('tr').dataset.key, button.dataset.action);
});

document.getElementById('cart-clear').addEventListener('click', () => {
  saveCart([]);
  showStatus(EMPTY_TEXT);
});

document.getElementById('cart-checkout').addEventListener('click', () => {
  saveCart([]);
  showStatus(THANKS_TEXT);
});

window.addEventListener('storage', render);   

(async function init() {
  try {
    products = await loadProducts();   
    render();
  } catch (error) {
    console.error(error);
    showStatus('Failed to load the cart.');
  }
})();