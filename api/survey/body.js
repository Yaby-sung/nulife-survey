// ============================================================
// 抗老研究室｜體態管理檢測（v3）
// Vercel Serverless Function: /api/survey/body.js
// 計分邏輯已抽至 lib/surveys/body.js，此檔僅負責 HTTP handler。
// ============================================================

const { calculateBodyResult } = require('../../lib/surveys/body');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { answers, email } = req.body;

  const result = calculateBodyResult(answers);

  return res.status(200).json(result);
};
