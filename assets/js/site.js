/**
 * Lucyware — site.js
 *
 * 화면 동작만 담는다. 내용은 JS 없이도 전부 보여야 하고, 여기 있는 것은
 * 전부 「있으면 더 나은」 것들이다. 스크립트가 죽어도 페이지는 읽힌다.
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     헤더 — 스크롤이 시작되면 경계선을 준다.
     맨 위에서는 선이 없어야 Hero 와 헤더가 한 면으로 보인다.
     ------------------------------------------------------------------ */
  const header = document.getElementById("site-header");

  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------
     모바일 메뉴
     ------------------------------------------------------------------ */
  const navToggle = document.querySelector(".nav__toggle");
  const nav = document.getElementById("site-nav");

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "메뉴 열기");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    });
  }

  /* ------------------------------------------------------------------
     드롭다운
     데스크톱에서는 CSS 의 hover/focus-within 이 이미 열고 닫는다.
     여기서는 클릭(터치)으로 여는 길과 Esc 로 닫는 길만 더한다 —
     터치 화면에는 hover 가 없어 CSS 만으로는 열리지 않는다.
     ------------------------------------------------------------------ */
  const triggers = document.querySelectorAll(".nav__trigger");

  function closeAllPanels(except) {
    triggers.forEach((t) => {
      if (t === except) return;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.classList.remove("is-open");
      t.setAttribute("aria-expanded", "false");
    });
  }

  triggers.forEach((trigger) => {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (!panel) return;

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = panel.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", String(open));
      if (open) closeAllPanels(trigger);
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav__item--menu")) closeAllPanels();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeAllPanels();
    closeNav();
  });

  /* ------------------------------------------------------------------
     진입 애니메이션
     AOS(614줄)를 대신한다. 화면에 들어온 요소에 클래스 하나를 붙일 뿐이고,
     한 번 보인 것은 다시 감시하지 않는다.
     ------------------------------------------------------------------ */
  const revealTargets = document.querySelectorAll(".reveal");

  if (revealTargets.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  /* ------------------------------------------------------------------
     맨 위로
     ------------------------------------------------------------------ */
  const toTop = document.querySelector(".to-top");

  if (toTop) {
    const onScrollTop = () => {
      toTop.classList.toggle("is-visible", window.scrollY > 400);
    };
    onScrollTop();
    window.addEventListener("scroll", onScrollTop, { passive: true });

    toTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ------------------------------------------------------------------
     문의 폼
     서버로 보내는 API 가 아직 없다(Phase 2). 그렇다고 「전송되었습니다」 를
     띄우면 도착하지 않은 문의를 도착했다고 말하는 셈이 된다.
     그래서 지금은 입력한 내용으로 메일을 조립해 메일 앱을 연다 —
     보내는 주체가 방문자 자신이므로 도착 여부가 방문자에게 보인다.
     Phase 2 에서 이 블록만 fetch("/api/contact") 로 바꾼다.
     ------------------------------------------------------------------ */
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(contactForm);
      const get = (k) => String(data.get(k) || "").trim();

      const subject = `[문의] ${get("company") || get("name")} — ${get("topic")}`;
      const body = [
        `회사 · 기관: ${get("company")}`,
        `담당자: ${get("name")}`,
        `이메일: ${get("email")}`,
        `연락처: ${get("phone")}`,
        `문의 유형: ${get("topic")}`,
        "",
        "문의 내용",
        "----------------------------------------",
        get("message"),
      ].join("\n");

      const to = contactForm.dataset.to || "info@lucyware.com";
      window.location.href =
        `mailto:${to}?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

      const note = document.getElementById("contact-form-note");
      if (note) note.hidden = false;
    });
  }
})();
