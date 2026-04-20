// ============================================================
// 抗老研究室｜體態管理檢測（v3）
// Vercel Serverless Function: /api/survey/body.js
// ============================================================

const GROUPS = {
  diet:     { questions: [1,2,3,4,5],     max: 15 },
  exercise: { questions: [6,7,8,9,10],    max: 15 },
  stress:   { questions: [11,12,13,14,15], max: 15 },
  insulin:  { questions: [16,17,18,19,20], max: 15 },
  survival: { questions: [21,22,23,24,25], max: 15 },
  gene:     { questions: [26,27,28,29,30], max: 15 },
};

const TYPE_LABEL = {
  diet:     '飲食型（能量失衡）',
  exercise: '運動型（代謝不足）',
  stress:   '壓力型（荷爾蒙）',
  insulin:  '胰島素型（血糖波動）',
  survival: '保命機制型（節能模式）',
  gene:     '基因表現型（代謝改變）',
};

// 複製用簡短名稱（無括號）
const TYPE_SHORT = {
  diet:     '飲食型',
  exercise: '運動型',
  stress:   '壓力型',
  insulin:  '胰島素型',
  survival: '保命機制型',
  gene:     '基因表現型',
};

// 15種組合的固定順序（字典序，小的永遠在前）
const TYPE_ORDER = ['diet', 'exercise', 'stress', 'insulin', 'survival', 'gene'];

// 取得固定15種組合的主次（依照 TYPE_ORDER 順序，index小的在前）
function getNormalizedPair(keyA, keyB) {
  const idxA = TYPE_ORDER.indexOf(keyA);
  const idxB = TYPE_ORDER.indexOf(keyB);
  return idxA <= idxB ? [keyA, keyB] : [keyB, keyA];
}

const TYPE_DESC = {
  diet: ['你的狀態比較像：「能量輸入過多但用不掉」','✔ 吃多、重口味','✔ 容易累','✔ 蔬菜攝取不足','不是吃太多，是身體不會用'],
  exercise: ['你的狀態比較像：「燃燒能力不足」','✔ 久坐、易累','✔ 肌肉少','✔ 稍微動就喘','不是不努力，是燃燒引擎弱'],
  stress: ['你的狀態比較像：「壓力影響代謝」','✔ 壓力大容易暴食','✔ 睡不好','✔ 肚子容易囤脂','不是自制力差，是荷爾蒙在影響'],
  insulin: ['你的狀態比較像：「血糖波動大」','✔ 很快餓、飯後累','✔ 腹部脂肪明顯','✔ 體重容易上下','不是吃錯，是代謝在囤積'],
  survival: ['你的狀態比較像：「身體鎖住代謝」','✔ 吃少也不瘦','✔ 體重卡關','✔ 容易復胖','不是沒效，是身體在保護你'],
  gene: ['你的狀態比較像：「代謝模式改變」','✔ 以前不會胖，現在會','✔ 脂肪集中腹部','✔ 年紀增加後變難瘦','不是基因，是被生活打開'],
};

const LEVEL_MAP = {
  diet:     { lv: 'Lv5｜生活習慣層',     desc: '飲食結構與能量輸入是體態的直接影響層，需要從飲食節奏調整起。' },
  exercise: { lv: 'Lv4｜肌肉與代謝層',   desc: '肌肉量決定基礎代謝率，運動不足讓燃燒引擎持續弱化。' },
  stress:   { lv: 'Lv3｜壓力與荷爾蒙層', desc: '壓力荷爾蒙直接影響脂肪囤積與代謝節奏，是最需要穩定的層面。' },
  insulin:  { lv: 'Lv2｜血糖與發炎層',   desc: '血糖波動讓身體持續囤積脂肪，需要從飲食節奏與抗發炎著手。' },
  survival: { lv: 'Lv1｜細胞修復層',     desc: '長期節食讓細胞進入節能保護模式，代謝恢復需要從基底重建。' },
  gene:     { lv: 'Lv1｜細胞修復層',     desc: '代謝模式改變源自細胞層面的變化，需要從根本修復代謝能力。' },
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { answers, email } = req.body;

  const scores = {};
  for (const [group, { questions }] of Object.entries(GROUPS)) {
    scores[group] = questions.reduce((sum, q) => sum + (answers[q] ?? 0), 0);
  }

  // 實際主次（依分數排序，用於文案）
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [primaryKey, primaryScore]     = sorted[0];
  const [secondaryKey, secondaryScore] = sorted[1];
  const isDualPrimary = (primaryScore - secondaryScore) < 3;

  // 固定15種組合（用於複製文字）
  const [normalA, normalB] = getNormalizedPair(primaryKey, secondaryKey);

  const layers = [
    { lv: LEVEL_MAP[primaryKey].lv + '（主）',   desc: LEVEL_MAP[primaryKey].desc },
    { lv: LEVEL_MAP[secondaryKey].lv + '（次）', desc: LEVEL_MAP[secondaryKey].desc },
    { lv: 'Lv1｜細胞修復層（基底）',             desc: '代謝能不能恢復，根本在細胞修復力，需要優先補足。' },
  ];

  const result = {
    headline: {
      primary:      TYPE_LABEL[primaryKey],   // 實際主類型（文案用）
      secondary:    TYPE_LABEL[secondaryKey], // 實際次類型（文案用）
      isDualPrimary,
      // 固定15種複製文字
      copyText: `我的體態屬於 主類型：${TYPE_SHORT[normalA]} 次類型：${TYPE_SHORT[normalB]}`,
    },
    scores,
    opening: [
      '我看了你的測試結果',
      '你的體態狀態偏向：「' + TYPE_LABEL[primaryKey] + '」',
      '並伴隨部分「' + TYPE_LABEL[secondaryKey] + '」的影響',
      '其實你的狀態，不是單純「瘦不下來」',
      '身體正在用現在的模式運作',
      '體重是結果，真正的關鍵是身體的代謝系統',
    ],
    typeDesc: TYPE_DESC[primaryKey],
    situation: [
      '☀️ 白天：容易累、想吃東西、精神不穩',
      '🌙 晚上：想吃高熱量、控制不了',
      '📉 長期：體重卡住，或反覆上下',
      '其實都是身體在失衡',
    ],
    layers,
    coreIssue: [
      '你現在的問題不是吃太多、動太少',
      '而是：身體沒有回到「正常燃燒模式」',
      '不是你瘦不下來，是身體還沒準備好變瘦',
    ],
    adjustDirection: [
      '① 從「基礎代謝修復」開始 → 讓身體能運作',
      '② 從「血糖／壓力調整」開始 → 讓脂肪不再囤積',
      '你比較有感的是哪一個？',
    ],
    lineCallToAction: [
      '你這次的結果，主要是「' + TYPE_LABEL[primaryKey] + '＋' + TYPE_LABEL[secondaryKey] + '」',
      '通常會有兩個調整方向',
      '直接把結果複製傳LINE給我就好',
    ],
  };

  return res.status(200).json(result);
};
