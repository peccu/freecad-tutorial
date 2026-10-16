/* ============================================================
   第9〜14章の図
   ============================================================ */
(function () {
  "use strict";
  const D = window.Demos, H = window.FigHelpers;
  const { cv, svg, f, poly, text, line, dimH, dimV, note, iso, isoBox } = H;
  let uid = 0;

  /* ============================================================
     第9章：Bambu Studio の画面
     ============================================================ */
  D.bsui = (fig) => {
    const Z = [
      [0, 0, 330, 22, "上部タブ", "［準備］で配置と設定、［プレビュー］でスライス結果の確認、［デバイス］でプリンタの状態とカメラ。"],
      [330, 0, 150, 22, "スライス／印刷ボタン", "［プレートをスライス］で計算し、［プレートを印刷］で送信画面へ進む。プレートが複数なら一括も選べる。"],
      [0, 22, 140, 58, "プリンタ", "機種、ノズル径、ビルドプレートの種類。実機と一致していないと第一層や温度が合わない。"],
      [0, 80, 140, 70, "フィラメント", "使う材料の一覧。AMS 使用時は同期ボタンで装填中の色・種類を読み込める。"],
      [0, 150, 140, 170, "プロセス", "レイヤー高さ・壁・インフィル・サポートなどの印刷設定。［グローバル］はプレート全体、［オブジェクト］は部品ごとの上書き。"],
      [140, 22, 340, 28, "ツールバー", "追加・自動配置・自動向き、移動・回転・拡大縮小・面に置く・カット・ペイント類。"],
      [140, 50, 300, 270, "3Dビュー（プレート）", "部品の配置と選択。右クリックで部品ごとのメニュー（モディファイア追加など）。"],
      [440, 50, 40, 270, "プレート一覧", "プレートの切替・追加。プレートごとにスライスと印刷ができる。"],
    ];
    let art = `<rect x="0" y="0" width="480" height="320" class="s-line" style="fill:var(--paper)"/>`;
    art += line(0, 22, 480, 22, "s-thin") + line(140, 22, 140, 320, "s-thin") + line(140, 50, 480, 50, "s-thin") + line(440, 50, 440, 320, "s-thin") +
      line(0, 80, 140, 80, "s-thin") + line(0, 150, 140, 150, "s-thin");
    ["ホーム", "準備", "プレビュー", "デバイス", "プロジェクト"].forEach((t, i) => (art += text(10 + i * 56, 15, t, i === 1 ? "t-xs t-b" : "t-xs t-m")));
    art += `<rect x="340" y="4" width="64" height="14" rx="2" class="s-thin"/><rect x="410" y="4" width="64" height="14" rx="2" style="fill:var(--accent-2);stroke:none"/>` +
      text(372, 14.5, "スライス", "t-xs", "middle") + text(442, 14.5, "印刷", "t-xs", "middle", 'style="fill:#fff"');
    art += text(8, 38, "プリンタ", "t-xs t-b") + `<rect x="8" y="44" width="124" height="14" rx="2" class="s-thin"/>` + text(12, 54, "機種 0.4 nozzle ▾", "t-xs t-m") + text(12, 72, "プレート：テクスチャ PEI", "t-xs t-m");
    art += text(8, 96, "フィラメント", "t-xs t-b");
    [["var(--accent)", "PLA"], ["var(--ink)", "PLA"], ["var(--text)", "PETG"]].forEach(([col, n], i) => (art += `<rect x="10" y="${104 + i * 14}" width="10" height="10" style="fill:${col}"/>` + text(26, 113 + i * 14, n, "t-xs t-m")));
    art += text(8, 166, "プロセス", "t-xs t-b") + `<rect x="70" y="156" width="62" height="14" rx="7" class="s-thin"/>` + text(101, 166, "全体｜部品", "t-xs t-m", "middle");
    art += `<rect x="8" y="176" width="124" height="14" rx="2" class="s-thin"/>` + text(12, 186, "0.20mm Standard ▾", "t-xs t-m");
    ["品質", "強度", "速度", "サポート", "その他"].forEach((t, i) => (art += text(10 + i * 26, 206, t, "t-xs t-m")));
    ["レイヤー高さ　0.2", "壁のループ数　2", "インフィル密度　15%", "…"].forEach((t, i) => (art += text(12, 226 + i * 16, t, "t-xs t-m")));
    for (let i = 0; i < 14; i++) art += `<rect x="${150 + i * 20}" y="28" width="14" height="14" rx="2" class="s-thin"/>`;
    const P = iso(2.6, 290, 160);
    art += H.poly([P(-40, -40, 0), P(40, -40, 0), P(40, 40, 0), P(-40, 40, 0)], "", 'style="fill:var(--surface-2);stroke:var(--rule)"');
    art += isoBox(P, -12, -10, 0, 24, 20, 14);
    for (let i = 0; i < 3; i++) art += `<rect x="446" y="${60 + i * 34}" width="28" height="28" rx="2" class="s-thin" style="${i === 0 ? "stroke:var(--accent-2);stroke-width:1.6" : ""}"/>` + text(460, 78 + i * 34, i + 1, "t-xs t-m", "middle");
    const zones = Z.map(([x, y, w, h], i) => `<g class="hot" data-i="${i}"><rect class="zone" x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" rx="2"/>
      <circle cx="${x + w - 9}" cy="${y + h - 9}" r="7" style="fill:var(--accent-2)"/><text x="${x + w - 9}" y="${y + h - 5.5}" text-anchor="middle" style="font-size:9.5px;font-weight:700;fill:#fff">${i + 1}</text></g>`).join("");
    const c = cv(fig);
    c.innerHTML = svg("0 0 480 320", art + zones) + `<div class="info-pane" style="border-left-color:var(--accent-2)"></div>`;
    const pane = c.querySelector(".info-pane");
    const sel = (i) => { c.querySelectorAll(".hot").forEach((g) => g.classList.toggle("on", +g.dataset.i === i)); pane.innerHTML = `<b>${i + 1}. ${Z[i][4]}</b>${Z[i][5]}`; };
    c.querySelectorAll(".hot").forEach((g) => { g.addEventListener("click", () => sel(+g.dataset.i)); g.addEventListener("mouseenter", () => sel(+g.dataset.i)); });
    sel(4);
  };

  D.presets = (fig) => {
    const box = (y, t, d, col) => `<rect x="20" y="${y}" width="190" height="50" rx="3" style="fill:var(--paper);stroke:${col};stroke-width:1.4"/>` +
      text(32, y + 21, t, "t-s t-b") + text(32, y + 39, d, "t-xs t-m");
    let s = box(14, "プリンタ", "機種・ノズル径・プレート", "var(--text)") + box(74, "フィラメント", "温度・流量・冷却・乾燥条件", "var(--accent)") + box(134, "プロセス", "層・壁・インフィル・速度・サポート", "var(--accent-2)");
    [39, 99, 159].forEach((y) => (s += `<path d="M210 ${y} C 240 ${y}, 240 99, 262 99" class="s-thin" marker-end="url(#ar)"/>`));
    s += `<rect x="266" y="76" width="80" height="46" rx="23" style="fill:var(--text)"/>` + text(306, 104, "スライス", "t-s t-b", "middle", 'style="fill:var(--paper)"');
    s += line(346, 99, 376, 99, "s-line", 'marker-end="url(#ar)"');
    s += `<path d="M380 70 h70 l12 12 v46 h-82 z" class="s-line" style="fill:var(--paper)"/>` + text(421, 98, "印刷データ", "t-xs t-b", "middle") + text(421, 114, ".gcode.3mf", "t-xs t-m", "middle");
    cv(fig).innerHTML = svg("0 0 480 196", s);
  };

  D.plates = (fig) => {
    const P1 = iso(1.5, 120, 98), P2 = iso(1.5, 360, 98);
    const plate = (P) => H.poly([P(-50, -50, 0), P(50, -50, 0), P(50, 50, 0), P(-50, 50, 0)], "", 'style="fill:var(--surface-2);stroke:var(--rule)"');
    let s = plate(P1) + isoBox(P1, -30, -20, 0, 20, 20, 16) + isoBox(P1, 8, -8, 0, 22, 14, 10) + isoBox(P1, -20, 16, 0, 14, 14, 24);
    s += plate(P2) + isoBox(P2, -16, -16, 0, 32, 32, 30, ["s-top", "s-mat2", "s-mat"]);
    s += text(120, 198, "プレート1：小物をまとめて", "t-xs", "middle") + text(360, 198, "プレート2：大物を単独で", "t-xs", "middle");
    s += note(...P1(15, -1, 10), 236, 14, "部品ごとに設定を上書きできる", "start");
    cv(fig).innerHTML = svg("0 0 480 208", s);
  };

  /* ============================================================
     第10章：スライス設定
     ============================================================ */
  D.layertime = (fig) => {
    const c = cv(fig);
    const PR = [[0.08, "Extra Fine"], [0.12, "Fine"], [0.16, "Optimal"], [0.2, "Standard"], [0.24, "Draft"], [0.28, "Extra Draft"]];
    c.innerHTML = `<div class="lt"></div><div class="readout">点にカーソルを合わせる（タップ）と詳細を表示。</div>`;
    const ro = c.querySelector(".readout");
    H.d3().then((d3) => {
      const W = 480, Ht = 230, m = { l: 44, r: 16, t: 14, b: 38 };
      const x = d3.scaleLinear().domain([0.06, 0.3]).range([m.l, W - m.r]);
      const y = d3.scaleLinear().domain([0, 3.4]).range([Ht - m.b, m.t]);
      const s = d3.select(c.querySelector(".lt")).append("svg").attr("viewBox", `0 0 ${W} ${Ht}`);
      s.append("g").attr("transform", `translate(0,${Ht - m.b})`).call(d3.axisBottom(x).tickValues([0.08, 0.12, 0.16, 0.2, 0.24, 0.28]).tickFormat(d3.format(".2f")).tickSizeOuter(0)).attr("class", "axis");
      s.append("g").attr("transform", `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickFormat((d) => "×" + d).tickSizeOuter(0)).attr("class", "axis");
      s.append("text").attr("x", (W + m.l) / 2).attr("y", Ht - 4).attr("text-anchor", "middle").attr("class", "t-xs t-m").text("レイヤー高さ（mm）");
      s.append("text").attr("x", m.l + 6).attr("y", m.t + 4).attr("class", "t-xs t-m").text("印刷時間（0.20 を 1 とした比）");
      const xs = d3.range(0.07, 0.301, 0.002);
      s.append("path").attr("d", d3.line().x((h) => x(h)).y((h) => y(0.2 / h))(xs)).attr("class", "s-acc-l");
      s.append("line").attr("x1", m.l).attr("x2", W - m.r).attr("y1", y(1)).attr("y2", y(1)).attr("class", "s-dash");
      const g = s.selectAll("g.pt").data(PR).join("g").attr("class", "pt hot").attr("transform", (d) => `translate(${x(d[0])},${y(0.2 / d[0])})`);
      g.append("circle").attr("r", 12).attr("style", "fill:transparent");
      g.append("circle").attr("r", 4.5).attr("style", (d) => d[0] === 0.2 ? "fill:var(--accent)" : "fill:var(--paper);stroke:var(--accent);stroke-width:1.6");
      g.append("text").attr("x", (d) => (d[0] >= 0.24 ? -8 : 8)).attr("y", -9).attr("text-anchor", (d) => (d[0] >= 0.24 ? "end" : "start")).attr("class", "t-xs").text((d) => d[1]);
      g.on("mouseenter click", (_, d) => {
        ro.innerHTML = `<b>${d[0].toFixed(2)}mm ${d[1]}</b>　時間 ×${(0.2 / d[0]).toFixed(2)}　` +
          (d[0] <= 0.12 ? "曲面や小さな文字がきれい。時間は長い。" : d[0] >= 0.24 ? "試作・大物向き。段差は目立つ。" : "見た目と時間のバランスがよい。");
      });
    });
  };

  D.shell = (fig) => {
    const c = cv(fig);
    c.innerHTML = `<div class="ctrl"><label>壁 <input type="range" class="i-w" min="1" max="5" value="2"></label><output class="o-w"></output>
      <label>上下面の層 <input type="range" class="i-t" min="0" max="8" value="5"></label><output class="o-t"></output>
      <label>インフィル <input type="range" class="i-i" min="0" max="60" step="5" value="15"></label><output class="o-i"></output></div>` +
      svg("0 0 480 240", `<defs><clipPath id="sh-in"><rect class="cl"/></clipPath></defs><g class="g"></g>`) + `<div class="readout"></div>`;
    const iw = c.querySelector(".i-w"), it = c.querySelector(".i-t"), ii = c.querySelector(".i-i"), g = c.querySelector(".g"), cl = c.querySelector(".cl"), ro = c.querySelector(".readout");
    const id = "sh-in-" + ++uid; c.querySelector("clipPath").id = id;
    const draw = () => {
      const nw = +iw.value, nt = +it.value, den = +ii.value / 100;
      const U = 12, lw = 0.45 * U, lh = 0.2 * U * 2.5; // 層は見やすさのため縦に2.5倍
      const X0 = 40, X1 = 440, Y0 = 20, Y1 = 220;
      let s = `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" class="s-line"/>`;
      for (let k = 0; k < nw; k++) {
        s += `<rect x="${X0 + k * lw}" y="${Y0}" width="${lw - 0.6}" height="${Y1 - Y0}" style="fill:var(--accent);opacity:${0.9 - k * 0.12}"/>`;
        s += `<rect x="${X1 - (k + 1) * lw + 0.6}" y="${Y0}" width="${lw - 0.6}" height="${Y1 - Y0}" style="fill:var(--accent);opacity:${0.9 - k * 0.12}"/>`;
      }
      const ix0 = X0 + nw * lw, ix1 = X1 - nw * lw;
      for (let k = 0; k < nt; k++) {
        s += `<rect x="${ix0}" y="${Y0 + k * lh}" width="${ix1 - ix0}" height="${lh - 0.6}" style="fill:var(--ink);opacity:.7"/>`;
        s += `<rect x="${ix0}" y="${Y1 - (k + 1) * lh + 0.6}" width="${ix1 - ix0}" height="${lh - 0.6}" style="fill:var(--ink);opacity:.7"/>`;
      }
      const iy0 = Y0 + nt * lh, iy1 = Y1 - nt * lh;
      cl.setAttribute("x", ix0); cl.setAttribute("y", iy0); cl.setAttribute("width", Math.max(0, ix1 - ix0)); cl.setAttribute("height", Math.max(0, iy1 - iy0));
      if (den > 0) {
        const sp = (lw / den) * 2;
        let inf = "";
        for (let x = ix0 - (iy1 - iy0); x < ix1 + (iy1 - iy0); x += sp) {
          inf += line(x, iy1, x + (iy1 - iy0), iy0, "", 'style="stroke:var(--accent-2);stroke-width:2.4"') + line(x, iy0, x + (iy1 - iy0), iy1, "", 'style="stroke:var(--accent-2);stroke-width:2.4"');
        }
        s += `<g clip-path="url(#${id})">${inf}</g>`;
      }
      if (nt === 0) s += text(240, 14, "上下面がない → 中が見える", "t-xs", "middle", 'style="fill:var(--ng)"');
      g.innerHTML = s;
      c.querySelector(".o-w").textContent = nw + " 周"; c.querySelector(".o-t").textContent = nt + " 層"; c.querySelector(".o-i").textContent = Math.round(den * 100) + "%";
      const area = (X1 - X0) * (Y1 - Y0), shell = area - Math.max(0, ix1 - ix0) * Math.max(0, iy1 - iy0);
      const mat = (shell + Math.max(0, ix1 - ix0) * Math.max(0, iy1 - iy0) * den) / area;
      ro.innerHTML = `<span style="color:var(--accent)">■</span>壁　<span style="color:var(--ink)">■</span>上下面　<span style="color:var(--accent-2)">■</span>インフィル　　材料の使用量（断面比） <b>${Math.round(mat * 100)}%</b>` +
        (nw <= 1 ? "　<span class='st-warn'>壁1周は穴が開きやすく弱い。</span>" : nt > 0 && nt < 3 ? "　<span class='st-warn'>上面が薄いと、インフィルの模様が透けたり穴が開く。</span>" : "");
    };
    [iw, it, ii].forEach((x) => x.addEventListener("input", draw)); draw();
  };

  D.infill = (fig) => {
    const c = cv(fig);
    const INFO = {
      grid: "グリッド：直交する2方向の線。速く、標準的。",
      tri: "三角：3方向の線。面内のたわみに強い。",
      gyroid: "ジャイロイド：波形の曲面。方向による強度差が小さい。少し時間がかかる。",
      honey: "ハニカム：六角形。強いが時間がかかる。",
      conc: "同心：外形に沿った線。TPU など柔らかい材料や、光を通したい部品向き。",
    };
    let pat = "grid";
    c.innerHTML = `<div class="ctrl">${H.seg([["grid", "グリッド"], ["tri", "三角"], ["gyroid", "ジャイロイド"], ["honey", "ハニカム"], ["conc", "同心"]], pat, "パターン")}
      <label>密度 <input type="range" min="5" max="40" step="5" value="15"></label><output></output></div>` +
      svg("0 0 480 220", `<defs><clipPath class="cp"><rect x="140" y="10" width="200" height="200"/></clipPath></defs><g class="g"></g>`) + `<div class="readout"></div>`;
    const id = "inf-" + ++uid; c.querySelector(".cp").id = id;
    const r = c.querySelector("input"), out = c.querySelector("output"), g = c.querySelector(".g"), ro = c.querySelector(".readout");
    const draw = () => {
      const d = +r.value / 100, lw = 0.45, U = 10, X0 = 140, Y0 = 10, S = 200;
      const st = 'style="stroke:var(--accent-2);stroke-width:4;fill:none;stroke-linecap:round"';
      let s = "";
      const fam = (ang, sp) => {
        const a = (ang * Math.PI) / 180, nx = -Math.sin(a), ny = Math.cos(a), cx = X0 + S / 2, cy = Y0 + S / 2;
        for (let k = -20; k <= 20; k++) {
          const ox = cx + nx * k * sp, oy = cy + ny * k * sp;
          s += line(ox - Math.cos(a) * 200, oy - Math.sin(a) * 200, ox + Math.cos(a) * 200, oy + Math.sin(a) * 200, "", st);
        }
      };
      if (pat === "grid") { const sp = ((2 * lw) / d) * U; fam(45, sp); fam(-45, sp); }
      if (pat === "tri") { const sp = ((3 * lw) / d) * U; fam(0, sp); fam(60, sp); fam(120, sp); }
      if (pat === "gyroid") {
        const sp = ((1.6 * lw) / d) * U;
        for (let y = Y0 - sp; y < Y0 + S + sp; y += sp) {
          let p = `M${X0} ${f(y)}`;
          for (let x = 0; x <= S; x += 4) p += ` L${f(X0 + x)} ${f(y + Math.sin((x / sp) * Math.PI) * sp * 0.32)}`;
          s += `<path d="${p}" ${st}/>`;
        }
      }
      if (pat === "honey") {
        const a = ((1.6 * lw) / d) * U, hw = a * Math.sqrt(3);
        for (let row = -1; row * a * 1.5 < S + a; row++) for (let col = -1; col * hw < S + hw; col++) {
          const cx = X0 + col * hw + (row % 2 ? hw / 2 : 0), cy = Y0 + row * a * 1.5;
          const pts = []; for (let i = 0; i < 6; i++) { const t = (Math.PI / 3) * i + Math.PI / 6; pts.push([cx + a * Math.cos(t), cy + a * Math.sin(t)]); }
          s += `<polygon points="${H.pts(pts)}" ${st}/>`;
        }
      }
      if (pat === "conc") { const sp = (lw / d) * U; for (let k = 0; k * sp < S / 2; k++) s += `<rect x="${X0 + k * sp + 2}" y="${Y0 + k * sp + 2}" width="${Math.max(0, S - 2 * k * sp - 4)}" height="${Math.max(0, S - 2 * k * sp - 4)}" rx="3" ${st}/>`; }
      g.innerHTML = `<rect x="${X0}" y="${Y0}" width="${S}" height="${S}" style="fill:var(--paper)"/><g clip-path="url(#${id})">${s}</g><rect x="${X0}" y="${Y0}" width="${S}" height="${S}" class="s-line" style="stroke-width:3"/>` +
        text(X0 + S + 10, Y0 + 14, "上から見た1層", "t-xs t-m");
      out.textContent = r.value + "%";
      ro.textContent = INFO[pat];
    };
    H.bindSeg(c, (v) => { pat = v; draw(); });
    r.addEventListener("input", draw); draw();
  };

  D.support = (fig) => {
    const part = (ox) => `<path d="M${ox + 70} 180 V90 H${ox + 20} V60 H${ox + 200} V90 H${ox + 150} V180 Z" class="s-mat"/>`;
    let s = part(0) + part(240);
    for (let x = 22; x < 68; x += 8) s += `<rect x="${x}" y="91" width="5" height="89" style="fill:var(--ink);opacity:.45"/>`;
    for (let x = 152; x < 198; x += 8) s += `<rect x="${x}" y="91" width="5" height="89" style="fill:var(--ink);opacity:.45"/>`;
    const tree = (x0, tx) => `<path d="M${x0} 180 C ${x0} 140, ${tx} 130, ${tx} 92" style="stroke:var(--ink);stroke-width:4;fill:none;opacity:.6"/>`;
    s += tree(280, 262) + tree(280, 300) + tree(282, 284) + tree(420, 404) + tree(420, 438) + tree(418, 422);
    s += line(0, 180, 480, 180, "s-line");
    s += text(110, 200, "通常（格子）：真下に柱", "t-s t-b", "middle") + text(350, 200, "ツリー：幹から枝を伸ばす", "t-s t-b", "middle");
    s += text(110, 216, "平らな面の支えに強い", "t-xs t-m", "middle") + text(350, 216, "材料が少なく、外しやすい", "t-xs t-m", "middle");
    cv(fig).innerHTML = svg("0 0 480 222", s);
  };

  D.threshold = (fig) => {
    const c = cv(fig);
    c.innerHTML = `<div class="ctrl"><label>しきい値角度 <input type="range" min="0" max="90" step="5" value="30"></label><output></output></div>` +
      svg("0 0 480 210", `<g class="g"></g>`) + `<div class="readout"></div>`;
    const r = c.querySelector("input"), out = c.querySelector("output"), g = c.querySelector(".g"), ro = c.querySelector(".readout");
    const draw = () => {
      const th = +r.value, ox = 240, oy = 30, L = 170;
      let s = line(ox - 200, oy, ox + 200, oy, "s-line") + text(ox + 200, oy - 6, "水平", "t-xs t-m", "end");
      for (let a = 0; a <= 90; a += 15) {
        const rad = (a * Math.PI) / 180, need = a < th;
        [1, -1].forEach((sd) => {
          if (a === 90 && sd < 0) return;
          s += line(ox, oy, ox + sd * L * Math.cos(rad), oy + L * Math.sin(rad), "", `style="stroke:${need ? "var(--ng)" : "var(--ok)"};stroke-width:${need ? 2.6 : 1.6}"`);
        });
        s += text(ox + (L + 12) * Math.cos(rad), oy + (L + 12) * Math.sin(rad) + 4, a + "°", "t-xs t-m", "middle");
      }
      s += text(ox, 204, "線＝下向きの面（オーバーハング）を横から見たもの", "t-xs t-m", "middle");
      g.innerHTML = s;
      out.textContent = th + "°";
      ro.innerHTML = `水平から <b>${th}°</b> 未満の面（<span class="st-ng">赤</span>）にサポートが付く。垂直から測ると <b>${90 - th}°</b> を超える面。`;
    };
    r.addEventListener("input", draw); draw();
  };

  D.brim = (fig) => {
    const shape = (ox, kind) => {
      let s = "";
      if (kind === "brim") for (let k = 8; k >= 1; k--) s += `<rect x="${ox + 60 - k * 5}" y="${50 - k * 5}" width="${120 + k * 10}" height="${80 + k * 10}" rx="${6 + k * 5}" style="fill:none;stroke:var(--accent-2);stroke-width:2.5;opacity:.75"/>`;
      if (kind === "ears") [[60, 50], [180, 50], [60, 130], [180, 130]].forEach(([x, y]) => (s += `<circle cx="${ox + x}" cy="${y}" r="22" style="fill:var(--accent-2);opacity:.4"/>`));
      return s + `<rect x="${ox + 60}" y="50" width="120" height="80" rx="6" class="s-mat"/>`;
    };
    let s = shape(0, "brim") + shape(240, "ears");
    s += text(120, 182, "ブリム：外周に数mmのつば", "t-s t-b", "middle") + text(360, 182, "耳：反りやすい角だけ", "t-s t-b", "middle");
    cv(fig).innerHTML = svg("0 0 480 192", s);
  };

  D.seam = (fig) => {
    const c = cv(fig);
    const INFO = {
      aligned: "整列：継ぎ目を一直線にそろえる。目立つが位置が予測でき、角に寄せれば隠れる。",
      back: "背面：継ぎ目を後ろ側（奥）に集める。正面をきれいに見せたいとき。",
      nearest: "最寄り：移動が短くなる位置。速いが、位置は形状次第で散る。",
      random: "ランダム：毎層ばらばらに散らす。線は出ないが、表面全体がわずかにざらつく。",
    };
    let m = "aligned";
    c.innerHTML = `<div class="ctrl">${H.seg([["aligned", "整列"], ["back", "背面"], ["nearest", "最寄り"], ["random", "ランダム"]], m, "シーム")}</div>` +
      svg("0 0 480 200", `<g class="g"></g>`) + `<div class="readout"></div>`;
    const g = c.querySelector(".g"), ro = c.querySelector(".readout");
    let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const draw = () => {
      seed = 7;
      let s = `<rect x="140" y="20" width="200" height="160" rx="14" class="s-mat"/>`;
      for (let y = 26; y < 180; y += 6) s += line(142, y, 338, y, "s-thin", 'stroke-width=".4"');
      for (let k = 0; k < 26; k++) {
        const y = 26 + k * 6;
        let x = m === "aligned" ? 200 : m === "back" ? null : m === "nearest" ? 200 + Math.sin(k * 0.7) * 40 : 150 + rnd() * 180;
        if (x != null) s += `<circle cx="${f(x)}" cy="${y}" r="2.6" style="fill:var(--ng)"/>`;
      }
      if (m === "back") s += text(240, 106, "継ぎ目は裏側", "t-s t-m", "middle");
      s += text(240, 196, "正面から見た円柱（横線＝層）", "t-xs t-m", "middle");
      g.innerHTML = s; ro.textContent = INFO[m];
    };
    H.bindSeg(c, (v) => { m = v; draw(); });
    draw();
  };

  /* ============================================================
     第11章：応用機能
     ============================================================ */
  D.modifier = (fig) => {
    const id = "mod-" + ++uid;
    let s = `<defs><clipPath id="${id}a"><rect x="40" y="30" width="300" height="160" rx="6"/></clipPath><clipPath id="${id}b"><circle cx="270" cy="110" r="46"/></clipPath></defs>`;
    s += `<rect x="40" y="30" width="300" height="160" rx="6" style="fill:var(--paper);stroke:var(--text);stroke-width:2"/>`;
    let sparse = "", dense = "";
    for (let k = -20; k < 30; k++) { sparse += line(40 + k * 24, 190, 40 + k * 24 + 160, 30, "", 'style="stroke:var(--accent-2);stroke-width:2;opacity:.6"'); }
    for (let k = -40; k < 60; k++) { dense += line(200 + k * 6, 160, 200 + k * 6 + 100, 60, "", 'style="stroke:var(--accent);stroke-width:2"'); }
    s += `<g clip-path="url(#${id}a)">${sparse}</g>`;
    s += `<circle cx="270" cy="110" r="46" style="fill:var(--paper)"/><g clip-path="url(#${id}b)">${dense}</g>`;
    s += `<circle cx="270" cy="110" r="46" style="fill:none;stroke:var(--accent);stroke-dasharray:5 3;stroke-width:1.5"/>`;
    s += `<circle cx="270" cy="110" r="12" style="fill:var(--fig-bg);stroke:var(--text);stroke-width:1.5"/>`;
    s += note(300, 76, 380, 50, "モディファイア（円柱）") + note(270, 110, 380, 110, "ネジ穴") + note(100, 150, 380, 170, "通常部分：15%");
    s += text(380, 66, "範囲内だけ密度 60%", "t-xs t-acc");
    cv(fig).innerHTML = svg("0 0 480 210", s);
  };

  D.pause = (fig) => {
    const frame = (ox, n, nut, done) => {
      let s = "";
      for (let k = 0; k < n; k++) {
        const y = 170 - (k + 1) * 9;
        if (k >= 5 && k < 10) s += `<rect x="${ox}" y="${y}" width="40" height="8" class="s-mat"/><rect x="${ox + 80}" y="${y}" width="40" height="8" class="s-mat"/>`;
        else s += `<rect x="${ox}" y="${y}" width="120" height="8" class="${k >= 10 ? "s-mat2" : "s-mat"}"/>`;
      }
      if (nut) s += `<rect x="${ox + 43}" y="${170 - 10 * 9 + 2}" width="34" height="40" rx="2" style="fill:var(--ink);opacity:.8"/>`;
      return s + line(ox - 10, 170, ox + 130, 170, "s-line");
    };
    let s = frame(20, 10, false) + frame(180, 10, true) + frame(340, 14, true);
    s += `<path d="M232 30 v30" class="s-acc-l" marker-end="url(#ar-acc)"/>` + text(240, 24, "ナットを入れる", "t-xs t-acc", "middle");
    s += text(80, 194, "1. 指定の層で一時停止", "t-xs", "middle") + text(240, 194, "2. 部品を挿入", "t-xs", "middle") + text(400, 194, "3. 再開して上を覆う", "t-xs", "middle");
    cv(fig).innerHTML = svg("0 0 480 205", s);
  };

  D.ams = (fig) => {
    const cols = ["var(--accent)", "var(--ink)", "var(--accent-2)", "var(--text)"];
    let s = `<rect x="20" y="20" width="200" height="80" rx="6" class="s-line" style="fill:var(--paper)"/>` + text(30, 16, "AMS（4スロット）", "t-xs t-m");
    cols.forEach((col, i) => {
      s += `<circle cx="${50 + i * 46}" cy="60" r="18" style="fill:none;stroke:${col};stroke-width:6"/>`;
      s += `<path d="M${50 + i * 46} 78 C ${50 + i * 46} 120, 120 110, 120 130" style="fill:none;stroke:${col};stroke-width:1.6"/>`;
    });
    s += `<path d="M120 130 C 120 160, 300 40, 330 60" class="s-line" style="stroke-width:2.4"/>`;
    s += `<rect x="318" y="60" width="40" height="34" class="s-mat2"/>` + poly([[332, 94], [344, 94], [338, 104]], "s-mat2") + text(364, 76, "ヘッド", "t-xs");
    s += `<rect x="300" y="160" width="160" height="8" class="s-mat2"/>`;
    s += `<rect x="410" y="110" width="30" height="50" style="fill:url(#hatch);stroke:var(--text)"/>` + text(425, 104, "プライムタワー", "t-xs t-m", "middle");
    s += `<path d="M338 110 q-10 30 -40 40" class="s-dash" marker-end="url(#ar)"/>` + text(250, 150, "色替えのたびに旧色を排出", "t-xs t-m", "end");
    cv(fig).innerHTML = svg("0 0 480 185", s);
  };

  /* ============================================================
     第12章：印刷
     ============================================================ */
  D.send = (fig) => {
    let s = `<rect x="20" y="70" width="80" height="54" rx="3" class="s-line" style="fill:var(--paper)"/>` + text(60, 102, "PC", "t-s t-b", "middle");
    s += `<rect x="380" y="62" width="80" height="70" rx="3" class="s-mat2"/>` + text(420, 102, "プリンタ", "t-s t-b", "middle");
    s += `<path d="M100 82 C 160 20, 320 20, 380 76" class="s-line" marker-end="url(#ar)"/>` + `<path d="M216 34 a14 14 0 0 1 26 -6 a12 12 0 0 1 20 10 a10 10 0 0 1 -4 18 h-40 a10 10 0 0 1 -2 -22 z" class="s-line" style="fill:var(--paper)"/>` + text(240, 72, "クラウド経由", "t-xs", "middle");
    s += line(100, 98, 380, 98, "s-line", 'marker-end="url(#ar)"') + text(240, 92, "LAN（同じネットワーク）", "t-xs", "middle");
    s += `<path d="M100 114 C 160 176, 320 176, 380 120" class="s-line" marker-end="url(#ar)"/>` + `<path d="M228 140 h20 l6 6 v22 h-26 z" class="s-line" style="fill:var(--paper)"/>` + text(240, 188, "microSD で持ち運び", "t-xs", "middle");
    cv(fig).innerHTML = svg("0 0 480 195", s);
  };

  /* ============================================================
     第13章：症状から逆引き
     ============================================================ */
  const TR = [
    { s: "第一層がくっつかない・途中で剥がれる", t: ["第一層"], c: "プレートの皮脂・ほこり、プレート種類の設定違い、ベッド温度不足。",
      d: ["接地面を広く平らにする", "底面の角を丸めて剥がれのきっかけを減らす"], g: ["プレートを中性洗剤と水で洗う", "プリンタ設定のプレート種類を実物に合わせる", "ブリムを付ける", "必要ならベッド温度を上げる"], l: [["ブリム", "ch-slice/7"], ["印刷前チェック", "ch-print/3"]] },
    { s: "角が反り上がる", t: ["反り", "第一層"], c: "冷えて縮む力。ABS・ASA や大きな平面で起きやすい。",
      d: ["外形の角を R3 以上で丸める", "大きく平らな底面を避ける"], g: ["ブリムまたは耳を付ける", "密閉型はカバーを閉める", "ABS 系は冷却ファンを弱める"], l: [["ブリム", "ch-slice/7"], ["材料", "ch-fdm/6"]] },
    { s: "細い糸が張る（糸引き）", t: ["外観"], c: "フィラメントの吸湿、温度が高い。PETG・TPU で多い。",
      d: ["離れた小さな島を減らす"], g: ["フィラメントを乾燥する", "ノズル温度を 5〜10℃ 下げる", "リトラクション設定がプリセット通りか確認"], l: [["材料", "ch-fdm/6"]] },
    { s: "せり出した部分が垂れる", t: ["垂れ"], c: "オーバーハングが急、冷却不足、ブリッジが長い。",
      d: ["45°以内に収める", "面取り・ティアドロップに変える", "向きを変える"], g: ["サポートを付ける", "オーバーハング部の速度を下げる"], l: [["45°ルール", "ch-dfam/3"], ["サポート", "ch-slice/5"]] },
    { s: "層の境目で割れる・折れる", t: ["強度"], c: "力の向きが積層方向と同じ。層間の溶着不足。",
      d: ["力が層に沿うように向きを変える", "根元にフィレットを付ける"], g: ["壁の数を増やす", "温度を少し上げ、冷却を弱める"], l: [["異方性", "ch-fdm/5"], ["印刷向き", "ch-dfam/2"]] },
    { s: "穴が小さい・部品がはまらない", t: ["寸法"], c: "穴は内側に、外形は外側にずれやすい。第一層のはみ出し。",
      d: ["クリアランスを変数にして調整", "底面側の穴に面取り"], g: ["品質タブの X-Y 穴補正・輪郭補正", "象の足補正"], l: [["公差", "ch-dfam/6"], ["寸法の出方", "ch-fdm/4"]] },
    { s: "サポートが外れない・跡が汚い", t: ["サポート"], c: "サポートと部品の間隔が狭い、見える面にサポートが当たっている。",
      d: ["サポートが要らない形にする", "サポートの当たる面を見えない側へ"], g: ["ツリーサポートを試す", "サポートペイントで範囲を限定", "上部 Z 距離を確認"], l: [["サポート", "ch-slice/5"], ["ペイント", "ch-bsadv/3"]] },
    { s: "縦に筋が出る（継ぎ目）", t: ["外観"], c: "各層の始点と終点（シーム）がそろって見える。",
      d: ["継ぎ目を隠せる角を設ける"], g: ["シーム位置を背面・整列に", "シームペイントで位置を指定"], l: [["シーム", "ch-slice/8"]] },
    { s: "上面に穴・すき間・模様が出る", t: ["外観"], c: "上面の層が少ない、インフィルが粗い。",
      d: [], g: ["上面の層数を増やす（目安 1mm 以上）", "インフィル密度を少し上げる"], l: [["壁と上下面", "ch-slice/3"]] },
  ];
  D.trouble = (fig) => {
    const c = cv(fig);
    const tags = ["すべて", "第一層", "反り", "垂れ", "強度", "寸法", "サポート", "外観"];
    let cur = "すべて";
    c.innerHTML = `<div class="chips">${tags.map((t) => `<button aria-pressed="${t === cur}">${t}</button>`).join("")}</div><div class="cards"></div>`;
    const cards = c.querySelector(".cards");
    const render = () => {
      cards.innerHTML = TR.filter((x) => cur === "すべて" || x.t.includes(cur)).map((x) => `<div class="trouble-card"><h4>${x.s}</h4>
        <p style="font-size:14px;color:var(--muted);margin-bottom:4px">原因：${x.c}</p>
        <div class="two"><div><h5>設計で直す（FreeCAD）</h5><ul>${x.d.map((v) => `<li>${v}</li>`).join("") || "<li>—</li>"}</ul></div>
        <div><h5>設定で直す（Bambu Studio）</h5><ul>${x.g.map((v) => `<li>${v}</li>`).join("")}</ul></div></div>
        <p style="font-size:13px">関連：${x.l.map(([n, h]) => `<a href="#${h}">${n}</a>`).join("　")}</p></div>`).join("");
    };
    c.querySelector(".chips").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      cur = b.textContent; c.querySelectorAll(".chips button").forEach((x) => x.setAttribute("aria-pressed", x === b)); render();
    });
    render();
  };

  /* ============================================================
     第14章：総合演習
     ============================================================ */
  D.casesec = (fig) => {
    let s = `<path d="M60 220 V90 H84 V196 H316 V90 H340 V220 Z" class="s-mat"/>`;
    s += `<path d="M50 60 H350 V80 H316 V140 H310 V80 H90 V140 H84 V80 H50 Z" class="s-mat2" transform="translate(0,-6)"/>`;
    s += dimH(60, 340, 236 + 8, "width", 222);
    s += dimV(30, 90, 220, "height", 58, -1);
    s += note(72, 150, 20, 160, "wall", "end");
    s += note(200, 208, 200, 150, "floor", "middle");
    s += note(87, 110, 140, 30, "clr（片側）");
    s += note(320, 100, 400, 100, "lip（フタの爪）");
    s += text(400, 230, "断面図・変数名で表記", "t-xs t-m", "middle");
    cv(fig).innerHTML = svg("0 0 480 255", s);
  };

  D.testpiece = (fig) => {
    const C = [0.1, 0.15, 0.2, 0.25, 0.3, 0.4];
    let s = `<rect x="20" y="20" width="440" height="70" rx="4" class="s-mat"/><rect x="20" y="120" width="440" height="70" rx="4" class="s-mat"/>`;
    C.forEach((cl, i) => {
      const x = 56 + i * 72;
      s += `<circle cx="${x}" cy="55" r="${f(18 + cl * 20)}" style="fill:var(--fig-bg);stroke:var(--text)"/>` + text(x, 108, cl.toFixed(2), "t-xs t-b", "middle");
      s += `<circle cx="${x}" cy="155" r="18" class="s-mat2"/>`;
    });
    s += text(470, 58, "穴", "t-xs t-m") + text(470, 158, "軸 φ5", "t-xs t-m");
    s += text(240, 208, "穴径 ＝ 5 ＋ 2×すき間。はまり具合を手で確かめ、ちょうどよい値を clr に入れる。", "t-xs t-m", "middle");
    cv(fig).innerHTML = svg("0 0 500 215", s);
  };
})();
