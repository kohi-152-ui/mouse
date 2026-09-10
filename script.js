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
  const topbar = document.getElementById("topbar");

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
    showTopbar();
  }

  // ============================================================
  // Top bar auto-hide — visible right after a slide change or when
  // the cursor/finger is near the top edge, fades out otherwise
  // ============================================================
  const TOPBAR_HIDE_DELAY = 1800;
  const TOPBAR_HOVER_ZONE = 90; // px from the top of the viewport
  let topbarHideTimer = null;
  let topbarHovered = false;

  function showTopbar() {
    if (!topbar) return;
    topbar.classList.remove("is-idle");
    clearTimeout(topbarHideTimer);
    scheduleTopbarHide();
  }

  function scheduleTopbarHide() {
    clearTimeout(topbarHideTimer);
    topbarHideTimer = setTimeout(() => {
      if (!topbarHovered) topbar.classList.add("is-idle");
    }, TOPBAR_HIDE_DELAY);
  }

  if (topbar) {
    topbar.addEventListener("mouseenter", () => {
      topbarHovered = true;
      clearTimeout(topbarHideTimer);
      topbar.classList.remove("is-idle");
    });
    topbar.addEventListener("mouseleave", () => {
      topbarHovered = false;
      scheduleTopbarHide();
    });
    window.addEventListener("mousemove", (e) => {
      if (e.clientY < TOPBAR_HOVER_ZONE) showTopbar();
    });
    window.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches[0] && e.touches[0].clientY < TOPBAR_HOVER_ZONE) showTopbar();
      },
      { passive: true }
    );
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
  // History timeline (slide "Lịch sử ra đời") — up/down arrows reveal
  // one milestone at a time from a collapsed frame ("phóng to" on open).
  //
  // The outgoing item is collapsed FIRST, and only once that transition
  // finishes does the incoming item expand. Previously both classes were
  // toggled in the same tick, so the collapse and the expand animated at
  // the same time — the items underneath got pushed by two competing
  // height changes within a frame, which read as a "rung" (shake/jitter),
  // especially on fast/repeated clicks.
  // ============================================================
  (function initHistoryTimeline() {
    const timeline = document.getElementById("historyTimeline");
    if (!timeline) return;
    const items = Array.from(timeline.querySelectorAll("li"));
    const heads = Array.from(timeline.querySelectorAll(".tl-head"));
    const prevBtn = document.getElementById("tlPrevBtn");
    const nextBtn = document.getElementById("tlNextBtn");
    let index = Math.max(0, items.findIndex((li) => li.classList.contains("active")));
    let isCollapsing = false; // true while the outgoing item is mid-collapse

    // Matches .tl-detail's max-height transition duration in style.css —
    // used as a fallback in case transitionend never fires (backgrounded
    // tab, reduced-motion settings, etc.) so the UI can't get stuck.
    const COLLAPSE_FALLBACK_MS = 460;

    function updateNavButtons() {
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === items.length - 1;
    }

    function goTo(target) {
      target = Math.max(0, Math.min(items.length - 1, target));
      // Ignore clicks on the current item, and while a collapse is still
      // playing out — this also stops rapid double-clicks from stacking
      // up multiple pending transitions.
      if (target === index || isCollapsing) return;

      const outgoing = items[index];
      const incoming = items[target];
      const outgoingDetail = outgoing.querySelector(".tl-detail");

      index = target;
      updateNavButtons();

      // Step 1 — collapse the old item.
      isCollapsing = true;
      outgoing.classList.remove("active");

      let opened = false;
      function openIncoming() {
        if (opened) return;
        opened = true;
        // Step 2 — only now expand the new item.
        incoming.classList.add("active");
        isCollapsing = false;
      }

      if (outgoingDetail) {
        outgoingDetail.addEventListener("transitionend", function onEnd(e) {
          if (e.target !== outgoingDetail || e.propertyName !== "max-height") return;
          outgoingDetail.removeEventListener("transitionend", onEnd);
          openIncoming();
        });
        setTimeout(openIncoming, COLLAPSE_FALLBACK_MS);
      } else {
        openIncoming();
      }
    }

    if (prevBtn) prevBtn.addEventListener("click", () => goTo(index - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goTo(index + 1));
    heads.forEach((head, i) => head.addEventListener("click", () => goTo(i)));

    updateNavButtons();
  })();

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

  // ============================================================
  // Theme toggle — Pastel (light) / Dark switch (cover slide)
  // Dark mode points the "Công thái học & Không dây" 3D model at a
  // separate .glb file — see MODEL_SRC below to change the paths.
  // ============================================================
  (function initThemeToggle() {
    const toggleBtn = document.getElementById("themeToggle");
    if (!toggleBtn) return;
    const toggleLabel = document.getElementById("themeToggleLabel");
    const modelViewer = document.getElementById("mouseModelViewer");

    // Đường dẫn file .glb cho từng theme — đổi ở đây nếu bạn đặt tên file khác.
    const MODEL_SRC = {
      pastel: "assets/Mouse1.glb",
      dark: "assets/Mouse2.glb"
    };
    const STORAGE_KEY = "mouseDeckTheme";

    function applyTheme(theme, silent) {
      document.documentElement.setAttribute("data-theme", theme);
      toggleBtn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      if (toggleLabel) toggleLabel.textContent = theme === "dark" ? "Dark" : "Pastel";
      if (modelViewer) modelViewer.setAttribute("src", MODEL_SRC[theme] || MODEL_SRC.pastel);
      if (!silent) {
        try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* private mode / sandbox: ignore */ }
      }
    }

    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    applyTheme(saved === "dark" ? "dark" : "pastel", true);

    toggleBtn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      applyTheme(isDark ? "pastel" : "dark");
    });
  })();
})();


// ============================================================
  // Auto-Submit Star Rating (Slide 8)
  // ============================================================
  (function initStarRating() {
    const starRating = document.getElementById("starRating");
    const ratingMsg = document.getElementById("ratingMsg");
    const surveyWrapper = document.getElementById("surveyWrapper");
    
    if (!starRating) return;

    const stars = Array.from(starRating.querySelectorAll(".star-btn"));
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzbuVIiQDR01BXyYG-7vKxqCp3lNuFPGpL6DC8p5cuqZZ-jn2WKUQmTTmtlcmcrYOLB/exec"; 
    const STORAGE_KEY = "hasRatedMouseDeck"; 

    // 1. Kiểm tra nếu người dùng đã từng cho sao (thoát ra vào lại hoặc F5)
    const savedRating = localStorage.getItem(STORAGE_KEY);
    if (savedRating) {
      starRating.classList.add("is-disabled"); 
      const targetStar = stars.find(s => s.dataset.val === savedRating);
      if (targetStar) targetStar.classList.add("is-selected");

      if (ratingMsg) {
        ratingMsg.textContent = "Bạn đã đánh giá " + savedRating + " sao. Cảm ơn bạn! 💖";
        ratingMsg.style.color = "var(--cyan)";
        ratingMsg.classList.add("show");
      }
      
      // Giữ cho nút khảo sát hiện sẵn luôn, không bị mất
      if (surveyWrapper) {
        surveyWrapper.classList.add("is-visible");
      }
      return; 
    }

    // 2. Lắng nghe người mới bấm chọn sao
    stars.forEach(star => {
      star.addEventListener("click", async () => {
        const ratingValue = star.dataset.val;

        starRating.classList.add("is-disabled");
        stars.forEach(s => s.classList.remove("is-selected"));
        star.classList.add("is-selected");
        
        if (ratingMsg) {
          ratingMsg.textContent = "Đang gửi đánh giá...";
          ratingMsg.style.color = "var(--ink-muted)";
          ratingMsg.classList.add("show");
        }

        try {
          await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: "Không",
              name: "Khách Ẩn Danh", 
              rating: ratingValue,
              feedback: "Đánh giá 1-click cuối Slide"
            })
          });

          if (ratingMsg) {
            ratingMsg.textContent = "Cảm ơn bạn đã đánh giá " + ratingValue + " sao! 💖";
            ratingMsg.style.color = "var(--cyan)";
          }
          localStorage.setItem(STORAGE_KEY, ratingValue);

          // Chọn sao xong -> Hiện nút khảo sát lên
          if (surveyWrapper) {
            setTimeout(() => {
              surveyWrapper.classList.add("is-visible");
            }, 500);
          }

        } catch (error) {
          if (ratingMsg) {
            ratingMsg.textContent = "Có lỗi kết nối, nhưng hệ thống đã ghi nhận!";
            ratingMsg.style.color = "var(--magenta)";
          }
          starRating.classList.remove("is-disabled"); 
        }
      });
    });
  })();


  // Bật/tắt Popup QR Code khi bấm nút
(function initQrModal() {
  const qrBtn = document.getElementById("qrBtn");
  const qrModal = document.getElementById("qrModal");
  const qrBackdrop = document.getElementById("qrBackdrop");
  const qrClose = document.getElementById("qrClose");

  function openQr() {
    if (qrModal) {
      qrModal.classList.add("is-open");
      qrModal.setAttribute("aria-hidden", "false");
    }
  }

  function closeQr() {
    if (qrModal) {
      qrModal.classList.remove("is-open");
      qrModal.setAttribute("aria-hidden", "true");
    }
  }

  if (qrBtn) qrBtn.addEventListener("click", openQr);
  if (qrBackdrop) qrBackdrop.addEventListener("click", closeQr);
  if (qrClose) qrClose.addEventListener("click", closeQr);

  // Nhấn phím Escape để đóng nhanh
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && qrModal && qrModal.classList.contains("is-open")) {
      closeQr();
    }
  });
})();

// ============================================================
// ASTEROID DODGE — bonus mini-game (slide "closing")
// Player (bottom of the arena) moves left/right with the mouse
// (or a finger drag) to dodge falling asteroids and collect
// coins. Asteroid speed & spawn rate ramp up with survival time;
// touching an asteroid ends the run immediately.
// ============================================================
(function initAsteroidDodge() {
  const openBtn = document.getElementById("adOpenBtn");
  const modal = document.getElementById("asteroidModal");
  if (!openBtn || !modal) return;

  const backdrop = document.getElementById("adBackdrop");
  const closeBtn = document.getElementById("adCloseBtn");
  const startBtn = document.getElementById("adStartBtn");
  const retryBtn = document.getElementById("adRetryBtn");
  const exitBtn = document.getElementById("adExitBtn");
  const arena = document.getElementById("adArena");
  const player = document.getElementById("adPlayer");
  const hudTime = document.getElementById("adHudTime");
  const hudScore = document.getElementById("adHudScore");
  const screens = {
    intro: document.getElementById("adIntro"),
    arena: document.getElementById("adArenaScreen"),
    results: document.getElementById("adResults")
  };
  const resultEls = {
    time: document.getElementById("adResultTime"),
    score: document.getElementById("adResultScore")
  };

  // --- Tuning knobs -----------------------------------------------------
  const PLAYER_RADIUS = 16;
  const PLAYER_BOTTOM_OFFSET = 16 + 19; // css "bottom" + half player height
  const BASE_FALL_SPEED = 110; // px/second
  const MAX_FALL_SPEED_BONUS = 260; // px/second, added gradually then capped
  const SPEED_RAMP_PER_SEC = 5.5; // how fast the speed bonus grows
  const BASE_SPAWN_INTERVAL = 950; // ms between spawns at the very start
  const MIN_SPAWN_INTERVAL = 380; // ms floor — keeps it beatable
  const SPAWN_RAMP_PER_SEC = 11; // how fast the interval shrinks
  const COIN_CHANCE = 0.32; // fraction of spawns that are coins, not asteroids

  let arenaW = 460;
  let arenaH = 620;
  let playerX = 0;
  let running = false;
  let rafId = null;
  let lastFrameTime = 0;
  let elapsedMs = 0;
  let spawnAccumulator = 0;
  let score = 0;
  let objects = []; // { el, x, y, r, type, spin }

  function showScreen(name) {
    Object.keys(screens).forEach((k) => {
      if (screens[k]) screens[k].classList.toggle("is-active", k === name);
    });
  }

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    showScreen("intro");
  }

  function closeModal() {
    stopGame();
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  function measureArena() {
    arenaW = arena.clientWidth || arenaW;
    arenaH = arena.clientHeight || arenaH;
  }

  function setPlayerX(x) {
    playerX = Math.max(PLAYER_RADIUS, Math.min(arenaW - PLAYER_RADIUS, x));
    player.style.left = playerX + "px";
  }

  function onPointerMove(clientX) {
    if (!running) return;
    const rect = arena.getBoundingClientRect();
    setPlayerX(clientX - rect.left);
  }

  function handleMouseMove(e) {
    onPointerMove(e.clientX);
  }
  function handleTouchMove(e) {
    if (!running) return;
    if (e.touches && e.touches[0]) {
      e.preventDefault();
      onPointerMove(e.touches[0].clientX);
    }
  }

  function spawnObject() {
    const isCoin = Math.random() < COIN_CHANCE;
    const r = isCoin ? 12 + Math.random() * 3 : 15 + Math.random() * 9;
    const x = r + Math.random() * (arenaW - r * 2);

    const el = document.createElement("div");
    el.className = isCoin ? "ad-coin" : "ad-asteroid";
    el.style.width = r * 2 + "px";
    el.style.height = r * 2 + "px";
    el.style.left = x - r + "px";
    el.style.top = -r * 2 + "px";
    arena.appendChild(el);

    objects.push({
      el,
      x,
      y: -r,
      r,
      type: isCoin ? "coin" : "asteroid",
      speedMult: isCoin ? 0.85 : 0.9 + Math.random() * 0.3
    });
  }

  function spark(className, x, y, size) {
    const el = document.createElement("div");
    el.className = className;
    el.style.left = x + "px";
    el.style.top = y + "px";
    if (size) {
      el.style.width = size + "px";
      el.style.height = size + "px";
    }
    arena.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }

  function updateHud() {
    if (hudTime) hudTime.textContent = (elapsedMs / 1000).toFixed(1) + "s";
    if (hudScore) hudScore.textContent = "Điểm: " + score;
  }

  function endRun() {
    stopGame();
    if (resultEls.time) resultEls.time.textContent = (elapsedMs / 1000).toFixed(1);
    if (resultEls.score) resultEls.score.textContent = String(score);
    showScreen("results");
  }

  function loop(timestamp) {
    if (!running) return;
    const dt = Math.min(timestamp - lastFrameTime, 48); // clamp huge gaps (tab switch, etc.)
    lastFrameTime = timestamp;
    elapsedMs += dt;

    const elapsedSec = elapsedMs / 1000;
    const speed = BASE_FALL_SPEED + Math.min(elapsedSec * SPEED_RAMP_PER_SEC, MAX_FALL_SPEED_BONUS);
    const spawnInterval = Math.max(MIN_SPAWN_INTERVAL, BASE_SPAWN_INTERVAL - elapsedSec * SPAWN_RAMP_PER_SEC);

    spawnAccumulator += dt;
    if (spawnAccumulator >= spawnInterval) {
      spawnAccumulator = 0;
      spawnObject();
    }

    const playerY = arenaH - PLAYER_BOTTOM_OFFSET;
    let collided = false;

    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      obj.y += speed * obj.speedMult * (dt / 1000);
      obj.el.style.top = obj.y - obj.r + "px";

      const dist = Math.hypot(obj.x - playerX, obj.y - playerY);
      if (dist < obj.r + PLAYER_RADIUS) {
        if (obj.type === "coin") {
          score += 10;
          spark("ad-burst", obj.x, obj.y);
          obj.el.remove();
          objects.splice(i, 1);
          continue;
        } else {
          spark("ad-explosion", playerX, playerY, 26);
          collided = true;
          break;
        }
      }

      if (obj.y - obj.r > arenaH + 20) {
        obj.el.remove();
        objects.splice(i, 1);
      }
    }

    updateHud();

    if (collided) {
      endRun();
      return;
    }

    rafId = requestAnimationFrame(loop);
  }

  function clearObjects() {
    objects.forEach((o) => o.el.remove());
    objects = [];
  }

  function startGame() {
    showScreen("arena");
    measureArena();
    clearObjects();
    score = 0;
    elapsedMs = 0;
    spawnAccumulator = 0;
    setPlayerX(arenaW / 2);
    updateHud();
    running = true;
    lastFrameTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function stopGame() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    clearObjects();
  }

  if (arena) {
    arena.addEventListener("mousemove", handleMouseMove);
    arena.addEventListener("touchmove", handleTouchMove, { passive: false });
    arena.addEventListener("touchstart", handleTouchMove, { passive: false });
  }

  openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (backdrop) backdrop.addEventListener("click", closeModal);
  if (startBtn) startBtn.addEventListener("click", startGame);
  if (retryBtn) retryBtn.addEventListener("click", startGame);
  if (exitBtn) exitBtn.addEventListener("click", closeModal);

  // Capture-phase so this fires before the deck's own keydown handler —
  // traps every key (not just Escape) while the game is open, so arrow
  // keys/space don't drive slide navigation underneath the overlay.
  window.addEventListener(
    "keydown",
    (e) => {
      if (!modal.classList.contains("is-open")) return;
      e.stopPropagation();
      if (e.key === "Escape") closeModal();
    },
    true
  );
})();