// ============================================================
// 抗老研究室｜LINE LIFF POC C - 後端重新驗證 + Messaging API Push
// Vercel Serverless Function: /api/liff-push-poc.js
// 僅供 POC 測試使用，不接入任何正式問卷邏輯
// ============================================================

const LINE_CHANNEL_ID = '2011409968';
const LINE_VERIFY_URL = 'https://api.line.me/oauth2/v2.1/verify';
const LINE_PUSH_URL = 'https://api.line.me/v2/bot/message/push';

const PUSH_MESSAGE_TEXT =
  '【AI健康解碼 POC】\n✅ Messaging API Push 成功\n這是一則模擬測驗完成結果，代表 MINI App → LINE 身分驗證 → 抗老研究室 OA Push 串接成功。';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { idToken } = req.body || {};

  if (!idToken) {
    return res.status(400).json({ ok: false, error: 'MISSING_ID_TOKEN' });
  }

  // 1) 後端重新向 LINE 官方驗證 ID token，絕不信任前端提供的 userId
  let verifiedUserId;
  try {
    const params = new URLSearchParams();
    params.append('id_token', idToken);
    params.append('client_id', LINE_CHANNEL_ID);

    const verifyRes = await fetch(LINE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.sub || verifyData.aud !== LINE_CHANNEL_ID) {
      return res.status(401).json({ ok: false, error: 'LINE_ID_TOKEN_VERIFICATION_FAILED' });
    }

    verifiedUserId = verifyData.sub;
  } catch (e) {
    return res.status(401).json({ ok: false, error: 'LINE_ID_TOKEN_VERIFICATION_FAILED' });
  }

  // 2) 讀取 Messaging API Channel Access Token（僅從環境變數讀取，不寫死在程式碼）
  const channelAccessToken = process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN;
  if (!channelAccessToken) {
    return res.status(500).json({ ok: false, error: 'MESSAGING_TOKEN_NOT_CONFIGURED' });
  }

  // 3) 呼叫 Messaging API，推送固定寫死的測試訊息（不接受前端自訂內容）
  try {
    const pushRes = await fetch(LINE_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + channelAccessToken,
      },
      body: JSON.stringify({
        to: verifiedUserId,
        messages: [{ type: 'text', text: PUSH_MESSAGE_TEXT }],
      }),
    });

    if (!pushRes.ok) {
      console.error('[liff-push-poc] push failed', {
        endpoint: 'v2/bot/message/push',
        status: pushRes.status,
        requestId: pushRes.headers.get('x-line-request-id') || null,
      });
      return res.status(502).json({ ok: false, error: 'LINE_PUSH_FAILED' });
    }

    return res.status(200).json({ ok: true, verified: true, pushed: true });
  } catch (e) {
    console.error('[liff-push-poc] push exception', { endpoint: 'v2/bot/message/push' });
    return res.status(502).json({ ok: false, error: 'LINE_PUSH_FAILED' });
  }
};
