/* global loadProducts, createProductCard */
function renderBlock(listId, products, options) {
  const list = document.getElementById(listId);
  if (!list) return;
  list.replaceChildren(...products.map((p) => createProductCard(p, options)));
}

async function initHome() {
  try {
    const products = await loadProducts();
    const byBlock = (name) => products.filter((p) => p.blocks.includes(name));

    renderBlock('selected-list', byBlock('Selected Products'), { withCart: true });
    renderBlock('new-list', byBlock('New Products Arrival'));
  } catch (error) {
    console.error(error);
  }
}

initHome();

function initTravelSlider() {
  const list = document.getElementById('travel-list');
  if (!list) return;

  const prev = document.querySelector('.slider-prev');
  const next = document.querySelector('.slider-next');
  const slider = list.closest('.travel-slider');
  const DELAY = 3000;
  let timer = null;

  const step = () => list.firstElementChild.getBoundingClientRect().width + 24;
  const maxScroll = () => list.scrollWidth - list.clientWidth;

  function goNext() {
    if (list.scrollLeft >= maxScroll() - 1) {
      list.scrollTo({ left: 0 });
    } else {
      list.scrollBy({ left: step() });
    }
  }

  function goPrev() {
    if (list.scrollLeft <= 1) {
      list.scrollTo({ left: maxScroll() });
    } else {
      list.scrollBy({ left: -step() });
    }
  }

  function start() {
    stop();
    if (maxScroll() > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timer = setInterval(goNext, DELAY);
    }
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  function update() {
    const scrollable = maxScroll() > 1;
    prev.hidden = next.hidden = !scrollable;   
  }

  prev.addEventListener('click', () => { goPrev(); start(); });
  next.addEventListener('click', () => { goNext(); start(); });

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusin', stop);
  slider.addEventListener('focusout', start);

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  window.addEventListener('resize', () => { update(); start(); });

  update();
  start();
}

initTravelSlider();