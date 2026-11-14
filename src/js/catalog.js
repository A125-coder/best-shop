/* global BASE, loadProducts, createProductCard, shuffle, renderStars */
const PER_PAGE = 12;

const FILTERS = [
  { key: 'size', label: 'Size' },
  { key: 'color', label: 'Color' },
  { key: 'category', label: 'Category' },
  { key: 'salesStatus', label: 'Sales', type: 'checkbox' },
];

const state = {
  filters: { category: '', color: '', size: '', salesStatus: '' },
  sort: 'default',
  page: 1,
};
let allProducts = [];

const listEl = document.getElementById('catalog-list');
const countEl = document.getElementById('catalog-count');
const pagEl = document.getElementById('pagination');
const filtersEl = document.getElementById('filters-list');
const sortEl = document.getElementById('catalog-sort');
const searchForm = document.getElementById('catalog-search-form');
const searchInput = document.getElementById('catalog-search');
const notFoundDialog = document.getElementById('not-found-dialog');

const capitalize = (text) => String(text).charAt(0).toUpperCase() + String(text).slice(1);

// ---------- data ----------
function getVisible() {
  const list = allProducts.filter((product) =>
    FILTERS.every(({ key }) => !state.filters[key] || String(product[key]) === state.filters[key])
  );

  const sorters = {
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    popularity: (a, b) => b.popularity - a.popularity,
    rating: (a, b) => b.rating - a.rating,
  };
  if (sorters[state.sort]) list.sort(sorters[state.sort]);
  return list;
}

// ---------- filters ----------
function buildFilters() {
  filtersEl.replaceChildren(
    ...FILTERS.map((filter) => {
      const item = document.createElement('li');
      item.className = 'filter';
      item.dataset.key = filter.key;

      const label = document.createElement('span');
      label.className = 'filter-label';
      label.textContent = filter.label;
      item.append(label);

      if (filter.type === 'checkbox') {
        const wrap = document.createElement('label');
        wrap.className = 'filter-check';
        wrap.innerHTML = '<input type="checkbox" /><span class="visually-hidden">Only products on sale</span>';
        wrap.firstElementChild.addEventListener('change', (event) => {
          state.filters[filter.key] = event.target.checked ? 'true' : '';
          state.page = 1;
          render();
        });
        item.append(wrap);
        return item;
      }

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'filter-toggle';
      toggle.setAttribute('aria-haspopup', 'true');
      toggle.innerHTML = '<span>Choose option</span><i class="fa-solid fa-angle-down" aria-hidden="true"></i>';

      const menu = document.createElement('ul');
      menu.className = 'filter-menu';

      const options = [...new Set(allProducts.map((product) => product[filter.key]))];
      options.forEach((value) => {
        const row = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'filter-option';
        button.dataset.value = String(value);
        button.textContent = capitalize(value);
        button.addEventListener('click', () => setFilter(filter.key, String(value)));
        row.append(button);
        menu.append(row);
      });

      item.append(toggle, menu);
      return item;
    })
  );
}

function syncFilters() {
  filtersEl.querySelectorAll('.filter').forEach((item) => {
    const key = item.dataset.key;
    const selected = state.filters[key];
    const checkbox = item.querySelector('input[type="checkbox"]');

    if (checkbox) {
      checkbox.checked = selected === 'true';
      return;
    }

    const toggle = item.querySelector('.filter-toggle');
    toggle.classList.toggle('is-active', Boolean(selected));
    toggle.firstElementChild.textContent = selected
      ? item.querySelector(`[data-value="${selected}"]`).textContent
      : 'Choose option';

    item.querySelectorAll('.filter-option').forEach((button) => {
      button.classList.toggle('is-selected', button.dataset.value === selected);
    });
  });
}

function setFilter(key, value) {
  state.filters[key] = state.filters[key] === value ? '' : value;
  state.page = 1;
  syncFilters();
  render();
}

function resetAll() {
  Object.keys(state.filters).forEach((key) => (state.filters[key] = ''));
  state.sort = 'default';
  state.page = 1;
  sortEl.value = 'default';
  searchInput.value = '';
  syncFilters();
  render();
}

// ---------- apperance ----------
function render() {
  const visible = getVisible();
  const pages = Math.max(1, Math.ceil(visible.length / PER_PAGE));
  state.page = Math.min(state.page, pages);

  const start = (state.page - 1) * PER_PAGE;
  const slice = visible.slice(start, start + PER_PAGE);

  listEl.replaceChildren(...slice.map((p) => createProductCard(p, { withCart: true })));

  countEl.textContent = slice.length
    ? `Showing ${start + 1}–${start + slice.length} of ${visible.length} results`
    : 'No results';

  renderPagination(pages);
}

function pageButton(className, html, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.innerHTML = html;
  button.addEventListener('click', onClick);
  return button;
}

function renderPagination(pages) {
  pagEl.replaceChildren();
  if (pages <= 1) return;

  const numbers = document.createElement('div');
  numbers.className = 'page-numbers';

  for (let i = 1; i <= pages; i++) {
    const button = pageButton('page-btn', i, () => goToPage(i));
    button.classList.toggle('active', i === state.page);
    if (i === state.page) button.setAttribute('aria-current', 'page');
    numbers.append(button);
  }

  const children = [numbers];

  if (state.page > 1) {
    children.unshift(
      pageButton('page-prev', '<i class="fa-solid fa-angle-left" aria-hidden="true"></i> Prev', () =>
        goToPage(state.page - 1)
      )
    );
  }
  if (state.page < pages) {
    children.push(
      pageButton('page-next', 'Next <i class="fa-solid fa-angle-right" aria-hidden="true"></i>', () =>
        goToPage(state.page + 1)
      )
    );
  }

  pagEl.append(...children);
}

function goToPage(page) {
  state.page = page;
  render();
  listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------- events ----------
sortEl.addEventListener('change', (event) => {
  state.sort = event.target.value;
  state.page = 1;
  render();
});

document.getElementById('filter-reset').addEventListener('click', resetAll);

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return;

  const found =
    allProducts.find((p) => p.name.toLowerCase() === query) ||
    allProducts.find((p) => p.name.toLowerCase().includes(query));

  if (found) {
    location.href = `${BASE}html/product.html?id=${found.id}`;
  } else {
    notFoundDialog.showModal();
  }
});

notFoundDialog.addEventListener('click', (event) => {
  if (event.target === notFoundDialog) notFoundDialog.close();
});

const filtersPanel = document.getElementById('catalog-filters');
const filtersToggle = document.getElementById('filters-toggle');

function toggleFilters() {
  filtersPanel.hidden = !filtersPanel.hidden;
  filtersToggle.setAttribute('aria-expanded', String(!filtersPanel.hidden));
}

filtersToggle.addEventListener('click', toggleFilters);
document.getElementById('filter-hide').addEventListener('click', toggleFilters);

(async function init() {
  try {
    allProducts = await loadProducts();
    buildFilters();
    syncFilters();
    render();
  } catch (error) {
    console.error(error);
    countEl.textContent = 'Failed to load products';
  }
})();