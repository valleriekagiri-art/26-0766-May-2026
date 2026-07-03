/* ══════════════════════════════════════════
   Val's Online Jewelry — scripts.js
   Popups (welcome, promo, fixture) + Registration form
══════════════════════════════════════════ */

/* ─────────────────────────────────────────
   1. POPUP SYSTEM
───────────────────────────────────────── */

function openPopup(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePopup(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

/* Close popup when clicking the dark overlay (outside the box) */
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('popup-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

/* Close on Escape key */
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.popup-overlay.active').forEach(function (el) {
            el.classList.remove('active');
        });
        document.body.style.overflow = '';
    }
});

/* Auto-show welcome popup after 800 ms on page load */
window.addEventListener('load', function () {
    setTimeout(function () {
        openPopup('popup-welcome');
    }, 800);
});


/* ─────────────────────────────────────────
   2. REGISTRATION FORM VALIDATION
───────────────────────────────────────── */

/* ── Helpers ── */
function showError(inputEl, msgEl, message) {
    inputEl.classList.remove('valid');
    inputEl.classList.add('invalid');
    msgEl.textContent = message;
    msgEl.classList.add('visible');

    // hide any success msg sibling
    const sib = inputEl.parentElement.querySelector('.success-msg');
    if (sib) sib.classList.remove('visible');
}

function showSuccess(inputEl, msgEl, message) {
    inputEl.classList.remove('invalid');
    inputEl.classList.add('valid');
    msgEl.classList.remove('visible');

    const sib = inputEl.parentElement.querySelector('.success-msg');
    if (sib) {
        sib.textContent = message || '✓ Looks good!';
        sib.classList.add('visible');
    }
}

function clearState(inputEl, errEl) {
    inputEl.classList.remove('valid', 'invalid');
    if (errEl) errEl.classList.remove('visible');
    const sib = inputEl.parentElement.querySelector('.success-msg');
    if (sib) sib.classList.remove('visible');
}

/* ── Validators ── */
function validateName(value) {
    if (!value.trim()) return 'Name is required.';
    if (value.trim().length < 2) return 'Name must be at least 2 characters.';
    if (!/^[a-zA-Z\s\-']+$/.test(value.trim())) return 'Name can only contain letters, spaces, hyphens or apostrophes.';
    return null;
}

function validateEmail(value) {
    if (!value.trim()) return 'Email is required.';
    /* Basic RFC-style check */
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())) return 'Enter a valid email address (e.g. val@gmail.com).';
    return null;
}

function validatePhone(value) {
    if (!value.trim()) return 'Phone number is required.';
    /* Accept formats: 07XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX (10-13 digits) */
    const cleaned = value.replace(/[\s\-()]/g, '');
    if (!/^(\+?254|0)[17]\d{8}$/.test(cleaned)) {
        return 'Enter a valid Kenyan number (e.g. 0788 945 632 or +254788945632).';
    }
    return null;
}

function validateGender(value) {
    if (!value) return 'Please select your gender.';
    return null;
}

/* ── Live validation (on blur / change) ── */
function attachLiveValidation() {
    const fields = [
        { id: 'reg-name',   errId: 'err-name',   fn: validateName   },
        { id: 'reg-email',  errId: 'err-email',  fn: validateEmail  },
        { id: 'reg-phone',  errId: 'err-phone',  fn: validatePhone  },
        { id: 'reg-gender', errId: 'err-gender', fn: validateGender },
    ];

    fields.forEach(function (f) {
        const el  = document.getElementById(f.id);
        const err = document.getElementById(f.errId);
        if (!el || !err) return;

        const eventType = el.tagName === 'SELECT' ? 'change' : 'blur';

        el.addEventListener(eventType, function () {
            const error = f.fn(el.value);
            if (error) {
                showError(el, err, error);
            } else {
                showSuccess(el, err);
            }
        });

        /* Clear red state while typing (so it isn't distracting mid-type) */
        if (el.tagName !== 'SELECT') {
            el.addEventListener('input', function () {
                if (el.classList.contains('invalid')) {
                    clearState(el, err);
                }
            });
        }
    });
}

/* ── Form submission ── */
async function handleFormSubmit(e) {
    e.preventDefault();

    const fields = [
        { id: 'reg-name',   errId: 'err-name',   fn: validateName   },
        { id: 'reg-email',  errId: 'err-email',  fn: validateEmail  },
        { id: 'reg-phone',  errId: 'err-phone',  fn: validatePhone  },
        { id: 'reg-gender', errId: 'err-gender', fn: validateGender },
    ];

    let allValid = true;

    fields.forEach(function (f) {
        const el  = document.getElementById(f.id);
        const err = document.getElementById(f.errId);
        if (!el || !err) return;

        const error = f.fn(el.value);
        if (error) {
            showError(el, err, error);
            allValid = false;
        } else {
            showSuccess(el, err);
        }
    });

    if (!allValid) return;

    const banner = document.getElementById('form-success-banner');

    const { error } = await supabaseClient
        .from('customers')
        .insert([{
            full_name: document.getElementById('reg-name').value.trim(),
            email: document.getElementById('reg-email').value.trim(),
            phone: document.getElementById('reg-phone').value.trim(),
            gender: document.getElementById('reg-gender').value
        }]);

    if (error) {
        console.error('Supabase error:', error);
        if (banner) {
            banner.innerHTML = '⚠️ Something went wrong. Please try again.';
            banner.classList.add('visible');
        }
        return;
    }

    const name = document.getElementById('reg-name').value.trim().split(' ')[0];
    if (banner) {
        banner.innerHTML = '💍 Thank you, <strong>' + name + '</strong>! You\'re now registered with Val\'s Online Jewelry.<br>We\'ll be in touch with exclusive deals!';
        banner.classList.add('visible');
    }

    document.getElementById('reg-form').reset();
    fields.forEach(function (f) {
        const el  = document.getElementById(f.id);
        const err = document.getElementById(f.errId);
        clearState(el, err);
    });
}

/* ── Init on DOM ready ── */
document.addEventListener('DOMContentLoaded', function () {
    attachLiveValidation();

    const form = document.getElementById('reg-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});
