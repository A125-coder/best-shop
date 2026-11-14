/* global BASE, loadProducts, createProductCard, addToCart, defaultSize, shuffle, renderStars */
const productId = new URLSearchParams(location.search).get('id');

function fillSelect(select, values) {
  select.replaceChildren(
    new Option('Choose option', ''),
    ...values.map((v) => new Option(v, v))
  );
}

function renderGallery(product) {
  const main = document.getElementById('product-main-image');
  const thumbs = document.getElementById('product-thumbs');

  // Main image + additional photos
  const images = [
    product.imageUrl,
    ...(product.gallery || [])
  ].filter(Boolean);

  // Set main image
  main.src = BASE + images[0];

  // Generate thumbnails
  thumbs.replaceChildren(
    ...images.map((src, i) => {
      const li = document.createElement('li');

      const button = document.createElement('button');
      button.type = 'button';
      button.classList.toggle('active', i === 0);
      button.setAttribute('aria-label', `Photo ${i + 1}`);

      const img = document.createElement('img');
      img.src = BASE + src;
      img.alt = '';

      button.append(img);
      li.append(button);

      button.addEventListener('click', () => {
        main.src = BASE + src;

        thumbs.querySelectorAll('button').forEach((btn) => {
          btn.classList.remove('active');
        });

        button.classList.add('active');
      });

      return li;
    })
  );
}

function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on);
        document.getElementById(t.dataset.tab).hidden = !on;
      });
    })
  );
}

function getReviews(product) {
  const key = `reviews-${product.id}`;

  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function saveReviews(product, reviews) {
  localStorage.setItem(`reviews-${product.id}`, JSON.stringify(reviews));
}

function renderReviewStars(rating) {
  return Array.from({ length: 5 }, (_, i) =>
    `<i class="${i < rating ? 'fa-solid' : 'fa-regular'} fa-star"></i>`
  ).join('');
}

function renderReviews(product) {
  const reviews = getReviews(product);

  const title = document.getElementById('reviews-title');
  const list = document.getElementById('reviews-list');

  title.textContent = `${reviews.length} ${
    reviews.length === 1 ? 'review' : 'reviews'
  } for ${product.name}`;

  if (!reviews.length) {
    list.innerHTML = `
      <p class="reviews-empty">
        No reviews yet. Be the first to review this product!
      </p>
    `;
    return;
  }

  list.replaceChildren(
    ...reviews.map((review) => {
      const item = document.createElement('article');
      item.className = 'review-item';

      const avatar = document.createElement('span');
      avatar.className = 'review-avatar';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = review.name.charAt(0).toUpperCase();

      const content = document.createElement('span');
      content.className = 'review-content';

      const meta = document.createElement('span');
      meta.className = 'review-meta';

      const author = document.createElement('span');
      author.className = 'review-author';
      author.textContent = review.name;

      const date = document.createElement('span');
      date.className = 'review-date';
      date.textContent = review.date;

      const stars = document.createElement('span');
      stars.className = 'review-stars';
      stars.innerHTML = renderReviewStars(review.rating);

      const text = document.createElement('p');
      text.className = 'review-text';
      text.textContent = review.text;

      meta.append(author, date, stars);
      content.append(meta, text);
      item.append(avatar, content);

      return item;
    })
  );
}

function initReviewForm(product) {
  const form = document.getElementById('review-form');
  const message = document.getElementById('review-message');

  const ratingInputs = form.querySelectorAll('input[name="rating"]');
  const ratingLabels = form.querySelectorAll('.rating-options label');

  function updateRatingHover(value) {
    ratingLabels.forEach((label, index) => {
        label.classList.toggle('is-filled', index < value);
    });
  }

  ratingLabels.forEach((label, index) => {
    label.addEventListener('mouseenter', () => {
      updateRatingHover(index + 1);
    });
  });

  document.querySelector('.rating-options').addEventListener('mouseleave', () => {
    const selected = form.querySelector('input[name="rating"]:checked');
    updateRatingHover(selected ? Number(selected.value) : 0);
  });

  ratingInputs.forEach((input) => {
    input.addEventListener('change', () => {
      updateRatingHover(Number(input.value));
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const formData = new FormData(form);

    const review = {
      name: formData.get('name').trim(),
      rating: Number(formData.get('rating')),
      text: formData.get('review').trim(),
      date: `/ ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
    };

    if (!review.name || !review.text || review.rating < 1 || review.rating > 5) {
      message.textContent = 'Please complete all required fields.';
      return;
    }

    const reviews = getReviews(product);
    reviews.push(review);

    saveReviews(product, reviews);
    renderReviews(product);

    form.reset();
    updateRatingHover(0);

    message.textContent = 'Thank you! Your review has been added.';
  });
}

function initQty(product) {
  const input = document.getElementById('qty-input');
  const clamp = (n) => Math.min(99, Math.max(1, n || 1));

  document.getElementById('qty-minus').addEventListener('click', () => (input.value = clamp(+input.value - 1)));
  document.getElementById('qty-plus').addEventListener('click', () => (input.value = clamp(+input.value + 1)));

  document.getElementById('product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const size = document.getElementById('product-size').value || defaultSize(product);
    const color = document.getElementById('product-color').value || product.color;
    addToCart(product.id, clamp(+input.value), size, color);
  });
}

(async function init() {
  try {
    const products = await loadProducts();
    const product = products.find((p) => p.id === productId) || products[0];

    document.title = product.name;
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-price').textContent = `$${product.price}`;
    document.getElementById('product-stars').innerHTML = renderStars(product.rating);

    fillSelect(document.getElementById('product-size'), product.size.split(',').map((s) => s.trim()));
    fillSelect(document.getElementById('product-color'), [product.color]);
    fillSelect(document.getElementById('product-category'), [product.category]);

    renderGallery(product);
    initTabs();
    initQty(product);

    renderReviews(product);
    initReviewForm(product);

    const related = shuffle(products.filter((p) => p.id !== product.id)).slice(0, 4);
      document.getElementById('related-list').replaceChildren(
      ...related.map((p) => createProductCard(p, { withCart: true }))
    );
  } catch (error) {
    console.error(error);
  }
})();