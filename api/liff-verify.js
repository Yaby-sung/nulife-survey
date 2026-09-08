// ============================================================
// 抗老研究室｜LINE LIFF POC B - ID Token 後端驗證
// Vercel Serverless Function: /api/liff-verify.js
// 僅供 POC 測試使用，不接入任何正式問卷邏輯
// ============================================================

const LINE_CHANNEL_ID = '2011409968';
const LINE_VERIFY_URL = 'https://api.line.me/oauth2/v2.1/verify';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { idToken } = req.body || {};

  if (!idToken) {
    return res.status(400).json({ ok: false, error: 'MISSING_ID_TOKEN' });
  }

  try {
    const params = new URLSearchParams();
    params.append('id_token', idToken);
    params.append('client_id', LINE_CHANNEL_ID);

    const lineRes = await fetch(LINE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const lineData = await lineRes.json();

    if (!lineRes.ok || !lineData.sub || lineData.aud !== LINE_CHANNEL_ID) {
      return res.status(401).json({ ok: false, error: 'LINE_ID_TOKEN_VERIFICATION_FAILED' });
    }

    return res.status(200).json({
      ok: true,
      userId: lineData.sub,
      aud: lineData.aud,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'LINE_ID_TOKEN_VERIFICATION_FAILED' });
  }
};
