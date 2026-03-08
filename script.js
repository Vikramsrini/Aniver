/* ========== PETAL ANIMATION ========== */
const canvas = document.getElementById('petalCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Petal {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -20;
    this.size = Math.random() * 8 + 4;
    this.speedY = Math.random() * 1.5 + 0.5;
    this.speedX = Math.random() * 1 - 0.5;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.04;
    this.opacity = Math.random() * 0.4 + 0.15;
    this.drift = Math.random() * 0.01;

    const colors = [
      'rgba(232, 160, 191,',     // pink
      'rgba(240, 192, 216,',      // light pink
      'rgba(212, 168, 83,',       // gold
      'rgba(201, 122, 158,',      // deep rose
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.y * this.drift) * 0.5;
    this.rotation += this.rotationSpeed;

    if (this.y > canvas.height + 20) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.opacity;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      this.size / 2, -this.size / 2,
      this.size, this.size / 3,
      0, this.size
    );
    ctx.bezierCurveTo(
      -this.size, this.size / 3,
      -this.size / 2, -this.size / 2,
      0, 0
    );
    ctx.fillStyle = this.color + this.opacity + ')';
    ctx.fill();
    ctx.restore();
  }
}

// Fewer petals on mobile for performance
const petalCount = window.innerWidth < 600 ? 12 : 20;
const petals = Array.from({ length: petalCount }, () => new Petal());

function animatePetals() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  petals.forEach(petal => {
    petal.update();
    petal.draw();
  });
  requestAnimationFrame(animatePetals);
}
animatePetals();


/* ========== SCROLL REVEAL (Intersection Observer) ========== */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px',
  }
);

// Observe all revealable elements
document.querySelectorAll(
  '.chapter-card, .reason-card, .letter-card, .main-quote, .gallery-item'
).forEach((el) => revealObserver.observe(el));

/* ========== STAGGERED GALLERY ANIMATION ========== */
const galleryObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Add staggered delay based on index
        const items = Array.from(document.querySelectorAll('.gallery-item'));
        const idx = items.indexOf(entry.target);
        entry.target.style.transitionDelay = (idx * 0.08) + 's';
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
);

document.querySelectorAll('.gallery-item').forEach(el => galleryObserver.observe(el));

/* ========== HERO PARALLAX ========== */
const hero = document.querySelector('.hero');
const heroContent = document.querySelector('.hero-content');

if (hero && heroContent) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const heroHeight = hero.offsetHeight;
        if (scrollY < heroHeight) {
          const progress = scrollY / heroHeight;
          heroContent.style.transform = 'translateY(' + (scrollY * 0.35) + 'px)';
          heroContent.style.opacity = 1 - progress * 1.3;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ========== CURSOR GLOW (desktop only) ========== */
if (window.innerWidth > 768) {
  const glow = document.createElement('div');
  glow.classList.add('cursor-glow');
  document.body.appendChild(glow);

  let glowVisible = false;

  document.addEventListener('mousemove', (e) => {
    if (!glowVisible) {
      glow.style.opacity = '1';
      glowVisible = true;
    }
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
    glowVisible = false;
  });
}

/* ========== SMOOTH SCROLL ========== */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ========== GALLERY LIGHTBOX ========== */
const galleryItems = document.querySelectorAll('.gallery-item');

const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
lightbox.style.cssText = [
  'position: fixed; inset: 0; z-index: 10000;',
  'background: rgba(10,10,15,0.96); backdrop-filter: blur(24px);',
  '-webkit-backdrop-filter: blur(24px);',
  'display: none; align-items: center; justify-content: center;',
  'cursor: zoom-out; opacity: 0;',
  'transition: opacity 0.3s ease;',
  'padding: 1rem;'
].join(' ');

const lightboxImg = document.createElement('img');
lightboxImg.style.cssText = [
  'max-width: 95vw; max-height: 90vh;',
  'object-fit: contain; border-radius: 12px;',
  'box-shadow: 0 20px 80px rgba(232,160,191,0.15);',
  'transform: scale(0.9); transition: transform 0.3s ease;'
].join(' ');
lightbox.appendChild(lightboxImg);

const lightboxClose = document.createElement('div');
lightboxClose.innerHTML = '✕';
lightboxClose.style.cssText = [
  'position: absolute; top: 16px; right: 20px;',
  'font-size: 1.3rem; color: rgba(240,236,229,0.6);',
  'cursor: pointer; font-family: var(--font-sans);',
  'width: 40px; height: 40px; display: flex;',
  'align-items: center; justify-content: center;',
  'border-radius: 50%; background: rgba(255,255,255,0.05);',
  'backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);',
  'transition: all 0.2s ease;'
].join(' ');
lightbox.appendChild(lightboxClose);

document.body.appendChild(lightbox);

function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.style.display = 'flex';
  requestAnimationFrame(() => {
    lightbox.style.opacity = '1';
    lightboxImg.style.transform = 'scale(1)';
  });
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.style.opacity = '0';
  lightboxImg.style.transform = 'scale(0.9)';
  setTimeout(() => {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }, 300);
}

lightbox.addEventListener('click', closeLightbox);
lightboxClose.addEventListener('click', closeLightbox);

galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('.gallery-img');
    if (img) openLightbox(img.src);
  });
});

// Escape to close lightbox
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

/* ========== HAPTIC FEEDBACK (mobile vibration) ========== */
function vibrate(ms) {
  if (navigator.vibrate) {
    navigator.vibrate(ms || 15);
  }
}

/* ========== LOVE REVEAL CHALLENGE ========== */
(function () {
  const heartBtn = document.getElementById('loveHeartBtn');
  const countEl = document.getElementById('loveCount');
  const messageEl = document.getElementById('loveMessage');
  const ringFill = document.querySelector('.ring-fill');
  const heartArea = document.querySelector('.love-reveal-heart-area');
  const revealSection = document.querySelector('.love-reveal-section');
  const letterSection = document.getElementById('letter');

  if (!heartBtn || !letterSection) return;

  const THRESHOLD = 20;
  const CIRCUMFERENCE = 339.292;
  let count = 0;
  let revealed = false;

  const messages = [
    { at: 0, text: 'Come on, show me!' },
    { at: 3, text: 'Just getting started? 🤔' },
    { at: 6, text: 'Okay okay, keep going! 😏' },
    { at: 9, text: 'Aww, more more more! 🥰' },
    { at: 12, text: "You're almost there... 💗" },
    { at: 15, text: "So close, don't stop! 🔥" },
    { at: 18, text: 'OMG just a little more!! 😍' },
  ];

  const heartEmojis = ['💕', '💗', '💖', '💘', '💝', '♥️', '🩷', '💓'];

  function spawnFloatingHeart() {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist = 20 + Math.random() * 40;
    heart.style.left = (50 + Math.cos(angle) * dist) + '%';
    heart.style.top = (50 + Math.sin(angle) * dist) + '%';
    heart.style.fontSize = (Math.random() * 0.8 + 0.8) + 'rem';
    heartArea.appendChild(heart);
    setTimeout(function () { heart.remove(); }, 1000);
  }

  function updateRing() {
    const progress = Math.min(count / THRESHOLD, 1);
    const offset = CIRCUMFERENCE * (1 - progress);
    ringFill.style.strokeDashoffset = offset;
    const glowIntensity = Math.floor(progress * 20) + 5;
    ringFill.style.filter = 'drop-shadow(0 0 ' + glowIntensity + 'px rgba(232, 160, 191, ' + (0.3 + progress * 0.5) + '))';
  }

  function updateMessage() {
    let msg = messages[0].text;
    for (const m of messages) {
      if (count >= m.at) msg = m.text;
    }
    messageEl.style.opacity = '0';
    setTimeout(function () {
      messageEl.textContent = msg;
      messageEl.style.opacity = '1';
    }, 150);
  }

  function revealLetter() {
    revealed = true;
    vibrate(50);
    messageEl.textContent = "You passed! Here's my letter to you 💌";

    setTimeout(function () {
      revealSection.classList.add('completed');

      setTimeout(function () {
        letterSection.classList.remove('letter-hidden');
        letterSection.classList.add('letter-revealed');

        setTimeout(function () {
          letterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const letterCard = letterSection.querySelector('.letter-card');
          if (letterCard) letterCard.classList.add('visible');
        }, 400);
      }, 900);
    }, 800);
  }

  function handleTap(e) {
    if (e.type === 'touchstart') {
      e.preventDefault(); // prevent double-tap zoom
    }
    if (revealed) return;

    count++;
    countEl.textContent = count;
    vibrate(12);

    heartBtn.classList.remove('clicked');
    void heartBtn.offsetWidth;
    heartBtn.classList.add('clicked');

    spawnFloatingHeart();
    if (count > 8) spawnFloatingHeart();
    if (count > 15) spawnFloatingHeart();

    updateRing();
    updateMessage();

    if (count >= THRESHOLD) {
      revealLetter();
    }
  }

  heartBtn.addEventListener('touchstart', handleTap, { passive: false });
  heartBtn.addEventListener('click', function (e) {
    // Only fire on non-touch (mouse/keyboard) to avoid double-firing
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
    handleTap(e);
  });
})();
