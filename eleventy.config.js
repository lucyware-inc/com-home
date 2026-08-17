/**
 * Eleventy 설정 — 정적 산출물 생성기
 *
 * 왜 빌드 단계를 두는가:
 * 페이지가 11개로 늘면서 헤더·푸터·GNB 가 페이지마다 복사된다. 메뉴 한 줄을
 * 고칠 때 11개 파일을 동시에 고쳐야 하고, 그중 하나를 빠뜨리면 사이트가
 * 조용히 어긋난다. 레이아웃 1벌 + 메뉴 데이터 1벌만 두고 HTML 을 찍어내면
 * 그 문제가 사라진다.
 *
 * 산출물은 여전히 순수 정적 HTML 이다 — Cloudflare Pages 가 그대로 서빙하고,
 * 방문자 브라우저에는 프레임워크가 한 줄도 내려가지 않는다.
 */
export default function (eleventyConfig) {
  // 정적 자산은 변환하지 않고 그대로 복사한다.
  // vendor/ 는 의도적으로 제외한다 — Bootstrap·AOS·Swiper 등 옛 템플릿 의존성이며
  // 새 페이지는 쓰지 않는다. 복사하지 않으면 배포 산출물에서도 함께 빠진다.
  eleventyConfig.addPassthroughCopy("assets/css");
  eleventyConfig.addPassthroughCopy("assets/img");
  eleventyConfig.addPassthroughCopy("assets/js");
  eleventyConfig.addPassthroughCopy("_headers");
  eleventyConfig.addPassthroughCopy("_redirects");

  // Cloudflare Pages Functions 는 빌드 산출물 루트에 있어야 인식된다.
  eleventyConfig.addPassthroughCopy("functions");

  // CSS·JS 를 고치면 브라우저를 새로 고친다
  eleventyConfig.addWatchTarget("assets/css");
  eleventyConfig.addWatchTarget("assets/js");

  /**
   * 현재 페이지가 이 URL 트리 안에 있는가 — GNB 활성 표시에 쓴다.
   * "/solutions/metadrag/" 는 "/solutions/" 아래에 있다.
   */
  eleventyConfig.addFilter("isUnder", function (pageUrl, sectionUrl) {
    if (!pageUrl || !sectionUrl) return false;
    if (sectionUrl === "/") return pageUrl === "/";
    return pageUrl === sectionUrl || pageUrl.startsWith(sectionUrl);
  });

  /**
   * 전화번호 — 국내 표기 하나만 적어 두고 나머지는 여기서 만든다.
   *
   * 국제표기를 site.js 에 따로 적어 두었더니 같은 번호가 두 벌이 되었다.
   * 한쪽만 고치면 화면에 어느 것이 나올지 사람이 알 수 없다 —
   * 번호가 바뀌는 날 반드시 어긋난다.
   *
   *   "02-861-6190" | intlPhone  →  "+82-2-861-6190"   (영어 화면에 보이는 글자)
   *   "02-861-6190" | telUri     →  "tel:+8228616190"  (눌러서 거는 링크)
   *
   * 국가번호를 붙일 때는 시외국번 앞의 0 을 뺀다. `+82 02-…` 는 어느 나라에서도
   * 연결되지 않는 번호다.
   */
  eleventyConfig.addFilter("intlPhone", function (num) {
    const s = String(num || "").trim();
    if (!s) return "";
    if (s.startsWith("+")) return s; // 이미 국제표기 — 두 번 붙이지 않는다
    // 0 으로 시작하면 그 0 이 국내 전용 접두사이므로 뺀다.
    // 1588·1544 같은 대표번호는 0 이 없고 그대로 국가번호 뒤에 온다.
    return "+82-" + (s.startsWith("0") ? s.slice(1) : s);
  });

  eleventyConfig.addFilter("telUri", function (num) {
    const digits = String(num || "").replace(/\D/g, "");
    if (!digits) return "";
    // tel: URI 에는 공백·괄호·하이픈을 넣지 않는다 — 모바일 다이얼러가 열리지 않는다
    return "tel:+82" + digits.replace(/^0/, "");
  });

  /**
   * GNB 그룹을 id 로 꺼낸다 — 홈이 Solution 구역과 Products 카드를 각각 그릴 때 쓴다.
   * 목록을 홈에 다시 적지 않고 site.js 의 nav 하나만 읽게 하려는 것이다.
   */
  eleventyConfig.addFilter("navGroup", function (nav, id) {
    return (nav || []).find((item) => item.id === id) || { children: [] };
  });

  /** 메뉴 항목(자식 포함)이 현재 페이지를 담고 있는가 */
  eleventyConfig.addFilter("navActive", function (item, pageUrl) {
    if (!pageUrl) return false;
    if (item.url && (pageUrl === item.url || pageUrl.startsWith(item.url)))
      return true;
    return (item.children || []).some((c) => pageUrl.startsWith(c.url));
  });

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      data: "_data",
    },
    // .md 도 Nunjucks 문법을 쓸 수 있게 둔다 (Insights 글이 늘면 마크다운으로 쓴다)
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
}
