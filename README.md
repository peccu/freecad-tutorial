# FreeCAD × Bambu Studio 3Dプリント入門

FreeCAD 1.1 で設計し、Bambu Studio でスライスして3Dプリントするまでの機能と概念をまとめた図解テキスト。
スライド表示と一覧表示を切り替えられ、PC・スマートフォンの両方で読める。

## 構成

```
index.html            外枠（ヘッダー・目次・検索・フッター）
chapters/*.html       章ごとの本文。1ファイル1章
assets/style.css      デザイン（ライト／ダーク）
assets/app.js         ビューア（目次・検索・進捗・URL・スワイプ）
assets/figures*.js    SVG・D3 の図（章別に3ファイル）
assets/three-demos.js WebGL（three.js）の図
assets/glossary.js    用語集データ（本文のツールチップと付録の一覧に使う）
```

外部ライブラリは CDN から読み込む（three.js 0.160.0、D3 7.9.0、Google Fonts）。ビルド工程はない。

## ローカルで見る

章ファイルを `fetch` で読み込むため、`index.html` を直接開くのではなく簡易サーバー経由で開く。

```bash
python3 -m http.server 8000
```

→ http://localhost:8000/

## 章・スライドの追加

`chapters/` に章ファイルを置き、`assets/app.js` 冒頭の `CHAPTER_FILES` にファイル名を足す。

```html
<section class="chapter" id="ch-xxx" data-no="16" data-title="章の題" data-part="部の名前">
  <article class="slide opener" data-title="扉">…</article>   <!-- 章内目次が自動で入る -->
  <article class="slide" data-title="スライドの題">…</article>
</section>
```

使える部品：`.box.point / .warn / .fail / .lost / .verify / .new`（囲み）、`.term`（用語）、`.quiz`、`.checklist[data-key]`、`ol.steps.progressive`、`.tabs > .tab[data-label]`、`figure.fig[data-demo="図の名前"]`。

## GitHub Pages で公開する

1. GitHub に空のリポジトリを作り、このフォルダを push する
2. リポジトリの Settings → Pages → Build and deployment で「Deploy from a branch」、ブランチ `main`、フォルダ `/ (root)` を選ぶ
3. 数分後に `https://<ユーザー名>.github.io/<リポジトリ名>/` で公開される

`.nojekyll` を置いてあるので、Jekyll の変換を通さずそのまま配信される。
