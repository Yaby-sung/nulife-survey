// ============================================================
// 抗老研究室｜睡眠快速評估問卷（v2）
// Vercel Serverless Function: /api/survey/sleep.js
// ============================================================

const GROUPS = {
  stress:       { questions: [1, 2, 3, 4, 5],     max: 15 },
  inflammation: { questions: [6, 7, 8, 9, 10],    max: 15 },
  structure:    { questions: [11, 12, 13, 14, 15], max: 15 },
};

const TYPE_LABEL = {
  stress:       '壓力型（神經）',
  inflammation: '發炎型（身體）',
  structure:    '結構型（環境）',
};

const TYPE_DESC = {
  stress: [
    '你的狀態比較像：「身體想睡，但神經還醒著」',
    '✔ 很累但停不下來',
    '✔ 容易淺眠或醒來',
    '✔ 睡完還是累',
    '這不是睡眠問題，是「放鬆系統沒有打開」',
  ],
  inflammation: [
    '你的狀態比較像：「身體在干擾睡眠」',
    '✔ 容易翻身',
    '✔ 睡不深',
    '✔ 起床沉重',
    '這代表身體在「修復失衡」',
  ],
  structure: [
    '你的狀態比較像：「睡眠被外在條件影響」',
    '✔ 枕頭不對',
    '✔ 姿勢卡住',
    '✔ 睡醒不舒服',
    '這不是你不會睡，是「環境沒有支撐你」',
  ],
};

const LEVEL_MAP = {
  stress:       { lv: 'Lv3｜神經層', desc: '壓力與自律神經持續過載，放鬆系統無法打開，是你目前最需要穩定的層面。' },
  inflammation: { lv: 'Lv2｜發炎層', desc: '身體慢性發炎干擾睡眠深度，讓修復效率下降。' },
  structure:    { lv: 'Lv4｜結構層', desc: '睡眠環境與姿勢支撐不足，導致身體無法真正放鬆進入深眠。' },
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
    { lv: 'Lv1｜細胞修復層（基底）',             desc: '睡眠「補不回來」的根本原因，細胞修復力是睡眠品質的基礎。' },
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
      '其實你的狀態，不是單純「睡不好」',
      '比較像是：身體累，但沒有真正休息到',
    ],
    typeDesc: TYPE_DESC[primaryKey],
    situation: [
      '☀️ 白天：精神差、容易累、專注力下降',
      '🌙 晚上：想睡但睡不好，或睡了但不深',
      '📉 長期：越睡越累、身體開始失衡',
    ],
    layers,
    coreIssue: [
      '你現在的問題不是睡不夠',
      '而是：身體沒有進入「修復狀態」',
    ],
    adjustDirection: [
      '① 從「神經放鬆」開始 → 讓身體先進入睡眠',
      '② 從「身體修復」開始 → 讓睡眠變深',
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
