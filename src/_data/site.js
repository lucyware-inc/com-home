/**
 * 사이트 마스터 데이터 — 회사 정보와 GNB 구조의 단일 진실 공급원.
 *
 * 헤더·푸터·사이트맵이 모두 이 파일 하나를 읽는다. 메뉴를 바꿀 때 고치는 곳은
 * 여기 한 곳뿐이고, 11개 페이지가 다음 빌드에서 함께 따라온다.
 *
 * 주의: 여기 값은 그대로 화면에 나간다. 미확정 값(대표 전화 등)은
 * `_TODO` 주석을 달아 두었으니 확인되면 지운다.
 */

export default {
  name: "Lucyware",
  nameKo: "루씨웨어",
  legalName: "루씨웨어 주식회사",
  legalNameEn: "Lucyware Inc.",
  tagline: "Lumen cyberware everywhere",
  description:
    "루씨웨어는 Metadata 기반 AI Transformation 전문 기업입니다. RDBMS 메타데이터를 AI 와 연결해 기업의 데이터 자산을 비즈니스 가치로 전환합니다.",

  // 운영 도메인. 정규 URL(canonical)·OG 태그가 이 값을 쓴다
  url: "https://lucyware.com",

  contact: {
    email: "info@lucyware.com",
    tel: "+82 10-1234-5678", // _TODO 대표번호 확인 — 현재 값은 옛 템플릿의 자리표시자다
    telHref: "tel:+821012345678",
    address: "서울 강남구 영동대로 602, 6층 n205호",
    // 지오코딩용. 층·호수가 붙으면 좌표 검색이 실패하는 경우가 있어 도로명까지만 둔다
    addressForMap: "서울 강남구 영동대로 602",
    addressEn: "6F n205, 602 Yeongdong-daero, Gangnam-gu, Seoul, Korea",
    mapUrl: "https://naver.me/x4lDjJ3f",
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
    {
      label: "Solutions",
      labelKo: "솔루션",
      id: "solutions",
      children: [
        {
          label: "Lucyware.AI",
          url: "/solutions/lucyware-ai/",
          desc: "기업 데이터에 자연어로 묻는 AI 포털",
          logo: "/assets/img/Logo/lucyware_ai_signature_gradient.svg",
          logoDark: "/assets/img/Logo/lucyware_ai_signature_gradient_reverse.svg",
        },
        {
          label: "MetaDRAG™",
          url: "/solutions/metadrag/",
          desc: "메타데이터 기반 설계·검색 플랫폼",
          logo: "/assets/img/Logo/metadrag-wordmark-light.svg",
          logoDark: "/assets/img/Logo/metadrag-wordmark-dark.svg",
        },
        {
          label: "flexelf",
          url: "/solutions/flexelf/",
          desc: "현장에 맞춰 늘어나는 업무 자동화",
          logo: "/assets/img/Logo/flexelf_logo_TM.svg",
          logoDark: "/assets/img/Logo/flexelf_logo_TM_reverse.svg",
        },
      ],
    },
    {
      label: "Services",
      labelKo: "서비스",
      id: "services",
      children: [
        {
          label: "ubiQloud",
          url: "/services/ubiqloud/",
          desc: "중견·중소기업을 위한 클라우드 ERP",
          logo: "/assets/img/Logo/ubiQloud_MainLogo.svg",
          logoDark: "/assets/img/Logo/ubiQloud_DarkMode.svg",
        },
        {
          label: "ubiQation",
          url: "/services/ubiqation/",
          desc: "업무 시스템 구축·운영 서비스",
          logo: "/assets/img/Logo/ubiQation_logo.svg",
          logoDark: "/assets/img/Logo/ubiQation_logo_reverse.svg",
        },
      ],
    },
    { label: "Company", labelKo: "회사소개", url: "/company/" },
    { label: "References", labelKo: "고객 사례", url: "/references/" },
    { label: "Insights", labelKo: "인사이트", url: "/insights/" },
    { label: "Careers", labelKo: "채용", url: "/careers/" },
  ],

  /** 푸터 하단 링크 — GNB 에 없는 것만 */
  footerLinks: [{ label: "문의 · PoC 신청", url: "/contact/" }],

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
