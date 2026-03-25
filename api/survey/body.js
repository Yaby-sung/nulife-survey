// ============================================================
// 抗老研究室｜體態管理檢測
// Vercel Serverless Function: /api/survey/body.js
// ============================================================

const GROUPS = {
  diet:     { questions: [1, 2, 3, 4],           max: 12 }, // 飲食熱量型
  exercise: { questions: [5, 6, 7, 8],           max: 12 }, // 運動不足型
  stress:   { questions: [9, 10, 11, 12],        max: 12 }, // 壓力型
  insulin:  { questions: [13, 14, 15, 16],       max: 12 }, // 胰島素型
  survival: { questions: [17, 18, 19, 20, 21],   max: 15 }, // 保命機制型
  gene:     { questions: [22, 23, 24, 25],       max: 12 }, // 基因表現型
};

function getIntensity(score, max) {
  const ratio = score / max;
  if (ratio < 0.33) return "低影響";
  if (ratio < 0.67) return "中影響";
  return "高影響";
}

const TYPE_LABEL = {
  diet:     "飲食熱量型",
  exercise: "運動不足型",
  stress:   "壓力型肥胖",
  insulin:  "胰島素型",
  survival: "保命機制型",
  gene:     "基因表現型",
};

const TRIGGER_MOMENTS = {
  diet:     ["吃多了體重就上去", "偏好重口味、外食比例高", "蔬菜攝取不足、飲食結構不均衡"],
  exercise: ["稍微活動就喘", "身體偏軟、缺乏肌肉感", "久坐久站、日常活動量低"],
  stress:   ["壓力大就想吃東西", "情緒會直接影響飲食", "睡不好或容易焦慮"],
  insulin:  ["吃完容易想睡", "很快又餓、血糖起伏大", "腹部脂肪特別明顯、很難瘦肚子"],
  survival: ["吃很少但體重不動", "一吃多就很容易胖回來", "代謝慢、手腳冰冷"],
  gene:     ["以前不容易胖，現在變容易", "體重增加集中在腹部", "運動或飲食效果不如以前"],
};

const COPY = {
  overallStatus: [
    "體重是結果",
    "真正的關鍵是「代謝狀態」",
  ],
  recoveryAbility: [
    "不是你不努力",
    "是身體在「鎖住脂肪」",
    "代謝回不來，再努力也很難突破",
  ],
  coreIssue: [
    "你現在的問題不是減肥",
    "是「代謝系統失衡」",
    "不是你不努力，是身體在「鎖住脂肪」",
  ],
  layers: [
    { title: "細胞修復層（能量）",   description: "細胞能量不足，代謝自然下降" },
    { title: "發炎與血糖層",         description: "慢性發炎與血糖不穩會鎖住脂肪" },
    { title: "壓力與荷爾蒙層",       description: "壓力荷爾蒙直接影響脂肪囤積" },
    { title: "肌肉與代謝層",         description: "肌肉量決定基礎代謝率" },
    { title: "生活習慣層",           description: "作息、飲食、壓力節奏" },
  ],
  brandClosing: [
    "體態不是靠意志力撐",
    "是讓代謝回到正常節奏",
    "當身體穩定了，體態自然會跟著改變",
  ],
  lineCallToAction: [
    "如果你看到這裡，其實你已經知道",
    "你不是單純胖",
    "我可以幫你整理一個「比較適合你的調整順序」",
    "直接把結果複製傳LINE給我就好",
  ],
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { answers, email } = req.body;

  // 各組加總
  const scores = {};
  for (const [group, { questions }] of Object.entries(GROUPS)) {
    scores[group] = questions.reduce((sum, q) => sum + (answers[q] ?? 0), 0);
  }

  // 排序找主次類型
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [primaryKey, primaryScore]     = sorted[0];
  const [secondaryKey, secondaryScore] = sorted[1];

  // 強度
  const intensity = {};
  for (const [k, { max }] of Object.entries(GROUPS)) {
    intensity[k] = getIntensity(scores[k], max);
  }

  const result = {
    headline: {
      primary:   TYPE_LABEL[primaryKey],
      secondary: TYPE_LABEL[secondaryKey],
      template:  `你的體態狀況偏向：「${TYPE_LABEL[primaryKey]}」，並伴隨 ${TYPE_LABEL[secondaryKey]} 的影響`,
    },
    scores,
    intensity,
    overallStatus:   COPY.overallStatus,
    lifeSituation: {
      dailyState:      ["體重不太好控制", "吃多或吃少都會影響"],
      triggerMoments:  TRIGGER_MOMENTS[primaryKey],
      recoveryAbility: COPY.recoveryAbility,
    },
    coreIssue:        COPY.coreIssue,
    layers:           COPY.layers,
    brandClosing:     COPY.brandClosing,
    lineCallToAction: COPY.lineCallToAction,
  };

  // await sendEmail(email, result);
  // await saveResult({ email, scores, primaryKey, secondaryKey });

  return res.status(200).json(result);
};
