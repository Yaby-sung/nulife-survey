// ============================================================
// 抗老研究室｜肌膚管理檢測（v2）
// Vercel Serverless Function: /api/survey/skin.js
// 計分邏輯已抽至 lib/surveys/skin.js，此檔僅負責 HTTP handler。
// ============================================================

const { calculateSkinResult } = require('../../lib/surveys/skin');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { answers, email } = req.body;

  const result = calculateSkinResult(answers);

  return res.status(200).json(result);
};
