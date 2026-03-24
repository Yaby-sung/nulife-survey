// ============================================================
// 抗老研究室｜免疫快速評估問卷
// Vercel Serverless Function: /api/survey/immune.js
// ============================================================

// ── 題組定義 ─────────────────────────────────────────────────
const GROUPS = {
  stress:       { questions: [1, 2, 3], max: 9 },  // 壓力型／自律神經型
  inflammation: { questions: [4, 5, 6], max: 9 },  // 發炎型／免疫失衡型
  structure:    { questions: [7, 8, 9], max: 9 },  // 結構／循環型
};

// ── 強度判斷（可用於進階顯示）────────────────────────────────
function getIntensity(score) {
  if (score <= 3) return "輕度";
  if (score <= 6) return "中度";
  return "明顯影響";
}

// ── 類型標籤 ─────────────────────────────────────────────────
const TYPE_LABEL = {
  stress:       "壓力型（自律神經型）",
  inflammation: "發炎型（免疫失衡型）",
  structure:    "結構／循環型（修復慢型）",
};

// ── 觸發時刻（依主類型動態切換）────────────────────────────────
const TRIGGER_MOMENTS = {
  stress: [
    "一忙或壓力大就容易不舒服",
    "熬夜或疲勞後身體狀況變差",
    "情緒緊繃時容易出現小病症",
  ],
  inflammation: [
    "換季容易過敏",
    "吃某些東西身體會有反應",
    "皮膚或身體容易反覆不適",
  ],
  structure: [
    "天氣變化時容易不舒服",
    "手腳冰冷時身體狀態較差",
    "久坐或循環差時更容易出問題",
  ],
};

// ── 生活對應標籤（系統內部用，可顯示於後台）──────────────────
const LIFE_CONTEXT = {
  stress:       ["一累就生病", "壓力一來身體就出問題"],
  inflammation: ["換季就過敏", "吃錯東西就不舒服"],
  structure:    ["感冒拖很久", "身體回復速度變慢"],
};

// ── 完整結果文案（固定段落）──────────────────────────────────
const COPY = {
  // 🟡 整體狀態
  overallStatus: [
    "你的免疫問題，不是單純「容易生病」",
    "比較像是：身體在不同情況下，穩定與恢復能力不一致",
  ],

  // 🟠 平常狀態（固定）
  dailyState: [
    "身體偶爾會有些小不適",
    "精神或體力起伏比較明顯",
    "有時覺得狀態沒有在最佳狀態",
  ],

  // 🟠 恢復能力（固定）
  recoveryAbility: [
    "感冒或不適時恢復較慢",
    "小問題容易拖比較久",
    "身體回復速度不如以往",
  ],

  // 🔥 核心問題
  coreIssue: [
    "你的問題不是「免疫力不夠」",
    "而是：身體缺乏穩定與修復的能力",
    "免疫不是單純變強，而是要維持「平衡與調節」",
  ],

  // 🧬 結構說明（五層）
  layers: [
    {
      title: "細胞修復層（基底）",
      description: "免疫來自細胞的修復能力",
    },
    {
      title: "發炎與循環層",
      description: "發炎會消耗免疫，循環影響修復效率",
    },
    {
      title: "自律神經層",
      description: "壓力會影響免疫穩定",
    },
    {
      title: "腸道吸收層",
      description: "腸道是免疫的重要基礎，70%免疫來自腸道",
    },
    {
      title: "生活習慣層",
      description: "作息、飲食、壓力節奏",
    },
  ],

  // 🌿 品牌結語
  brandClosing: [
    "免疫不是讓你不生病",
    "而是讓身體能夠「穩定運作與恢復」",
    "當身體回到平衡狀態，免疫自然會變穩定",
  ],

  // 📲 LINE 收口
  lineCallToAction: [
    "如果你看到這裡，其實你已經知道",
    "免疫問題通常不是單一原因",
    "我可以幫你看你的狀況，幫你整理一個「比較適合你的調整順序」",
    "直接把結果截圖傳給我就好",
  ],
};

// ── 主函式 ────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { answers, email } = req.body;
  // answers 格式：{ "1": 2, "2": 1, ..., "9": 3 }
  // 每題值為 0（幾乎沒有）～ 3（幾乎每天）

  // ── 1. 各組加總 ──
  const scores = {};
  for (const [group, { questions }] of Object.entries(GROUPS)) {
    scores[group] = questions.reduce((sum, q) => sum + (answers[q] ?? 0), 0);
  }

  // ── 2. 排序找主類型 & 次類型 ──
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [primaryKey, primaryScore]     = sorted[0];
  const [secondaryKey, secondaryScore] = sorted[1];

  // ── 3. 強度判斷 ──
  const intensity = {
    stress:       getIntensity(scores.stress),
    inflammation: getIntensity(scores.inflammation),
    structure:    getIntensity(scores.structure),
  };

  // ── 4. 組成完整結果物件 ──
  const result = {
    // 🟢 主結果
    headline: {
      primary:   TYPE_LABEL[primaryKey],
      secondary: TYPE_LABEL[secondaryKey],
      template:  `你的免疫狀態偏向：「${TYPE_LABEL[primaryKey]}」，並伴隨部分 ${TYPE_LABEL[secondaryKey]} 的影響`,
    },

    // 分數 + 強度
    scores: {
      stress:       { score: scores.stress,       intensity: intensity.stress },
      inflammation: { score: scores.inflammation, intensity: intensity.inflammation },
      structure:    { score: scores.structure,    intensity: intensity.structure },
    },

    // 生活對應標籤（可顯示於結果頁輔助說明）
    lifeContext: {
      primary:   LIFE_CONTEXT[primaryKey],
      secondary: LIFE_CONTEXT[secondaryKey],
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

    // 🌿 品牌結語
    brandClosing: COPY.brandClosing,

    // 📲 LINE 收口
    lineCallToAction: COPY.lineCallToAction,
  };

  // ── 5. Email 寄送（之後接 Resend）──
  // if (email) await sendEmail(email, result);

  // ── 6. 儲存資料庫（之後接 Supabase）──
  // await saveResult({ email, scores, primaryKey, secondaryKey });

  return res.status(200).json(result);
}
