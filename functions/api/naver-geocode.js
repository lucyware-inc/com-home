export default async function (request, env) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  if (!q) {
    return new Response(JSON.stringify({ error: 'missing q' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const apiUrl = 'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=' + encodeURIComponent(q);

  const clientId = env.NAVER_CLIENT_ID;
  const clientSecret = env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response(JSON.stringify({ error: 'missing server credentials. set NAVER_CLIENT_ID and NAVER_CLIENT_SECRET in environment' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const resp = await fetch(apiUrl, {
    headers: {
      'X-NCP-APIGW-API-KEY-ID': clientId,
      'X-NCP-APIGW-API-KEY': clientSecret
    }
  });

  const text = await resp.text();
  return new Response(text, { status: resp.status, headers: { 'Content-Type': 'application/json' } });
}
