배포 및 환경 설정 안내 — Naver Maps & Geocode

요약
- 클라이언트 측 Naver Maps 스크립트는 이미 `index.html`에 Client ID를 넣어두었습니다.
- 서버 측 지오코드 호출은 `functions/api/naver-geocode.js`로 프록시됩니다. 이 함수는 다음 환경 변수가 필요합니다:
  - `NAVER_CLIENT_ID` (API Key ID)
  - `NAVER_CLIENT_SECRET` (API Key Secret)

Cloudflare Pages (권장)
1. 프로젝트를 GitHub에 푸시 후 Cloudflare Pages에 연결하세요.
2. Pages의 "Functions"는 저장소의 `functions/` 디렉터리를 자동으로 인식합니다.
3. Cloudflare Pages 설정 > "Environment variables"에 아래를 추가:
   - `NAVER_CLIENT_ID` = <발급받은 Client ID>
   - `NAVER_CLIENT_SECRET` = <발급받은 Client Secret>

wrangler(로컬 업로드/관리)
- 환경변수(Secrets)를 wrangler로 등록하려면:

```bash
# 로그인 필요: wrangler login
wrangler secret put NAVER_CLIENT_ID --env production
wrangler secret put NAVER_CLIENT_SECRET --env production
```

- Pages로 배포:
```bash
# 한 번 설정된 후 GitHub 연동 또는 wrangler pages publish 사용
wrangler pages publish . --project-name=lucyware-web
```

로컬 테스트 (간단)
- 서버 프록시 없이 클라이언트 맵만 확인하려면 `assets/js/main.js`의 `resolveCoords` 호출을 주석 처리하거나 `resolveCoords`가 실패할 경우 사용되는 fallback 좌표(현재 값)를 사용하여 맵이 보이는지 확인하세요.

배포 후 확인
1. 페이지 로드 시 `naver-map`에 맵과 마커가 표시되는지 확인.
2. 브라우저 개발자도구 네트워크 탭에서 `/api/naver-geocode?q=루씨웨어` 호출이 200을 반환하는지 확인.

보안 유의사항
- `NAVER_CLIENT_SECRET`은 절대 클라이언트에 노출하지 마세요. 로컬 `.env` 또는 Cloudflare Secrets/Pages 환경변수로만 관리합니다.
- 저장소에 비밀(키/토큰)을 커밋하지 마세요.

문제 발생 시
- 함수 로그 확인: Cloudflare Pages > Functions > Logs 또는 `wrangler tail` 사용
- 응답 코드가 401/403이면 Client ID/Secret 또는 Cloudflare 프로젝트의 허용 도메인 설정을 확인하세요.
