# Flat to 3D

> **這是翻譯。** 這份說明是上游 README 的繁體中文（臺灣）譯文，說明這個專案在做什麼、有哪七種手法，以及怎麼在自己的電腦上跑。指令、連結和程式區塊都保持原樣。譯文若與上游英文有出入，以上游 README 為準。
>
> - 英文說明（本儲存庫）：[README.md](README.md)
> - 上游 README：<https://github.com/Sam1983Aing/flat-to-3d/blob/main/README.md>
> - 上游儲存庫：<https://github.com/Sam1983Aing/flat-to-3d>

七種方式，把一張平面的建築圖變成你用捲動走過的 3D 體驗。每一種都從建築師本來就在用的圖開始——爆炸軸測、剖面、序列圖、施工進度表、研究模型或立面——然後在你捲動的時候，變成那棟真正的建築。

[**線上觀看全部七個示範**](https://sam1983aing.github.io/flat-to-3d/) · 用筆電看效果最好

每個示範都附上完整程式碼，以及一段起步提示詞，方便你做出自己的版本。

## 這七種

| | 手法 | 畫面上發生的事 | 程式碼 | 提示詞 |
|---|---|---|---|---|
| 01 | **Exploded House（爆炸房屋）** | 爆炸軸測依照建造順序，一層一層落下。接著鏡頭拉寬到視線高度，你走進去。 | [01-exploded-house](01-exploded-house/) | [提示詞](01-exploded-house/PROMPT.md) |
| 02 | **Section Sweep（剖面掃過）** | 剖面圖往深處打開；一道掃描把墨線變成材料，圖上畫的日照角度變成真正的光束。然後你從切開的地方走進去。 | [02-section-sweep](02-section-sweep/) | [提示詞](02-section-sweep/PROMPT.md) |
| 03 | **Open Section（打開的剖面）** | 一張平的剖面自己把線畫出來。鏡頭打開時，切口仍維持原來的大小，攝影機從切口逐層看每一樓。 | [03-open-section](03-open-section/) | [提示詞](03-open-section/PROMPT.md) |
| 04 | **Build Time-Lapse（施工縮時）** | 同一棟房子的六張圖，一個階段一張。鑽進第一張，在工地走，看它一週一週蓋上去，直到交屋。 | [04-build-time-lapse](04-build-time-lapse/) | [提示詞](04-build-time-lapse/PROMPT.md) |
| 05 | **Schedule Build（依進度表建造）** | 捲動施工進度表，房子就跟著一根一根的進度條自己蓋起來，起重機也在。然後前門打開。 | [05-schedule-build](05-schedule-build/) | [提示詞](05-schedule-build/PROMPT.md) |
| 06 | **Card Model（紙卡模型）** | 夜裡，桌上放著白色的紙卡模型。往下鑽到比例人，紙卡變成真正的房子，桌燈就是它的太陽。 | [06-card-model](06-card-model/) | [提示詞](06-card-model/PROMPT.md) |
| 07 | **Sunlit Elevation（有日照的立面）** | 一張正立面，上面的排線就是真正的影子。一掃過去變成磚牆，太陽移動，門打開，你走進去。 | [07-sunlit-elevation](07-sunlit-elevation/) | [提示詞](07-sunlit-elevation/PROMPT.md) |

每個資料夾裡都有一篇短的 README，說明這個手法怎麼運作。

## 從哪裡開始

這些是接在我的平面圖示範之後做的：一張平面圖會隨著你捲動，自己蓋成一棟房子。它比我以前分享過的都走得更遠，看的人多半是建築和室內設計，所以我接著做他們每天在用的那些圖。

- 平面圖的線上示範：https://sam1983aing.github.io/casa-serra/
- 它的起步提示詞：https://github.com/Sam1983Aing/casa-serra/blob/main/starter-prompt.md
- 我怎麼做的，一支 8 分鐘的影片：https://youtu.be/rKv4PrtBkb8

## 怎麼做出來的

- three.js 從 CDN 載入，搭配純 HTML、CSS 和 JavaScript。沒有建置步驟，也不用安裝任何東西。
- 沒有圖片檔，也沒有 3D 模型檔。每一面牆、每一種材料、每一件家具都是用程式做出來的，所以每個示範大約在 100 到 190 KB 之間。
- 七個裡面有五個，那張平面圖其實是真正的 3D 模型，只是用焦距很長的鏡頭去看，所以看起來是平的。把鏡頭打開，它才變成 3D。
- 全部都是用 Opus 5.5 做出來的。

## 在自己的電腦上跑

這些頁面用了 JavaScript 模組，所以需要一台本地伺服器。在 `index.html` 上點兩下是開不起來的。

```bash
python3 -m http.server 8000
```

然後打開 http://localhost:8000/。

## 注意

- 用筆電搭配較新的瀏覽器效果最好。多數示範有手機版面，07 還沒有。
- 事務所、房子、地址和聯絡方式都是虛構的。這是一組設計研究，和任何真實的事務所沒有關係。
- 程式碼以 MIT 授權，見 [LICENSE](LICENSE)。three.js 也是 MIT。字型 Chakra Petch 和 IBM Plex Mono 從 Google Fonts 載入，授權為 SIL Open Font License。

Samnang Aing 製作。這類作品我會一邊做、一邊分享在 [X](https://x.com/SammmAing) 和 [Threads](https://www.threads.com/@prompting_lab)。

---

繁體中文（臺灣）譯文由 [chydesignstudio-Henry](https://github.com/chydesignstudio-Henry) 維護。原文作者是 Samnang Aing。
