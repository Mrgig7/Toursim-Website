/* ============================================
   TOURISM WEBSITE - SCRIPT.JS
   JavaScript for interactions, form validation,
   GA4 event tracking, and animations
   ============================================ */

// =============================================
// 1. NAVIGATION - Mobile menu & scroll effects
// =============================================

/** Toggle mobile navigation menu */
function initNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navbar = document.querySelector('.navbar');

  // Mobile menu open/close
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.textContent = '☰';
      });
    });
  }

  // Navbar background on scroll
  window.addEventListener('scroll', () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
  });
}

// =============================================
// 2. GA4 EVENT TRACKING HELPERS
// =============================================

/**
 * Safely send a GA4 event via gtag().
 * Falls back silently if gtag is not loaded.
 *
 * @param {string} eventName  - GA4 event name (e.g. 'book_now_click')
 * @param {object} params     - Additional event parameters
 */
function trackEvent(eventName, params = {}) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
    console.log('[GA4] Event tracked:', eventName, params);
  } else {
    console.log('[GA4] gtag not available — event:', eventName);
  }
}

// =============================================
// 3. NAVIGATION CLICK TRACKING
// =============================================

/** Track clicks on navigation links → event: nav_click */
function initNavTracking() {
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      trackEvent('nav_click', {
        event_category: 'navigation',
        event_label: link.textContent.trim(),
        link_url: link.getAttribute('href')
      });
    });
  });
}

// =============================================
// 4. "BOOK NOW" BUTTON TRACKING
// =============================================

/** Track all Book Now button clicks → event: book_now_click */
function initBookNowTracking() {
  document.querySelectorAll('.btn-book-now').forEach(button => {
    button.addEventListener('click', (e) => {
      // Get the destination name from the closest card, if available
      const card = button.closest('.card');
      const destination = card
        ? card.querySelector('.card-title')?.textContent || 'Unknown'
        : 'Hero CTA';

      trackEvent('book_now_click', {
        event_category: 'engagement',
        event_label: destination
      });

      // Show a small toast notification
      showToast(`Redirecting to book ${destination}...`);
    });
  });
}

// =============================================
// 5. SCROLL DEPTH TRACKING (50%)
// =============================================

/** Track when user scrolls past 50% of the page → event: scroll_50 */
function initScrollTracking() {
  let scrollTracked = false;

  window.addEventListener('scroll', () => {
    if (scrollTracked) return;

    const scrollPercent =
      (window.scrollY + window.innerHeight) /
      document.documentElement.scrollHeight;

    if (scrollPercent >= 0.5) {
      scrollTracked = true;
      trackEvent('scroll_50', {
        event_category: 'engagement',
        event_label: document.title,
        percent_scrolled: 50
      });
    }
  });
}

// =============================================
// 6. FORM VALIDATION & SUBMISSION
// =============================================

/**
 * Validates a form field and shows/hides error messages.
 * @param {HTMLElement} field  - The input/select element
 * @param {string} message    - Error message to display
 * @returns {boolean}         - true if valid
 */
function validateField(field, message) {
  const group = field.closest('.form-group');
  const errorEl = group?.querySelector('.form-error');

  if (!field.value.trim()) {
    group?.classList.add('error');
    if (errorEl) errorEl.textContent = message;
    return false;
  }

  // Email-specific validation
  if (field.type === 'email' && field.value.trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(field.value.trim())) {
      group?.classList.add('error');
      if (errorEl) errorEl.textContent = 'Please enter a valid email address';
      return false;
    }
  }

  group?.classList.remove('error');
  return true;
}

/** Initialize form validation and submission tracking */
function initFormHandling() {
  const form = document.getElementById('booking-form') ||
               document.getElementById('contact-form');

  if (!form) return;

  // Clear error state on input
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.closest('.form-group')?.classList.remove('error');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Validate each required field
    form.querySelectorAll('[required]').forEach(field => {
      const label = field.closest('.form-group')?.querySelector('label')?.textContent || 'This field';
      if (!validateField(field, `${label} is required`)) {
        isValid = false;
      }
    });

    if (!isValid) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Collect form data for tracking
    const formData = new FormData(form);
    const destination = formData.get('destination') || 'N/A';

    // Track form submission → event: form_submit
    trackEvent('form_submit', {
      event_category: 'conversion',
      event_label: form.id === 'booking-form' ? 'Booking Form' : 'Contact Form',
      destination: destination
    });

    // Show success confirmation
    showToast('🎉 Submitted successfully! We\'ll be in touch soon.');

    // Reset form after short delay
    setTimeout(() => form.reset(), 1500);
  });
}

// =============================================
// 7. TOAST NOTIFICATION SYSTEM
// =============================================

/**
 * Display a toast notification at the bottom-right.
 * @param {string} message - Text to display
 * @param {string} type    - 'success' (default) or 'error'
 */
function showToast(message, type = 'success') {
  // Remove any existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  if (type === 'error') {
    toast.style.borderColor = '#ef4444';
  }

  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto-dismiss after 3.5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// =============================================
// 8. SCROLL-TRIGGERED ANIMATIONS
// =============================================

/** Animate elements as they enter the viewport */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger animations slightly
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach(el => observer.observe(el));
}

// =============================================
// 9. ACTIVE NAV LINK HIGHLIGHTING
// =============================================

/** Highlight the current page's nav link */
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// =============================================
// 10. INITIALIZE EVERYTHING ON DOM READY
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initNavTracking();
  initBookNowTracking();
  initScrollTracking();
  initFormHandling();
  initScrollAnimations();
  setActiveNavLink();

  console.log('[Tourism Website] All modules initialized ✓');
});
