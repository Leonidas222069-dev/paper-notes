# 探究筆記｜論文閱讀筆記站

潘聖融（宜蘭大學人工智慧碩士學位學程碩一，學號 r1545005）的個人論文閱讀筆記站。建議的 GitHub Repository 名稱：`paper-notes`。

論文主題圍繞**台灣—馬來西亞線上教學**、**Community of Inquiry（探究社群）**與**社會臨場感**。本站採「一篇論文、一則固定格式筆記」的寫法，並以 [`AGENTS.md`](AGENTS.md) 把規則寫清楚，讓之後的自己或 AI 都能依同一套方式繼續新增頁面。

這不是一次性做出來的單一網頁，而是一套可重複使用的內容規格：新的文獻只要依範本寫 Markdown、更新目錄，首頁與筆記頁就會跟著出現。

## 網站裡有什麼

目前有四則種子筆記，都是 CoI 領域的經典文獻：

- Garrison, Anderson, and Archer (2000)：提出 CoI 三元架構
- Rourke, Anderson, Garrison, and Archer (1999)：社會臨場感的內容分析模板
- Garrison and Arbaugh (2007)：研究回顧與未來方向
- Arbaugh 等 (2008)：34 題 CoI 量表的多校檢驗

書目（作者、年份、期刊、卷期頁碼、DOI）已盡力以 Crossref、期刊頁或 ERIC 核對。沒有 DOI 或年份有資料庫分歧的，會寫在該則筆記的「書目說明」。

## 如何預覽

本專案是純靜態網站，沒有建置步驟。請在專案根目錄啟動本機伺服器（不要用瀏覽器直接開 `file://`，否則無法載入筆記）：

```bash
python3 -m http.server 8000
```

然後在瀏覽器打開 [http://127.0.0.1:8000/](http://127.0.0.1:8000/)。

之後會把完整專案上傳到 GitHub，並開啟 GitHub Pages（來源：`main` 分支根目錄）。公開後的網址請補在這裡：

- GitHub Repository：（待補）
- 網頁：待補，預設會是 `https://<帳號>.github.io/paper-notes/`

## 如何新增一則筆記

完整規則、檔名、必填欄位與檢查清單，請看 [`AGENTS.md`](AGENTS.md)。若你使用 Claude，也可以先讀短入口 [`CLAUDE.md`](CLAUDE.md)，它會指向同一份規則。

最簡流程：

1. 先核對書目（DOI / Crossref / 期刊頁），不要臆造 DOI 或引句。
2. 複製 [`templates/note-template.md`](templates/note-template.md) 為 `notes/YYYY-firstauthor-keyword.md`。
3. 依範本填 front matter，並以繁體中文寫齊七個必備章節。
4. 在 [`data/index.json`](data/index.json) 新增對應項目（年份由新到舊排序）。
5. 用上面的本機伺服器檢查首頁卡片與筆記頁。
6. 走完 `AGENTS.md` 第 9 節清單再提交。

給 AI 時可以這樣說：

> 這是一篇論文的 PDF／DOI：……請完整閱讀 AGENTS.md，依模板新增筆記並更新 `data/index.json`。書目請先核對，不要捏造 DOI 或引句。

## 技術說明

- 純 HTML / CSS / JS，筆記以 Markdown 存放，瀏覽器端用內建的 `js/marked.min.js` 渲染。
- 首頁只讀 `data/index.json`，不會自動掃描資料夾，所以新增 `.md` 後一定要改目錄。
- 所有資源使用相對路徑，可同時在本機伺服器與 GitHub Pages 專案網站下運作。
- 已放置 `.nojekyll`，避免 GitHub Pages 以 Jekyll 處理而漏檔。

## 授權

筆記為個人閱讀整理，僅供課程作業與自身研究使用。引用文獻時請回原論文，不要把本站轉述當成原文。
