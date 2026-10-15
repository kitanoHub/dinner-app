# 我が家のレシピ検索

iPhoneで使うことを想定した、個人用のレシピ検索Webアプリです。

## 何ができるか
- 「使う食材」からレシピを探す
- 米 / 麺 / パスタ / おかず / 汁物などで絞る
- さっぱり / 普通 / こってり
- あったかい / 冷たい
- 辛さ
- 塩 / 醤油 / カレー / 酸っぱい / 甘辛 / クリーム / にんにく等の味
- 魚介 / あったかい汁物 / 冷たい麺 / 卵 / きのこ等の特徴
- 冷蔵庫の食材を自由入力して近いレシピを上位表示

## ファイル構成
- `index.html` : 画面の骨組み
- `style.css` : 見た目
- `app.js` : 検索・ランキング処理
- `recipes.json` : レシピ本体
- `app-config.json` : UI文言、選択肢、スコア設定
- `AI_MAINTENANCE_GUIDE.md` : AI向けの編集仕様
- `START_HERE_FOR_AI.md` : AIが最初に読む短い案内
- `manifest.webmanifest` : iPhoneホーム画面追加用
- `sw.js` : オフラインキャッシュ
- `icon-192.png`, `icon-512.png` : アプリアイコン

## ローカルで試す
ブラウザのセキュリティ制約により `recipes.json` を読むにはHTTP配信が必要です。

MacのTerminalでこのフォルダに移動して:
```bash
python3 -m http.server 8000
```

その後:
`http://localhost:8000`

をSafari/Chromeで開きます。

## GitHub Pagesへ更新
GitHubの `kitanoHub/dinner-app` に、このフォルダ内のファイルをアップロードして同名ファイルを置き換えます。
GitHub Pagesが有効なら公開URLは通常:
`https://kitanohub.github.io/dinner-app/`

## iPhoneで使う
1. iPhoneのSafariで公開URLを開く
2. 共有ボタン
3. 「ホーム画面に追加」
4. 「追加」

## 今後の更新
AIにこのプロジェクト一式を渡す場合は、最初に `START_HERE_FOR_AI.md` と `AI_MAINTENANCE_GUIDE.md` を読ませてください。

## 「使う食材」ドロップダウン
この項目は全材料を自動表示せず、`app-config.json` の `filters.ingredient` で主要食材だけを管理します。

## 登録レシピ数
現在85件。

## 現在の検索項目
- 使う食材
- キーワード検索
- タイプ1（米 / 麺 / 鍋 / 一品料理（おかず））

料理タイプのドロップダウンは使用しません。
キーワード検索では料理名を優先し、材料・タグ・レシピ本文も検索対象にします。
