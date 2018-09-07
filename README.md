# Espack Example

展示混合一般靜態頁開發與使用 react 製作的 SPA 頁面的設定方式，還有展示如何設定 proxy 將 API 或外部網站代理進開發環境，還有抽取共用 JS，或不使用 webpack 單純使用 babel 來轉譯 JS 等範例。

## 環境需求

* node >= 8.10.0

## 使用方式

下載 Example

``` shell
$ git clone git@github.com:104corp/espack.git es6-project --branch example
$ cd es6-project
$ npm install
```

啟動 Develop Server

``` shell
$ npm run dev
```

發佈 production 檔案至 ./dist

``` shell
$ npm run build
# bundle 並移除程式中所有 console
$ npm run build -- -d
```

使用 eslint 代碼檢查

``` shell
$ npm run lint
```

執行測試

``` shell
$ npm run test
```

## 頁面慣例

|    資料夾         |   說明                  |
| :--------------- | :--------------------- |
| ./src/pages/*.js  |   各主程式放置資料夾，也是 webpack entry 來源（自動加入）   |
| ./src/pages/*.ejs |   各尋找對應主程式 html 樣板，自動對應 *.js 相同檔名  |
| ./public/*       |   靜態檔案存放資料夾      |

假設需生成頁面主程式，此頁面假設未來路徑為 `/account/accountForm.html`，依照約定創建新檔案 `./src/page/account/accountForm.js`，此時便已完成新增此頁的動作，但是如果還沒有對應的 `accountForm.ejs` 樣板，會使用預設顯示列表。


發佈後的 html 檔案為完整 html 內容，方便直接開啟靜態頁觀看，但由於資料夾拆分方式 html 都是使用相對於根目錄 `/` (需設置 `<base href="/">`) 的方式引用外部靜態檔案，所以需要使用類似 `live-server` 模擬線上環境來觀看發佈後的結果。

``` shell
# 使用 live-server
$ npm install -g live-server
$ live-server dist
```

## 更多用法說明

[文件連結](https://github.com/104corp/espack/wiki)