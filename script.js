// ===============================
// CONTROL SCROLL / FADE - MOBILE FIX
// ===============================

let tickingFade = false;
let fadeItems = [];

// La refresh, pagina pornește de sus
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// ===============================
// SELECTĂM ELEMENTELE DIN PAGINĂ
// ===============================

const socials = document.querySelector('.hero-socials');
const artistCards = document.querySelectorAll('.artist-link');

// ==========================================
// 1. PREGĂTIM CARDURILE
// ==========================================

fadeItems = Array.from(artistCards)
  .map((cardLink) => {
    return {
      link: cardLink,
      card: cardLink.querySelector('.artist-card')
    };
  })
  .filter((item) => item.card);

// ==========================================
// 2. EFECTUL DE APARIȚIE
// ==========================================

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0,
    rootMargin: '0px 0px 20% 0px'
  }
);

artistCards.forEach((card, index) => {
  card.style.transitionDelay = `${index * 20}ms`;
  observer.observe(card);
});

// ==========================================
// 3. FADE LA SCROLL - FIX PENTRU TELEFON
// ==========================================

function getViewportHeight() {
  return window.visualViewport ? window.visualViewport.height : window.innerHeight;
}

function updateArtistFadeOnScroll() {
  if (!fadeItems.length) return;

  const isMobile = window.innerWidth <= 768;
  const viewportHeight = getViewportHeight();

  let effectStart;
  let effectEnd;

  if (isMobile) {
    // Pe telefon NU mai folosim hero-socials ca trigger principal.
    // Asta elimină bug-ul unde fade-ul pornește prea târziu.
    effectStart = viewportHeight * 0.72;
    effectEnd = viewportHeight * 0.36;
  } else {
    // Pe desktop păstrăm comportamentul apropiat de cel original.
    const triggerLine = socials
      ? socials.getBoundingClientRect().bottom
      : viewportHeight * 0.35;

    effectStart = triggerLine + 25;
    effectEnd = triggerLine - 90;
  }

  const minOpacity = 0.18;
  const minScale = 0.92;
  const maxTranslateY = -10;

  fadeItems.forEach(({ link, card }) => {
    const rectTop = link.getBoundingClientRect().top;

    let progress = 0;

    if (rectTop >= effectStart) {
      progress = 0;
    } else if (rectTop <= effectEnd) {
      progress = 1;
    } else {
      progress = (effectStart - rectTop) / (effectStart - effectEnd);
    }

    progress = Math.max(0, Math.min(progress, 1));

    const eased = 1 - Math.pow(1 - progress, 3);

    const opacity = 1 - (1 - minOpacity) * eased;
    const scale = 1 - (1 - minScale) * eased;
    const translateY = maxTranslateY * eased;

    link.classList.toggle('is-disabled', progress > 0.05);

    card.style.opacity = opacity;
    card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
    card.style.filter = 'none';
  });
}

function requestFadeUpdate() {
  if (tickingFade) return;

  tickingFade = true;

  requestAnimationFrame(() => {
    updateArtistFadeOnScroll();
    tickingFade = false;
  });
}

// ==========================================
// 4. REINIȚIALIZARE CORECTĂ PE MOBIL
// ==========================================

function forceFadeRefresh() {
  requestAnimationFrame(() => {
    updateArtistFadeOnScroll();

    requestAnimationFrame(() => {
      updateArtistFadeOnScroll();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  forceFadeRefresh();
});

window.addEventListener('load', () => {
  window.scrollTo(0, 0);

  forceFadeRefresh();

  setTimeout(forceFadeRefresh, 100);
  setTimeout(forceFadeRefresh, 300);
  setTimeout(forceFadeRefresh, 700);
});

// Important pentru iPhone / Android browser bar
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', requestFadeUpdate, {
    passive: true
  });

  window.visualViewport.addEventListener('scroll', requestFadeUpdate, {
    passive: true
  });
}

// Când utilizatorul atinge ecranul, forțăm update imediat.
// Asta rezolvă problema unde fade-ul se activează abia după primul swipe.
window.addEventListener('touchstart', forceFadeRefresh, {
  passive: true
});

window.addEventListener('touchmove', requestFadeUpdate, {
  passive: true
});

window.addEventListener('scroll', requestFadeUpdate, {
  passive: true
});

window.addEventListener('resize', requestFadeUpdate, {
  passive: true
});

window.addEventListener('orientationchange', () => {
  setTimeout(forceFadeRefresh, 300);
});

window.addEventListener('pageshow', () => {
  forceFadeRefresh();
});