/**
 * ============================================================================
 * 3. MAIN UI INTERACTIVITY & SCROLL LOGIC (main.js)
 * ----------------------------------------------------------------------------
 * Handles:
 * 1. Central config binding (from data.js)
 * 2. Sticky header & active section Scroll-Spy
 * 3. Accessible mobile navigation menu
 * 4. Scroll-reveal animations via IntersectionObserver
 * 5. Interactive Skill Category filtering
 * 6. Glass card mouse-spotlight hover effect
 * 7. Copy-to-clipboard & mailto contact form helper
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  applyPortfolioConfig();
  initHeaderAndMobileNav();
  initScrollReveal();
  initScrollSpy();
  initSkillsFilter();
  initCardSpotlight();
  initContactActions();
  updateFooterYear();
});

/**
 * 1. Bind centralized values from window.PORTFOLIO_CONFIG (data.js)
 */
function applyPortfolioConfig() {
  const config = window.PORTFOLIO_CONFIG?.profile;
  if (!config) return;

  // Update text placeholders
  document.querySelectorAll("[data-config-text]").forEach((el) => {
    const key = el.getAttribute("data-config-text");
    if (config[key]) {
      el.textContent = config[key];
    }
  });

  // Update href links (GitHub, LinkedIn, Resume, mailto)
  document.querySelectorAll("[data-config-href]").forEach((el) => {
    const key = el.getAttribute("data-config-href");
    if (key === "email") {
      el.setAttribute("href", `mailto:${config.email}`);
    } else if (config[key]) {
      el.setAttribute("href", config[key]);
    }
  });
}

/**
 * 2. Sticky Navbar state & Accessible Mobile Drawer
 */
function initHeaderAndMobileNav() {
  const header = document.getElementById("site-header");
  const menuBtn = document.getElementById("mobile-menu-btn");
  const mobileDrawer = document.getElementById("mobile-nav-drawer");

  const handleScroll = () => {
    if (!header) return;
    if (window.scrollY > 24) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  if (menuBtn && mobileDrawer) {
    const toggleMenu = (forceClose = false) => {
      const isOpen = forceClose ? false : !mobileDrawer.classList.contains("is-open");
      mobileDrawer.classList.toggle("is-open", isOpen);
      menuBtn.setAttribute("aria-expanded", String(isOpen));
      mobileDrawer.setAttribute("aria-hidden", String(!isOpen));
    };

    menuBtn.addEventListener("click", () => toggleMenu());

    // Close drawer when clicking any mobile navigation link
    mobileDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => toggleMenu(true));
    });

    // Close drawer when pressing Escape key
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobileDrawer.classList.contains("is-open")) {
        toggleMenu(true);
        menuBtn.focus();
      }
    });
  }
}

/**
 * 3. Reveal elements smoothly as they enter the viewport
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/**
 * 4. Highlight active navigation link based on current scroll section
 */
function initScrollSpy() {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  if (!sections.length || !navLinks.length || !("IntersectionObserver" in window)) return;

  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const activeId = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            const isMatch = link.getAttribute("href") === `#${activeId}`;
            link.classList.toggle("active", isMatch);
          });
        }
      });
    },
    {
      rootMargin: "-35% 0px -55% 0px"
    }
  );

  sections.forEach((section) => spyObserver.observe(section));
}

/**
 * 5. Filter Skill Cards by Category (All / Programming Languages / Web Technologies)
 */
function initSkillsFilter() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const skillCards = document.querySelectorAll(".skill-card");

  if (!filterBtns.length || !skillCards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedCategory = btn.getAttribute("data-filter");

      // Update active button state and aria-pressed
      filterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", String(active));
      });

      // Show/hide skill cards based on their data-categories attribute
      skillCards.forEach((card) => {
        const categories = (card.getAttribute("data-categories") || "").split(",");
        const shouldShow =
          selectedCategory === "all" || categories.includes(selectedCategory);
        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });
}

/**
 * 6. Subtle radial spotlight tracking mouse coordinates inside .glass-card
 */
function initCardSpotlight() {
  const cards = document.querySelectorAll(".glass-card");
  cards.forEach((card) => {
    card.addEventListener(
      "mousemove",
      (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        card.style.setProperty("--card-mouse-x", `${x}px`);
        card.style.setProperty("--card-mouse-y", `${y}px`);
      },
      { passive: true }
    );
  });
}

/**
 * 7. Copy Email button & Honest Client-Side Contact Form (mailto draft)
 */
function initContactActions() {
  const copyBtn = document.getElementById("copy-email-btn");
  const contactForm = document.getElementById("contact-form");

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email =
        window.PORTFOLIO_CONFIG?.profile?.email ||
        "ajay.kumar.placeholder@example.com";
      try {
        await navigator.clipboard.writeText(email);
        showToast(`Copied email address: ${email}`);
      } catch {
        showToast(`Email: ${email}`);
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = document.getElementById("sender-name")?.value.trim() || "";
      const senderEmail = document.getElementById("sender-email")?.value.trim() || "";
      const subject =
        document.getElementById("sender-subject")?.value.trim() ||
        "Portfolio Inquiry for Ajay Kumar";
      const message = document.getElementById("sender-message")?.value.trim() || "";

      const targetEmail =
        window.PORTFOLIO_CONFIG?.profile?.email ||
        "ajay.kumar.placeholder@example.com";

      const mailtoBody = encodeURIComponent(
        `Hi Ajay,\n\n${message}\n\n---\nFrom: ${name}\nReply-To: ${senderEmail}`
      );
      const mailtoSubject = encodeURIComponent(subject);

      showToast("Opening your email client with your drafted message...");
      window.location.href = `mailto:${targetEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;
    });
  }
}

/**
 * Helper to show temporary accessible toast feedback
 */
function showToast(message) {
  const toast = document.getElementById("toast-notification");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");

  window.clearTimeout(toast._hideTimer);
  toast._hideTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3200);
}

/**
 * 8. Keep Footer Copyright Year automatically up to date
 */
function updateFooterYear() {
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}
