# 抗老研究室｜技術交接文件
## Technical Handover Document · 開發者版

---

## 一、專案基本資訊

| 項目 | 內容 |
|------|------|
| 專案名稱 | 抗老研究室｜AI 健康問卷系統 |
| GitHub | https://github.com/Yaby-sung/nulife-survey |
| 線上網址 | https://nulife-survey.vercel.app |
| 部署平台 | Vercel（免費方案，自動偵測 GitHub 更新部署）|
| 技術棧 | 純 HTML / CSS / JS + Vercel Serverless Functions |
| 版本控制 | GitHub，主分支為 `main` |

---

## 二、檔案結構

```
nulife-survey/
├── index.html                    # 首頁（五份問卷入口）
├── sleep-survey.html             # 睡眠管理檢測
├── immune-survey.html            # 免疫力檢測
├── emotion-survey.html           # 情緒壓力檢測
├── body-survey.html              # 體態管理檢測
├── skin-survey.html              # 肌膚管理檢測
├── vercel.json                   # Vercel 路由設定
└── api/
    └── survey/
        ├── sleep.js              # 睡眠計分 API
        ├── immune.js             # 免疫計分 API
        ├── emotion.js            # 情緒計分 API
        ├── body.js               # 體態計分 API
        └── skin.js               # 肌膚計分 API
```

---

## 三、vercel.json 路由設定

```json
{
  "version": 2,
  "routes": [
    { "src": "/", "dest": "/index.html" },
    { "src": "/sleep-survey", "dest": "/sleep-survey.html" },
    { "src": "/immune-survey", "dest": "/immune-survey.html" },
    { "src": "/body-survey", "dest": "/body-survey.html" },
    { "src": "/skin-survey", "dest": "/skin-survey.html" },
    { "src": "/emotion-survey", "dest": "/emotion-survey.html" }
  ]
}
```

---

## 四、各問卷規格

### 4.1 睡眠管理檢測（sleep-survey.html）
- **題數**：15 題
- **分類**：3 類（各 5 題）
- **API**：`POST /api/survey/sleep`
- **組合數**：6 種
- **複製格式**：`我的睡眠屬於 主類型：XXX（XXX） 次類型：XXX（XXX）`（保留括號）

| 類型 | 題號 | Lv |
|------|------|----|
| 壓力型（神經） | Q1-Q5 | Lv3 |
| 發炎型（身體） | Q6-Q10 | Lv2 |
| 結構型（環境） | Q11-Q15 | Lv4 |

---

### 4.2 免疫力檢測（immune-survey.html）
- **題數**：15 題
- **分類**：3 類（各 5 題）
- **API**：`POST /api/survey/immune`
- **組合數**：6 種
- **複製格式**：`我的免疫屬於 主類型：XXX 次類型：XXX`（保留括號）
- **特殊**：類型名稱含 emoji（🟡 壓力型免疫（神經）/ 🔴 發炎型免疫（內在）/ 🟣 結構型免疫（循環））

| 類型 | 題號 | Lv |
|------|------|----|
| 🟡 壓力型免疫（神經） | Q1-Q5 | Lv3 |
| 🔴 發炎型免疫（內在） | Q6-Q10 | Lv2 |
| 🟣 結構型免疫（循環） | Q11-Q15 | Lv4 |

---

### 4.3 情緒壓力檢測（emotion-survey.html）
- **題數**：15 題
- **分類**：3 類（各 5 題）
- **API**：`POST /api/survey/emotion`
- **組合數**：6 種
- **複製格式**：`我的情緒屬於 主類型：XXX（XXX） 次類型：XXX（XXX）`（保留括號）

| 類型 | 題號 | Lv |
|------|------|----|
| 壓力型失衡（神經過載） | Q1-Q5 | Lv3 |
| 發炎型情緒（身體壓力） | Q6-Q10 | Lv2 |
| 結構耗損型（慢性壓力） | Q11-Q15 | Lv1+Lv4 |

---

### 4.4 體態管理檢測（body-survey.html）
- **題數**：30 題
- **分類**：6 類（各 5 題）
- **API**：`POST /api/survey/body`
- **組合數**：15 種（固定，見下方說明）
- **複製格式**：`我的體態屬於 主類型：XXX 次類型：XXX`（**去掉括號，固定15種**）

**⚠️ 重要：體態 15 種固定組合邏輯**
```
TYPE_ORDER = ['飲食型', '運動型', '壓力型', '胰島素型', '保命機制型', '基因表現型']
複製文字：index 小的類型永遠排在前面（不論實際主次）
畫面文案：仍依實際主次顯示（30 種角度）
```

固定 15 種組合：
```
飲食型 + 運動型
飲食型 + 壓力型
飲食型 + 胰島素型
飲食型 + 保命機制型
飲食型 + 基因表現型
運動型 + 壓力型
運動型 + 胰島素型
運動型 + 保命機制型
運動型 + 基因表現型
壓力型 + 胰島素型
壓力型 + 保命機制型
壓力型 + 基因表現型
胰島素型 + 保命機制型
胰島素型 + 基因表現型
保命機制型 + 基因表現型
```

| 類型 | 題號 | Lv |
|------|------|----|
| 飲食型（能量失衡） | Q1-Q5 | Lv5 |
| 運動型（代謝不足） | Q6-Q10 | Lv4 |
| 壓力型（荷爾蒙） | Q11-Q15 | Lv3 |
| 胰島素型（血糖波動） | Q16-Q20 | Lv2 |
| 保命機制型（節能模式） | Q21-Q25 | Lv1 |
| 基因表現型（代謝改變） | Q26-Q30 | Lv1 |

---

### 4.5 肌膚管理檢測（skin-survey.html）
- **題數**：30 題
- **分類**：6 類（各 5 題）
- **API**：`POST /api/survey/skin`
- **組合數**：15 種
- **複製格式**：`我的肌膚屬於 主類型：XXX 次類型：XXX`（**去掉括號**）
- **特殊**：Q2「上妝容易浮粉」為選填題（`data-optional="true"`），不計入必答驗證

| 類型 | 題號 | Lv |
|------|------|----|
| 水分流失型（乾燥） | Q1-Q5 | Lv1 |
| 油脂失衡型（出油） | Q6-Q10 | Lv2 |
| 敏感修復型（屏障） | Q11-Q15 | Lv2 |
| 鬆弛下垂型（結構） | Q16-Q20 | Lv4 |
| 暗沉斑點型（代謝） | Q21-Q25 | Lv1 |
| 基因老化型（整體） | Q26-Q30 | Lv1 |

---

## 五、API 回傳格式

所有問卷 API 回傳結構一致：

```json
{
  "headline": {
    "primary": "主類型名稱",
    "secondary": "次類型名稱",
    "isDualPrimary": false,
    "copyText": "（體態專用）固定15種複製文字"
  },
  "scores": {
    "groupA": 12,
    "groupB": 8,
    "groupC": 5
  },
  "opening": ["開場文案第1行", "第2行"],
  "typeDesc": ["主類型描述"],
  "situation": ["生活情境"],
  "layers": [
    { "lv": "Lv3｜神經層（主）", "desc": "說明文字" },
    { "lv": "Lv2｜發炎層（次）", "desc": "說明文字" },
    { "lv": "Lv1｜細胞修復層（基底）", "desc": "說明文字" }
  ],
  "coreIssue": ["關鍵核心文案"],
  "adjustDirection": ["調整方向"],
  "lineCallToAction": ["LINE 收口文案"]
}
```

---

## 六、前端共用設計規範

### 6.1 色彩變數（CSS Variables）
```css
--bg: #0a0e1a        /* 主背景 */
--bg3: #1a2236       /* 卡片內背景 */
--card: #151d2e      /* 卡片背景 */
--border: #1e2d45    /* 邊框 */
--accent: #7eb8f7    /* 藍色強調 */
--accent2: #a78bfa   /* 紫色強調 */
--gold: #e2b96f      /* 金色（主色）*/
--text: #e8edf5      /* 主文字 */
--text2: #8a9bbf     /* 次文字 */
--text3: #4a5a7a     /* 說明文字 */
```

### 6.2 外部套件
```html
<!-- 字體 -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600&family=Noto+Sans+TC:wght@300;400;500&display=swap">

<!-- 雷達圖 -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js">

<!-- 截圖下載 -->
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js">
```

### 6.3 結果頁面結構順序
```
1. 主次類型標題（.type-hero）
2. 金色雷達圖（.radar-wrap）
3. 你的狀態（r-opening）
4. 你目前的狀況（r-type-desc）
5. 你可能會有的情況（r-situation）
6. 影響你的三個層面（r-layers）
7. 關鍵核心（r-core）
8. 調整方向（r-adjust）
9. 想了解更多？黑金框（.line-cta）
   ├── 主次類型大字顯示
   ├── LINE 收口文案
   ├── 📋 複製分析結果 回傳到抗老研究室（金色實心按鈕）
   └── ↓ 報告下載（金色橢圓細框按鈕）
```

---

## 七、常見修改位置

| 想改的內容 | 檔案 | 搜尋關鍵字 |
|-----------|------|-----------|
| 問卷題目 | `xxx-survey.html` | `q-text` |
| 複製按鈕文字 | `xxx-survey.html` | `複製分析結果` |
| 下載按鈕文字 | `xxx-survey.html` | `報告下載` |
| 分析結果文案 | `api/survey/xxx.js` | `TYPE_DESC` |
| 類型名稱 | `api/survey/xxx.js` | `TYPE_LABEL` |
| 層級說明 | `api/survey/xxx.js` | `LEVEL_MAP` |
| 雷達圖顏色 | `xxx-survey.html` | `rgba(226,185,111` |
| 雷達圖標籤 | `xxx-survey.html` | `RADAR_LABELS` |
| 計分分組 | `api/survey/xxx.js` | `GROUPS` |
| 複製前綴文字 | `xxx-survey.html` | `我的XXX屬於` |

---

## 八、已完成功能清單

- [x] 五份問卷前端（HTML）
- [x] 五份問卷後端 API（Vercel Serverless）
- [x] 動態雷達圖（Chart.js，金色，展開動畫）
- [x] 主次類型大字顯示
- [x] 分析結果七區塊文案
- [x] 📋 複製結果按鈕（iOS 原生分享選單）
- [x] ↓ 報告下載（html2canvas 截圖，iOS 原生分享含儲存影像）
- [x] 分享問卷連結功能
- [x] 體態 15 種固定組合複製邏輯
- [x] 肌膚 Q2 選填題設定
- [x] Email 欄位已移除
- [x] 手機響應式設計

## 九、待辦 / 預留功能

- [ ] Email 寄送報告（Resend API，已預留位置）
- [ ] 資料庫儲存回答記錄（Supabase，已預留位置）
- [ ] 問卷結果分享連結（帶參數的永久連結）

---

## 十、部署流程

```
修改檔案
  → 上傳到 GitHub（覆蓋舊檔案）
  → Vercel 自動偵測更新
  → 約 30-60 秒完成部署
  → 瀏覽器強制重整（Cmd+Shift+R）確認更新
```

---

*文件版本：v1.0 · 2026年4月*  
*抗老研究室｜讓生命，不只是變老，而是持續綻放*
