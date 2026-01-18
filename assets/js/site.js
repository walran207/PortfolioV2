function setupSmoothScroll() {
  document.querySelectorAll("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!(target instanceof HTMLElement)) return;

      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top, behavior: "smooth" });

      const collapseEl = document.getElementById("navbarNav");
      if (collapseEl && collapseEl.classList.contains("show")) {
        const collapse = bootstrap.Collapse.getInstance(collapseEl);
        if (collapse) collapse.hide();
      }
    });
  });
}

function setupContactNavActive() {
  const contact = document.getElementById("contact");
  if (!contact) return;

  const navLinks = Array.from(document.querySelectorAll(".nav-link.nav-pill"));
  if (!navLinks.length) return;

  const contactLinks = navLinks.filter((link) => link.getAttribute("href") === "#contact");
  if (!contactLinks.length) return;

  const defaultLink =
    navLinks.find((link) => {
      const href = link.getAttribute("href") || "";
      if (!href || href.startsWith("#")) return false;
      const current = window.location.pathname.split("/").pop() || "index.html";
      return href.replace("./", "") === current;
    }) || navLinks[0];

  const setActiveLink = (activeLink) => {
    navLinks.forEach((link) => link.classList.toggle("active", link === activeLink));
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setActiveLink(contactLinks[0]);
        return;
      }
      setActiveLink(defaultLink);
    },
    { threshold: 0.3 },
  );

  observer.observe(contact);
}

function setupHeroCanvas() {
  const canvas = document.getElementById("heroCanvas");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const colors = [
    "rgba(157, 111, 255, 0.40)",
    "rgba(64, 207, 255, 0.35)",
    "rgba(255, 138, 216, 0.30)",
  ];

  const state = {
    width: 0,
    height: 0,
    orbs: [],
    raf: 0,
  };

  const rand = (min, max) => Math.random() * (max - min) + min;

  const createOrbs = () => {
    const count = 3;
    state.orbs = Array.from({ length: count }).map((_, i) => ({
      x: rand(0, state.width),
      y: rand(0, state.height),
      vx: rand(0.4, 0.9) * (Math.random() > 0.5 ? 1 : -1),
      vy: rand(0.3, 0.8) * (Math.random() > 0.5 ? 1 : -1),
      radius: rand(90, 170),
      color: colors[i % colors.length],
    }));
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    state.width = Math.max(1, Math.floor(rect.width));
    state.height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(state.width * dpr);
    canvas.height = Math.floor(state.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createOrbs();
  };

  const render = () => {
    ctx.clearRect(0, 0, state.width, state.height);
    ctx.fillStyle = "rgba(5, 8, 27, 0.12)";
    ctx.fillRect(0, 0, state.width, state.height);

    for (const orb of state.orbs) {
      orb.x += orb.vx;
      orb.y += orb.vy;

      if (orb.x - orb.radius < 0) {
        orb.x = orb.radius;
        orb.vx *= -1;
      } else if (orb.x + orb.radius > state.width) {
        orb.x = state.width - orb.radius;
        orb.vx *= -1;
      }

      if (orb.y - orb.radius < 0) {
        orb.y = orb.radius;
        orb.vy *= -1;
      } else if (orb.y + orb.radius > state.height) {
        orb.y = state.height - orb.radius;
        orb.vy *= -1;
      }

      const gradient = ctx.createRadialGradient(
        orb.x - orb.radius * 0.25,
        orb.y - orb.radius * 0.25,
        orb.radius * 0.2,
        orb.x,
        orb.y,
        orb.radius,
      );
      gradient.addColorStop(0, orb.color);
      gradient.addColorStop(1, "rgba(5, 8, 27, 0)");

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    state.raf = window.requestAnimationFrame(render);
  };

  resize();
  render();

  window.addEventListener("resize", resize);
  window.addEventListener("pagehide", () => window.cancelAnimationFrame(state.raf), { once: true });
}

document.addEventListener("DOMContentLoaded", () => {
  setupSmoothScroll();
  setupContactNavActive();
  setupHeroCanvas();
});
