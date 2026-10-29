# Flat to 3D

七種方法，將建築師日常使用的平面建築圖紙，透過捲動轉化為 3D 體驗。每一個示範都從常見的圖紙開始——爆炸軸測圖、剖面圖、序列圖、施工計劃、研究模型或立面圖——並在捲動過程中逐漸變成真實的建築物。

[**查看全部七個即時示範**](https://sam1983aing.github.io/flat-to-3d/) · 建議在筆記型電腦上觀看

每個示範都附有完整程式碼與起步提示詞（starter prompt），方便你打造自己的版本。

## 七種技術

| | 技術 | 發生什麼事 | 程式碼 | 提示詞 |
|---|---|---|---|---|
| 01 | **爆炸房屋（Exploded House）** | 爆炸軸測圖依建造順序逐層落地。接著鏡頭展開至視線高度，你走入室內。 | [01-exploded-house](01-exploded-house/) | [prompt](01-exploded-house/PROMPT.md) |
| 02 | **剖面掃掠（Section Sweep）** | 剖面圖展開成深度空間。掃描將墨線轉為材質，繪製的日照角度變成真實光束。然後你從切口走入。 | [02-section-sweep](02-section-sweep/) | [prompt](02-section-sweep/PROMPT.md) |
| 03 | **開啟剖面（Open Section）** | 平面剖面圖自行繪製。鏡頭展開同時切口維持原尺寸，相機從切口探訪每一層樓。 | [03-open-section](03-open-section/) | [prompt](03-open-section/PROMPT.md) |
| 04 | **建造時間流逝（Build Time-Lapse）** | 同一棟房屋的六張階段圖紙。潛入第一張圖，在工地漫步，看著它週週成長，直到交屋。 | [04-build-time-lapse](04-build-time-lapse/) | [prompt](04-build-time-lapse/PROMPT.md) |
| 05 | **進度表建造（Schedule Build）** | 捲動施工計劃，房屋依進度條逐段建造，包含起重機。接著前門開啟。 | [05-schedule-build](05-schedule-build/) | [prompt](05-schedule-build/PROMPT.md) |
| 06 | **卡片模型（Card Model）** | 夜晚書桌上的白色卡片模型。潛入比例人偶，卡片變成真實房屋，書桌檩燈化為陽光。 | [06-card-model](06-card-model/) | [prompt](06-card-model/PROMPT.md) |
| 07 | **日照立面（Sunlit Elevation）** | 正面立面圖的影線即為真實陰影。掃掠將其轉為磚牆，太陽移動，門開啟，你走入室內。 | [07-sunlit-elevation](07-sunlit-elevation/) | [prompt](07-sunlit-elevation/PROMPT.md) |

每個資料夾都有簡短的 README，說明該技術的運作方式。

## 起源

這些示範源於我先前的平面圖示範：一張平面圖在捲動時自行建造為房屋。它的反響超越以往，尤其受到建築與室內設計領域人士關注，因此我繼續以他們日常使用的圖紙為主題。

- 平面圖即時示範：https://sam1983aing.github.io/casa-serra/
- 起步提示詞：https://github.com/Sam1983Aing/casa-serra/blob/main/starter-prompt.md
- 製作過程 8 分鐘影片：https://youtu.be/rKv4PrtBkb8

## 建置方式

- 使用 CDN 載入 three.js，搭配純 HTML、CSS 與 JavaScript。無需建置步驟，也無需安裝任何套件。
- 沒有圖片檔案，也沒有 3D 模型檔。所有牆面、材質與家具皆以程式碼生成，因此每個示範約 100 至 190 KB。
- 其中五個示範中，平面圖紙其實是透過極長鏡頭觀察的真實 3D 模型，因此看起來平坦。展開鏡頭即是將其轉化為 3D 的關鍵。
- 全部使用 Opus 5.5 製作。

## 在本機執行

這些頁面使用 JavaScript 模組，因此需要本地伺服器。直接雙擊 `index.html` 無法運作。

```bash
python3 -m http.server 8000
```

然後開啟 http://localhost:8000/。

## 注意事項

- 建議在筆記型電腦搭配近期瀏覽器觀看。多數示範有手機版面，但 07 尚未支援。
- 工作室、房屋、地址與聯絡資訊皆為虛構。這是一組設計研究，與任何真實事務所無關。
- 程式碼採 MIT 授權，詳見 [LICENSE](LICENSE)。three.js 亦為 MIT。字型 Chakra Petch 與 IBM Plex Mono 透過 Google Fonts 載入，採 SIL Open Font License。

由 Samnang Aing 製作。我持續在 [X](https://x.com/SammmAing) 與 [Threads](https://www.threads.com/@prompting_lab) 分享類似作品。

---

**繁體中文版本** 由 chydesignstudio-Henry 翻譯與維護。