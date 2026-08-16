/**
 * 홈 배너 — 배경 그래프 + 슬라이드 넘김
 *
 * 둘 다 「없어도 되는」 것으로 만든다. 슬라이드 내용은 전부 문서에 들어 있고
 * 트랙이 scroll-snap 가로 스크롤이라, 스크립트가 죽어도 손가락과 트랙패드로 넘어간다.
 * 배경은 캔버스 한 장이므로 없으면 어두운 면만 남는다.
 */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ==================================================================
     1. 배경 그래프
     파티클을 흩뿌리는 흔한 배경 대신 이 회사가 다루는 것을 그린다 —
     노드는 테이블, 선은 관계, 선을 따라 흐르는 점은 질의가 지나간 자취다.
     배경이므로 눈에 띄면 실패다. 느리고 흐리게 둔다.
     ================================================================== */
  (function graph() {
    const canvas = document.getElementById("banner-canvas");
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext("2d");
    const WARM = "237, 125, 49";
    const COOL = "0, 145, 170";

    let w = 0;
    let h = 0;
    let nodes = [];
    let edges = [];
    let raf = null;

    function build() {
      /* 화면 넓이에 따라 노드 수를 정한다. 좁은 화면에 40개를 두면
         선이 뒤엉켜 배경이 아니라 무늬가 된다. */
      const count = Math.max(14, Math.min(38, Math.round((w * h) / 26000)));
      const cols = Math.max(1, Math.ceil(Math.sqrt(count * (w / Math.max(h, 1)))));
      const rows = Math.max(1, Math.ceil(count / cols));

      nodes = Array.from({ length: count }, (_, i) => {
        /* 완전 난수는 뭉치고 빈 곳이 생긴다. 느슨한 격자 위에 흩어 둔다 */
        const gx = ((i % cols) + 0.5) / cols;
        const gy = (Math.floor(i / cols) + 0.5) / rows;
        return {
          x: (gx + (Math.random() - 0.5) * 0.6 / cols) * w,
          y: (gy + (Math.random() - 0.5) * 0.6 / rows) * h,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          r: Math.random() < 0.22 ? 2.6 : 1.5,
        };
      });

      edges = [];
      const LINK = Math.min(w, h) * 0.3;
      const seen = new Set();

      for (let i = 0; i < nodes.length; i++) {
        const near = [];
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < LINK) near.push({ j: j, d: d });
        }
        near.sort((a, b) => a.d - b.d);
        /* 관계는 두 개까지만. 전부 이으면 그물이 되어 구조가 안 보인다 */
        near.slice(0, 2).forEach((n) => {
          const key = i < n.j ? i + "-" + n.j : n.j + "-" + i;
          if (seen.has(key)) return;
          seen.add(key);
          edges.push({
            a: i,
            b: n.j,
            /* 일부 관계에만 흐름을 준다. 전부 흐르면 소란스럽다 */
            flow: Math.random() < 0.28 ? Math.random() : -1,
            speed: 0.0016 + Math.random() * 0.0022,
            warm: Math.random() < 0.5,
          });
        });
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      /* 레티나에서 선이 뭉개지지 않게 실제 픽셀로 그린다.
         배경이라 2배까지면 충분하고 3배는 낭비다. */
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function draw(animate) {
      ctx.clearRect(0, 0, w, h);

      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const fade = Math.max(0, 1 - d / (Math.min(w, h) * 0.32));

        ctx.strokeStyle = "rgba(255, 255, 255, " + (0.05 * fade).toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        if (e.flow < 0) continue;
        if (animate) {
          e.flow += e.speed;
          if (e.flow > 1) e.flow = 0;
        }

        const t = e.flow;
        /* 양 끝에서 사라지게 해 점이 갑자기 나타나지 않도록 */
        const alpha = Math.sin(t * Math.PI) * 0.6 * fade;
        ctx.fillStyle = "rgba(" + (e.warm ? WARM : COOL) + ", " + alpha.toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const n of nodes) {
        if (animate) {
          n.x += n.vx;
          n.y += n.vy;
          /* 화면 밖으로 나가면 그래프에 구멍이 생긴다 */
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
        }
        ctx.fillStyle = "rgba(255, 255, 255, " + (n.r > 2 ? 0.34 : 0.16) + ")";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop() {
      draw(true);
      raf = window.requestAnimationFrame(loop);
    }

    function start() {
      if (raf || reduced.matches) return;
      raf = window.requestAnimationFrame(loop);
    }

    function stop() {
      if (!raf) return;
      window.cancelAnimationFrame(raf);
      raf = null;
    }

    let settle;
    window.addEventListener("resize", () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(() => { resize(); draw(false); }, 160);
    });

    /* 안 보이는 동안 그리지 않는다 — 노트북 배터리를 태울 이유가 없다 */
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
        { threshold: 0 }
      ).observe(canvas);
    }

    reduced.addEventListener("change", () => {
      if (reduced.matches) { stop(); draw(false); }
      else start();
    });

    resize();
    /* 모션을 줄이도록 설정한 사용자에게도 한 장은 남긴다.
       배경을 통째로 비우면 배너가 밋밋한 검정이 된다. */
    draw(false);
    start();
  })();

  /* ==================================================================
     2. 슬라이드 넘김
     첫 장은 회사 메시지, 이어서 제품이 하나씩 지나간다.
     ================================================================== */
  (function carousel() {
    const root = document.querySelector("[data-banner]");
    if (!root) return;

    const track = root.querySelector(".banner__track");
    const slides = Array.from(root.querySelectorAll(".banner__slide"));
    const dots = Array.from(root.querySelectorAll(".banner__dot"));
    const prev = root.querySelector("[data-banner-prev]");
    const next = root.querySelector("[data-banner-next]");
    const pause = root.querySelector("[data-banner-pause]");
    if (!track || slides.length < 2) return;

    const INTERVAL = 6000;
    let index = 0;
    let timer = null;
    /* 사용자가 직접 멈춘 상태. 마우스를 올려 잠깐 멈춘 것과 구분해야
       마우스를 치웠을 때 멋대로 다시 돌지 않는다. */
    let stoppedByUser = reduced.matches;

    function sync() {
      dots.forEach((d, i) => d.setAttribute("aria-current", i === index ? "true" : "false"));
      slides.forEach((s, i) => {
        /* 보이지 않는 슬라이드의 버튼이 탭 순서에 끼어들지 않게 한다 */
        s.querySelectorAll("a, button").forEach((el) => {
          if (i === index) el.removeAttribute("tabindex");
          else el.setAttribute("tabindex", "-1");
        });
      });
    }

    function goTo(i, smooth) {
      index = (i + slides.length) % slides.length;
      track.scrollTo({
        left: slides[index].offsetLeft - slides[0].offsetLeft,
        behavior: smooth === false || reduced.matches ? "auto" : "smooth",
      });
      sync();
    }

    function start() {
      if (stoppedByUser || timer) return;
      timer = window.setInterval(() => goTo(index + 1), INTERVAL);
    }

    function stop() {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    }

    prev && prev.addEventListener("click", () => goTo(index - 1));
    next && next.addEventListener("click", () => goTo(index + 1));
    dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));

    if (pause) {
      pause.setAttribute("aria-pressed", String(stoppedByUser));
      pause.addEventListener("click", () => {
        stoppedByUser = !stoppedByUser;
        pause.setAttribute("aria-pressed", String(stoppedByUser));
        pause.setAttribute("aria-label", stoppedByUser ? "배너 자동 넘김 켜기" : "배너 자동 넘김 멈추기");
        if (stoppedByUser) stop();
        else start();
      });
    }

    /* 읽는 중에는 넘어가지 않는다 */
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", () => { if (!stoppedByUser) start(); });
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", (e) => {
      if (!root.contains(e.relatedTarget) && !stoppedByUser) start();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else if (!stoppedByUser) start();
    });

    /* 손가락으로 넘겼을 때 표시가 따라오게 한다 */
    let scrollSettle;
    track.addEventListener("scroll", () => {
      window.clearTimeout(scrollSettle);
      scrollSettle = window.setTimeout(() => {
        const mid = track.scrollLeft + track.clientWidth / 2;
        const base = slides[0].offsetLeft;
        const found = slides.findIndex(
          (s) => s.offsetLeft - base <= mid && mid < s.offsetLeft - base + s.offsetWidth
        );
        if (found >= 0 && found !== index) {
          index = found;
          sync();
        }
      }, 120);
    }, { passive: true });

    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") goTo(index - 1);
      else if (e.key === "ArrowRight") goTo(index + 1);
    });

    sync();
    start();
  })();
})();
