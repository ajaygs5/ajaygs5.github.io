/**
 * ============================================================================
 * 2. INTERACTIVE ANIMATED BACKGROUND (background.js)
 * ----------------------------------------------------------------------------
 * Renders a subtle, high-performance developer grid + particle constellation
 * on an HTML5 <canvas>.
 *
 * Key performance & accessibility features:
 * - Scales particle count automatically based on screen size (fewer on mobile).
 * - Pauses rendering when the browser tab is hidden to save battery/CPU.
 * - Respects the user's "prefers-reduced-motion" OS accessibility setting.
 * ============================================================================
 */

(function initAnimatedBackground() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrameId = null;

  // Track mouse position for subtle interactive connection lines
  const mouse = {
    x: null,
    y: null,
    radius: 150
  };

  window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  }, { passive: true });

  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  /**
   * Resize canvas to match viewport dimensions with sharp Retina/HiDPI support
   */
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createParticles();
  }

  /**
   * Create floating nodes proportional to viewport area
   */
  function createParticles() {
    const area = width * height;
    // Keep particle count subtle (between 22 on mobile and 58 on large screens)
    const count = Math.min(58, Math.max(22, Math.floor(area / 26000)));
    particles = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 1.6 + 0.8,
        alpha: Math.random() * 0.45 + 0.2
      });
    }
  }

  /**
   * Draw a very faint developer coordinate grid in the background
   */
  function drawSubtleGrid() {
    const gridSize = 64;
    ctx.strokeStyle = "rgba(148, 163, 184, 0.03)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let x = 0; x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }

  /**
   * Main render loop (runs ~60 frames per second via requestAnimationFrame)
   */
  function renderFrame() {
    ctx.clearRect(0, 0, width, height);

    drawSubtleGrid();

    // Soft radial spotlight around mouse cursor
    if (mouse.x !== null && mouse.y !== null) {
      const radial = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        10,
        mouse.x,
        mouse.y,
        280
      );
      radial.addColorStop(0, "rgba(56, 189, 248, 0.07)");
      radial.addColorStop(1, "rgba(56, 189, 248, 0)");
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);
    }

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      if (!prefersReducedMotion) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap smoothly around screen edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }

      // Draw particle dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
      ctx.fill();

      // Connect nearby particles with faint network lines
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.hypot(dx, dy);
        const maxDist = 135;

        if (dist < maxDist) {
          const lineAlpha = (1 - dist / maxDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(129, 140, 248, ${lineAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Connect particle to mouse cursor when nearby
      if (mouse.x !== null && mouse.y !== null) {
        const dxMouse = p.x - mouse.x;
        const dyMouse = p.y - mouse.y;
        const distMouse = Math.hypot(dxMouse, dyMouse);

        if (distMouse < mouse.radius) {
          const mouseAlpha = (1 - distMouse / mouse.radius) * 0.22;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${mouseAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    if (!prefersReducedMotion) {
      animationFrameId = window.requestAnimationFrame(renderFrame);
    }
  }

  // Initialize and handle window resize
  resizeCanvas();
  renderFrame();

  window.addEventListener("resize", resizeCanvas, { passive: true });

  // Pause animation loop when user switches browser tabs
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    } else if (!prefersReducedMotion && !animationFrameId) {
      renderFrame();
    }
  });
})();
