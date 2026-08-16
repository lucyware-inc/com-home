# CLAUDE.md — Lucyware 홈페이지 프로젝트

> 이 파일은 Claude Code가 세션 시작 시 자동으로 읽는 프로젝트 컨텍스트입니다.

## 응답 언어

- **항상 한국어로 응답**합니다. 모든 설명·요약·코드 주석·커밋 메시지를 한국어로 작성합니다.
- 영어로 질문을 받아도 한국어로 답합니다.
- 작업 중 언어가 영어로 전환되면 즉시 한국어로 복귀합니다.

## 프로젝트 개요

- **회사**: 루씨웨어(Lucyware Inc.) — RDBMS 기반 AI · Text2SQL 전문 IT/SI 기업
- **목적**: 기업 홈페이지 구축
- **핵심 제품**: MetaDRAG™

## 아키텍처 — 정적 우선 → API 확장 (2단계)

```
방문자 → Cloudflare Pages (정적 HTML5)
                 │  (DB 요청 시 · Phase 2)
        Cloudflare Functions (/functions/api/*)
                 │
        Hyperdrive (커넥션 풀 · 쿼리 캐시)
                 │
            MariaDB
```

- **Phase 1 (현재)**: 순수 정적 HTML5/CSS/JS
- **Phase 2 (향후)**: Functions + Hyperdrive → MariaDB

## 기술 스택

- 프론트: HTML5 / CSS / JS. **프레임워크 없음** — Bootstrap·AOS·Swiper 를 걷어내고
  `assets/css/base.css`(토큰·리셋·레이아웃) + `site.css`(컴포넌트) 로 직접 만든다.
- 빌드: **Eleventy(11ty) 3.x** — `src/` 의 Nunjucks 템플릿을 `dist/` 의 정적 HTML 로 찍는다.
  `npm run dev` (로컬 서버) / `npm run build` (배포용 산출).
- 호스팅: Cloudflare Pages (GitHub 연동 자동 배포)
- DB 연동: Cloudflare Workers/Functions + Hyperdrive → MariaDB
- 드라이버: `mysql2 >= 3.13.0`, `nodejs_compat` 플래그
- 설정 단일 진실 공급원: `wrangler.toml`

### 왜 빌드 단계를 두는가 (2026-08-16 사용자 승인)

페이지가 11개로 늘면서 헤더·푸터·GNB 가 페이지마다 복사된다. 메뉴 한 줄을 고칠 때
11개 파일을 함께 고쳐야 하고, 하나를 빠뜨리면 사이트가 조용히 어긋난다 —
정규화되지 않은 테이블과 같은 문제다. 레이아웃 1벌 + 메뉴 데이터 1벌만 두고
HTML 을 생성해 그 중복을 없앤다. **방문자에게 내려가는 것은 여전히 순수 정적 HTML 이다.**

## 폴더 구조

- `src/` — 11ty 입력. **여기만 고친다.**
  - `_data/site.js` — 회사 정보와 **GNB 구조의 단일 진실 공급원.** 메뉴는 여기서만 바꾼다
  - `_data/build.js` — 빌드 시각(저작권 연도)
  - `_includes/layouts/` — `base`(문서 뼈대) → `page`(하위 페이지) → `soon`(준비중)
  - `_includes/partials/` — `header` · `footer` · `cta` · `icons`(SVG 스프라이트)
  - 나머지 디렉터리가 그대로 URL 이 된다 (`src/solutions/metadrag.html` → `/solutions/metadrag/`)
  - **페이지는 `.njk` 가 아니라 `.html` 확장자를 쓴다** (2026-08-16). 내용은 어차피
    일반 HTML 인데 `.njk` 라는 이름 때문에 「내가 직접 못 고치는 것」 으로 보였다.
    11ty 는 `htmlTemplateEngine: "njk"` 로 `.html` 도 같은 엔진에 태우므로 동작은 같고,
    에디터에서 HTML 로 열려 사용자가 직접 편집할 수 있다. **새 페이지도 `.html` 로 만든다.**
    레이아웃·파셜(`_includes/`)만 `.njk` 로 남긴다 — 그쪽은 실제로 템플릿 문법 덩어리다.
- `assets/css·js·img` — 정적 자산. 빌드가 `dist/` 로 그대로 복사한다
- `dist/` — **빌드 산출물. 손으로 고치지 않는다.** `.gitignore` 에 있다
- `functions/api` — Phase 2 API 예약 디렉터리 (현재 비움)

옛 BootstrapMade 템플릿(루트 `index.html` · `main.css` · `main.js` · `vendor/` 9.9MB ·
스톡 사진)은 **2026-08-16 전부 정리했다.** 저장소에 사이트는 하나뿐이며,
`assets/` 는 9.9MB 에서 1.2MB 로 줄었다.

## 브랜드 로고 자산 (`assets/img/Logo/`)

**파일 이름의 접미사는 「글자색」 이 아니라 「놓이는 배경」 을 가리킨다.**
`-dark` 는 어두운 글자가 아니라 *다크 배경용*(= 흰 글자)이다. 반대로 읽으면
흰 배경에 흰 로고를 얹게 된다 — 실제로 한 번 그렇게 넣었다가 SVG 안의 색상값을
확인하고 바로잡았다. **추측하지 말고 파일 안의 `#색상` 을 본다.**

| 밝은 면에 놓는 것 | 어두운 면에 놓는 것 | 무엇 |
|---|---|---|
| `lucyware_signature_color` | `lucyware_signature_reverse` | 회사 로고 (헤더 / 푸터) |
| `lucyware_symbol_color` | — | 심볼 (파비콘) |
| `lucyware_ai_signature_gradient` | `..._gradient_reverse` | Lucyware.AI |
| `metadrag-wordmark-light` | `metadrag-wordmark-dark` | MetaDRAG™ |
| `flexelf_logo_TM` | `flexelf_logo_TM_reverse` | flexelf |
| `ubiQloud_MainLogo` | `ubiQloud_DarkMode` | ubiQloud |
| `ubiQation_logo` | `ubiQation_logo_reverse` | ubiQation |
| `lucyware_logotype-kr_color` | `lucyware_logotype-kr_reverse` | 한글 로고타이프 (푸터) |

- **짝은 `src/_data/site.js` 의 `nav[].children[]` 에 `logo` / `logoDark` 로 물려 있다.**
  화면에서 고를 때 파일명을 다시 판단하지 말고 배경 톤에 맞는 쪽을 꺼내 쓴다.
- **헤더 로고만은 예외로 원본 한 벌을 쓴다.** 홈 헤더가 어두운 배너 위에서 시작해
  스크롤하면 흰 바로 바뀌는데, 그때마다 이미지를 갈아 끼우면 깜빡인다.
  대신 1px 흰 외곽선(`filter: drop-shadow` 4방향)을 둘러 양쪽을 함께 버틴다.
- **제품 상세 페이지의 머리는 밝은 면이다** (2026-08-16 사용자 지시). 한때 제품
  딥컬러를 배경으로 깔았으나 두 가지가 걸렸다 — 페이지마다 다른 사이트처럼 보였고,
  **로고가 반전판으로만 노출되어 브랜드 인상이 갇혔다.** 지금은 밝은 머리에 원본
  컬러 로고를 놓고, 제품색은 머리 위 4px 띠 하나(front matter 의 `accent`)에만 남긴다.
  어두운 면은 홈 배너와 푸터에만 쓴다.

## 정보구조(IA) — 2026-08-16 확정

| 메뉴 | URL | 상태 |
|---|---|---|
| Home | `/` | |
| Solutions › Lucyware.AI | `/solutions/lucyware-ai/` | |
| Solutions › MetaDRAG™ | `/solutions/metadrag/` | |
| Solutions › flexelf | `/solutions/flexelf/` | 본문 내용 미확정 |
| Services › ubiQloud | `/services/ubiqloud/` | 본문 내용 미확정 |
| Services › ubiQation | `/services/ubiqation/` | 본문 내용 미확정 |
| Company | `/company/` | 비전·핵심가치 + 오시는 길·기업정보 |
| References | `/references/` | 본문 준비중 |
| Insights | `/insights/` | 본문 준비중 |
| Careers | `/careers/` | 본문 준비중 |
| Contact / PoC | `/contact/` | |

- **ubiQation 은 Lucyware.AI 와 별개 서비스다** (2026-08-16 사용자 확인). 상위
  `C:\VSCode_Source\CLAUDE.md` 의 「lucyware.ai 는 ubiqation 에서 개명」 은 사내 AI Portal
  **프로젝트** 이야기이며 이 홈페이지의 ubiQation 서비스와 다르다. 헷갈리기 쉬운 자리다.
- **GNB·푸터에 「준비중」 배지를 달지 않는다** (2026-08-16 사용자 지시). 메뉴는 다 같은
  무게로 보이고, 아직 채워지지 않은 것은 페이지에 들어가서 알게 된다. 대신 그 페이지를
  빈 화면으로 두지 않는다 — 무엇을 준비하는지 쓰고 문의로 이어 준다.

## 홈 레이아웃 — 2026-08-16 확정

**어두운 배너로 열고, 밝은 본문으로 내려간 뒤, 어두운 푸터로 닫는다.**

- 배너는 슬라이드 6장이다. **첫 장은 회사 메시지**, 이어서 제품 5장이 6초마다 넘어간다.
- 배경은 캔버스 한 장(`assets/js/home.js`)이 배너 전체에 깔린다. 슬라이드가 넘어가도
  배경은 이어서 흐른다. 흔한 파티클이 아니라 **노드=테이블 · 선=관계 · 흐르는 점=질의**
  라, 배경이 회사가 파는 것을 설명한다.
- **제품 슬라이드에 로고 색을 배경으로 칠하지 않는다** (2026-08-16 사용자 지적).
  옅은 빛 하나와 작은 라벨에만 제품색을 두어, 글자는 어느 장에서나 같은 조건으로 읽힌다.
- 자동 넘김은 **멈출 수 있어야 한다.** 일시정지 버튼이 있고, 마우스를 올리거나 포커스가
  들어오면 자동으로 멈춘다. 멈출 수 없는 자동 재생은 접근성에서 실패로 친다.
- 홈 헤더는 투명하게 시작해 스크롤하면 흰 바가 된다(`.home .header`).

## 가드레일 (반드시 준수)

- **정적·동적 분리 유지**: 정적 사이트는 DB에 직접 연결 금지. 반드시 Functions(API) 경유.
- **자격증명 커밋 금지**: 연결 문자열·비밀번호는 `.dev.vars`(로컬) / Cloudflare Secrets(운영)만 사용. 저장소에 절대 커밋하지 않음.
- **파괴적 작업 사전 승인**: force push, 파일 대량 삭제 등은 실행 전 반드시 사용자 승인 요청.
- **변경 보고**: 작업 후 변경 파일 목록·요약을 한국어로 보고.

## 사용자 컨텍스트

- 사용자는 DB·데이터 모델링 전문가이며, 일반 프로그래밍은 Claude Code에 위임합니다.
- 코드 자체보다 **아키텍처·방향성 검토**에 집중하므로, 변경 의도와 영향을 명확히 설명합니다.
