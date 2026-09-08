// ============================================================
// 抗老研究室｜免疫快速評估問卷（v2）
// Vercel Serverless Function: /api/survey/immune.js
// 計分邏輯已抽至 lib/surveys/immune.js，此檔僅負責 HTTP handler。
// ============================================================

const { calculateImmuneResult } = require('../../lib/surveys/immune');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { answers, email } = req.body;

  const result = calculateImmuneResult(answers);

  return res.status(200).json(result);
};
