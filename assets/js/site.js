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
     한국어 ↔ English

     번역은 마크업에 붙여 둔다 — 영어가 필요한 자리에 속성을 달면 그것이 곧
     사전이다. 사전 파일을 따로 두면 화면의 글과 번역이 다른 파일에 떨어져,
     문구를 고칠 때 한쪽만 고치고 지나가게 된다.

         <p data-en="We build...">우리는 ...</p>          글자
         <input data-en-placeholder="Your name" ...>       속성
         <option data-en-value="Other">기타</option>       보내지는 값

     **속성까지 다루는 이유**: 폼은 글자만 바꿔서는 반쪽이다. placeholder 가
     한국어로 남으면 영어 화면에서 입력칸 안내만 한글이고, `<option>` 의 value 를
     그대로 두면 영어로 보낸 문의가 한국어 제목으로 도착한다 — 화면은 영어인데
     결과물이 한국어인 상태가 된다.

     `data-en*` 이 없는 요소는 한국어로 남는다. 지어낸 영어로 채우지 않는다 —
     제품 설명은 영업 자리에서 그대로 약속이 되므로 사람이 확정한 문장만 들어간다.
     지금 영어가 붙은 곳은 사이트 공통 UI 와 **Contact 페이지 전체**다.

     선택은 localStorage 에 남는다. 서버·빌드가 관여하지 않으므로 정적 사이트
     그대로다 — 언어별 URL(/en/)은 본문 번역이 확정된 뒤에 붙인다.
     ------------------------------------------------------------------ */
  const LANG_KEY = "lucyware-lang";
  const langSwitch = document.querySelector("[data-lang-switch]");

  // 지금 화면의 언어. 폼이 조립하는 메일도 이 값을 보고 말을 고른다.
  const currentLang = () => (document.documentElement.lang === "en" ? "en" : "ko");

  if (langSwitch) {
    const langLabel = langSwitch.querySelector("[data-lang-label]");
    // 원문은 DOM 이 아니라 여기에 담는다. data-ko 를 되받아 적으면 한국어 문장이
    // 속성으로 한 벌 더 실려 나가고, 영어 상태에서 새로고침하면 그 값이 없다.
    const original = new WeakMap();

    const readLang = () => {
      try {
        return localStorage.getItem(LANG_KEY) === "en" ? "en" : "ko";
      } catch (e) {
        return currentLang();
      }
    };

    // 요소 전체(textContent)가 아니라 「첫 글자 덩어리」 만 갈아 끼운다.
    // 버튼 안에는 화살표 SVG 가 함께 들어 있는 경우가 많아, textContent 로 덮으면
    // 그 아이콘이 조용히 사라진다. 앞뒤 공백은 그대로 두어 아이콘과의 간격도 지킨다.
    const textNodeOf = (el) => {
      for (const node of el.childNodes) {
        if (node.nodeType === 3 && node.nodeValue.trim()) return node;
      }
      return null;
    };

    /* 번역 대상을 한 번만 훑어 모은다.
       CSS 에는 「이름이 data-en- 으로 시작하는 속성」 을 고르는 선택자가 없어
       전체를 한 번 훑는다. 페이지당 한 번뿐이라 값이 싸고, 이후 전환은
       이 목록만 돈다 — 버튼을 누를 때마다 문서를 다시 뒤지지 않는다. */
    const targets = Array.prototype.filter.call(
      document.querySelectorAll("*"),
      (el) =>
        Array.prototype.some.call(
          el.attributes,
          (a) => a.name === "data-en" || a.name.indexOf("data-en-") === 0
        )
    );

    /* 한국어 원본을 떠 둔다. 영어로 바꾼 뒤 되돌릴 곳이 여기뿐이다.

       **data-en 과 data-en-html 은 쓰는 자리가 다르다.**
       data-en 은 요소의 「첫 글자 덩어리」 만 바꾼다 — 버튼 안에 화살표 SVG 가
       함께 든 경우가 많아 통째로 덮으면 그 아이콘이 조용히 사라지기 때문이다.
       그래서 문장 안에 <strong> 이나 링크가 들어 있으면 뒷부분이 한국어로 남는다.
       그런 자리는 data-en-html 로 요소 안을 통째로 갈아 끼운다 — 본문 블록의
       3분의 1이 여기 해당한다 (2026-08-20 실측: 300개 중 104개).

       **둘을 한 요소에 함께 쓰지 않는다.** innerHTML 을 갈아 끼우면 아래에서
       떠 두는 텍스트 노드가 문서에서 떨어져 나가 data-en 쪽이 아무 일도 못 한다.
       **data-en-html 을 단 요소 안에 다른 번역 대상을 두지도 않는다** — 같은
       이유로 그 자식이 통째로 교체된다. */
    function snapshot(el) {
      const hasHtml = el.hasAttribute("data-en-html");
      const node = !hasHtml && el.hasAttribute("data-en") ? textNodeOf(el) : null;
      const text = node ? node.nodeValue : "";
      // 앞뒤 공백을 따로 떼어 둔다 — 아이콘과의 사이 간격이 이 공백이다
      const pad = node ? /^(\s*)[\s\S]*?(\s*)$/.exec(text) : null;

      const attrs = [];
      Array.prototype.forEach.call(el.attributes, (a) => {
        if (a.name.indexOf("data-en-") !== 0) return;
        const name = a.name.slice("data-en-".length);
        // html 은 속성 이름이 아니라 「요소 안 전체」 를 가리키는 예약어다
        if (name === "html") return;
        attrs.push({ name: name, ko: el.getAttribute(name) || "" });
      });

      return {
        node: node,
        text: text,
        pad: pad,
        attrs: attrs,
        html: hasHtml ? el.innerHTML : null,
      };
    }

    function applyLang(lang) {
      const en = lang === "en";
      document.documentElement.lang = lang;

      targets.forEach((el) => {
        if (!original.has(el)) original.set(el, snapshot(el));
        const base = original.get(el);

        if (base.html !== null) {
          el.innerHTML = en ? el.getAttribute("data-en-html") : base.html;
        } else if (base.node) {
          base.node.nodeValue = en
            ? base.pad[1] + el.getAttribute("data-en") + base.pad[2]
            : base.text;
        }

        base.attrs.forEach((attr) => {
          el.setAttribute(
            attr.name,
            en ? el.getAttribute("data-en-" + attr.name) : attr.ko
          );
        });
      });

      /* 검증 문구는 여기서 지운다. data-en 으로 다룰 수 없는 글자라(제출할 때
         JS 가 만들어 넣는다) 남겨 두면 화면은 영어인데 빨간 글자만 한국어로 남는다. */
      document.querySelectorAll(".field__error").forEach((el) => {
        const control = el.previousElementSibling;
        if (control) {
          control.removeAttribute("aria-invalid");
          control.removeAttribute("aria-describedby");
        }
        el.remove();
      });

      // 버튼은 늘 「누르면 갈 언어」 를 그 나라 말로 보여준다
      if (langLabel) langLabel.textContent = en ? "한국어" : "EN";
      langSwitch.lang = en ? "ko" : "en";
      langSwitch.setAttribute(
        "aria-label",
        en ? "한국어로 전환" : "Switch to English"
      );
    }

    applyLang(readLang());
    langSwitch.hidden = false;

    langSwitch.addEventListener("click", () => {
      const next = readLang() === "en" ? "ko" : "en";
      try {
        localStorage.setItem(LANG_KEY, next);
      } catch (e) {
        /* 저장이 막혀도 이번 페이지에서는 바뀌어야 한다 */
      }
      applyLang(next);
    });
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
    const menuLabel = (open) =>
      currentLang() === "en"
        ? open ? "Close menu" : "Open menu"
        : open ? "메뉴 닫기" : "메뉴 열기";

    navToggle.setAttribute("aria-label", menuLabel(false));
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", menuLabel(open));
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
    /* 브라우저 기본 검증(novalidate 를 떼는 것)을 쓰지 않는 이유:
       기본 말풍선은 문구도 언어도 브라우저가 정해서, 영어 화면에서 한국어
       문구가 뜨거나 그 반대가 된다. 이 페이지는 통째로 번역되는 유일한
       페이지라 그 어긋남이 바로 보인다.

       문구는 「무엇이 잘못됐는지 + 무엇을 하면 되는지」 순으로 적는다. */
    const INVALID = {
      ko: {
        company: "회사 · 기관을 입력해 주세요.",
        name: "담당자 이름을 입력해 주세요.",
        email: "이메일 주소를 입력해 주세요.",
        emailFormat: "이메일 주소를 다시 확인해 주세요. name@company.com 형식입니다.",
        message: "문의 내용을 입력해 주세요.",
      },
      en: {
        company: "Enter your company or organization.",
        name: "Enter a contact name.",
        email: "Enter your email address.",
        emailFormat: "Check the email address — it should look like name@company.com.",
        message: "Tell us what you need.",
      },
    };

    const setError = (control, text) => {
      let note = control.nextElementSibling;
      if (!note || !note.classList.contains("field__error")) {
        note = document.createElement("span");
        note.className = "field__error";
        note.id = "invalid-" + control.name;
        control.insertAdjacentElement("afterend", note);
      }
      note.textContent = text;
      control.setAttribute("aria-invalid", "true");
      control.setAttribute("aria-describedby", note.id);
    };

    const clearError = (control) => {
      const note = control.nextElementSibling;
      if (note && note.classList.contains("field__error")) note.remove();
      control.removeAttribute("aria-invalid");
      control.removeAttribute("aria-describedby");
    };

    /* 고치는 순간 지운다. 다 채웠는데도 빨간 글자가 남아 있으면
       무엇이 아직 모자란지 사람이 다시 세어야 한다. */
    contactForm.addEventListener("input", (e) => {
      if (e.target.classList.contains("field__control")) clearError(e.target);
    });

    const validate = () => {
      const msg = INVALID[currentLang() === "en" ? "en" : "ko"];
      const invalid = [];

      ["company", "name", "email", "message"].forEach((field) => {
        const control = contactForm.elements[field];
        if (control && !control.value.trim()) {
          setError(control, msg[field]);
          invalid.push(control);
        }
      });

      const email = contactForm.elements.email;
      const value = email ? email.value.trim() : "";
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setError(email, msg.emailFormat);
        invalid.push(email);
      }

      // 첫 번째 칸으로 데려간다 — 어디부터 봐야 하는지 알려주지 않으면
      // 긴 폼에서 사람이 위아래로 훑어야 한다.
      if (invalid.length) invalid[0].focus();
      return invalid.length === 0;
    };

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) return;

      const data = new FormData(contactForm);
      const get = (k) => String(data.get(k) || "").trim();

      /* 메일 본문도 화면 언어를 따라간다. 영어로 채운 폼이 한국어 제목·항목명으로
         도착하면 보낸 사람은 자기가 무엇을 보냈는지 확인할 수 없다 —
         메일 앱이 열리고 내용이 보이는 방식이라 이 화면이 곧 영수증이다. */
      const en = currentLang() === "en";
      const t = en
        ? {
            subject: "Inquiry",
            company: "Company",
            name: "Contact",
            email: "Email",
            phone: "Phone",
            topic: "Topic",
            message: "Message",
          }
        : {
            subject: "문의",
            company: "회사 · 기관",
            name: "담당자",
            email: "이메일",
            phone: "연락처",
            topic: "문의 유형",
            message: "문의 내용",
          };

      const subject = `[${t.subject}] ${get("company") || get("name")} — ${get("topic")}`;
      const body = [
        `${t.company}: ${get("company")}`,
        `${t.name}: ${get("name")}`,
        `${t.email}: ${get("email")}`,
        `${t.phone}: ${get("phone")}`,
        `${t.topic}: ${get("topic")}`,
        "",
        t.message,
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
