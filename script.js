(function () {
  "use strict";

  const deck = document.getElementById("deck");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const total = slides.length;
  let current = 0;
  let hasInteracted = false;

  const progressFill = document.getElementById("progressFill");
  const counterCurrent = document.getElementById("counterCurrent");
  const counterTotal = document.getElementById("counterTotal");
  const navPrev = document.getElementById("navPrev");
  const navNext = document.getElementById("navNext");
  const dotsWrap = document.getElementById("dots");
  const navHint = document.getElementById("navHint");

  counterTotal.textContent = String(total).padStart(2, "0");

  // ---- build dot navigation ----
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", "Đi tới slide " + (i + 1));
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.querySelectorAll(".dot"));

  function render() {
    deck.style.transform = `translateX(-${current * 100}vw)`;
    progressFill.style.width = `${((current + 1) / total) * 100}%`;
    counterCurrent.textContent = String(current + 1).padStart(2, "0");
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
    navPrev.disabled = current === 0;
    navNext.disabled = current === total - 1;
    slides.forEach((s, i) => s.classList.toggle("is-active", i === current));
  }

  function goTo(index) {
    current = Math.max(0, Math.min(total - 1, index));
    dismissHint();
    render();
  }

  function dismissHint() {
    if (hasInteracted) return;
    hasInteracted = true;
    if (navHint) navHint.classList.add("is-hidden");
  }

  navPrev.addEventListener("click", () => goTo(current - 1));
  navNext.addEventListener("click", () => goTo(current + 1));
  document.getElementById("btnStart").addEventListener("click", () => goTo(1));
  const btnRestart = document.getElementById("btnRestart");
  if (btnRestart) btnRestart.addEventListener("click", () => goTo(0));

  // ---- keyboard navigation ----
  window.addEventListener("keydown", (e) => {
    const modalOpen = engelbartModal && engelbartModal.classList.contains("is-open");
    if (modalOpen) {
      if (e.key === "Escape") closeEngelbartModal();
      return;
    }
    if (["ArrowRight", "PageDown", " "].includes(e.key)) {
      e.preventDefault();
      goTo(current + 1);
    } else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) {
      e.preventDefault();
      goTo(current - 1);
    } else if (e.key === "Home") {
      goTo(0);
    } else if (e.key === "End") {
      goTo(total - 1);
    }
  });

  // ---- touch swipe navigation ----
  let touchStartX = 0;
  let touchStartY = 0;
  window.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  window.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      dismissHint();
      if (dx < 0) goTo(current + 1);
      else goTo(current - 1);
    }
  }, { passive: true });

  render();

  // ============================================================
  // Mother of All Demos — video modal (Slide "Lịch sử ra đời")
  // ============================================================
  const engelbartPlayBtn = document.getElementById("engelbartPlayBtn");
  const engelbartModal = document.getElementById("engelbartModal");
  const engelbartBackdrop = document.getElementById("engelbartBackdrop");
  const engelbartCloseBtn = document.getElementById("engelbartCloseBtn");
  const engelbartVideo = document.getElementById("engelbartVideo");

  function openEngelbartModal() {
    if (!engelbartModal || !engelbartVideo) return;
    engelbartModal.classList.add("is-open");
    engelbartModal.setAttribute("aria-hidden", "false");
    engelbartVideo.currentTime = 0;
    engelbartVideo.muted = false;
    const playPromise = engelbartVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }

  function closeEngelbartModal() {
    if (!engelbartModal || !engelbartVideo) return;
    engelbartModal.classList.remove("is-open");
    engelbartModal.setAttribute("aria-hidden", "true");
    engelbartVideo.pause();
  }

  if (engelbartPlayBtn) engelbartPlayBtn.addEventListener("click", openEngelbartModal);
  if (engelbartBackdrop) engelbartBackdrop.addEventListener("click", closeEngelbartModal);
  if (engelbartCloseBtn) engelbartCloseBtn.addEventListener("click", closeEngelbartModal);

  // ============================================================
  // Generic tab-group initializer (classification + usage slides)
  // ============================================================
  function initTabGroup(tabsSelector) {
    const tabsEl = document.querySelector(tabsSelector);
    if (!tabsEl) return;
    const buttons = Array.from(tabsEl.querySelectorAll(".tab-btn"));
    const panelsWrap = tabsEl.parentElement.querySelector(".tab-panels");
    const panels = Array.from(panelsWrap.querySelectorAll(".tab-panel"));

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.tab;
        buttons.forEach((b) => b.classList.toggle("active", b === btn));
        panels.forEach((p) => p.classList.toggle("active", p.dataset.tab === key));
      });
    });
  }
  initTabGroup("#classTabs");
  initTabGroup("#useTabs");

  // ============================================================
  // Era rail (history timeline slide)
  // ============================================================
  (function initEraRail() {
    const rail = document.getElementById("eraRail");
    if (!rail) return;
    const buttons = Array.from(rail.querySelectorAll(".era-btn"));
    const panels = Array.from(document.querySelectorAll(".era-panel"));

    // Scrolls the rail itself only (never an outer ancestor) so the given
    // button is centred — used instead of scrollIntoView, which can walk
    // up to overflow:hidden ancestors like <body> and shift the whole page.
    function centerButtonInRail(btn) {
      const railRect = rail.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const targetCenter = btnRect.left - railRect.left + btnRect.width / 2;
      const railCenter = railRect.width / 2;
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      const newScroll = Math.max(0, Math.min(maxScroll, rail.scrollLeft + (targetCenter - railCenter)));
      rail.scrollTo({ left: newScroll, behavior: "smooth" });
    }

    buttons.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.era;
        buttons.forEach((b) => b.classList.toggle("active", b === btn));
        panels.forEach((p) => p.classList.toggle("active", p.dataset.era === key));

        // Glide the rail so the next button comes into view — handy on mobile
        // where the rail scrolls horizontally and swiping can otherwise
        // accidentally trigger the slide-to-slide swipe gesture instead.
        centerButtonInRail(buttons[i + 1] || btn);
      });
    });
  })();

  // ============================================================
  // Era visual toggle — switch between static image and 3D model
  // (Công thái học & Không dây panel)
  // ============================================================
  (function initEraVisualToggles() {
    const groups = Array.from(document.querySelectorAll(".era-visual"));
    groups.forEach((group) => {
      const buttons = Array.from(group.querySelectorAll(".era-visual-btn"));
      const panes = Array.from(group.querySelectorAll(".era-visual-pane"));
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const view = btn.dataset.view;
          buttons.forEach((b) => b.classList.toggle("active", b === btn));
          panes.forEach((p) => p.classList.toggle("active", p.dataset.view === view));
        });
      });
    });
  })();

  // ============================================================
  // Feature accordion (BioMorph Mesh slide)
  // ============================================================
  (function initFeatureAccordion() {
    const list = document.getElementById("featureList");
    if (!list) return;
    const items = Array.from(list.querySelectorAll(".feature-item"));

    items.forEach((item) => {
      const key = item.dataset.feature;
      const detail = list.querySelector(`.feature-detail[data-feature="${key}"]`);
      item.addEventListener("click", () => {
        const willOpen = !item.classList.contains("open");
        items.forEach((other) => {
          other.classList.remove("open");
          const otherKey = other.dataset.feature;
          const otherDetail = list.querySelector(`.feature-detail[data-feature="${otherKey}"]`);
          if (otherDetail) otherDetail.classList.remove("open");
        });
        if (willOpen) {
          item.classList.add("open");
          if (detail) detail.classList.add("open");
        }
      });
    });

    // open the first feature by default
    if (items[0]) items[0].click();
  })();
})();
