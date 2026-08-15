/* 1. Custom Cursor */
const pointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  tx: window.innerWidth / 2,
  ty: window.innerHeight / 2,
  active: false
};

const isTouch = matchMedia("(pointer: coarse)").matches;
const cursor = document.querySelector(".cursor");
const cursorDot = document.querySelector(".cursor-dot");
const mouseLight = document.querySelector(".mouse-light");

if (!isTouch) {
  window.addEventListener("mousemove", (event) => {
    pointer.tx = event.clientX;
    pointer.ty = event.clientY;
    pointer.active = true;
  });

  document.querySelectorAll("a, button, .tilt-card, .hero-visual, .tech-badge").forEach((item) => {
    item.addEventListener("mouseenter", () => cursor.classList.add("is-hovering"));
    item.addEventListener("mouseleave", () => cursor.classList.remove("is-hovering"));
  });
}

function animateCursor() {
  if (!isTouch) {
    pointer.x += (pointer.tx - pointer.x) * 0.16;
    pointer.y += (pointer.ty - pointer.y) * 0.16;
    cursor.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
    cursorDot.style.transform = `translate3d(${pointer.tx}px, ${pointer.ty}px, 0) translate(-50%, -50%)`;
    mouseLight.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

/* 2. Navigation */
const header = document.getElementById("site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = [...document.querySelectorAll(".nav-links a")];

menuToggle.addEventListener("click", () => {
  const open = !navLinks.classList.contains("is-open");
  navLinks.classList.toggle("is-open", open);
  menuToggle.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
});

navItems.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

/* 3. Smooth Scroll */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* 4. 3D Sphere */
const sphereCanvas = document.getElementById("sphere-canvas");
const sphereCtx = sphereCanvas.getContext("2d");
const heroVisual = document.getElementById("hero-visual");
let sphereParticles = [];
let sphereRotationX = 0;
let sphereRotationY = 0;

function resizeSphere() {
  const size = heroVisual.offsetWidth;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  sphereCanvas.width = size * dpr;
  sphereCanvas.height = size * dpr;
  sphereCanvas.style.width = `${size}px`;
  sphereCanvas.style.height = `${size}px`;
  sphereCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function createSphere() {
  const count = isTouch ? 190 : 340;
  sphereParticles = [];
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(1 - 2 * (i + 0.5) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    sphereParticles.push({
      x: Math.cos(theta) * Math.sin(phi),
      y: Math.sin(theta) * Math.sin(phi),
      z: Math.cos(phi),
      size: Math.random() * 1.8 + 0.7
    });
  }
}

function drawSphere() {
  const width = heroVisual.offsetWidth;
  const height = width;
  const radius = width * 0.32;
  const focal = width * 0.9;
  const mouseX = (pointer.tx / window.innerWidth - 0.5) * (isTouch ? 0.15 : 0.75);
  const mouseY = (pointer.ty / window.innerHeight - 0.5) * (isTouch ? 0.15 : 0.75);

  sphereRotationX += 0.0025 + mouseY * 0.0008;
  sphereRotationY += 0.004 + mouseX * 0.001;

  sphereCtx.clearRect(0, 0, width, height);

  const points = sphereParticles.map((particle) => {
    let { x, y, z } = particle;
    const cosY = Math.cos(sphereRotationY);
    const sinY = Math.sin(sphereRotationY);
    const cosX = Math.cos(sphereRotationX);
    const sinX = Math.sin(sphereRotationX);

    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;
    const scale = focal / (focal + z2 * radius);

    return {
      x: x1 * radius * scale + width / 2,
      y: y1 * radius * scale + height / 2,
      z: z2,
      scale,
      size: particle.size
    };
  }).sort((a, b) => a.z - b.z);

  for (const point of points) {
    const brightness = Math.max(0.18, (point.z + 1) / 2);
    sphereCtx.beginPath();
    sphereCtx.fillStyle = `rgba(255, ${95 + brightness * 90}, ${55 + brightness * 80}, ${0.18 + brightness * 0.72})`;
    sphereCtx.arc(point.x, point.y, point.size * point.scale, 0, Math.PI * 2);
    sphereCtx.fill();
  }

  if (!isTouch) {
    heroVisual.style.transform = `rotateX(${mouseY * -12}deg) rotateY(${mouseX * 16}deg) translate3d(${mouseX * 22}px, ${mouseY * 18}px, 0)`;
  }
}

/* 5. Particle System */
const particleCanvas = document.getElementById("particle-canvas");
const particleCtx = particleCanvas.getContext("2d");
let particles = [];

function resizeParticles() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  particleCanvas.width = window.innerWidth * dpr;
  particleCanvas.height = window.innerHeight * dpr;
  particleCanvas.style.width = `${window.innerWidth}px`;
  particleCanvas.style.height = `${window.innerHeight}px`;
  particleCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function createParticles() {
  const count = window.innerWidth < 720 ? 70 : 125;
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    z: Math.random() * 0.8 + 0.2,
    vx: (Math.random() - 0.5) * 0.24,
    vy: (Math.random() - 0.5) * 0.24
  }));
}

function drawParticles() {
  particleCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((particle, index) => {
    const dx = particle.x - pointer.tx;
    const dy = particle.y - pointer.ty;
    const mouseDistance = Math.hypot(dx, dy);

    if (!isTouch && mouseDistance < 150) {
      particle.x += dx / mouseDistance * 0.5 || 0;
      particle.y += dy / mouseDistance * 0.5 || 0;
    }

    particle.x += particle.vx * particle.z;
    particle.y += particle.vy * particle.z;

    if (particle.x < -20) particle.x = window.innerWidth + 20;
    if (particle.x > window.innerWidth + 20) particle.x = -20;
    if (particle.y < -20) particle.y = window.innerHeight + 20;
    if (particle.y > window.innerHeight + 20) particle.y = -20;

    particleCtx.beginPath();
    particleCtx.fillStyle = `rgba(246, 242, 237, ${0.12 + particle.z * 0.22})`;
    particleCtx.arc(particle.x, particle.y, particle.z * 1.8, 0, Math.PI * 2);
    particleCtx.fill();

    for (let j = index + 1; j < particles.length; j++) {
      const other = particles[j];
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
      if (distance < 118) {
        particleCtx.beginPath();
        particleCtx.strokeStyle = `rgba(255, 91, 46, ${(1 - distance / 118) * 0.12})`;
        particleCtx.lineWidth = 1;
        particleCtx.moveTo(particle.x, particle.y);
        particleCtx.lineTo(other.x, other.y);
        particleCtx.stroke();
      }
    }
  });
}

/* 6. Mouse Interaction */
document.querySelectorAll(".magnetic").forEach((element) => {
  element.addEventListener("mousemove", (event) => {
    if (isTouch) return;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    element.style.transform = `translate3d(${x * 0.16}px, ${y * 0.16}px, 0)`;
  });

  element.addEventListener("mouseleave", () => {
    element.style.transform = "";
  });
});

/* 7. 3D Cards */
document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    if (isTouch) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = (x / rect.width - 0.5) * 16;
    const rotateX = (0.5 - y / rect.height) * 16;
    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
    card.style.setProperty("--mx", "50%");
    card.style.setProperty("--my", "50%");
  });
});

/* 8. Scroll Animations */
const revealItems = [...document.querySelectorAll(".reveal-up, .reveal-text")];
const sections = [...document.querySelectorAll("main section[id]")];
const timeline = document.getElementById("timeline");
let ticking = false;

function updateScrollEffects() {
  const scrollY = window.scrollY;
  header.classList.toggle("is-scrolled", scrollY > 40);

  revealItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.86) {
      item.classList.add("is-visible");
    }
  });

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const id = section.getAttribute("id");
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link && rect.top < window.innerHeight * 0.45 && rect.bottom > window.innerHeight * 0.3) {
      navItems.forEach((item) => item.classList.remove("is-active"));
      link.classList.add("is-active");
    }
  });

  if (timeline) {
    const rect = timeline.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.72 - rect.top) / rect.height));
    timeline.style.setProperty("--timeline-height", `${progress * 100}%`);
  }

  document.documentElement.style.setProperty("--scroll", scrollY);
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateScrollEffects);
    ticking = true;
  }
}, { passive: true });

/* 9. Mobile Optimization */
function resizeAll() {
  resizeParticles();
  resizeSphere();
  createParticles();
}

function animate() {
  drawParticles();
  drawSphere();
  requestAnimationFrame(animate);
}

window.addEventListener("resize", resizeAll);
resizeAll();
createSphere();
updateScrollEffects();
animate();
