// ===============================
// CONTROL SCROLL - VARIANTĂ STABILĂ MOBILE
// ===============================

let tickingFade = false;

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
// 1. EFECTUL DE APARIȚIE LA ÎNCĂRCAREA PAGINII
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
    threshold: 0.05,
    rootMargin: '0px 0px -10% 0px'
  }
);

artistCards.forEach((card, index) => {
  card.style.transitionDelay = `${index * 20}ms`;
  observer.observe(card);
});

// ==========================================
// 2. EFECTUL DE FADE LA SCROLL - MAI UȘOR
// ==========================================

const fadeItems = Array.from(artistCards)
  .map((cardLink) => ({
    link: cardLink,
    card: cardLink.querySelector('.artist-card')
  }))
  .filter((item) => item.card);

function updateArtistFadeOnScroll() {
  if (!fadeItems.length) return;

  const isMobile = window.innerWidth <= 768;

  let triggerLine;

  if (socials) {
    triggerLine = socials.getBoundingClientRect().bottom;
  } else {
    triggerLine = window.innerHeight * 0.35;
  }

  // Pe mobil facem fade-ul mai devreme și pe distanță mai scurtă
  const effectStart = isMobile ? triggerLine + 40 : triggerLine + 25;
  const effectEnd = isMobile ? triggerLine - 70 : triggerLine - 90;

  const minOpacity = 0.18;
  const minScale = 0.92;

  fadeItems.forEach(({ link, card }) => {
    const rect = link.getBoundingClientRect();

    let progress = 0;

    if (rect.top >= effectStart) {
      progress = 0;
    } else if (rect.top <= effectEnd) {
      progress = 1;
    } else {
      progress = (effectStart - rect.top) / (effectStart - effectEnd);
    }

    progress = Math.max(0, Math.min(progress, 1));

    const eased = 1 - Math.pow(1 - progress, 3);

    const opacity = 1 - (1 - minOpacity) * eased;
    const scale = 1 - (1 - minScale) * eased;
    const translateY = -10 * eased;

    link.classList.toggle('is-disabled', progress > 0.05);

    card.style.opacity = opacity;
    card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
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
// 3. CÂND SE RULEAZĂ EFECTUL
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);

  requestAnimationFrame(() => {
    updateArtistFadeOnScroll();
  });
});

window.addEventListener('load', () => {
  window.scrollTo(0, 0);

  setTimeout(() => {
    updateArtistFadeOnScroll();
  }, 100);
});

window.addEventListener('scroll', requestFadeUpdate, { passive: true });
window.addEventListener('resize', requestFadeUpdate, { passive: true });

window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    updateArtistFadeOnScroll();
  }, 300);
});