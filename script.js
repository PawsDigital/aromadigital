// ===============================
// CONTROL SCROLL - STABIL MOBILE
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

        // După apariție, scoatem delay-ul ca să nu afecteze fade-ul la scroll
        entry.target.style.transitionDelay = '0ms';

        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.05,
    rootMargin: '0px 0px -5% 0px'
  }
);

artistCards.forEach((card, index) => {
  card.style.transitionDelay = `${index * 20}ms`;
  observer.observe(card);
});

// ==========================================
// 2. EFECTUL DE FADE LA SCROLL - OPTIMIZAT MOBILE
// ==========================================

const fadeItems = Array.from(artistCards)
  .map((cardLink) => {
    return {
      link: cardLink,
      card: cardLink.querySelector('.artist-card')
    };
  })
  .filter((item) => item.card);

function updateArtistFadeOnScroll() {
  if (!socials || !fadeItems.length) return;

  const triggerLine = socials.getBoundingClientRect().bottom;

  // Ajustează valorile astea dacă vrei fade mai devreme sau mai târziu
  const effectStart = triggerLine + 120;
  const effectEnd = triggerLine - 40;

  const minOpacity = 0.18;
  const minScale = 0.92;
  const maxTranslateY = -10;

  // Citim pozițiile separat, apoi scriem stilurile.
  // Asta reduce lag-ul pe telefon.
  const measurements = fadeItems.map((item) => {
    return {
      link: item.link,
      card: item.card,
      rectTop: item.link.getBoundingClientRect().top
    };
  });

  measurements.forEach(({ link, card, rectTop }) => {
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

    link.classList.toggle('is-disabled', progress > 0.02);

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

  requestAnimationFrame(() => {
    updateArtistFadeOnScroll();
  });
});

window.addEventListener('scroll', requestFadeUpdate, { passive: true });
window.addEventListener('resize', requestFadeUpdate, { passive: true });
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    updateArtistFadeOnScroll();
  }, 250);
});