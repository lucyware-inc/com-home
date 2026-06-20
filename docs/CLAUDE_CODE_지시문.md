# Claude Code 작업 지시문 세트 — Lucyware Phase 1

> 사용법: 아래 블록을 **순서대로** Claude Code 프롬프트에 그대로 붙여넣습니다.
> 코딩은 Claude Code가 수행합니다. 사용자는 결과 검토·승인만 하면 됩니다.
> 각 단계 완료 후 다음 단계로 진행합니다.

---

## 사전 준비 (1회)

- **Claude Code 설치**: Native Installer 권장 (Pro·Max·Team·API 계정 필요)
- **GitHub 계정** 및 빈 저장소 1개 생성 (예: `lucyware-web`)
- **Cloudflare 계정** (Pages 사용)
- 이 스캐폴드 압축을 해제한 폴더를 VS Code로 연 뒤, 그 폴더에서 Claude Code 실행

---

## 단계 1 — 환경 검증

```
이 프로젝트 루트에서 다음을 점검하고 결과를 표로 보고해줘.
1) node, npm, git 버전 (node 20 이상인지)
2) wrangler 설치 여부 (없으면 npx 로 실행 가능한지)
3) wrangler.toml 의 pages_build_output_dir, compatibility_flags 값이 유효한지
누락 항목이 있으면 설치/수정 명령을 제안만 하고, 실행 전 나에게 확인받아.
```

## 단계 2 — Git 초기화 + GitHub 연결

```
git 저장소를 초기화하고 첫 커밋을 만든 뒤, 내 GitHub 원격 저장소에 연결해줘.
- .gitignore 가 .dev.vars 를 제외하는지 먼저 확인
- 원격 URL 은 내가 입력하면 그걸로 설정
- 커밋 메시지: "chore: Phase 1 정적 사이트 스캐폴드"
- main 브랜치로 push
실행 명령을 보여주고 내 승인 후 진행해.
```

## 단계 3 — 폴더 구조 검증

```
현재 폴더 구조가 아래 의도와 일치하는지 점검하고 트리로 보여줘.
- 루트: 정적 HTML5 (index.html 등)
- /assets: css, js, img
- /functions/api: Phase 2 API 예약 디렉터리 (현재 비어 있어야 정상)
- 설정: wrangler.toml, _headers, .gitignore, .dev.vars.example
불일치가 있으면 수정안을 제안해.
```

## 단계 4 — Claude Design 시안 반영

```
별도로 전달하는 Claude Design HTML 시안을 이 프로젝트에 통합해줘.
- index.html 의 IA 주석 구조(Hero/Solutions/Tech/References/About/Contact)에 맞춰 배치
- 공통 스타일은 /assets/css/style.css 로 분리, 디자인 토큰은 :root 변수로 정리
- 이미지는 /assets/img 로 이동하고 경로를 절대경로(/assets/...)로 통일
- 시맨틱 HTML5 와 반응형(모바일 우선) 준수
- 문의 폼은 지금은 동작 없이 마크업만 (Phase 2 에서 /api/contact 연동 예정, 주석 표시)
통합 후 변경 파일 목록과 diff 요약을 보고해.
```

## 단계 5 — 로컬 미리보기

```
정적 사이트를 로컬에서 미리보기로 띄워줘.
- npx wrangler pages dev . 사용
- 접속 URL 을 알려주고, 콘솔 에러가 있으면 정리해서 보고
```

## 단계 6 — Cloudflare Pages 연동 (자동 배포)

```
Cloudflare Pages 를 GitHub 저장소에 연동하는 절차를 안내해줘.
- 대시보드 기반 Git 연동 방식으로 진행 (빌드 명령 없음, 출력 디렉터리 = 루트)
- 프로덕션 브랜치 = main
- 연동 후 자동 배포 동작과 *.pages.dev URL 확인 방법
- wrangler.toml 이 단일 진실 공급원이 되도록 주의사항도 알려줘
대시보드에서 직접 해야 하는 항목은 단계별 체크리스트로 줘.
```

## 단계 7 — 도메인 연결

```
Cloudflare DNS 로 커스텀 도메인을 Pages 프로젝트에 연결하는 절차를 안내해줘.
- 도메인은 내가 입력
- 프로덕션 도메인 + (선택) preview 동작 설명
- 적용 후 HTTPS 자동 적용 확인 방법
```

---

## Phase 2 착수 시 (참고 — 본 세션 범위 외)

```
Phase 2 DB 연동을 준비해줘.
- wrangler.toml 의 [[hyperdrive]] 블록 주석 해제 및 구성
- wrangler hyperdrive create 명령으로 MariaDB 연결 등록 (mysql:// 형식)
- /functions/api/contact.js 작성 (mysql2 >= 3.13.0, env.HYPERDRIVE 사용)
- 자격증명은 .dev.vars(로컬) / Cloudflare Secrets(운영)만 사용, 커밋 금지
```

---

## 핵심 가드레일 (Claude Code 에게 항상 상기)

- 정적·동적 계층 분리 유지 — 정적 사이트는 DB 직접 연결 금지, 반드시 Functions 경유
- 자격증명·연결 문자열은 절대 커밋하지 않음 (.dev.vars / Secrets)
- 파괴적 명령(force push, 파일 대량 삭제)은 실행 전 반드시 승인 요청
- 변경 후에는 항상 변경 파일 목록·요약 보고
