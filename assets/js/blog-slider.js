/**
 * Initializes all .blog-slider components on service detail pages using Swiper,
 * keeps the subservices section sticky until every slide has displayed on scroll,
 * and falls back cleanly to vanilla JS if Swiper CDN is unavailable.
 */
(function initBlogSliders() {
  const sliders = document.querySelectorAll(".blog-slider");
  if (!sliders.length) return;

  const STICKY_MIN_WIDTH = 769;

  sliders.forEach((sliderEl) => {
    const sectionEl = sliderEl.closest(".sp-slider-section");
    const containerEl = sectionEl ? sectionEl.querySelector(":scope > .container") : null;
    const outerEl = sliderEl.closest(".blog-slider-outer");
    const paginationEl = sliderEl.querySelector(".blog-slider__pagination");
    const prevBtns = sliderEl.querySelectorAll(".slider-prev-btn");
    const nextBtns = sliderEl.querySelectorAll(".slider-next-btn");
    const slides = Array.from(sliderEl.querySelectorAll(".blog-slider__item"));
    const bullets = Array.from(sliderEl.querySelectorAll(".swiper-pagination-bullet"));
    const slideCount = slides.length;
    if (!slideCount) return;

    let currentIdx = 0;
    let isStickyActive = false;
    let maxScrollDist = 0;
    let swiperInstance = null;

    let progressCue = outerEl ? outerEl.querySelector(".sp-slider-progress-cue") : null;
    if (outerEl && !progressCue && slideCount > 1) {
      progressCue = document.createElement("div");
      progressCue.className = "sp-slider-progress-cue";
      progressCue.innerHTML =
        `<span class="sp-slider-step-text">01 / ${String(slideCount).padStart(2, "0")}</span>` +
        `<div class="sp-slider-progress-track"><div class="sp-slider-progress-fill"></div></div>` +
        `<span class="sp-slider-scroll-hint">Scroll to explore all</span>`;
      outerEl.appendChild(progressCue);
    }

    const stepTextEl = progressCue ? progressCue.querySelector(".sp-slider-step-text") : null;
    const progressFillEl = progressCue ? progressCue.querySelector(".sp-slider-progress-fill") : null;

    const updateProgressUI = (idx, continuousProgress) => {
      if (stepTextEl) {
        stepTextEl.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(slideCount).padStart(2, "0")}`;
      }
      if (progressFillEl) {
        const pct = typeof continuousProgress === "number"
          ? Math.max(4, Math.min(100, continuousProgress * 100))
          : ((idx + 1) / slideCount) * 100;
        progressFillEl.style.width = `${pct.toFixed(1)}%`;
      }
    };

    const goToSlide = (idx) => {
      const clamped = Math.max(0, Math.min(slideCount - 1, idx));
      if (clamped === currentIdx && ((swiperInstance && swiperInstance.activeIndex === clamped) || !swiperInstance)) {
        return;
      }
      currentIdx = clamped;
      if (swiperInstance) {
        swiperInstance.slideTo(clamped);
      } else {
        slides.forEach((s, i) => s.classList.toggle("swiper-slide-active", i === clamped));
        bullets.forEach((b, i) => b.classList.toggle("swiper-pagination-bullet-active", i === clamped));
      }
      if (!isStickyActive) {
        updateProgressUI(clamped);
      }
    };

    if (window.Swiper) {
      swiperInstance = new Swiper(sliderEl, {
        spaceBetween: 30,
        effect: "fade",
        fadeEffect: { crossFade: true },
        speed: 420,
        loop: false,
        allowTouchMove: true,
        pagination: paginationEl
          ? {
              el: paginationEl,
              clickable: true
            }
          : undefined
      });

      swiperInstance.on("slideChange", () => {
        currentIdx = swiperInstance.activeIndex;
        if (!isStickyActive) {
          updateProgressUI(currentIdx);
        }
      });
    } else {
      sliderEl.classList.add("blog-slider--fallback");
    }

    const scrollToSlideStop = (targetIdx) => {
      const wrapped = ((targetIdx % slideCount) + slideCount) % slideCount;
      if (isStickyActive && sectionEl && maxScrollDist > 0) {
        const sectionTop = window.scrollY + sectionEl.getBoundingClientRect().top;
        const segmentCenter = (wrapped + 0.5) / slideCount;
        const targetY = sectionTop + segmentCenter * maxScrollDist;
        window.scrollTo({ top: Math.round(targetY), behavior: "smooth" });
      } else {
        goToSlide(wrapped);
      }
    };

    prevBtns.forEach((btn) => btn.addEventListener("click", () => scrollToSlideStop(currentIdx - 1)));
    nextBtns.forEach((btn) => btn.addEventListener("click", () => scrollToSlideStop(currentIdx + 1)));

    if (paginationEl) {
      paginationEl.addEventListener("click", (e) => {
        if (!isStickyActive || maxScrollDist <= 0) return;
        const bullet = e.target.closest(".swiper-pagination-bullet");
        if (!bullet) return;
        const allBullets = Array.from(paginationEl.querySelectorAll(".swiper-pagination-bullet"));
        const idx = allBullets.indexOf(bullet);
        if (idx >= 0) {
          e.preventDefault();
          e.stopPropagation();
          scrollToSlideStop(idx);
        }
      }, true);
    }

    const onScrollSync = () => {
      if (!isStickyActive || !sectionEl || maxScrollDist <= 0) return;
      const rect = sectionEl.getBoundingClientRect();
      const scrolled = Math.max(0, Math.min(maxScrollDist, -rect.top));
      const progress = scrolled / maxScrollDist;
      const nextIdx = Math.min(slideCount - 1, Math.floor(progress * slideCount));

      updateProgressUI(nextIdx, progress);
      if (nextIdx !== currentIdx) {
        goToSlide(nextIdx);
      }
    };

    const updateStickyGeometry = () => {
      if (!sectionEl || !containerEl || slideCount <= 1) return;

      sectionEl.classList.remove("is-sticky-enabled");
      sectionEl.style.height = "";
      containerEl.style.top = "";

      if (window.innerWidth < STICKY_MIN_WIDTH) {
        isStickyActive = false;
        updateProgressUI(currentIdx);
        return;
      }

      sectionEl.classList.add("is-sticky-enabled");
      const stageHeight = Math.max(containerEl.offsetHeight, window.innerHeight);

      const stepPx = Math.max(380, Math.min(600, Math.round(window.innerHeight * 0.65)));
      maxScrollDist = stepPx * slideCount;
      sectionEl.style.height = `${stageHeight + maxScrollDist}px`;
      isStickyActive = true;

      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }
      onScrollSync();
    };

    updateStickyGeometry();
    window.addEventListener("scroll", onScrollSync, { passive: true });
    window.addEventListener("resize", updateStickyGeometry, { passive: true });
    window.addEventListener("load", updateStickyGeometry);
  });
})();
