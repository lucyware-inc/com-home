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
| `index.html` 등 | Phase 1 정적 HTML5 |
| `/assets/css`, `/js`, `/img` | 스타일·스크립트·이미지 |
| `/functions/api` | Phase 2 API 예약 (현재 비움) |
| `wrangler.toml` | Pages 설정 (단일 진실 공급원) |
| `_headers` | 보안 헤더 |
| `.dev.vars.example` | 로컬 시크릿 템플릿 (`.dev.vars`로 복사) |
| `docs/CLAUDE_CODE_지시문.md` | Claude Code 작업 지시문 세트 |
| `CLAUDE.md` | Claude Code 자동 로드 컨텍스트·가드레일·한국어 지침 |
| `.claude/settings.json` | 프로젝트 단위 Claude Code 한국어 응답 설정 |

## Phase 1 진행 순서

`docs/CLAUDE_CODE_지시문.md` 단계 1~7을 순서대로 실행.

1. 환경 검증 → 2. Git/GitHub → 3. 구조 검증 → 4. Design 시안 반영
→ 5. 로컬 미리보기 → 6. Pages 연동 → 7. 도메인 연결

## 로컬 미리보기

```bash
npx wrangler pages dev .
```

## 보안 원칙

- 자격증명·연결 문자열은 **절대 커밋 금지**. `.dev.vars`(로컬) / Cloudflare Secrets(운영)만 사용.
- `wrangler.toml`을 단일 진실 공급원으로 유지. 대시보드와 이중 관리 지양.
