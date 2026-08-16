# Lucyware 기업 홈페이지

루씨웨어(Lucyware Inc.) 기업 홈페이지. **정적 우선 → API 확장** 2단계 아키텍처(JAMstack).

## 아키텍처

```
Claude Design → Claude Code → GitHub (단일 진실 공급원)
                                  │
방문자 → Cloudflare Pages (정적 HTML5)
                                  │  (DB 요청 시 · Phase 2)
                         Cloudflare Functions (/functions/api/*)
                                  │
                         Hyperdrive (커넥션 풀 · 쿼리 캐시)
                                  │
                             MariaDB
```

- 정적 사이트는 DB에 직접 연결하지 않음. 반드시 Functions(API) 경유.
- Hyperdrive는 MariaDB(MySQL 호환) 지원. 드라이버 `mysql2 >= 3.13.0`, `nodejs_compat` 필요.

## 폴더 구조

| 경로 | 용도 |
|---|---|
| `src/` | **Eleventy 입력 — 여기만 고친다** |
| `src/_data/site.js` | 회사 정보 + GNB 구조 (단일 진실 공급원) |
| `src/_includes/` | 레이아웃(`layouts/`) · 조각(`partials/`) |
| `/assets/css`, `/js`, `/img` | 스타일·스크립트·이미지 |
| `dist/` | 빌드 산출물. 손으로 고치지 않음. 커밋하지 않음 |
| `/functions/api` | Phase 2 API 예약 (현재 비움) |
| `wrangler.toml` | Pages 설정 (단일 진실 공급원) |
| `_headers` | 보안 헤더 |
| `.dev.vars.example` | 로컬 시크릿 템플릿 (`.dev.vars`로 복사) |
| `CLAUDE.md` | Claude Code 자동 로드 컨텍스트·가드레일·한국어 지침 |

## 개발

```bash
npm install          # 최초 1회
npm run dev          # http://localhost:8080 — 파일을 고치면 자동 반영
npm run build        # dist/ 에 정적 HTML 생성
```

## 내용을 직접 고치려면

`src/` 아래 파일은 **일반 HTML** 이다. `<h2>`, `<p>`, `<a>` 를 그대로 쓰고,
에디터에서 HTML 로 열리며 문법 강조·자동완성도 그대로 받는다.
`npm run dev` 를 켜 둔 채로 저장하면 브라우저가 즉시 새로고침된다.

HTML 과 다른 것은 딱 두 가지다.

**1) 파일 맨 위 `---` 사이의 머리말.** 페이지 제목·설명처럼 여러 곳에서 쓰이는 값을
여기 한 번만 적는다. `제목: 값` 형식이고, 여기 적은 `title` 이 브라우저 탭과 `<h1>` 에
함께 들어간다.

```
---
layout: layouts/page.njk          ← 이 페이지가 쓸 틀. 건드리지 않는다
title: MetaDRAG™                  ← 탭 제목이자 페이지 큰 제목
eyebrow: Solutions                ← 제목 위 작은 글씨
lead: 데이터베이스의 구조를 읽어…   ← 제목 아래 요약문
accent: "#0091AA"                 ← 페이지 맨 위 4px 띠 색
---
여기서부터 그냥 HTML
```

**2) `{{ }}` 와 `{% %}`.** 회사 정보처럼 여러 페이지에 같은 값이 들어가는 자리다.
`{{ site.contact.email }}` 은 빌드할 때 실제 이메일로 바뀐다. 값을 바꾸려면
그 자리가 아니라 `src/_data/site.js` 를 고친다 — 그래야 11개 페이지가 함께 따라온다.

| 무엇을 고치려면 | 어디를 |
|---|---|
| 제품·회사 소개 **본문** | `src/solutions/*.html`, `src/services/*.html`, `src/company/index.html` |
| 홈 **배너 문구** | `src/index.html` 위쪽 `slides` 목록의 `title` · `lead` |
| **메뉴** 이름·순서·주소 | `src/_data/site.js` 의 `nav` (헤더·푸터가 함께 따라온다) |
| 주소·전화·이메일 | `src/_data/site.js` 의 `contact` |
| 머리글/바닥글 **구조** | `src/_includes/partials/` |
| 색·글자 크기·여백 | `assets/css/base.css` (토큰) |

**`dist/` 는 고치지 않는다.** 빌드가 만들어내는 결과물이라 다음 빌드에 덮어써진다.

### 페이지를 추가하려면

`src/` 아래에 `.html` 파일을 만들면 경로가 그대로 URL 이 된다
(`src/solutions/foo.html` → `/solutions/foo/`). 머리말에 `layout: layouts/page.njk`
와 `title` 을 넣고 본문을 쓴다. GNB 에 노출하려면 `site.js` 에도 한 줄 더한다.

## Cloudflare Pages 빌드 설정

GitHub 연동 시 Pages 프로젝트에 아래 값이 들어가 있어야 한다.

| 항목 | 값 |
|---|---|
| 빌드 명령 | `npm run build` |
| 빌드 출력 디렉터리 | `dist` |
| Node 버전 | `20` (`.nvmrc` 로도 지정됨) |

출력 디렉터리는 `wrangler.toml` 의 `pages_build_output_dir` 이 함께 들고 있다.

## 보안 원칙

- 자격증명·연결 문자열은 **절대 커밋 금지**. `.dev.vars`(로컬) / Cloudflare Secrets(운영)만 사용.
- `wrangler.toml`을 단일 진실 공급원으로 유지. 대시보드와 이중 관리 지양.
