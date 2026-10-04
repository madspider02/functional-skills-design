# functional-skills-design

學習功能嚴重缺損學生：能力排序與教學設計

此專案包含兩個 GitHub Pages 前端頁面：

- `index.html`：學生填寫真實姓名、排序六項能力、針對第一順位能力撰寫教學主題與內容。
- `gallery.html`：匿名共學牆，顯示全班六項能力的平均排序與匿名教學想法。

## Apps Script

目前前端已設定為：

`https://script.google.com/macros/s/AKfycbyS6YYMQM1y8FAWYfzRhBju0gYZOhTDXovNCVbfldS9fmMw-KbwD-d4mjMtsgO_Br3U/exec`

請確認 Apps Script Web App：

1. 執行身分：我
2. 存取權限：任何人
3. `responses` Sheet 欄位與 Code.gs 一致

## GitHub Pages

將以下檔案放在 repository 根目錄：

- index.html
- gallery.html
- styles.css
- app.js
- gallery.js

在 Settings → Pages 選擇 `main` branch 與 `/ (root)`。

## 隱私設計

學生姓名僅透過 POST 寫入 Google Sheet。`gallery.html` 使用的 `?action=gallery` API 不應回傳姓名，因此公開頁面與瀏覽器開發者工具都不會取得學生姓名。


## 建議 Repository 名稱

`functional-skills-design`
