# 문의 폼 DB 저장 — 준비 절차

홈페이지 문의를 사내 MariaDB 에 남기기 위한 절차다. **DB 와 서버 작업은 사람이
한다** — Claude 는 DB 에 붙지 않고, 아래 1~4 는 대신할 수 없다.

지금 상태: **코드는 올라가 있고 저장할 곳만 없다.** `/api/contact` 는 Hyperdrive
바인딩이 없으면 503 을 돌려주고, 화면은 예전처럼 메일 앱을 연다. 그래서 준비가
끝나기 전에도 문의를 잃지 않는다.

---

## 왜 터널이 필요한가

**Cloudflare 에서 사내 MariaDB 로 가는 길이 없다.** 그 DB 는 `123.41.35.7` 경유
SSH 터널로만 닿는다(상위 `CLAUDE.md` 참조). Hyperdrive 는 DB 에 직접 닿을 수
있어야 동작하므로, 그 사이를 Cloudflare Tunnel 이 잇는다.

DB 를 인터넷에 직접 열어 IP 로 막는 방법도 있으나 권하지 않는다 — Cloudflare 의
출구 IP 대역이 넓어서 「우리만 들어온다」 가 성립하지 않는다.

---

## 1. 문의 테이블 만들기

`docs/sql/crm_inq.sql` 을 검토하고 실행한다. 실행 전에 그 파일 머리에 적어 둔 네
가지를 정한다 — **테이블 이름 · 문자셋 · 코드마스터 등록 여부 · 보관기간**.

이름을 바꾸면 알려 준다. 함수(`functions/api/contact.js`)의 INSERT 문에 테이블
이름이 한 번 나오므로 함께 고쳐야 한다.

## 2. 웹 전용 DB 계정 만들기

**그 테이블에 INSERT 만 되는 계정**을 쓴다. 공개된 폼에서 들어오는 경로이므로,
엔드포인트 하나가 뚫렸을 때 사고 범위를 한 테이블로 묶어 둔다.

```sql
CREATE USER 'lucyware_web'@'<접속대역>' IDENTIFIED BY '<비밀번호>';
GRANT INSERT ON <스키마>.CRM_INQ TO 'lucyware_web'@'<접속대역>';
FLUSH PRIVILEGES;
```

**`@` 뒤 대역이 중요하다.** 터널을 지나면 MariaDB 는 클라이언트를 「터널이 뜬
서버」 로 본다. 개발 PC 주소가 아니다. 접속이 거부되면 에러 문구의 `@` 뒤 IP 가
필요한 대역을 그대로 알려 준다.

## 3. Cloudflare Tunnel 띄우기

경유 서버(`123.41.35.7`)에서 `cloudflared` 를 설치하고 DB 대역을 사설망으로
공개한다. Cloudflare 대시보드의 **Zero Trust → Networks → Tunnels** 에서 터널을
만들고, 그 서버에서 커넥터를 실행한 뒤 **Private Network** 에 DB 의 IP 대역을
등록한다.

- **개발자 개인 SSH 키로 뜨는 터널과는 다른 것이다.** 이쪽은 상시 떠 있어야
  하므로 서비스로 등록한다(재부팅 후에도 살아야 한다).
- CI 의 배포 키로는 SSH 포트포워딩이 되지 않는다 — 그 키에는
  `no-port-forwarding` 이 걸려 있다. 이 절차는 SSH 가 아니라 cloudflared 를 쓴다.

## 4. Hyperdrive 구성 만들고 바인딩 걸기

```bash
npx wrangler hyperdrive create lucyware-mariadb \
  --connection-string="mysql://lucyware_web:<비밀번호>@<DB주소>:3306/<스키마>" \
  --access-client-id="<터널 서비스 토큰 ID>" \
  --access-client-secret="<터널 서비스 토큰 Secret>"
```

출력된 **id** 를 `wrangler.toml` 의 `[[hyperdrive]]` 블록에 넣고 주석을 푼다.

```toml
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "<위에서 출력된 ID>"
```

**대시보드가 아니라 이 파일이다** (2026-08-18 문서 확인으로 바로잡음). 저장소에
`wrangler.toml` 이 있는 Pages 프로젝트에서는 이 파일이 단일 진실 공급원이 되어
같은 항목을 대시보드에서 고칠 수 없다 — Cloudflare 문서의 말로는 "This file
becomes the source of truth when used, meaning that you cannot edit the same
fields in the dashboard" 다. 대시보드에만 걸어 두면 두 곳이 어긋나는 정도가
아니라 **아예 먹지 않는다.**

**id 는 비밀이 아니므로 커밋한다.** 자격증명(계정·비밀번호·Access 토큰)은 위
`hyperdrive create` 명령이 Cloudflare 쪽 구성에 넣었고, 저장소에는 그 구성을
가리키는 이름만 남는다. `localConnectionString` 은 적지 않는다 — 그 줄에는
비밀번호가 들어가고 그대로 커밋된다.

바인딩 이름은 **`HYPERDRIVE`** 여야 한다 — 함수가 `env.HYPERDRIVE` 로 읽는다.

---

## 4-1. 로컬에서 붙여 보기

**운영에 걸기 전에 개발 PC 에서 같은 코드로 확인할 수 있다.** 로컬은 Hyperdrive
를 지나지 않고 wrangler 가 접속 문자열로 직접 붙는다.

```bash
cp .env.example .env      # 그리고 <비밀번호> · <스키마> 두 곳을 채운다
```

`.env` 의 변수는 이것 하나다.

```
CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE="mysql://lucyware_web:<비밀번호>@127.0.0.1:13307/<스키마>"
```

- **`.dev.vars` 가 아니라 `.env` 다.** 이 값은 워커의 바인딩이 아니라 **wrangler
  프로세스가 읽는 시스템 환경변수**이고, wrangler 는 `.env` 만 자기 `process.env`
  에 얹는다. `.dev.vars` 에 적으면 아무 일도 일어나지 않는다.
- 변수 이름 끝(`_HYPERDRIVE`)은 바인딩 이름과 같아야 한다.
- **주소 자리에 DB 주소를 적지 않는다.** 붙는 곳은 터널의 이쪽 끝인 `127.0.0.1`
  이고, 저쪽 끝을 DB 로 잇는 일은 `ssh -L` 이 한다. DB 주소를 그대로 적으면 그
  대역으로 가는 라우트가 없어 `timed out` 으로 죽는다 — 값은 맞는데 길이 없는
  것이라, 접속 문자열을 아무리 들여다봐도 원인이 보이지 않는다.
- **비밀번호의 특수문자는 퍼센트 인코딩한다.** 주소 문법이라 그대로 넣으면
  구분자로 읽힌다. 인코딩한 값은 wrangler 가 되돌려 주므로 안전하다
  (`%40`→`@` · `%24`→`$` · `%23`→`#`, 2026-08-18 실제로 넣어 확인).
  만드는 법: `node -e "console.log(encodeURIComponent('비밀번호'))"`
- **`$` 는 특히 위험하다.** 날 `$` 를 적으면 dotenv 가 변수 이름으로 읽어 **거기서
  값이 잘린다** — `pa$word9` 를 넣었더니 함수가 받은 비밀번호는 `pa` 였다. 그러면
  `Access denied` 만 나오는데 접속 문자열은 눈으로 봐서 맞게 적혀 있으므로, 어디가
  틀렸는지 보이지 않는다. `%24` 로 적는다.
- `127.0.0.1:13307` 은 이 프로젝트의 SSH 터널 자리다. 터널을 먼저 띄운다 —
  **개발자 개인 키**로만 뚫리고, CI 배포 키에는 `no-port-forwarding` 이 걸려 있다.

```bash
ssh -i ~/.ssh/Lucyware-net-SCP2-Keypair.pem -N -L 13307:<DB주소>:3306 <계정>@123.41.35.7
npm run dev:api                     # http://localhost:8220
```

**바인딩 블록의 주석을 풀지 않으면 로컬에서도 503 이다** — 함수가 보는 것은
`env.HYPERDRIVE` 이고, 그 바인딩은 `wrangler.toml` 이 만든다.

응답으로 어디까지 갔는지 알 수 있다 (2026-08-18 로컬 확인).

| 응답 | 어디까지 갔는가 |
|---|---|
| `405 method_not_allowed` | GET 으로 불렀다. 이 주소는 POST 만 받는다 |
| `503 storage_unavailable` | 바인딩이 없다 — `[[hyperdrive]]` 주석을 풀지 않았다 |
| `502 storage_failed` | 바인딩은 잡혔고 **DB 에 못 붙었다.** 터널·그란트·테이블을 본다. 원인은 wrangler 콘솔에 찍힌다 |
| `200 {"ok":true}` | 저장됨. DB 에서 그 한 줄을 직접 확인한다 |

---

## 5. 되는지 확인하기

바인딩을 걸면 **재배포해야 적용된다.** 그 뒤 이렇게 확인한다.

```bash
curl -i -X POST https://www.lucyware.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"company":"테스트","name":"테스트","email":"test@example.com",
       "topic":"ETC","message":"연결 확인","agree":true,"lang":"ko"}'
```

| 응답 | 뜻 |
|---|---|
| `200 {"ok":true}` | 저장됨. DB 에서 한 줄 확인한다 |
| `503 storage_unavailable` | 바인딩이 안 걸렸거나 재배포 전이다 |
| `502 storage_failed` | 붙었으나 INSERT 실패 — 테이블 이름·권한·컬럼을 본다. Pages 의 Functions 로그에 원인이 남는다 |
| `400 …` | 보낸 값 문제. 위 명령을 그대로 썼는지 본다 |

**상태코드만 보지 말고 DB 에서 그 한 줄을 직접 확인한다.** 200 은 확인이 아니다.

확인이 끝나면 그 테스트 행은 지운다.

---

## 아직 남은 것 — 이것 없이 저장을 시작하면 안 된다

**⑴ 개인정보 수집·이용 동의**
지금 폼에는 동의 체크박스가 없다. 메일로 받을 때는 방문자가 자기 메일로 보내는
구조였지만, **DB 에 저장하는 순간 우리가 개인정보를 보관하는 주체가 된다.**
수집 항목·목적·보관기간을 적고 동의를 받아야 한다. 함수는 이미 `agree !== true`
면 거부한다.

**⑵ 개인정보처리방침 페이지**
사이트에 없다. 동의를 받으려면 무엇에 동의하는지 볼 곳이 있어야 한다.
보관기간과 개인정보 보호책임자를 정해 주면 화면으로 옮긴다.

**⑶ 수집 항목에 접속 IP 를 포함할지**
함수는 `CLNT_IP` 를 넣는다. 스팸 추적에 쓸모가 있으나 **그 자체가 개인정보다.**
수집 항목에 적지 않을 거라면 함수와 DDL 에서 컬럼째로 뺀다.

**⑷ 스팸 방어**
지금은 벌집(honeypot) 칸 하나뿐이다. 공개 POST 엔드포인트는 반드시 봇이 찾아온다.
**Cloudflare Turnstile**(무료)을 붙이길 권한다 — 사이트 키를 발급해 주면 화면과
함수에 함께 붙인다.

**⑸ 새 문의를 사람이 어떻게 아는가**
DB 에만 쌓이면 아무도 안 본다. 알림 메일을 보내려면 발송 서비스가 필요하다
(Workers 에서 SMTP 를 직접 쓸 수 없다). 관리 화면을 만드는 편이 나을 수도 있으니
따로 정한다.
