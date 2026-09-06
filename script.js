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

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.era;
        buttons.forEach((b) => b.classList.toggle("active", b === btn));
        panels.forEach((p) => p.classList.toggle("active", p.dataset.era === key));
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
