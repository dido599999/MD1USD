// Language Management
const root = document.documentElement;
const langBtn = document.getElementById('langToggle');

function setLang(lang) {
  root.setAttribute('lang', lang);
  root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  localStorage.setItem('mdm1-lang', lang);
}

if (langBtn) {
  langBtn.addEventListener('click', () => {
    const current = root.getAttribute('dir') === 'rtl' ? 'ar' : 'en';
    setLang(current === 'ar' ? 'en' : 'ar');
  });
}

// Restore Language Preference
const urlLang = new URLSearchParams(window.location.search).get('lang');
const savedLang = (() => {
  try {
    return localStorage.getItem('mdm1-lang');
  } catch (e) {
    return null;
  }
})();
const initialLang = urlLang === 'ar' || urlLang === 'en' ? urlLang : savedLang;
if (initialLang) setLang(initialLang);

// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navRow = document.getElementById('navRow');

if (menuToggle && navRow) {
  menuToggle.addEventListener('click', () => {
    navRow.classList.toggle('open');
    const expanded = navRow.classList.contains('open');
    menuToggle.setAttribute('aria-expanded', String(expanded));
  });
}

// Close menu on link click
const mobileMenu = document.getElementById('mobileMenu');
if (mobileMenu) {
  document.querySelectorAll('#mobileMenu a').forEach(link => {
    link.addEventListener('click', () => {
      navRow.classList.remove('open');
      if (menuToggle) {
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// Copy to Clipboard
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.copy);
    if (!target) return;

    navigator.clipboard
      .writeText(target.textContent.trim())
      .then(() => {
        const original = btn.innerHTML;
        btn.textContent =
          root.getAttribute('dir') === 'rtl'
            ? 'تم النسخ ✓'
            : 'Copied ✓';
        setTimeout(() => {
          btn.innerHTML = original;
        }, 1600);
      })
      .catch(() => {
        const original = btn.innerHTML;
        btn.textContent =
          root.getAttribute('dir') === 'rtl'
            ? 'فشل النسخ'
            : 'Copy failed';
        setTimeout(() => {
          btn.innerHTML = original;
        }, 1600);
      });
  });
});

// Network Detection
if (window.ethereum) {
  const banner = document.getElementById('networkBanner');

  function checkNetwork(chainId) {
    if (banner) {
      if (chainId !== '0x89' && chainId !== 137 && chainId !== '137') {
        banner.classList.add('show');
      } else {
        banner.classList.remove('show');
      }
    }
  }

  window.ethereum
    .request({ method: 'eth_chainId' })
    .then(checkNetwork)
    .catch(() => {});

  window.ethereum.on('chainChanged', checkNetwork);
}
