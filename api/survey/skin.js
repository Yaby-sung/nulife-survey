// ============================================================
// 抗老研究室｜肌膚管理檢測
// Vercel Serverless Function: /api/survey/skin.js
// ============================================================

const GROUPS = {
  stress:       { questions: [1, 2, 3, 4, 5],      max: 15 }, // 壓力型 → Lv3
  inflammation: { questions: [6, 7, 8, 9],          max: 12 }, // 發炎型 → Lv2
  structure:    { questions: [10, 11, 12, 13, 14],  max: 15 }, // 結構耗損型 → Lv4
  lifestyle:    { questions: [15, 16, 17, 18, 19],  max: 15 }, // 生活習慣型 → Lv5
  cell:         { questions: [20],                   max: 3  }, // 細胞抗氧化 → Lv1
};

// 層級對應
const LEVEL_MAP = {
  stress:       { lv: 'Lv3｜神經層',     desc: '壓力與自律神經直接影響皮脂分泌與修復節奏，這是你目前最需要穩定的層面。' },
  inflammation: { lv: 'Lv2｜發炎層',     desc: '慢性發炎讓肌膚容易泛紅、敏感、反覆不穩定，需要從內在抗發炎著手。' },
  structure:    { lv: 'Lv4｜膠原結構層', desc: '膠原蛋白與彈力蛋白流失，導致鬆弛、細紋、保養效果變差。' },
  lifestyle:    { lv: 'Lv5｜生活習慣層', desc: '作息與飲食習慣是肌膚問題的放大器，需要從生活節奏調整起。' },
  cell:         { lv: 'Lv1｜細胞抗氧化層（基底）', desc: '無論哪種類型，細胞修復力是肌膚穩定的根基，需要優先補足。' },
};

const TYPE_LABEL = {
  stress:       '壓力型肌膚',
  inflammation: '發炎型肌膚',
  structure:    '結構耗損型肌膚',
  lifestyle:    '生活習慣型肌膚',
  cell:         '細胞抗氧化不足型',
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { answers, email } = req.body;

  // 各組加總
  const scores = {};
  for (const [group, { questions }] of Object.entries(GROUPS)) {
    scores[group] = questions.reduce((sum, q) => sum + (answers[q] ?? 0), 0);
  }

  // 排序找主次類型（cell固定為基底，不參與主次排序）
  const sortable = Object.entries(scores)
    .filter(([k]) => k !== 'cell')
    .sort((a, b) => b[1] - a[1]);

  const [primaryKey]   = sortable[0];
  const [secondaryKey] = sortable[1];

  // 三層顯示邏輯：主 + 次 + Lv1基底（固定）
  const layers = [
    { lv: LEVEL_MAP[primaryKey].lv + '（主）',   desc: LEVEL_MAP[primaryKey].desc },
    { lv: LEVEL_MAP[secondaryKey].lv + '（次）', desc: LEVEL_MAP[secondaryKey].desc },
    { lv: LEVEL_MAP.cell.lv,                     desc: LEVEL_MAP.cell.desc },
  ];

  const result = {
    headline: {
      primary:   TYPE_LABEL[primaryKey],
      secondary: TYPE_LABEL[secondaryKey],
      template:  `你的肌膚目前偏向：「${TYPE_LABEL[primaryKey]}」＋「${TYPE_LABEL[secondaryKey]}」`,
    },
    scores,

    // 開場
    opening: [
      '我看了你的測試結果',
      '你的肌膚狀態，不是單純「保養不夠」',
      '身體內部的狀態，正在反映在皮膚上',
      '肌膚是「表現」，真正的原因，在身體裡',
    ],

    // 生活情境
    situation: [
      '☀️ 白天：上妝不服貼、容易出油或乾',
      '🌙 晚上：保養吸收有限、膚況忽好忽壞',
      '📉 長期：痘痘／敏感反覆，或老化速度變快',
      '這些其實是身體內在節奏失衡的表現',
    ],

    // 三層結構（動態）
    layers,

    // 核心結論
    coreIssue: [
      '你現在的問題不是：保養品不夠好、擦得不夠多',
      '而是：身體沒有支撐肌膚穩定的能力',
      '不是你皮膚不好，是身體還沒準備好讓皮膚變好',
    ],

    // 調整順序
    adjustOrder: [
      '🟡 先穩定基底（抗氧化＋修復）',
      '🟠 再處理發炎與循環',
      '🔴 最後才是外在結構與保養',
      '順序對，皮膚才會穩定',
    ],

    // LINE 收口
    lineCallToAction: [
      '每個人的調整順序不太一樣',
      '我可以幫你看，你現在最適合先調哪一層',
      '直接把結果複製傳LINE給我就好',
    ],
  };

  // await sendEmail(email, result);
  // await saveResult({ email, scores, primaryKey, secondaryKey });

  return res.status(200).json(result);
};
