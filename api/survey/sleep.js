// ============================================================
// 抗老研究室｜睡眠快速評估問卷（v2）
// Vercel Serverless Function: /api/survey/sleep.js
// 計分邏輯已抽至 lib/surveys/sleep.js，此檔僅負責 HTTP handler。
// ============================================================

const { calculateSleepResult } = require('../../lib/surveys/sleep');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { answers, email } = req.body;

  const result = calculateSleepResult(answers);

  return res.status(200).json(result);
};
