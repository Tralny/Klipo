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

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsIntersectionObserver = "IntersectionObserver" in window;
  const reveals = document.querySelectorAll(".reveal");
  if (reducedMotion || !supportsIntersectionObserver) {
    reveals.forEach((node) => node.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    reveals.forEach((node) => observer.observe(node));
  }

  const motionVideos = document.querySelectorAll("[data-motion-video]");
  if (!reducedMotion && supportsIntersectionObserver) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.45 });

    motionVideos.forEach((video) => videoObserver.observe(video));
  }

  const showcase = document.querySelector("[data-showcase]");
  if (showcase) {
    const tabs = Array.from(showcase.querySelectorAll(".showcase-tab"));
    const stage = showcase.querySelector("[role='tabpanel']");
    const stageVideo = showcase.querySelector("[data-showcase-video]");
    const stagePoster = showcase.querySelector("[data-showcase-poster]");
    const preloaders = [];

    tabs.forEach((tab, index) => {
      if (!tab.id) tab.id = `showcase-tab-${index + 1}`;
    });

    function selectShowcaseTab(tab, shouldFocus) {
      if (!tab || !stageVideo) return;

      tabs.forEach((item) => {
        const isSelected = item === tab;
        item.classList.toggle("is-active", isSelected);
        item.setAttribute("aria-selected", String(isSelected));
        item.tabIndex = isSelected ? 0 : -1;
      });

      if (stage) stage.setAttribute("aria-labelledby", tab.id);

      const source = stageVideo.querySelector("source");
      if (source && source.getAttribute("src") !== tab.dataset.video) {
        stageVideo.classList.remove("is-ready");
        stageVideo.pause();
        if (stagePoster) stagePoster.src = tab.dataset.poster;
        source.setAttribute("src", tab.dataset.video);
        stageVideo.poster = tab.dataset.poster;
        stageVideo.load();
        if (!reducedMotion) stageVideo.play().catch(() => {});
      }

      if (shouldFocus) tab.focus();
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => selectShowcaseTab(tab, false));
      tab.addEventListener("keydown", (event) => {
        const currentIndex = tabs.indexOf(tab);
        let nextIndex = null;

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          nextIndex = (currentIndex + 1) % tabs.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = tabs.length - 1;
        }

        if (nextIndex === null) return;
        event.preventDefault();
        selectShowcaseTab(tabs[nextIndex], true);
      });
    });

    const showVideoFrame = () => stageVideo.classList.add("is-ready");
    stageVideo.addEventListener("loadeddata", showVideoFrame);
    stageVideo.addEventListener("playing", showVideoFrame);
    stageVideo.addEventListener("error", () => stageVideo.classList.remove("is-ready"));
    if (stageVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) showVideoFrame();

    function preloadShowcaseMedia() {
      const activeSource = stageVideo.querySelector("source")?.getAttribute("src");
      tabs.forEach((tab) => {
        const poster = new Image();
        poster.src = tab.dataset.poster;

        if (tab.dataset.video === activeSource) return;
        const video = document.createElement("video");
        video.className = "showcase-video-preload";
        video.muted = true;
        video.playsInline = true;
        video.preload = "auto";
        video.src = tab.dataset.video;
        video.setAttribute("aria-hidden", "true");
        video.tabIndex = -1;
        showcase.appendChild(video);
        video.load();
        preloaders.push(video);
      });
    }

    const schedulePreload = () => {
      if (supportsIntersectionObserver) {
        const preloadObserver = new IntersectionObserver((entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          preloadObserver.disconnect();
          preloadShowcaseMedia();
        }, { rootMargin: "900px 0px" });
        preloadObserver.observe(showcase);
      } else {
        window.setTimeout(preloadShowcaseMedia, 350);
      }
    };

    if (document.readyState === "complete") {
      schedulePreload();
    } else {
      window.addEventListener("load", schedulePreload, { once: true });
    }
  }
})();
