// ---- Load shared header and footer ----
(function () {
  var isHomepage = document.body.classList.contains('homepage');

  // Load header
  var navPlaceholder = document.getElementById('nav-placeholder');
  if (navPlaceholder) {
    fetch('header.html')
      .then(function (r) { return r.text(); })
      .then(function (html) {
        navPlaceholder.innerHTML = html;

        var nav = document.getElementById('mainNav');

        // On homepage: wordmark scrolls to top instead of linking to index.html
        if (isHomepage && nav) {
          var wordmark = nav.querySelector('.wordmark');
          wordmark.href = '#';
          wordmark.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });

          // On homepage: section links are anchors, not prefixed with index.html
          nav.querySelectorAll('.nav-links a').forEach(function (a) {
            var href = a.getAttribute('href');
            if (href && href.indexOf('index.html#') === 0) {
              a.setAttribute('href', '#' + href.split('#')[1]);
            }
          });
        }

        // Set active nav link for subpages
        if (!isHomepage) {
          var currentPage = window.location.pathname.split('/').pop();
          nav.querySelectorAll('.nav-links a').forEach(function (a) {
            var href = a.getAttribute('href');
            if (href === currentPage) {
              a.classList.add('active');
            }
          });
        }

        // Mobile menu toggle
        var menuToggle = document.getElementById('menuToggle');
        var navLinks = document.getElementById('navLinks');
        if (menuToggle && navLinks) {
          menuToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
          });
          navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
              navLinks.classList.remove('open');
            });
          });
        }

        // Homepage: nav appears on scroll
        if (isHomepage && nav) {
          window.addEventListener('scroll', function () {
            nav.classList.toggle('scrolled', window.scrollY > 20);
          });
        }
      });
  }

  // Load footer
  var footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    fetch('footer.html')
      .then(function (r) { return r.text(); })
      .then(function (html) {
        footerPlaceholder.innerHTML = html;

        // On homepage: footer links are anchors, not prefixed with index.html
        if (isHomepage) {
          footerPlaceholder.querySelectorAll('.footer-links a').forEach(function (a) {
            var href = a.getAttribute('href');
            if (href && href.indexOf('index.html#') === 0) {
              a.setAttribute('href', '#' + href.split('#')[1]);
            }
          });
        }
      });
  }
})();

// ---- Scroll-triggered animations ----
var observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0, rootMargin: '0px 0px 0px 0px' });

document.querySelectorAll('.animate').forEach(function (el) {
  observer.observe(el);
});

// ---- UTM tracking ----
var defined_utm_source = new URLSearchParams(window.location.search).get('utm_source') || '';

// ---- Fetch with retry (for Google Sheet POSTs) ----
function fetchWithRetry(url, options, retries, delay) {
  retries = retries || 2;
  delay = delay || 1000;
  return fetch(url, options).catch(function(err) {
    if (retries <= 0) throw err;
    return new Promise(function(resolve) {
      setTimeout(resolve, delay);
    }).then(function() {
      return fetchWithRetry(url, options, retries - 1, delay);
    });
  });
}

// ---- Subscribe form handler (used by footer) ----
// Google Sheet endpoint
var SHEET_URL = 'https://script.google.com/macros/s/AKfycbxOBlhihUAjGi44Lc8q878fQqVlW8mdaYiRa3jj0C4RvoqPrMMdcWsTe4ormHuhQ49q/exec';

function handleSubscribe(e) {
  e.preventDefault();
  var form = e.target;
  var email = form.querySelector('input[name="EMAIL"]').value;
  var honeypot = form.querySelector('input[name="b_041966420b3984e390841b884_5afc9a6ca7"]').value;
  if (honeypot) return;

  // Send to Google Sheet (with retry)
  fetchWithRetry(SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, source: 'subscriber', utm_source: defined_utm_source })
  }, 2, 1000).catch(function (err) { console.error('Sheet subscribe error:', err); });

  // Send to Mailchimp
  var url = 'https://sfmandarinschool.us18.list-manage.com/subscribe/post-json?u=041966420b3984e390841b884&id=5afc9a6ca7&f_id=0072abe6f0&EMAIL=' + encodeURIComponent(email) + '&c=handleSubscribeResponse';

  window.handleSubscribeResponse = function (data) {
    var msg = form.closest('.footer-subscribe, .updates-subscribe').querySelector('p[id^="subscribeMsg"]');
    if (data.result === 'success') {
      msg.textContent = 'Thanks! You\u2019re subscribed.';
      msg.style.color = 'var(--red)';
      form.reset();
      if (typeof gtag === 'function') {
        gtag('event', 'subscribe_form_submit', { event_category: 'forms' });
      }
    } else if (data.msg && data.msg.indexOf('already subscribed') > -1) {
      msg.textContent = 'You\u2019re already subscribed!';
      msg.style.color = 'var(--red)';
    } else {
      msg.textContent = 'Something went wrong. Please try again.';
      msg.style.color = '#c00';
    }
    msg.style.display = 'block';
    var mcScript = document.getElementById('mcSubscribeScript');
    if (mcScript) mcScript.parentNode.removeChild(mcScript);
  };

  var script = document.createElement('script');
  script.id = 'mcSubscribeScript';
  script.src = url;
  document.body.appendChild(script);
}
