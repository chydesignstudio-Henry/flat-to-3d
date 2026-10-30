# Flat to 3D 內容替換指南（繁體中文）

本指南說明如何在你的 fork 中替換實際內容（文字、平面圖、3D 模型等），讓示範變成你自己的建築案例。

> 目前所有幾何、材質、文字皆以程式碼生成，沒有外部圖片或 .glb 模型檔。因此替換方式分為「文字／介面」與「幾何／模型」兩類。

## 1. 文字與介面標籤（最容易）

每個示範的主要文字都集中在「chrome」物件中。

### 範例：01-exploded-house

- 檔案位置：`01-exploded-house/dir-a.js`、`dir-b.js`、`dir-c.js`
- 尋找 `chrome:` 或 `S.chrome` 物件，裡面有：
  - `brand`、`brandSub`、`nav`、`cta`
  - `kicker`、`h1`、`lede`
  - `spec`（規格表）
  - `hint`、`loader`、`title`

**操作步驟：**
1. 用編輯器開啟 `dir-a.js`。
2. 找到 `chrome: {` 區塊。
3. 把英文文字改成你的繁體中文。
4. 儲存後重新整理頁面即可看到效果。

其他示範類似：
- `02-section-sweep/` → 主要在 `main.js` 或相關模組
- `03-open-section/` → `page.js` / `engine.js`
- 其餘請搜尋檔案中的 `chrome`、`title`、`h1`、`lede` 關鍵字。

## 2. 平面圖 / 剖面圖 / 立面圖

這些「圖紙」其實是用 Three.js 幾何 + 自訂 shader 畫出來的，不是圖片。

### 替換方式

1. **輕度修改（尺寸、房間名稱）**  
   編輯對應的 `house.js` 或 `world.js`，修改座標、牆厚、房間尺寸。

2. **完全換一張平面**  
   - 在 `house.js`（或等效檔案）中找到建立牆面、樓板的函式。
   - 根據你的新平面重新計算點座標，重建 Mesh。
   - 或把你的平面圖轉成 SVG path，再用 Three.js ExtrudeGeometry 或 Shape 生成。

3. **載入外部圖片作為底圖（進階）**  
   目前沒有，但可以修改程式，把平面圖 PNG 當作 Texture 貼在一個平面上，再疊加 3D 元素。

## 3. 3D 模型替換

目前全部是程式碼生成的簡易幾何（Box、Extrude 等），沒有 .glb / .gltf。

### 建議做法

1. **繼續用程式碼生成**  
   適合簡單的房屋、家具。直接改 `house.js` 裡的尺寸與材質。

2. **載入外部模型（推薦給真實專案）**  
   - 把你的模型匯出成 `.glb`。
   - 在示範的 `main.js` 或 `house.js` 中加入 GLTFLoader：
     ```js
     import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
     const loader = new GLTFLoader();
     loader.load('your-model.glb', (gltf) => {
       scene.add(gltf.scene);
     });
     ```
   - 記得把模型放到對應資料夾，並調整位置／縮放，使其與現有相機路徑吻合。

3. **混合使用**  
   保留原本的爆炸軸測／剖面邏輯，只把主體房屋換成你的 GLB。

## 4. 雙語支援建議

若要讓內部示範也隨語言切換：

1. 在 URL 加上 `?lang=zh`。
2. 在各示範的 `main.js` 開頭讀取語言參數。
3. 準備兩套 chrome 物件（chrome_en / chrome_zh），根據語言選擇。

目前外層切換器（index-bilingual.html）已支援語言切換，內部示範仍為英文，需依上述方式自行修改。

## 5. 建議工作流程

1. 先改文字（chrome）→ 確認介面中文化。
2. 再改尺寸與房間配置。
3. 最後視需要導入自己的 GLB 模型。
4. 本機用 `python3 -m http.server 8000` 測試。
5. 推上 GitHub 後，GitHub Pages 會自動更新。

## 6. 相關檔案快速索引

| 技術 | 主要檔案 | 文字位置 | 幾何位置 |
|------|----------|----------|----------|
| 01 爆炸房屋 | dir-a.js / dir-b.js / dir-c.js | chrome 物件 | house 相關函式 |
| 02 剖面掃掠 | main.js / house.js | chrome / 文字常數 | house.js |
| 03 開啟剖面 | page.js / house.js | page.js | house.js |
| 04–07 | 各資料夾內 js 檔 | 搜尋 "chrome" 或 "title" | 對應 world / house / stage.js |

---

如需協助修改特定示範的中文版或導入模型，請提供你想替換的內容（文字草稿、平面尺寸、模型檔），我可以幫你產生修改後的程式碼。
