/* global EMAIL_REGEX */
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');

const RULES = {
  name: (value) => (value.trim() ? '' : 'Please enter your name.'),
  email: (value) => {
    if (!value.trim()) return 'Please enter your email.';
    return EMAIL_REGEX.test(value.trim()) ? '' : 'Please enter a valid email address.';
  },
  topic: (value) => (value.trim() ? '' : 'Please enter a topic.'),
  message: (value) => (value.trim() ? '' : 'Please enter your message.'),
};

function validateField(field) {
  const error = RULES[field.name](field.value);
  const errorEl = document.getElementById(`${field.name}-error`);

  errorEl.textContent = error;
  field.classList.toggle('is-invalid', Boolean(error));
  field.classList.toggle('is-valid', !error);
  field.setAttribute('aria-invalid', String(Boolean(error)));
  return !error;
}

function showStatus(text, type) {
  statusEl.textContent = text;
  statusEl.className = `form-status is-${type}`;
}

form.querySelectorAll('.form-input').forEach((field) => {
  field.addEventListener('input', () => validateField(field));
  field.addEventListener('blur', () => validateField(field));
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const fields = [...form.querySelectorAll('.form-input')];
  const results = fields.map(validateField);   

  if (results.includes(false)) {
    showStatus('Please fix the errors and try again.', 'error');
    fields[results.indexOf(false)].focus();
    return;
  }

  form.reset();
  fields.forEach((field) => {
    field.classList.remove('is-valid', 'is-invalid');
    field.removeAttribute('aria-invalid');
  });
  showStatus('Thank you! Your message has been sent. We will contact you soon.', 'success');
});