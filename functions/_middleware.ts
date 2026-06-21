/**
 * Cloudflare Pages Middleware
 * 환경변수(NAVER_CLIENT_ID)를 HTML에 동적으로 주입
 */

export const onRequest: PagesFunction = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // index.html 요청만 처리
  if (url.pathname === '/' || url.pathname === '/index.html') {
    const response = await context.next();
    
    // HTML이 아니면 그냥 반환
    if (!response.headers.get('content-type')?.includes('text/html')) {
      return response;
    }

    const html = await response.text();
    const clientId = env.NAVER_CLIENT_ID || 'wqjlpu2rl3'; // fallback
    
    // HTML의 마커를 실제 클라이언트 ID로 치환
    const modifiedHtml = html.replace(
      '<!--NAVER_CLIENT_ID-->',
      clientId
    );

    return new Response(modifiedHtml, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  return context.next();
};
