// ===============================
// CONTROL SCROLL - MAI LENT + MAI FLUID
// ===============================

const SCROLL_EASING = 0.1;
const WHEEL_STRENGTH = 1.2;
const TOUCHPAD_STRENGTH = 0.8;

let currentScroll = window.scrollY;
let targetScroll = window.scrollY;
let isAnimatingScroll = false;
let tickingFade = false;

function clampScroll(value) {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  return Math.max(0, Math.min(value, maxScroll));
}

function animateScroll() {
  const diff = targetScroll - currentScroll;

  currentScroll += diff * SCROLL_EASING;

  if (Math.abs(diff) < 0.3) {
    currentScroll = targetScroll;
    isAnimatingScroll = false;
  } else {
    requestAnimationFrame(animateScroll);
  }

  window.scrollTo(0, currentScroll);
}

/* window.addEventListener(
  'wheel',
  (event) => {
    event.preventDefault();

    const isTouchpad = Math.abs(event.deltaY) < 50;
    const strength = isTouchpad ? TOUCHPAD_STRENGTH : WHEEL_STRENGTH;

    targetScroll = clampScroll(targetScroll + event.deltaY * strength);

    if (!isAnimatingScroll) {
      isAnimatingScroll = true;
      requestAnimationFrame(animateScroll);
    }
  },
  { passive: false }
); */

window.addEventListener('resize', () => {
  currentScroll = window.scrollY;
  targetScroll = window.scrollY;
});

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
      }
    });
  },
  {
    threshold: 0.15
  }
);

artistCards.forEach((card, index) => {
  card.style.transitionDelay = `${index * 20}ms`;
  observer.observe(card);
});

// ==========================================
// 2. EFECTUL DE FADE LA SCROLL
// ==========================================

function updateArtistFadeOnScroll() {
  if (!socials || !artistCards.length) return;

  const triggerLine = socials.getBoundingClientRect().bottom;

  artistCards.forEach((cardLink) => {
    if (!cardLink.classList.contains('is-visible')) return;

    const card = cardLink.querySelector('.artist-card');
    if (!card) return;

    const rect = cardLink.getBoundingClientRect();

    const effectStart = triggerLine + 25;
    const effectEnd = triggerLine - 90;
    const minOpacity = 0.18;
    const minScale = 0.92;

    let progress = 0;

    if (rect.top >= effectStart) {
      progress = 0;
    } else if (rect.top <= effectEnd) {
      progress = 1;
    } else {
      progress = (effectStart - rect.top) / (effectStart - effectEnd);
    }

    const isFading = progress > 0;
    cardLink.classList.toggle('is-disabled', isFading);

    const eased = 1 - Math.pow(1 - progress, 3);

    const opacity = 1 - (1 - minOpacity) * eased;
    const scale = 1 - (1 - minScale) * eased;
    const translateY = -10 * eased;

    card.style.opacity = opacity;
    card.style.transform = `translateY(${translateY}px) scale(${scale})`;
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
  currentScroll = 0;
  targetScroll = 0;
  window.scrollTo(0, 0);
  updateArtistFadeOnScroll();
});

window.addEventListener('scroll', requestFadeUpdate, { passive: true });
window.addEventListener('resize', requestFadeUpdate);