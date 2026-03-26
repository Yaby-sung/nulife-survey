// ============================================================
// 抗老研究室｜肌膚管理檢測（v2）
// Vercel Serverless Function: /api/survey/skin.js
// ============================================================

const GROUPS = {
  moisture: { questions: [1,2,3,4,5],     max: 15 },
  oil:      { questions: [6,7,8,9,10],    max: 15 },
  sensitive:{ questions: [11,12,13,14,15], max: 15 },
  sagging:  { questions: [16,17,18,19,20], max: 15 },
  dull:     { questions: [21,22,23,24,25], max: 15 },
  aging:    { questions: [26,27,28,29,30], max: 15 },
};

const TYPE_LABEL = {
  moisture:  '水分流失型（乾燥）',
  oil:       '油脂失衡型（出油）',
  sensitive: '敏感修復型（屏障）',
  sagging:   '鬆弛下垂型（結構）',
  dull:      '暗沉斑點型（代謝）',
  aging:     '基因老化型（整體）',
};

const TYPE_DESC = {
  moisture: [
    '你的皮膚比較像：「水留不住」',
    '✔ 乾、緊、脫屑',
    '✔ 保濕撐不久',
    '✔ 換季容易乾癢',
    '不是缺水，是鎖水能力下降',
  ],
  oil: [
    '你的皮膚比較像：「油水不平衡」',
    '✔ 容易出油、毛孔明顯',
    '✔ 粉刺反覆',
    '✔ 清潔後很快又出油',
    '不是油太多，是皮膚在失衡',
  ],
  sensitive: [
    '你的皮膚比較像：「防禦力下降」',
    '✔ 容易泛紅、刺痛',
    '✔ 保養品容易不適',
    '✔ 天氣變化就不穩',
    '不是皮膚差，是屏障受損',
  ],
  sagging: [
    '你的皮膚比較像：「支撐力下降」',
    '✔ 皮膚變鬆、下垂',
    '✔ 法令紋或細紋明顯',
    '✔ 彈性變差',
    '不是老了，是結構在流失',
  ],
  dull: [
    '你的皮膚比較像：「代謝變慢」',
    '✔ 膚色暗沉、蠟黃',
    '✔ 有斑點或色素沉澱',
    '✔ 睡不好膚況明顯變差',
    '不是黑，是更新慢',
  ],
  aging: [
    '你的皮膚比較像：「整體模式改變」',
    '✔ 保養品吸收變差',
    '✔ 皮膚整體老化加快',
    '✔ 作息正常但仍變差',
    '不是年紀，是身體狀態改變',
  ],
};

const LEVEL_MAP = {
  moisture:  { lv: 'Lv1｜細胞保水層',   desc: '細胞保水能力下降讓皮膚容易乾燥，需要從細胞層面提升鎖水能力。' },
  oil:       { lv: 'Lv2｜發炎與皮脂層', desc: '皮脂分泌失衡源自內在發炎，需要調節發炎才能穩定油水平衡。' },
  sensitive: { lv: 'Lv2｜發炎與屏障層', desc: '皮膚屏障受損讓外在刺激容易穿透，導致持續發炎與敏感反應。' },
  sagging:   { lv: 'Lv4｜膠原結構層',   desc: '膠原蛋白與彈力蛋白流失導致鬆弛，需要從結構層面補充支撐。' },
  dull:      { lv: 'Lv1｜細胞代謝層',   desc: '細胞代謝變慢讓廢物堆積、色素沉澱，需要提升細胞更新速度。' },
  aging:     { lv: 'Lv1｜細胞修復層',   desc: '整體老化源自細胞修復能力下降，需要從根本提升細胞活力。' },
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
    { lv: 'Lv1｜細胞修復層（基底）',             desc: '皮膚能不能穩定變好，根本在細胞修復力，需要優先補足。' },
  ];

  const result = {
    headline: { primary: TYPE_LABEL[primaryKey], secondary: TYPE_LABEL[secondaryKey], isDualPrimary },
    scores,
    opening: [
      '我看了你的測試結果',
      '你的肌膚狀態偏向：「' + TYPE_LABEL[primaryKey] + '」',
      '並伴隨部分「' + TYPE_LABEL[secondaryKey] + '」的影響',
      '其實你的狀態，不是單純「皮膚不好」',
      '皮膚正在反映身體的狀態',
      '肌膚是「表現」，真正的原因，在身體裡',
    ],
    typeDesc: TYPE_DESC[primaryKey],
    situation: [
      '☀️ 白天：容易出油／乾／暗、膚況不穩',
      '🌙 晚上：修復效果差、保養感受有限',
      '📉 長期：膚況反覆，或持續變差',
      '這些其實都是身體在失衡',
    ],
    layers,
    coreIssue: [
      '你現在的問題不是保養不夠',
      '而是：身體沒有在「修復皮膚」',
      '不是你保養沒用，是身體還沒準備好吸收',
    ],
    adjustDirection: [
      '① 從「細胞抗氧化」開始 → 讓皮膚穩定＋變亮',
      '② 從「發炎或壓力調整」開始 → 讓皮膚不再反覆',
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
