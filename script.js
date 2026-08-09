/* ==========================================================
   GOLDEN CRUST BAKERY & CAFÉ — script.js
   ==========================================================
   TEACHING NOTES
   This file adds BEHAVIOUR on top of the HTML structure and CSS
   presentation: things that happen in response to the visitor
   doing something (clicking, typing, scrolling).

   It's organised into small, separate features. Each one:
     1. grabs the element(s) it needs with document.querySelector
     2. listens for an event (click, submit, scroll...)
     3. reacts to that event

   We wrap the whole file in a 'DOMContentLoaded' listener so
   none of this code runs until the browser has finished
   building the page and every element actually exists.
   ========================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* --------------------------------------------------------
     FEATURE 1 — Mobile navigation toggle
     --------------------------------------------------------
     The hamburger button (#navToggle) shows/hides the off-canvas
     menu (#primaryNav) by adding or removing the "is-open" CSS
     class we defined in styles.css. We also flip the button's
     aria-expanded attribute so screen readers know whether the
     menu is currently open or closed.
  -------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');

  function closeMenu() {
    primaryNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  }

  function toggleMenu() {
    const isOpen = primaryNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  navToggle.addEventListener('click', toggleMenu);

  // Close the mobile menu automatically once a visitor taps a
  // link inside it — otherwise the drawer stays open and covers
  // the section they just navigated to.
  primaryNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });


  /* --------------------------------------------------------
     FEATURE 2 — Highlight the active nav link while scrolling
     --------------------------------------------------------
     As the visitor scrolls past each <section>, we want the
     matching nav link to look "active". The IntersectionObserver
     API is the modern, efficient way to detect "is this element
     currently visible on screen?" — much better for performance
     than manually checking scroll position on every scroll event.
  -------------------------------------------------------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.primary-nav a[href^="#"]');

  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      // entry.isIntersecting is true when the section is on screen.
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');

        navLinks.forEach(function (link) {
          const linkMatches = link.getAttribute('href') === '#' + id;
          link.classList.toggle('active-link', linkMatches);
        });
      }
    });
  }, {
    // Treat a section as "current" once it's crossed roughly the
    // middle of the viewport — feels more natural than the exact
    // top edge.
    rootMargin: '-45% 0px -45% 0px'
  });

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });


  /* --------------------------------------------------------
     FEATURE 3 — "Back to top" button behaviour
     --------------------------------------------------------
     The link already works via plain HTML (href="#top"), so
     this is just a small visual touch: only show the button
     once the visitor has scrolled down a bit.
  -------------------------------------------------------- */
  const backToTop = document.getElementById('backToTop');

  function updateBackToTopVisibility() {
    const scrolledPastHero = window.scrollY > 400;
    backToTop.style.opacity = scrolledPastHero ? '1' : '0';
    backToTop.style.pointerEvents = scrolledPastHero ? 'auto' : 'none';
  }

  // Give the button a starting state, then keep it updated as
  // the visitor scrolls.
  backToTop.style.transition = 'opacity 0.2s ease';
  updateBackToTopVisibility();
  window.addEventListener('scroll', updateBackToTopVisibility);


  /* --------------------------------------------------------
     FEATURE 4 — Contact form validation (no backend needed)
     --------------------------------------------------------
     We use "novalidate" on the <form> in HTML so the BROWSER'S
     default validation bubbles don't fire — instead we run our
     own checks here and write friendly messages into the
     .field-error <span> elements we placed next to each input.
     This is the pattern real projects follow when they want
     validation styled to match their own design.
  -------------------------------------------------------- */
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  const fields = {
    name: {
      input: document.getElementById('name'),
      error: document.getElementById('nameError'),
      validate: function (value) {
        return value.trim().length > 0 ? '' : 'Please enter your name.';
      }
    },
    email: {
      input: document.getElementById('email'),
      error: document.getElementById('emailError'),
      validate: function (value) {
        // A simple, readable email pattern — good enough for
        // front-end sanity checking (real verification always
        // still has to happen on a server).
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value.trim().length === 0) return 'Please enter your email.';
        if (!pattern.test(value.trim())) return 'That email address doesn\u2019t look right.';
        return '';
      }
    },
    message: {
      input: document.getElementById('message'),
      error: document.getElementById('messageError'),
      validate: function (value) {
        return value.trim().length >= 10 ? '' : 'Please write at least 10 characters.';
      }
    }
  };

  // Validate a single field and display/clear its error message.
  // Returns true if the field is valid.
  function validateField(field) {
    const message = field.validate(field.input.value);
    field.error.textContent = message;
    return message === '';
  }

  // Live feedback: re-validate a field as soon as the visitor
  // leaves it (the "blur" event), rather than waiting until they
  // try to submit the whole form.
  Object.values(fields).forEach(function (field) {
    field.input.addEventListener('blur', function () {
      validateField(field);
    });
  });

  form.addEventListener('submit', function (event) {
    // Stop the browser from actually submitting/reloading the
    // page — this is a front-end-only demo with nowhere to send
    // the data.
    event.preventDefault();

    // Run every field's validation and remember if ANY of them failed.
    let formIsValid = true;
    Object.values(fields).forEach(function (field) {
      const fieldIsValid = validateField(field);
      if (!fieldIsValid) {
        formIsValid = false;
      }
    });

    if (formIsValid) {
      formStatus.textContent = 'Thanks! Your message has been sent — we\u2019ll reply within one business day.';
      formStatus.className = 'form-status success';
      form.reset();
    } else {
      formStatus.textContent = 'Please fix the highlighted fields and try again.';
      formStatus.className = 'form-status error';
    }
  });


  /* --------------------------------------------------------
     FEATURE 5 — Dynamic copyright year
     --------------------------------------------------------
     A classic beginner-friendly trick: instead of hard-coding
     "2026" in the footer (and forgetting to update it every
     January), we let JavaScript read the visitor's current date
     and insert the year automatically.
  -------------------------------------------------------- */
  document.getElementById('currentYear').textContent = new Date().getFullYear();

});
