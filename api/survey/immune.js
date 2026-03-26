// ============================================================
// 抗老研究室｜免疫快速評估問卷（v2）
// Vercel Serverless Function: /api/survey/immune.js
// ============================================================

const GROUPS = {
  stress:       { questions: [1, 2, 3, 4, 5],     max: 15 },
  inflammation: { questions: [6, 7, 8, 9, 10],    max: 15 },
  structure:    { questions: [11, 12, 13, 14, 15], max: 15 },
};

const TYPE_LABEL = {
  stress:       '壓力型（神經影響）',
  inflammation: '發炎型（內在失衡）',
  structure:    '結構型（循環與基礎）',
};

const TYPE_DESC = {
  stress: [
    '你的狀態比較像：「神經一直在影響免疫」',
    '✔ 一忙就容易生病',
    '✔ 身體緊繃放鬆不下來',
    '✔ 覺得自己一直在撐',
    '這不是免疫力差，是「壓力在消耗你的免疫」',
  ],
  inflammation: [
    '你的狀態比較像：「身體在過度反應」',
    '✔ 容易過敏、發炎',
    '✔ 腸胃不穩定',
    '✔ 反覆感冒久不好',
    '這不是體質問題，是「免疫在失衡」',
  ],
  structure: [
    '你的狀態比較像：「循環跟不上修復」',
    '✔ 手腳冰冷、循環差',
    '✔ 傷口癒合慢',
    '✔ 長期疲倦沒精神',
    '這不是老化，是「基礎循環需要支撐」',
  ],
};

const LEVEL_MAP = {
  stress:       { lv: 'Lv3｜神經層',   desc: '壓力與自律神經直接影響免疫穩定，神經過載讓身體無法好好修復。' },
  inflammation: { lv: 'Lv2｜發炎層',   desc: '慢性發炎消耗免疫資源，讓身體容易過敏、反覆不適。' },
  structure:    { lv: 'Lv4｜循環結構層', desc: '循環不足讓免疫細胞無法有效運送，修復效率下降。' },
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
    { lv: 'Lv1｜細胞修復層（基底）',             desc: '免疫的根本在細胞修復力，無論哪種類型都需要優先補足。' },
  ];

  const result = {
    headline: {
      primary:      TYPE_LABEL[primaryKey],
      secondary:    TYPE_LABEL[secondaryKey],
      isDualPrimary,
    },
    scores,
    opening: [
      '我看了你的測試結果',
      '你的免疫狀態偏向：「' + TYPE_LABEL[primaryKey] + '」',
      '並伴隨部分「' + TYPE_LABEL[secondaryKey] + '」的影響',
    ],
    typeDesc: TYPE_DESC[primaryKey],
    situation: [
      '☀️ 白天：容易疲勞、身體緊繃、狀況不穩',
      '🌙 晚上：睡不好讓免疫更差',
      '📉 長期：反覆生病、恢復慢、能量下降',
    ],
    layers,
    coreIssue: [
      '你現在的問題不是免疫力不夠',
      '而是：身體缺乏穩定與修復的能力',
    ],
    adjustDirection: [
      '① 從「神經穩定」開始 → 讓免疫不再被壓力消耗',
      '② 從「抗發炎」開始 → 讓身體回到平衡',
      '你比較有感的是哪一個？',
    ],
    lineCallToAction: [
      '你這次的狀態，主要是「' + TYPE_LABEL[primaryKey] + '＋' + TYPE_LABEL[secondaryKey] + '」',
      '通常會有兩個調整方向',
      '直接把結果複製傳LINE給我就好',
    ],
  };

  return res.status(200).json(result);
};
