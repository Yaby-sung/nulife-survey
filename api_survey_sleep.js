// ============================================================
// 抗老研究室｜睡眠快速評估問卷
// Vercel Serverless Function: /api/survey/sleep.js
// ============================================================

// ── 題組定義 ─────────────────────────────────────────────────
const GROUPS = {
  stress:       { questions: [1, 2, 3, 4], max: 12 },  // 壓力／神經
  inflammation: { questions: [5, 6, 7],    max: 9  },  // 發炎／修復
  structure:    { questions: [8, 9, 10],   max: 9  },  // 結構／環境
};

// ── 觸發時刻（依主類型動態切換）────────────────────────────────
const TRIGGER_MOMENTS = {
  stress: [
    "躺下後腦袋停不下來",
    "越累反而越難睡",
    "半夜容易醒來",
  ],
  inflammation: [
    "身體有悶、緊、卡的感覺",
    "容易翻身、淺眠",
    "睡醒還是累",
  ],
  structure: [
    "怎麼躺都不太對",
    "枕頭或姿勢很影響睡眠",
    "肩頸或背部會干擾睡眠",
  ],
};

// ── 類型標籤 ─────────────────────────────────────────────────
const TYPE_LABEL = {
  stress:       "壓力／神經型",
  inflammation: "發炎／修復型",
  structure:    "結構／環境型",
};

// ── 完整結果文案（固定段落）──────────────────────────────────
const COPY = {
  // 🟡 整體狀態
  overallStatus: [
    "你的睡眠問題，不是單純「睡不好」",
    "比較像是：身體還在運作，但沒有真正進入修復狀態",
  ],

  // 🟠 平常狀態（固定）
  dailyState: [
    "白天容易疲累",
    "精神狀態不穩定",
    "有時覺得怎麼休息都不太夠",
  ],

  // 🟠 恢復能力（固定）
  recoveryAbility: [
    "睡了但沒有恢復感",
    "精神無法真正回來",
    "身體修復效率下降",
  ],

  // 🔥 核心問題
  coreIssue: [
    "你的問題不是「睡眠時間不夠」",
    "而是：身體沒有進入真正修復的能力",
    "很多人會以為是失眠，但其實是身體還沒準備好「關機」",
  ],

  // 🧬 結構說明
  layers: [
    {
      title: "神經層（關鍵）",
      description: "身體還處在緊繃狀態，無法切換到放鬆模式",
    },
    {
      title: "發炎層",
      description: "長期壓力或疲勞，會影響睡眠深度",
    },
    {
      title: "細胞修復層",
      description: "修復能力不足，導致「睡了也補不回來」",
    },
  ],

  // 🌙 品牌結語
  brandClosing: [
    "睡眠不是讓你休息",
    "是讓身體「修復」",
    "當身體回到穩定節奏，睡眠自然會改善",
  ],

  // 📲 LINE 收口
  lineCallToAction: [
    "如果你看到這裡，其實你已經知道",
    "睡眠問題通常不是單一原因",
    "我可以幫你看你的狀況，幫你整理一個「比較適合你的調整方式」",
    "直接把結果截圖傳給我就好",
  ],
};

// ── 主函式 ────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { answers, email } = req.body;
  // answers 格式：{ "1": 2, "2": 1, ..., "10": 3 }
  // 每題值為 0（幾乎沒有）～ 3（幾乎每天）

  // ── 1. 各組加總 ──
  const scores = {};
  for (const [group, { questions }] of Object.entries(GROUPS)) {
    scores[group] = questions.reduce((sum, q) => sum + (answers[q] ?? 0), 0);
  }

  // ── 2. 排序找主類型 & 次類型 ──
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [primaryKey, primaryScore]    = sorted[0];
  const [secondaryKey, secondaryScore] = sorted[1];

  // ── 3. 組成完整結果物件 ──
  const result = {
    // 🟢 主結果
    headline: {
      primary:   TYPE_LABEL[primaryKey],
      secondary: TYPE_LABEL[secondaryKey],
      template:  `你的睡眠狀態偏向：「${TYPE_LABEL[primaryKey]}」，並伴隨部分 ${TYPE_LABEL[secondaryKey]} 的影響`,
    },

    // 分數（可顯示或隱藏）
    scores: {
      stress:       scores.stress,
      inflammation: scores.inflammation,
      structure:    scores.structure,
    },

    // 🟡 整體狀態
    overallStatus: COPY.overallStatus,

    // 🟠 生活情境
    lifeSituation: {
      dailyState:      COPY.dailyState,
      triggerMoments:  TRIGGER_MOMENTS[primaryKey],   // ← 依主類型動態切換
      recoveryAbility: COPY.recoveryAbility,
    },

    // 🔥 核心問題
    coreIssue: COPY.coreIssue,

    // 🧬 結構說明
    layers: COPY.layers,

    // 🌙 品牌結語
    brandClosing: COPY.brandClosing,

    // 📲 LINE 收口
    lineCallToAction: COPY.lineCallToAction,
  };

  // ── 4. Email 寄送（之後接 Resend）──
  // if (email) await sendEmail(email, result);

  // ── 5. 儲存資料庫（之後接 Supabase）──
  // await saveResult({ email, scores, primaryKey, secondaryKey });

  return res.status(200).json(result);
}
