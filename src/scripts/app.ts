/**
 * src/scripts/app.ts
 * Core Application Client Module for Gyankosh.
 *
 * Bundled and minified once by Vite/Astro into an immutable cached chunk.
 * Handles PWA installation lifecycle, theme toggling, share sheets,
 * global toast notifications, and catalog search triggers.
 */

declare global {
  interface Window {
    showGyankoshToast: (message: string, icon?: string) => void;
    __gyankoshToastTimer?: ReturnType<typeof setTimeout>;
  }
}

const base = (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');

// Global Toast Notification Helper
window.showGyankoshToast = function (message: string, icon = '✓') {
  let toast = document.getElementById('gyankosh-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'gyankosh-toast';
    toast.className = 'gyankosh-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
  toast.classList.add('show');
  clearTimeout(window.__gyankoshToastTimer);
  window.__gyankoshToastTimer = setTimeout(() => {
    toast?.classList.remove('show');
  }, 2800);
};

document.addEventListener('DOMContentLoaded', () => {
  // Header Search Button Trigger
  document.getElementById('header-search-trigger')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('gyankosh:open-search'));
  });

  // Global Theme Toggle
  const themeToggle = document.getElementById('global-theme-toggle');
  const themeIcon = document.getElementById('global-theme-icon');

  function updateThemeIcon() {
    if (themeIcon) {
      const isNight = document.documentElement.classList.contains('reader-night-mode');
      themeIcon.textContent = isNight ? '🌙' : '☀️';
    }
  }
  updateThemeIcon();

  themeToggle?.addEventListener('click', () => {
    let prefs: Record<string, any> = {};
    try {
      prefs = JSON.parse(localStorage.getItem('gyankosh_prefs') || '{}');
    } catch (e) {}

    const isNight = document.documentElement.classList.toggle('reader-night-mode');
    prefs.nightMode = isNight;
    localStorage.setItem('gyankosh_prefs', JSON.stringify(prefs));
    updateThemeIcon();
    const colorSchemeMeta = document.getElementById('color-scheme-meta') as HTMLMetaElement | null;
    if (colorSchemeMeta) colorSchemeMeta.content = isNight ? 'dark' : 'light';
    const themeColorMeta = document.getElementById('theme-color-meta') as HTMLMetaElement | null;
    if (themeColorMeta) themeColorMeta.content = isNight ? '#151210' : '#8e1b14';
  });

  // Header Share Page Button
  document.getElementById('header-share-app-btn')?.addEventListener('click', async () => {
    const canonicalLink = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
    const currentUrl = (canonicalLink && canonicalLink.href) ? canonicalLink.href : window.location.href;
    const pageTitle = document.title || 'ज्ञानकोश — सनातन वैदिक एवं पौराणिक धर्मग्रंथ';
    const metaDescEl = document.querySelector<HTMLMetaElement>("meta[name='description']");
    const pageDesc = metaDescEl?.getAttribute('content') || 'सनातन वैदिक एवं पौराणिक धर्मग्रंथों का पावन डिजिटल संग्रह — शुद्ध पाठ एवं प्रामाणिक हिन्दी अर्थ सहित।';

    const shareData = {
      title: pageTitle,
      text: pageDesc,
      url: currentUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err && err.name === 'AbortError') {
          return;
        }
      }
    }

    let copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentUrl);
        copied = true;
      }
    } catch {}

    if (copied) {
      window.showGyankoshToast('॥ पृष्ठ लिंक कॉपी किया गया ॥', '🔗');
    } else {
      window.prompt('पृष्ठ लिंक कॉपी करें:', currentUrl);
    }
  });

  // Track last visited catalog/listing page for smart reader back navigation
  try {
    sessionStorage.setItem('gyankosh_last_catalog_url', window.location.href);
  } catch {}

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register(`${base}/sw.js`, { scope: `${base}/` })
      .catch((err) => {
        console.warn('[Gyankosh PWA] Service Worker registration failed:', err);
      });
  }

  // PWA Installation Handling
  initPWA();
});

function initPWA() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;
  if (isStandalone) return;

  const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()) && !(window as any).MSStream;

  let deferredPrompt: any = null;
  const headerBtn = document.getElementById('header-pwa-install-btn');
  const footerBtn = document.getElementById('footer-pwa-install-btn');
  const footerSep = document.getElementById('footer-install-separator');
  const banner = document.getElementById('pwa-install-banner');
  const bannerInstallBtn = document.getElementById('pwa-banner-install-btn');
  const bannerCloseBtn = document.getElementById('pwa-banner-close-btn');
  const iosModal = document.getElementById('pwa-ios-modal') as HTMLDialogElement | null;
  const iosCloseBtn = document.getElementById('pwa-ios-close-btn');
  const iosDoneBtn = document.getElementById('pwa-ios-done-btn');

  function openIOSModal() {
    if (iosModal && typeof iosModal.showModal === 'function') {
      iosModal.showModal();
    }
  }

  function closeIOSModal() {
    if (iosModal && typeof iosModal.close === 'function') {
      iosModal.close();
    }
  }

  iosCloseBtn?.addEventListener('click', closeIOSModal);
  iosDoneBtn?.addEventListener('click', closeIOSModal);
  iosModal?.addEventListener('click', (e) => {
    if (e.target === iosModal) closeIOSModal();
  });

  function showInstallUI() {
    if (headerBtn) headerBtn.style.display = 'inline-flex';
    if (footerBtn) footerBtn.style.display = 'inline';
    if (footerSep) footerSep.style.display = 'inline';

    // Show floating banner if not dismissed in last 7 days
    const dismissedAt = localStorage.getItem('gyankosh_pwa_dismissed');
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (!dismissedAt || (now - Number(dismissedAt)) > sevenDays) {
      setTimeout(() => {
        if (banner) {
          banner.style.display = 'block';
          banner.offsetHeight; // trigger reflow
          banner.classList.add('is-visible');
        }
      }, 1800);
    }
  }

  function hideInstallUI() {
    if (headerBtn) headerBtn.style.display = 'none';
    if (footerBtn) footerBtn.style.display = 'none';
    if (footerSep) footerSep.style.display = 'none';
    if (banner) {
      banner.classList.remove('is-visible');
      setTimeout(() => { banner.style.display = 'none'; }, 400);
    }
  }

  async function handleInstallTrigger() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          hideInstallUI();
        }
      } catch (err) {
        console.warn('[PWA] Prompt error:', err);
      }
      deferredPrompt = null;
    } else if (isIOS) {
      openIOSModal();
    } else {
      openIOSModal();
    }
  }

  headerBtn?.addEventListener('click', handleInstallTrigger);
  bannerInstallBtn?.addEventListener('click', handleInstallTrigger);
  footerBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    handleInstallTrigger();
  });

  bannerCloseBtn?.addEventListener('click', () => {
    localStorage.setItem('gyankosh_pwa_dismissed', String(Date.now()));
    if (banner) {
      banner.classList.remove('is-visible');
      setTimeout(() => { banner.style.display = 'none'; }, 400);
    }
  });

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallUI();
  });

  window.addEventListener('appinstalled', () => {
    hideInstallUI();
    deferredPrompt = null;
    console.log('[Gyankosh PWA] App installed successfully');
  });

  if (isIOS) {
    showInstallUI();
  }
}
