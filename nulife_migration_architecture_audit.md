# 抗老研究室問卷系統｜技術架構盤點（遷移前現況分析）

> 本文件為**唯讀分析**，盤點過程中未修改任何程式碼、未執行 commit / push / 部署。
> 盤點對象：`C:\Users\mengyu\Documents\Claude\Projects\nulife-survey-main`（本機資料夹，已與 GitHub 連動）

---

## 一、逐項盤點結果

### 1. 使用什麼前端框架與版本
**沒有使用任何前端框架。** 五份問卷（`index.html` / `sleep-survey.html` / `immune-survey.html` / `emotion-survey.html` / `body-survey.html` / `skin-survey.html`）都是純手寫的靜態 HTML + CSS + Vanilla JavaScript，單檔案內嵌所有邏輯，沒有元件化、沒有建置流程。

### 2. 是否使用 Next.js / React / Vite 或其他框架
**沒有。** 專案內沒有 `package.json`、沒有 `node_modules`、沒有任何 `.config.*`（`next.config` / `vite.config` / `tsconfig` 等皆不存在）。唯二用到的外部套件都是直接用 `<script src="...">` 掛 CDN：
- `Chart.js 4.4.0`（雷達圖）
- `html2canvas 1.4.1`（結果頁截圖下載）
- Google Fonts（Noto Serif TC / Noto Sans TC）

### 3. 現在是否有後端 API
**有。** 是 Vercel Serverless Functions（Node.js，CommonJS `module.exports`），共 5 支，路徑在 `api/survey/` 下：
`sleep.js`、`immune.js`、`emotion.js`、`skin.js`、`body.js`。前端用 `fetch('/api/survey/xxx', { method: 'POST', body: {...} })` 呼叫，API 純粹做「收答案 → 計分 → 回傳 JSON 文案」，**沒有連接任何外部服務**。

⚠️ 另外發現根目錄有一支 `api_survey_emotion.js`，內容是 `api/survey/emotion.js` 的**舊版本**（文案、分組寫法都不同），因為它不在 `/api/` 資料夾內，Vercel 不會把它部署成 API 路由，是一支**沒有作用的孤兒檔案**，遷移時建議清掉以免造成混淆。

### 4. 是否使用 Supabase 或其他資料庫
**目前完全沒有連接任何資料庫。** 全域搜尋 `supabase` / `postgres` / `mongodb` / `firebase` / `airtable` 等關鍵字，只有在 `nulife_technical_handover.md` 的「待辦清單」裡出現一行：
> `[ ] 資料庫儲存回答記錄（Supabase，已預留位置）`

也就是說 Supabase 只是**文件裡寫的未來規劃**，程式碼裡完全沒有 Supabase client、沒有 connection string、沒有任何資料庫相關的 import 或呼叫。

### 5. 是否已連接 GitHub，以及目前 git remote 指向哪裡
**已連接。**
```
origin  https://github.com/Yaby-sung/nulife-survey-main.git
分支：master，追蹤 origin/master，工作目錄乾淨（無落後/超前）
```
比較值得注意的是：本機 git log 只有 **1 個 commit**（`9532011 抗老研究室問卷：依第四版 Notion 文案更新 5 份問卷題目與作答選項`），代表這份本機資料夾的歷史紀錄非常淺（可能是重新匯出或壓縮過的版本），不是完整開發歷程。

### 6. 是否有 Vercel 設定
**有基本設定，但很簡單。** `vercel.json` 只定義了 5 條路由，把乾淨網址（如 `/sleep-survey`）對應到對應的 `.html` 檔：
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
沒有設定 `functions`（Node runtime 版本）、沒有 `env` 區塊、沒有 build command——因為根本沒有建置步驟，Vercel 直接把靜態檔案跟 `/api` 資料夾原樣部署。

### 7. `.env` / `.env.local` 需要哪些環境變數
**目前專案完全沒有 `.env` 或 `.env.local` 檔案，程式碼裡也沒有任何 `process.env.xxx` 的呼叫** —— 也就是說現在系統一個環境變數都不需要。
`.gitignore` 裡雖然已經預先排除了 `.env` / `.env.local`（代表開發者有預留未來要用），但目前完全沒有使用到。

### 8. 現在測驗結果是怎麼計算的
五支 API 邏輯完全一致（詳細對照表我上次已經整理成 `nulife_survey_scoring_logic.md` 放在同資料夾）：
1. 每題答案對應到一個「分組」（每組固定 5 題），組內加總，滿分 15
2. 各組分數排序，最高分＝主類型，第二高＝次類型
3. 主次分差 < 3 分 → 標記「雙主型」
4. 固定附加一層「Lv1 細胞修復層」做為所有結果共通的收斂結論
5. 體態問卷（`body.js`）額外有一套「固定 15 種組合」的複製文字正規化邏輯，跟畫面顯示的主次類型是分開算的

全部計算都在 **API 端（伺服器）當場算完直接回傳**，沒有任何非同步或背景運算。

### 9. 使用者完成測驗後，有沒有把結果存到任何地方
**沒有，完全沒有持久化。**
- API 回傳的 JSON 只存在瀏覽器記憶體中（`window._bodyData` 這類變數），重新整理就消失
- 沒有使用 `localStorage` / `sessionStorage` / Cookie
- API 雖然會從 `req.body` 解構出 `email` 欄位，但**完全沒有使用它**（沒寫入任何地方）——而且 `nulife_technical_handover.md` 的「已完成清單」也寫著「Email 欄位已移除」，代表前端目前根本不會送 email 過去，這是段死代碼
- 使用者唯一能把結果帶走的方式，是手動按「複製分析結果」（存到剪貼簿丟 LINE）或「報告下載」（html2canvas 截圖存成圖片）——兩者都是**使用者端動作**，不會回傳到任何伺服器或資料庫

### 10. 目前網站的部署方式
純手動、無 CI/CD 檢查的部署流程（依 `nulife_technical_handover.md` 所述）：
```
本機修改檔案 → git push 到 GitHub → Vercel 偵測到 origin 更新 → 自動建置部署（約 30–60 秒）→ 人工強制重整瀏覽器確認
```
沒有測試、沒有 staging 環境、沒有部署前檢查，push 到 master 就會直接影響正式站（`https://nulife-survey.vercel.app`）。

---

## 二、目前架構總覽

```
使用者瀏覽器
   │
   │  GET /sleep-survey 等（靜態 HTML，Vercel 依 vercel.json 路由）
   ▼
Vercel（靜態託管 + Serverless Functions，同一個專案）
   ├── 靜態檔案：index.html / *-survey.html（純 HTML+CSS+JS，內嵌 Chart.js／html2canvas CDN）
   └── /api/survey/*.js（Node.js Serverless Function，無框架、無資料庫連線）
             │  POST 答案 → 計分 → 回傳 JSON 文案
             ▼
        （結果只回到瀏覽器記憶體，不落地）

GitHub repo: Yaby-sung/nulife-survey-main（master）→ Vercel 自動部署
資料庫：無
環境變數：無
使用者資料留存：無
```

一句話總結：這是一個**沒有框架、沒有資料庫、沒有使用者資料留存**的純靜態網站＋輕量 Serverless API，計分即時算即時回傳，用完即丟。技術上非常單純，但也代表「完全沒有累積任何使用者測驗資料」。

---

## 三、遷移到「抗老研究室」正式 GitHub + Vercel + Supabase 的建議

以下純粹是**規劃建議**，尚未執行任何動作。

### 3.1 GitHub 遷移
- 把現有 repo（`Yaby-sung/nulife-survey-main`）transfer 或重新 push 到抗老研究室正式帳號下的新 repo，並在正式 repo 建立完整、有意義的 commit 歷史（目前只有 1 個 commit，等於沒有可回溯的開發紀錄，建議遷移時把裡程碑寫清楚）
- 清掉孤兒檔案 `api_survey_emotion.js`（未被使用，內容又是舊版，留著容易誤改）
- 順手處理目前工作目錄裡還沒 commit 的異動：`body-survey.html`（我們上次一起做的「只顯示主類型」修改）和新增的 `nulife_survey_scoring_logic.md`，遷移前建議先決定要不要帶過去

### 3.2 Vercel 專案設定
- 用抗老研究室的正式 Vercel 團隊/帳號重新建立專案並連接新 repo（而不是延用個人帳號的舊專案），避免正式站掛在私人帳號下
- 建議補上 `vercel.json` 的 `functions` 區塊明確指定 Node runtime 版本（目前完全沒指定，是跟著 Vercel 平台預設值走，未來平台預設版本改變時可能悄悄影響行為）
- 導入 Supabase／未來若要串 Email（Resend，文件裡也提到已預留）後，需要在 Vercel 專案的 Environment Variables 設定對應變數（見下方 3.3）

### 3.3 導入 Supabase（目前完全空白，需要從 0 規劃）
最小需要新增的環境變數（僅列名稱）：
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY   # 在 API（伺服器端）寫入資料用，不可暴露在前端
SUPABASE_ANON_KEY           # 若未來有前端直接讀取資料的需求才需要
```
建議的最小資料表設計方向（規劃層級，非最終 schema）：
- `survey_responses`：紀錄每次測驗——問卷類型、原始答案(JSON)、算出的主/次類型、分數、`isDualPrimary`、送出時間、（若之後要收）email／LINE 識別
- API 端（`api/survey/*.js`）在算完分數、回傳給前端「之前」或「之後」多一步 `insert` 到 Supabase，這是目前完全沒有的邏輯，需要新寫
- 因為現在 5 支 API 的計分邏輯幾乎一模一樣，建議遷移時順便把共用邏輯（分組加總、排序主次、雙主型判定）抽成共用函式，5 份問卷各自只保留文案設定，這樣之後要接資料庫寫入邏輯也只需要寫一次

### 3.4 其他遷移前該留意的狀態
- 目前 API 會解構 `email` 欄位但完全沒使用，是死代碼；若未來要收 email 存進 Supabase，這段需要重新設計（現在前端也沒有 email 輸入欄位了）
- 本機資料夾搬移到 Windows 環境後，一開始有殘留的 `.git/index.lock` 卡住 git 操作，先前已清除過一次，但盤點時又偵測到它再次出現——遷移／commit 前建議確認電腦上是否有其他 Git 工具（例如 GitHub Desktop、VS Code 的 Git 面板）正在對這個資料夾動作，避免多個程式同時搶 git 鎖
- 目前完全沒有測試、沒有 staging 環境；遷移到正式管理架構時，建議至少加一個「先部署到 preview URL 確認、再合併到 master」的習慣（Vercel 對每個 PR 都會自動生成 preview 網址，目前的單分支直接 push 流程沒有用到這個功能）

---

*（本文件僅為分析與建議，未對程式碼或部署狀態做任何變更。）*
