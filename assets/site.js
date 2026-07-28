(function () {
  const root = document.documentElement;
  const storageKey = "klipo-site-language";
  const toggles = document.querySelectorAll("[data-language-toggle]");

  function setLanguage(language) {
    const next = language === "en" ? "en" : "zh";
    root.dataset.lang = next;
    root.lang = next === "zh" ? "zh-Hans" : "en";
    document.title = document.body.dataset.titleEn && next === "en"
      ? document.body.dataset.titleEn
      : document.body.dataset.titleZh || document.title;
    toggles.forEach((toggle) => {
      toggle.textContent = next === "zh" ? "EN" : "中文";
      toggle.setAttribute("aria-label", next === "zh" ? "Switch to English" : "切换到中文");
    });
    try {
      localStorage.setItem(storageKey, next);
    } catch (_) {}
  }

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      setLanguage(root.dataset.lang === "zh" ? "en" : "zh");
    });
  });

  setLanguage(root.dataset.lang);

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const reveals = document.querySelectorAll(".reveal");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    reveals.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  reveals.forEach((node) => observer.observe(node));
})();
