const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const backToTop = document.querySelector(".back-to-top");
const siteHeader = document.querySelector(".site-header");

if (siteHeader) {
  const updateHeaderBackground = () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  updateHeaderBackground();
  window.addEventListener("scroll", updateHeaderBackground, { passive: true });
}

function closeNavigation() {
  if (!navToggle || !siteNav) return;
  siteNav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-open");
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeNavigation();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavigation();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeNavigation();
  });
}

if (backToTop) {
  const updateBackToTop = () => {
    const isVisible = window.scrollY > window.innerHeight * 0.45;
    backToTop.classList.toggle("is-visible", isVisible);
    backToTop.tabIndex = isVisible ? 0 : -1;
  };

  updateBackToTop();
  window.addEventListener("scroll", updateBackToTop, { passive: true });
}

document.querySelectorAll(".work-card .item-meta, .web-item .item-meta").forEach((meta) => {
  const labels = meta.textContent
    .replace(/UI\s*\/\s*UX/gi, "__UIUX__")
    .split(/\s*(?:·|,|\/|／)\s*/)
    .map((label) => label.replace(/__UIUX__/g, "UI/UX").trim())
    .filter(Boolean);

  if (labels.length === 0) return;

  meta.textContent = "";
  meta.setAttribute("aria-label", labels.join(", "));

  labels.forEach((label) => {
    const tag = document.createElement("span");
    tag.className = "item-meta-tag";
    tag.textContent = label;
    meta.append(tag);
  });

  if (!meta.closest(".web-item")) return;

  const description = [...meta.parentElement.children].find(
    (element) => element.tagName === "P" && element !== meta
  );
  if (description) description.after(meta);
});

document.querySelectorAll(".filter-group[data-filter-target]").forEach((filterGroup) => {
  const target = filterGroup.dataset.filterTarget;
  const buttons = [...filterGroup.querySelectorAll(".filter-button")];
  const yearGroups = [...document.querySelectorAll(`[data-filter-group="${target}"]`)];
  const emptyState = document.querySelector(`[data-empty-state="${target}"]`);

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.dataset.filter || "all";
      let visibleCount = 0;

      if (target === "work") {
        const projectsSection = document.querySelector(".projects-section");
        projectsSection?.classList.toggle("is-visual-mode", selected === "visual");
        projectsSection?.classList.toggle("is-uiux-mode", selected === "uiux");
        projectsSection?.classList.toggle("is-video-mode", selected === "video");
        projectsSection?.classList.toggle("is-marketing-mode", selected === "marketing");
      }

      buttons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      yearGroups.forEach((yearGroup) => {
        const items = [...yearGroup.querySelectorAll("article[data-category]")];
        let visibleInYear = 0;

        items.forEach((item) => {
          const categories = (item.dataset.category || "").split(/\s+/);
          const matches = selected === "all" || categories.includes(selected);
          item.classList.toggle("is-hidden", !matches);
          if (matches) visibleInYear += 1;
        });

        yearGroup.classList.toggle("is-hidden", visibleInYear === 0);
        visibleCount += visibleInYear;
      });

      filterGroup
        .closest("section")
        ?.querySelectorAll(".year-jump a")
        .forEach((link) => {
          const yearGroup = document.querySelector(link.getAttribute("href"));
          link.hidden = Boolean(yearGroup?.classList.contains("is-hidden"));
        });

      if (emptyState) emptyState.hidden = visibleCount > 0;
    });
  });

  const initialButton = buttons.find((button) => button.classList.contains("active")) || buttons[0];
  initialButton?.click();
});

const observedSections = navLinks
  .map((link) => link.getAttribute("href"))
  .filter((href) => href?.startsWith("#"))
  .map((href) => document.querySelector(href))
  .filter(Boolean);

if ("IntersectionObserver" in window && observedSections.length > 0) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) return;

      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${visibleEntry.target.id}`;
        if (isCurrent) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    },
    {
      rootMargin: "-18% 0px -68% 0px",
      threshold: [0, 0.2, 0.5],
    }
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}
