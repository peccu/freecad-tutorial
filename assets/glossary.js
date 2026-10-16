/* 用語集データ（単一ソース）
   - en：英語名（英語 UI での表記）。ツールチップ・用語集・各章の初出に併記する
   - 本文中の <span class="term" data-term="キー">…</span> にツールチップとして表示
   - 付録「用語集」スライドに一覧として自動展開
   - see: 関連する章の id（クリックでジャンプ） */
window.GLOSSARY = {
  "FDM": { en: "Fused Deposition Modeling", cat: "3Dプリント", desc: "熱溶解積層方式。溶かした樹脂をノズルから押し出し、1層ずつ積み上げて造形する。家庭用3Dプリンタの主流。", see: "ch-fdm" },
  "レイヤー高さ": { en: "Layer height", cat: "3Dプリント", desc: "1層あたりの厚み。小さいほど表面がなめらかになるが印刷時間が延びる。0.4mmノズルでは0.08〜0.28mm程度が一般的。", see: "ch-slice" },
  "オーバーハング": { en: "Overhang", cat: "3Dプリント", desc: "下に支えのない、せり出した部分。垂直からの傾きがおよそ45°を超えるとサポートが必要になりやすい。", see: "ch-dfam" },
  "ブリッジ": { en: "Bridge", cat: "3Dプリント", desc: "2点間を空中で橋渡しするように押し出すこと。短い距離ならサポートなしで印刷できる。", see: "ch-dfam" },
  "サポート": { en: "Support", cat: "スライサー", desc: "オーバーハングを支えるために一時的に印刷し、後で取り除く構造。ツリー型と通常（グリッド）型がある。", see: "ch-slice" },
  "インフィル": { en: "Infill（Sparse infill）", cat: "スライサー", desc: "部品内部を埋める格子状の充填構造。密度とパターンで強度・重さ・時間が変わる。", see: "ch-slice" },
  "壁（ウォール）": { en: "Wall loops", cat: "スライサー", desc: "外周を形作る線の本数。強度への寄与はインフィルより大きいことが多い。", see: "ch-slice" },
  "ブリム": { en: "Brim", cat: "スライサー", desc: "第一層の周囲に付けるつば。ベッドとの接地面積を増やし、反りや剥がれを防ぐ。", see: "ch-slice" },
  "シーム": { en: "Seam", cat: "スライサー", desc: "各層の外周の始点・終点がそろってできる継ぎ目。配置方法（整列・背面・ランダム等）を選べる。", see: "ch-slice" },
  "公差・クリアランス": { en: "Tolerance / Clearance", cat: "設計", desc: "はめ合う部品同士に設けるすき間。FDMでは0.1〜0.3mm程度から試し、実機で調整する。", see: "ch-dfam" },
  "象の足": { en: "Elephant foot", cat: "3Dプリント", desc: "第一層がつぶれて外側にはみ出す現象。底面エッジに小さな面取りを入れると目立たなくなる。", see: "ch-dfam" },
  "ワークベンチ": { en: "Workbench", cat: "FreeCAD", desc: "目的別のツール群。3Dプリント用部品は主に Part Design ワークベンチを使う。", see: "ch-fcui" },
  "ボディ": { en: "Body", cat: "FreeCAD", desc: "Part Design で1つの連続した立体を表すコンテナ。フィーチャはボディの中に積み重なる。", see: "ch-partdesign" },
  "スケッチ": { en: "Sketch", cat: "FreeCAD", desc: "平面上に描く2D形状。拘束で寸法と関係を決め、パッドやポケットの元にする。", see: "ch-sketch" },
  "拘束": { en: "Constraint", cat: "FreeCAD", desc: "スケッチ要素の位置・寸法・関係（水平、一致、距離など）を決めるルール。", see: "ch-sketch" },
  "完全拘束": { en: "Fully constrained", cat: "FreeCAD", desc: "スケッチの自由度が0になった状態。形状が意図せず動かなくなり、後の修正に強くなる。", see: "ch-sketch" },
  "パッド": { en: "Pad", cat: "FreeCAD", desc: "スケッチを押し出して立体を追加する Part Design の基本フィーチャ。", see: "ch-partdesign" },
  "ポケット": { en: "Pocket", cat: "FreeCAD", desc: "スケッチ形状で立体を削り取るフィーチャ。", see: "ch-partdesign" },
  "パラメトリック": { en: "Parametric", cat: "設計", desc: "寸法や変数を変えるだけで形状全体が追従して作り直される設計方式。", see: "ch-param" },
  "スプレッドシート": { en: "Spreadsheet", cat: "FreeCAD", desc: "変数を表形式で管理し、式から参照できる FreeCAD の機能。", see: "ch-param" },
  "トポロジカルネーミング問題": { en: "Topological naming problem", cat: "FreeCAD", desc: "前段の形状変更で面や辺の番号が変わり、それを参照していたフィーチャが壊れる問題。1.0以降で大幅に緩和された。", see: "ch-param" },
  "STL": { en: "STereoLithography", cat: "ファイル形式", desc: "三角形メッシュだけを保存する古典的な形式。単位や色の情報を持たない。", see: "ch-export" },
  "3MF": { en: "3D Manufacturing Format", cat: "ファイル形式", desc: "単位・色・複数オブジェクト・印刷設定まで保存できる現代的な形式。Bambu Studio の標準。", see: "ch-export" },
  "STEP": { en: "STEP（ISO 10303）", cat: "ファイル形式", desc: "メッシュではなく正確な曲面を持つCAD交換形式。Bambu Studio でも読み込める。", see: "ch-export" },
  "プレート": { en: "Plate", cat: "Bambu Studio", desc: "ビルドプレート上の配置単位。1プロジェクトに複数プレートを持てる。", see: "ch-bsbasic" },
  "プロセスプリセット": { en: "Process preset", cat: "Bambu Studio", desc: "レイヤー高さ・壁・インフィル・速度などの印刷設定のまとまり。", see: "ch-bsbasic" },
  "モディファイア": { en: "Modifier", cat: "Bambu Studio", desc: "部品の一部の範囲にだけ別の設定（インフィル密度など）を適用するための補助形状。", see: "ch-bsadv" },
  "AMS": { en: "Automatic Material System", cat: "Bambu Studio", desc: "Bambu Lab の自動マテリアルシステム。複数フィラメントを切り替えてマルチカラー印刷できる。", see: "ch-bsadv" },
};
