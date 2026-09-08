// ============================================================
// 抗老研究室｜睡眠問卷正式 LINE 串接
// Vercel Serverless Function: /api/sleep-result-push.js
//
// 只接受 { idToken, answers }。
// 後端重新向 LINE 驗證身分、重新用 lib/surveys/sleep.js 計算結果，
// 絕不信任前端提供的 userId / resultKey / headline / message。
// ============================================================

const { calculateSleepResult } = require('../lib/surveys/sleep');

// 允許的 MINI App Channel ID（Developing + Published）。Review 本輪不支援。
const LINE_CHANNEL_IDS = ['2011409968', '2011409970'];
const LINE_VERIFY_URL = 'https://api.line.me/oauth2/v2.1/verify';
const LINE_PUSH_URL = 'https://api.line.me/v2/bot/message/push';

// 依序對每個允許的 Channel ID 呼叫官方 Verify，直到有一個成功為止。
// 不自行 decode JWT，永遠以 LINE 官方回應為準；frontend 不參與這個判斷。
async function verifyLineIdToken(idToken) {
  for (const candidate of LINE_CHANNEL_IDS) {
    try {
      const params = new URLSearchParams();
      params.append('id_token', idToken);
      params.append('client_id', candidate);

      const verifyRes = await fetch(LINE_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.sub && verifyData.aud === candidate) {
        return verifyData.sub;
      }
    } catch (e) {
      // 這個 candidate 失敗，繼續嘗試下一個
    }
  }
  return null;
}

function buildPushMessage(result) {
  const headline = (result && result.headline) || {};
  const lines = [
    '【AI 健康解碼｜睡眠管理】',
    '',
    '你的睡眠解碼結果：',
    '主線索｜' + headline.primary,
  ];

  if (headline.isDualPrimary && headline.secondary) {
    lines.push('另一個明顯線索｜' + headline.secondary);
  }

  lines.push('');
  lines.push('你的結果已經幫你留在聊天室裡。');
  lines.push('接下來可以直接從這個線索繼續往下拆解，');
  lines.push('看看哪些因素可能正在影響你的老化速度。');

  return lines.join('\n');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { idToken, answers } = req.body || {};

  if (!idToken) {
    return res.status(400).json({ ok: false, error: 'MISSING_ID_TOKEN' });
  }

  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return res.status(400).json({ ok: false, error: 'MISSING_ANSWERS' });
  }

  // 1) 後端重新向 LINE 官方驗證 ID token，絕不信任前端提供的 userId
  const verifiedUserId = await verifyLineIdToken(idToken);
  if (!verifiedUserId) {
    return res.status(401).json({ ok: false, error: 'LINE_ID_TOKEN_VERIFICATION_FAILED' });
  }

  // 2) 後端用同一套共用計分邏輯重新計算正式睡眠結果（不信任前端傳來的任何結果欄位）
  let result;
  try {
    result = calculateSleepResult(answers);
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'RESULT_CALCULATION_FAILED' });
  }

  // 3) 讀取 Messaging API Channel Access Token（僅從環境變數讀取）
  const channelAccessToken = process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN;
  if (!channelAccessToken) {
    return res.status(500).json({ ok: false, error: 'MESSAGING_TOKEN_NOT_CONFIGURED' });
  }

  // 4) 用後端重新算出的正式結果組成固定格式訊息，呼叫 Messaging API Push
  try {
    const pushMessage = buildPushMessage(result);

    const pushRes = await fetch(LINE_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + channelAccessToken,
      },
      body: JSON.stringify({
        to: verifiedUserId,
        messages: [{ type: 'text', text: pushMessage }],
      }),
    });

    if (!pushRes.ok) {
      console.error('[sleep-result-push] push failed', {
        endpoint: 'v2/bot/message/push',
        status: pushRes.status,
        requestId: pushRes.headers.get('x-line-request-id') || null,
      });
      return res.status(502).json({ ok: false, error: 'LINE_PUSH_FAILED' });
    }

    return res.status(200).json({ ok: true, verified: true, pushed: true });
  } catch (e) {
    console.error('[sleep-result-push] push exception', { endpoint: 'v2/bot/message/push' });
    return res.status(502).json({ ok: false, error: 'LINE_PUSH_FAILED' });
  }
};
