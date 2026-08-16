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
