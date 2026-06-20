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

- 프론트: HTML5 / CSS / JS (정적, 빌드 단계 없음)
- 호스팅: Cloudflare Pages (GitHub 연동 자동 배포)
- DB 연동: Cloudflare Workers/Functions + Hyperdrive → MariaDB
- 드라이버: `mysql2 >= 3.13.0`, `nodejs_compat` 플래그
- 설정 단일 진실 공급원: `wrangler.toml`

## 폴더 구조

- 루트: 정적 HTML5 (`index.html` 등)
- `/assets/css·js·img`: 스타일·스크립트·이미지
- `/functions/api`: Phase 2 API 예약 디렉터리 (현재 비움)

## 정보구조(IA) — index.html 섹션

1. Hero — 핵심 가치제안 (RDBMS 기반 AI · Text2SQL)
2. Solutions — MetaDRAG™ · SI 컨설팅 · 데이터 파이프라인
3. Tech & Approach — SI 역량 · 기술 스택
4. References — 프로젝트 실적 (B2B 신뢰 핵심)
5. About / Contact — 회사 정보 + 문의 폼

## 가드레일 (반드시 준수)

- **정적·동적 분리 유지**: 정적 사이트는 DB에 직접 연결 금지. 반드시 Functions(API) 경유.
- **자격증명 커밋 금지**: 연결 문자열·비밀번호는 `.dev.vars`(로컬) / Cloudflare Secrets(운영)만 사용. 저장소에 절대 커밋하지 않음.
- **파괴적 작업 사전 승인**: force push, 파일 대량 삭제 등은 실행 전 반드시 사용자 승인 요청.
- **변경 보고**: 작업 후 변경 파일 목록·요약을 한국어로 보고.

## 사용자 컨텍스트

- 사용자는 DB·데이터 모델링 전문가이며, 일반 프로그래밍은 Claude Code에 위임합니다.
- 코드 자체보다 **아키텍처·방향성 검토**에 집중하므로, 변경 의도와 영향을 명확히 설명합니다.
