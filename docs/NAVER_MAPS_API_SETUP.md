# Naver Maps API 인증 설정 가이드

## 에러 상황
```
Error Code: 200
Error Message: Authentication Failed
Client ID: wqjlpu2rl3
URI: https://www.lucyware.com/
```

---

## 🔧 해결 순서

### Step 1: Naver Cloud Platform (NCP) 콘솔 접속
1. https://console.ncloud.com 접속
2. **Maps** → **Maps** 메뉴 선택

### Step 2: Application 설정 (웹 서비스 URL 등록)
1. 메뉴에서 **Application** 선택
2. 해당 Application 클릭 (또는 신규 생성)
3. **WebServiceURL 설정** 섹션에서:
   - `https://www.lucyware.com/` 추가
   - `http://localhost:port/` 추가 (로컬 개발용)
4. **변경사항 저장**

### Step 3: Client ID 확인
- Application 상세에서 **Client ID** 확인
- 예: `wqjlpu2rl3` (현재 설정값)

### Step 4: Cloudflare Pages 환경변수 설정
1. **Cloudflare 대시보드** → **Pages** → **lucyware-web** 선택
2. **Settings** → **Environment variables** 클릭
3. **Add variable** 버튼 클릭
4. 다음 입력:
   ```
   Variable name: NAVER_CLIENT_ID
   Value: wqjlpu2rl3  (또는 NCP에서 확인한 실제 Client ID)
   ```
5. **Save** 클릭

### Step 5: 로컬 개발 환경 설정
1. `.dev.vars.example` 파일을 `.dev.vars`로 복사:
   ```bash
   cp .dev.vars.example .dev.vars
   ```
2. `.dev.vars` 파일 편집:
   ```
   NAVER_CLIENT_ID=wqjlpu2rl3
   ```
3. 저장

### Step 6: 로컬 테스트
```bash
# wrangler dev 실행
wrangler dev

# 브라우저에서 http://localhost:8787 접속
# Contact 섹션 지도 표시 여부 확인
# F12 → Console에서 에러 메시지 확인
```

### Step 7: 배포
```bash
git add .
git commit -m "지도 API 환경변수 설정"
git push origin main

# Cloudflare Pages 자동 배포 (GitHub 연동)
```

---

## 🔐 보안 체크리스트

- [ ] `.dev.vars` 파일이 `.gitignore`에 포함되어 있음
- [ ] `wrangler.toml`에 클라이언트 ID가 하드코딩되지 않음
- [ ] Cloudflare 대시보드에서 환경변수 설정 완료
- [ ] `index.html`의 스크립트 태그에 `<!--NAVER_CLIENT_ID-->` 마커만 있음

---

## 📝 코드 동작 원리

1. **로컬 개발 (`wrangler dev`)**:
   - `.dev.vars` 파일에서 `NAVER_CLIENT_ID` 읽음
   - `functions/_middleware.ts`가 HTML의 `<!--NAVER_CLIENT_ID-->` 마커를 실제 ID로 치환
   - 지도 로드 성공

2. **운영 배포 (Cloudflare Pages)**:
   - Cloudflare 환경변수에서 `NAVER_CLIENT_ID` 읽음
   - Worker Middleware가 자동으로 HTML 변환
   - 지도 로드 성공

---

## 🆘 문제 해결

### Q: "Authentication Failed" 에러가 여전히 발생
**A:** NCP 콘솔에서 **Application의 WebServiceURL 설정** 다시 확인
- `https://www.lucyware.com/` 정확하게 등록?
- 저장 후 5분 후 테스트 (캐시 적용 시간)

### Q: 로컬에서 localhost로 테스트할 때도 실패
**A:** 다음 확인:
1. `.dev.vars` 파일 존재 여부
2. NCP Application에 `http://localhost:8787/` 등록 여부
3. `wrangler dev`에서 로그 확인

### Q: Cloudflare 대시보드에서 환경변수 설정했는데 반영 안 됨
**A:** 
1. Pages 프로젝트 다시 배포:
   ```bash
   git commit --allow-empty -m "trigger deployment"
   git push origin main
   ```
2. 또는 Cloudflare 대시보드에서 **Deployments** → **Latest** → **Re-deploy** 클릭

---

## 📚 참고 자료
- [Naver Cloud Platform API 문서](https://api.ncloud-docs.com/)
- [Cloudflare Pages 환경변수](https://developers.cloudflare.com/pages/functions/bindings/)
- [Wrangler 설정](https://developers.cloudflare.com/workers/wrangler/configuration/)
