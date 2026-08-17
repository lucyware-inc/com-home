/**
 * POST /api/contact — 문의 접수
 *
 * 화면(폼)에서 받은 값을 사내 MariaDB 의 문의 테이블에 한 줄 넣는다.
 * Cloudflare Pages Functions 라 `onRequestPost` 를 내보내야 한다 — `export
 * default` 는 호출되지 않는다.
 *
 * ----------------------------------------------------------------------------
 * **이 함수는 INSERT 만 한다.** 붙는 계정도 그 테이블에 INSERT 만 되는 계정이다.
 * 공개된 폼에서 들어오는 경로이므로, 엔드포인트 하나가 뚫렸을 때 사고 범위를
 * 한 테이블로 묶어 둔다. 조회는 사람이 하거나 별도 계정을 쓰는 관리 화면이 한다.
 *
 * **실패를 감추지 않는다.** 저장이 안 됐는데 「접수되었습니다」 를 돌려주면
 * 문의가 조용히 사라진다. 실패하면 그대로 실패를 알리고, 화면은 예전처럼
 * 메일 앱을 열어 방문자가 직접 보내게 한다 — 그래야 문의가 남는다.
 * ----------------------------------------------------------------------------
 */

/** 화면이 보내는 문의유형 코드. 이 목록에 없는 값은 받지 않는다 — 화면을 우회해
 *  아무 문자열이나 넣는 것을 막는다. DDL 주석의 코드 목록과 같아야 한다. */
const INQ_TYPE_CD = new Set([
  "POC",
  "METADRAG",
  "LUCYWAREAI",
  "FLEXELF",
  "UBIQLOUD",
  "UBIQATION",
  "SI",
  "RECRUIT",
  "ETC",
]);

/** 컬럼 길이를 넘는 값은 자른다. DB 가 거부해 통째로 실패하는 것보다,
 *  받아서 넣고 사람이 읽을 수 있게 하는 편이 낫다. 길이는 DDL 과 맞춘다. */
const LIMIT = {
  company: 100,
  name: 50,
  email: 255,
  phone: 30,
  message: 20000,
  referer: 500,
};

const json = (body, status, extra) =>
  new Response(JSON.stringify(body), {
    status: status,
    headers: Object.assign(
      { "Content-Type": "application/json; charset=utf-8" },
      extra || {}
    ),
  });

/**
 * 모든 메서드가 여기로 들어온다.
 *
 * **메서드별 함수(onRequestPost)만 내보내면 안 된다.** 그러면 POST 아닌 요청을
 * Pages 가 정적 사이트로 흘려보내, `/api/contact` 에 GET 했을 때 홈 화면이
 * 200 으로 돌아온다 — 검색엔진이 홈의 사본으로 색인할 수 있고, 무엇보다 API
 * 주소가 API 처럼 답하지 않는다. 하나만 내보내고 안에서 갈라 애매함을 없앤다.
 */
export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return json({ ok: false, reason: "method_not_allowed" }, 405, {
      Allow: "POST",
    });
  }
  return handlePost(context);
}

function clean(value, max) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

async function handlePost(context) {
  const { request, env } = context;

  /* Hyperdrive 바인딩이 없으면 저장할 곳이 없다. 여기서 500 을 주면 화면이
     메일 앱을 여는 예전 경로로 넘어간다 — 문의는 잃지 않는다. */
  if (!env.HYPERDRIVE) {
    return json({ ok: false, reason: "storage_unavailable" }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ ok: false, reason: "bad_request" }, 400);
  }

  /* 벌집(honeypot). 사람에게는 보이지 않는 칸이라 값이 들어 있으면 봇이다.
     조용히 성공으로 답한다 — 막혔다고 알려주면 다음번에 우회한다. */
  if (clean(body.website, 100) !== "") {
    return json({ ok: true });
  }

  const company = clean(body.company, LIMIT.company);
  const name = clean(body.name, LIMIT.name);
  const email = clean(body.email, LIMIT.email);
  const phone = clean(body.phone, LIMIT.phone);
  const message = clean(body.message, LIMIT.message);
  const topic = clean(body.topic, 20).toUpperCase();
  const lang = clean(body.lang, 2).toLowerCase() === "en" ? "en" : "ko";

  if (!company || !name || !email || !message) {
    return json({ ok: false, reason: "missing_field" }, 400);
  }
  if (!INQ_TYPE_CD.has(topic)) {
    return json({ ok: false, reason: "bad_topic" }, 400);
  }
  /* 화면에서도 막지만 여기서 또 본다 — 화면을 우회한 요청이 동의 없이
     개인정보를 남기게 두면 안 된다. */
  if (body.agree !== true) {
    return json({ ok: false, reason: "consent_required" }, 400);
  }
  /* 형식만 본다. 실제로 닿는 주소인지는 답장을 보내 봐야 안다 */
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, reason: "bad_email" }, 400);
  }

  /* 접속 정보. CLNT_IP 는 그 자체가 개인정보이므로 개인정보처리방침의
     수집 항목에 반드시 적혀 있어야 한다. */
  const ip = request.headers.get("CF-Connecting-IP") || null;
  const referer = clean(request.headers.get("Referer"), LIMIT.referer) || null;

  let conn;
  try {
    /* mysql2 는 Workers 런타임에서 `disableEval` 이 필요하다 — 코드 생성을
       쓰는 경로가 막혀 있기 때문이다. Hyperdrive 가 넘겨주는 접속 정보는
       터널 뒤의 실제 DB 가 아니라 Hyperdrive 자신을 가리킨다. */
    const { createConnection } = await import("mysql2/promise");
    conn = await createConnection({
      host: env.HYPERDRIVE.host,
      port: env.HYPERDRIVE.port,
      user: env.HYPERDRIVE.user,
      password: env.HYPERDRIVE.password,
      database: env.HYPERDRIVE.database,
      disableEval: true,
    });

    await conn.execute(
      `INSERT INTO CRM_INQ
         (RCPT_DTM, CORP_NM, MGR_NM, EMAIL, TEL_NO, INQ_TYPE_CD, INQ_CNTN,
          LANG_CD, PRVC_AGR_YN, PRVC_AGR_DTM,
          PROC_STAT_CD, REG_CHNL_CD, CLNT_IP, REFERER_URL)
       VALUES
         (NOW(), ?, ?, ?, ?, ?, ?, ?, 'Y', NOW(), 'RCPT', 'HOMEPAGE', ?, ?)`,
      [company, name, email, phone || null, topic, message, lang, ip, referer]
    );

    return json({ ok: true });
  } catch (err) {
    /* 사람이 읽는 화면에는 내부 사정을 내보내지 않는다. 원인은 로그로 남긴다
       (wrangler tail 또는 Pages 의 Functions 로그에서 본다). */
    console.error("contact insert failed:", err && err.message);
    return json({ ok: false, reason: "storage_failed" }, 502);
  } finally {
    if (conn) {
      /* 연결을 닫지 않으면 Hyperdrive 쪽 풀에 남는다. 실패해도 닫는다. */
      context.waitUntil(conn.end().catch(() => {}));
    }
  }
}
