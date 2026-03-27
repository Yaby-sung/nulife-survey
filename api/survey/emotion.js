// ============================================================
// 抗老研究室｜情緒壓力檢測（v2）
// Vercel Serverless Function: /api/survey/emotion.js
// ============================================================

const GROUPS = {
  stress:       { questions: [1,2,3,4,5],     max: 15 },
  inflammation: { questions: [6,7,8,9,10],    max: 15 },
  structure:    { questions: [11,12,13,14,15], max: 15 },
};

const TYPE_LABEL = {
  stress:       '壓力型(神經）',
  inflammation: '發炎型(體壓）',
  structure:    '結構型(慢壓）',
};

const TYPE_DESC = {
  stress: [
    '你的狀態比較像：「神經一直開著」',
    '✔ 腦袋停不下來',
    '✔ 容易焦慮／緊張',
    '✔ 小事放大',
    '✔ 睡前思緒很多',
    '不是你想太多，是神經沒有關掉（Lv3）',
  ],
  inflammation: [
    '你的狀態比較像：「身體在影響情緒」',
    '✔ 容易煩躁／易怒',
    '✔ 情緒起伏大',
    '✔ 身體疲累但精神緊',
    '✔ 腸胃／皮膚容易出問題',
    '不是情緒問題，是發炎影響神經（Lv2 → Lv3）',
  ],
  structure: [
    '你的狀態比較像：「能量撐不起來」',
    '✔ 長期疲憊',
    '✔ 情緒鈍化（沒感覺）',
    '✔ 提不起勁',
    '✔ 對事情失去興趣',
    '不是你懶，是能量＋結構在下降（Lv1＋Lv4）',
  ],
};

const LEVEL_MAP = {
  stress:       { lv: 'Lv3｜神經層',           desc: '壓力與自律神經持續過載，神經系統無法切換到放鬆模式，這是你目前最需要穩定的層面。' },
  inflammation: { lv: 'Lv2｜發炎層',           desc: '慢性發炎透過神經影響情緒穩定，身體的發炎反應讓情緒更容易波動。' },
  structure:    { lv: 'Lv1＋Lv4｜能量結構層', desc: '細胞能量不足加上結構耗損，導致情緒鈍化與長期疲憊感。' },
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { answers, email } = req.body;

  const scores = {};
  for (const [group, { questions }] of Object.entries(GROUPS)) {
    scores[group] = questions.reduce((sum, q) => sum + (answers[q] ?? 0), 0);
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [primaryKey, primaryScore]     = sorted[0];
  const [secondaryKey, secondaryScore] = sorted[1];
  const isDualPrimary = (primaryScore - secondaryScore) < 3;

  const layers = [
    { lv: LEVEL_MAP[primaryKey].lv + '（主）',   desc: LEVEL_MAP[primaryKey].desc },
    { lv: LEVEL_MAP[secondaryKey].lv + '（次）', desc: LEVEL_MAP[secondaryKey].desc },
    { lv: 'Lv1｜細胞抗壓層（基底）',             desc: '決定情緒能不能穩定下來，無論哪種類型都需要優先補足細胞抗壓能力。' },
  ];

  const result = {
    headline: { primary: TYPE_LABEL[primaryKey], secondary: TYPE_LABEL[secondaryKey], isDualPrimary },
    scores,
    opening: [
      '我看了你的測試結果',
      '你的情緒壓力狀態偏向：「' + TYPE_LABEL[primaryKey] + '」',
      '並伴隨部分「' + TYPE_LABEL[secondaryKey] + '」的影響',
      '其實你的狀態，不是單純「情緒不好」',
      '身體正在承受壓力的方式不同',
      '情緒是「表現」，壓力是一種「累積結果」',
    ],
    typeDesc: TYPE_DESC[primaryKey],
    situation: [
      '☀️ 白天：容易累、情緒波動、專注力下降',
      '🌙 晚上：放鬆不了，或停不下來',
      '📉 長期：情緒內耗、狀態不穩、能量下降',
      '這些其實都是系統在失衡',
    ],
    layers,
    coreIssue: [
      '你現在的問題不是情緒不好',
      '而是：身體沒有回到穩定模式',
      '不是你控制不了，是系統還沒穩定',
    ],
    adjustDirection: [
      '① 從「神經平衡」開始 → 讓整體慢下來',
      '② 從「身體修復」開始 → 讓情緒穩定',
      '③ 如果是長期累積 → 需要能量＋結構一起調整',
      '你比較有感的是哪一個？',
    ],
    lineCallToAction: [
      '你這次的結果，主要是「' + TYPE_LABEL[primaryKey] + '＋' + TYPE_LABEL[secondaryKey] + '」',
      '通常會有兩個方向',
      '直接把結果複製傳LINE給我就好',
    ],
  };

  return res.status(200).json(result);
};
