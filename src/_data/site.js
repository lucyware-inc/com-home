/**
 * 사이트 마스터 데이터 — 회사 정보와 GNB 구조의 단일 진실 공급원.
 *
 * 헤더·푸터·사이트맵이 모두 이 파일 하나를 읽는다. 메뉴를 바꿀 때 고치는 곳은
 * 여기 한 곳뿐이고, 11개 페이지가 다음 빌드에서 함께 따라온다.
 *
 * 주의: 여기 값은 그대로 화면에 나간다. 미확정 값에는 `_TODO` 주석을 달아 두고
 * 확인되면 지운다.
 *
 * **값을 더해도 저절로 보이지는 않는다.** 이 파일은 값의 출처일 뿐이고, 화면에
 * 나오려면 그 값을 쓰는 줄이 템플릿에 있어야 한다 — 아무도 읽지 않는 키를 더해도
 * 빌드는 조용히 지나간다(2026-08-17 `fax` 를 넣고 안 보인 적이 있다).
 */

export default {
  name: "Lucyware",
  nameKo: "루씨웨어",
  legalName: "루씨웨어 주식회사",
  legalNameEn: "Lucyware, Inc.",

  // 회사소개 페이지의 「기업 정보」 와 연혁이 함께 읽는다. 같은 날짜를 두 곳에
  // 적어 두면 한쪽만 고쳤을 때 어느 것이 참인지 알 수 없어진다.
  ceo: "정희석 (Tim CHUNG)",
  founded: "2022년 11월 22일",
  tagline: "Lumen cyberware everywhere!",
  description:
    "루씨웨어는 Metadata 기반 AI Transformation 전문 기업입니다. RDBMS 메타데이터를 AI 와 연결해 기업의 데이터 자산을 비즈니스 가치로 전환합니다.",
  descriptionEn:
    "Lucyware turns RDBMS metadata into an AI-ready foundation, connecting enterprise data assets to business value.",

  /**
   * 운영 도메인. 정규 URL(canonical)·OG 태그가 이 값을 쓴다.
   *
   * **www 를 붙인 주소가 최종 주소다.** apex(lucyware.com)는 301 로 www 에
   * 넘긴다. 여기에 apex 를 적어 두었더니 canonical 이 「따라가면 다른 곳으로
   * 넘어가는 주소」 를 가리켰다 — 정규 주소는 그 자체가 200 이어야 한다.
   * 검색엔진이 대개 한 번 더 따라가 주기는 하지만, 기댈 일이 아니다.
   *
   * 도메인 앞단(리다이렉트)이 바뀌면 이 값도 함께 본다.
   */
  url: "https://www.lucyware.com",

  /**
   * 번호는 **국내 표기 한 벌만** 적는다. 영어 화면에 나가는 국제표기와 눌러서 거는
   * 링크는 빌드가 계산해서 만든다(eleventy.config.js 의 intlPhone · telUri).
   *
   *   여기 적는 값        한국어 화면      영어 화면          누르면
   *   "02-6465-2112"  →  02-6465-2112  ·  +82-2-6465-2112  ·  +8264652112
   *
   * 국제표기를 여기 따로 적어 두었더니 같은 번호가 두 벌이 되어, 한쪽만 고치면
   * 화면에 어느 것이 나올지 알 수 없었다 (2026-08-17). 번호를 바꿀 때는 이 줄만 고친다.
   */
  contact: {
    email: "info@lucyware.com",
    // 채용 지원은 대표 메일이 아니라 이 주소로 받는다 (채용 페이지에서만 쓴다)
    recruitEmail: "recruit@lucyware.com",
    tel: "02-6465-2112",
    fax: "02-6499-6175",
    address: "서울 강남구 영동대로 602, 6층 n205호",

    // 지도에 찍는 좌표. **주소를 고치면 이 두 줄도 함께 고친다.**
    //
    // 예전에는 페이지를 열 때마다 주소를 좌표로 바꾸는 API 를 불렀다. 「좌표를
    // 박아 두면 이사했을 때 지도만 옛 자리에 남는다」 는 이유였는데, 2026-08-18
    // 그 호출 하나가 막히면서(키에 도메인이 등록돼 있지 않았다) 지도가 통째로
    // 뜨지 않았다. **한 번 정해지면 변하지 않는 값을 방문자마다 다시 물어보게
    // 만든 것이 문제였다** — 이사는 몇 년에 한 번이고 페이지는 매일 열린다.
    // 그래서 값을 여기 주소 바로 옆에 둔다. 함께 있으면 함께 고치게 된다.
    lat: 37.5147216,
    lng: 127.0604839,
    addressEn: "6F n205, 602 Yeongdong-daero, Gangnam-gu, Seoul, Korea",
    mapUrl: "https://naver.me/x4lDjJ3f",
  },

  /**
   * 지도 API 키 — 네이버 클라우드 플랫폼의 Client ID.
   *
   * **커밋해도 되는 값이다.** 스크립트 주소에 붙어 브라우저로 그대로 내려가므로
   * 어디에 두든 페이지 소스에서 보인다. 실제 방어는 숨기는 것이 아니라 네이버
   * 콘솔의 **Web 서비스 URL 제한**이고, 그 제한이 있으면 남이 복사해도 우리
   * 도메인 밖에서는 동작하지 않는다.
   *
   * 한때 Cloudflare Pages 환경변수(NAVER_MAP_KEY_ID)로 빌드 때 주입했는데,
   * 그 대시보드에서 **빌드가 읽는 변수 자리를 찾지 못해** 값이 끝내 들어오지
   * 않았다 (2026-08-18). 얻는 것이 「공개 저장소 이력에 안 남는다」 뿐이라
   * 그 품을 들일 이유가 없었다. 나중에 옮기고 싶으면 이 줄만 환경변수로 바꾼다.
   *
   * **지도가 안 뜨면 코드가 아니라 콘솔부터 본다.** 등록된 Web 서비스 URL 이
   * 실제 접속 주소와 어긋나면(스킴·www 유무 포함) 인증이 거부된다.
   */
  map: {
    naverKeyId: "oe1ny73d93",
  },

  /**
   * GNB. 자식이 있으면 드롭다운, 없으면 단일 링크.
   * `soon: true` 는 준비중 — 메뉴에 배지가 붙고 준비중 레이아웃으로 간다.
   *
   * 제품 항목은 로고를 두 벌 들고 있다. 자산 파일 이름이 이미 놓일 배경을
   * 말하고 있으므로(_color · -light · _MainLogo 는 밝은 면, _reverse · -dark ·
   * _DarkMode 는 어두운 면) 화면에서 고를 때 헷갈리지 않도록 여기에 짝지어 둔다.
   *   logo     밝은 배경에 놓는 것
   *   logoDark 어두운 배경에 놓는 것
   */
  nav: [
    // Solution 은 우리가 파는 「그림」 이고 Products 는 그 그림을 이루는 물건이다.
    // 그래서 Lucyware.AI 하나만 위에 두고 나머지 넷을 아래로 내렸다 (2026-08-17 사용자 지시).
    // URL 은 `/solutions/lucyware-ai/` 그대로다 — 메뉴 라벨이 단수가 됐다고 이미
    // 나가 있는 주소를 바꾸면 얻는 것 없이 링크만 끊긴다.
    {
      label: "Solution",
      labelKo: "솔루션",
      id: "solution",
      children: [
        {
          label: "Lucyware.AI",
          url: "/solutions/lucyware-ai/",
          desc: "기업 데이터에 자연어로 묻는 AI 포털",
          logo: "/assets/img/Logo/lucyware_ai_signature_gradient.svg",
          logoDark: "/assets/img/Logo/lucyware_ai_signature_gradient_reverse.svg",
        },
      ],
    },
    {
      label: "Products",
      labelKo: "제품",
      id: "products",
      children: [
        {
          label: "MetaDRAG®",
          url: "/products/metadrag/",
          desc: "메타데이터 기반 설계·검색 플랫폼",
          logo: "/assets/img/Logo/metadrag-wordmark-light.svg",
          logoDark: "/assets/img/Logo/metadrag-wordmark-dark.svg",
        },
        {
          label: "flexelf™",
          url: "/products/flexelf/",
          desc: "시선을 읽는 온디바이스 AI 사이니지",
          logo: "/assets/img/Logo/flexelf_logo_TM.svg",
          logoDark: "/assets/img/Logo/flexelf_logo_TM_reverse.svg",
        },
        {
          label: "ubiQloud",
          url: "/products/ubiqloud/",
          desc: "맥락을 읽고 스스로 실행하는 Agentic ERP",
          logo: "/assets/img/Logo/ubiQloud_MainLogo.svg",
          logoDark: "/assets/img/Logo/ubiQloud_DarkMode.svg",
        },
        {
          label: "ubiQation",
          url: "/products/ubiqation/",
          desc: "엔터프라이즈 AI 개발 프레임워크",
          logo: "/assets/img/Logo/ubiQation_logo.svg",
          logoDark: "/assets/img/Logo/ubiQation_logo_reverse.svg",
        },
      ],
    },
    { label: "Company", labelKo: "회사소개", url: "/company/" },
    { label: "References", labelKo: "고객 사례", url: "/references/" },
    // Insights 는 뺐다 (2026-08-17 사용자 지시) — 실을 내용이 없었다. 채울 것이
    // 없는 메뉴는 자리만 차지하면서 「들어가 봐야 빈 곳」 을 한 번 더 만든다.
    // 옛 주소는 _redirects 가 홈으로 넘긴다.
    { label: "Careers", labelKo: "채용", url: "/careers/" },
    // 헤더 우측의 「문의 · PoC 신청」 버튼을 뺐다(2026-08-17 사용자 지시). 그 버튼이
    // 헤더에서 /contact/ 로 가는 유일한 길이었으므로 메뉴 항목으로 올린다 —
    // 빼기만 하면 문의 페이지가 푸터에서만 닿는 섬이 된다.
    { label: "Contact", labelKo: "문의", url: "/contact/" },
  ],

  /**
   * 푸터 하단 링크 — GNB 에 없는 것만.
   * Contact 가 GNB 로 올라가면서 지금은 비어 있다. 푸터 템플릿은 빈 배열이면
   * 아무것도 그리지 않으므로 그대로 두어, 다음에 넣을 자리를 남긴다.
   */
  footerLinks: [],

  /**
   * 브랜드 자산 경로.
   * 헤더는 밝은 면·어두운 면을 오가므로(홈 배너 위에서는 어둡고, 스크롤하면 밝다)
   * 로고를 바꿔 끼우지 않고 원본 하나에 흰 외곽선을 둘러 양쪽을 함께 버틴다.
   * 푸터는 늘 어두우므로 한글 로고타이프의 반전판을 쓴다.
   */
  logo: {
    light: "/assets/img/Logo/lucyware_signature_color.svg",
    dark: "/assets/img/Logo/lucyware_signature_reverse.svg",
    symbol: "/assets/img/Logo/lucyware_symbol_color.svg",
    // 874:126 ≒ 6.94:1
    krReverse: "/assets/img/Logo/lucyware_logotype-kr_reverse.svg",
    krColor: "/assets/img/Logo/lucyware_logotype-kr_color.svg",
  },
};
