/* ============================================================
   図版（SVG・D3）共通ヘルパー + 第0〜3章の図
   window.Demos[名前] = (figure要素) => void
   ============================================================ */
(function () {
  "use strict";
  const D = (window.Demos = window.Demos || {});
  const NS = "http://www.w3.org/2000/svg";

  /* ---------- 共通定義（矢印・ハッチング） ---------- */
  document.body.insertAdjacentHTML("afterbegin", `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" style="fill:var(--text)"/></marker>
    <marker id="ar-ink" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,1.5 L10,5 L0,8.5 z" style="fill:var(--ink)"/></marker>
    <marker id="ar-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" style="fill:var(--accent)"/></marker>
    <marker id="ar-grn" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" style="fill:var(--accent-2)"/></marker>
    <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" style="stroke:var(--muted);stroke-width:.9"/></pattern>
    <pattern id="hatch-acc" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="5" style="stroke:var(--accent);stroke-width:1"/></pattern>
  </defs></svg>`);

  const H = (window.FigHelpers = {});
  H.cv = (fig) => {
    let c = fig.querySelector(".canvas");
    if (!c) { c = document.createElement("div"); c.className = "canvas"; fig.prepend(c); }
    return c;
  };
  H.svg = (vb, inner, attrs = "") => `<svg viewBox="${vb}" xmlns="${NS}" ${attrs}>${inner}</svg>`;
  H.f = (n, d = 1) => Number(n).toFixed(d);
  H.pts = (arr) => arr.map((p) => `${H.f(p[0])},${H.f(p[1])}`).join(" ");
  H.poly = (arr, cls = "s-mat", extra = "") => `<polygon points="${H.pts(arr)}" class="${cls}" ${extra}/>`;
  H.text = (x, y, s, cls = "t-s", anchor = "start", extra = "") => `<text x="${H.f(x)}" y="${H.f(y)}" class="${cls}" text-anchor="${anchor}" ${extra}>${s}</text>`;
  H.line = (x1, y1, x2, y2, cls = "s-line", extra = "") => `<line x1="${H.f(x1)}" y1="${H.f(y1)}" x2="${H.f(x2)}" y2="${H.f(y2)}" class="${cls}" ${extra}/>`;
  // 寸法線（水平・垂直）
  H.dimH = (x1, x2, y, label, ext) => {
    let s = "";
    if (ext != null) s += H.line(x1, ext, x1, y + 4, "s-dim", 'stroke-width=".6"') + H.line(x2, ext, x2, y + 4, "s-dim", 'stroke-width=".6"');
    return s + H.line(x1, y, x2, y, "s-dim", 'marker-start="url(#ar-ink)" marker-end="url(#ar-ink)"') + H.text((x1 + x2) / 2, y - 4, label, "t-s t-ink", "middle");
  };
  H.dimV = (x, y1, y2, label, ext, side = 1) => {
    let s = "";
    if (ext != null) s += H.line(ext, y1, x + 4 * side, y1, "s-dim", 'stroke-width=".6"') + H.line(ext, y2, x + 4 * side, y2, "s-dim", 'stroke-width=".6"');
    return s + H.line(x, y1, x, y2, "s-dim", 'marker-start="url(#ar-ink)" marker-end="url(#ar-ink)"') +
      H.text(x + 6 * side, (y1 + y2) / 2 + 4, label, "t-s t-ink", side > 0 ? "start" : "end");
  };
  // 引出線付きの注記
  H.note = (x1, y1, x2, y2, label, anchor = "start", cls = "t-s") =>
    H.line(x1, y1, x2, y2, "s-thin") + `<circle cx="${H.f(x1)}" cy="${H.f(y1)}" r="2" style="fill:var(--muted)"/>` +
    H.text(x2 + (anchor === "start" ? 4 : anchor === "end" ? -4 : 0), y2 + 4, label, cls, anchor);
  // 等角投影
  H.iso = (s = 1, ox = 0, oy = 0) => {
    const c = Math.cos(Math.PI / 6);
    // FreeCAD のアイソメ（+X・−Y・+Z 側から見る）と同じ向き
    return (x, y, z) => [ox + (x + y) * c * s, oy + (x - y) * 0.5 * s - z * s];
  };
  // 等角の直方体（見える3面）
  H.isoBox = (P, x, y, z, w, d, h, cls = ["s-top", "s-mat", "s-mat2"]) => {
    const top = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
    const right = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)];
    const front = [P(x, y, z), P(x + w, y, z), P(x + w, y, z + h), P(x, y, z + h)];
    return H.poly(front, cls[1]) + H.poly(right, cls[2]) + H.poly(top, cls[0]);
  };
  // XY平面上の円（等角では楕円）
  H.isoCircle = (P, cx, cy, z, r, cls = "s-line", n = 40) => {
    const p = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; p.push(P(cx + r * Math.cos(a), cy + r * Math.sin(a), z)); }
    return H.poly(p, cls);
  };
  // 表示中だけ動くアニメーション
  H.animate = (fig, step) => {
    let on = false, raf = 0, last = 0;
    const tick = (t) => {
      if (!on) return;
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t; step(dt); raf = requestAnimationFrame(tick);
    };
    new IntersectionObserver((es) => {
      const v = es[0].isIntersecting;
      if (v && !on) { on = true; last = performance.now(); raf = requestAnimationFrame(tick); }
      else if (!v && on) { on = false; cancelAnimationFrame(raf); }
    }).observe(fig);
  };
  // セグメントボタン
  H.seg = (items, cur, name = "") => `<span class="seg" role="group" aria-label="${name}">${items.map(([v, l]) =>
    `<button type="button" data-v="${v}" aria-pressed="${v === cur}">${l}</button>`).join("")}</span>`;
  H.bindSeg = (root, cb) => root.querySelectorAll(".seg").forEach((g) => g.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    g.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    cb(b.dataset.v, g);
  }));
  // D3 の遅延読み込み
  let d3p = null;
  H.d3 = () => d3p || (d3p = new Promise((res, rej) => {
    if (window.d3) return res(window.d3);
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js";
    s.onload = () => res(window.d3); s.onerror = rej; document.head.append(s);
  }));
  // WebGL 図（three.js）は別モジュールを遅延読み込み
  H.three = (name) => (fig) => {
    const c = H.cv(fig);
    c.innerHTML = `<div class="fig-loading">3D表示を準備中…</div>`;
    import("./three-demos.js").then((m) => { c.innerHTML = ""; m[name](fig, c); })
      .catch((e) => { console.error(e); c.innerHTML = `<div class="fig-loading">3D表示を読み込めない（WebGL 非対応の可能性）</div>`; });
  };
  ["views", "parambox", "orient", "slice"].forEach((n) => (D[n] = H.three(n)));

  const { cv, svg, f, poly, text, line, dimH, dimV, note, iso, isoBox } = H;

  /* ============================================================
     第0章
     ============================================================ */
  const ICON = {
    sketch: `<rect x="9" y="17" width="30" height="20" class="s-line"/><circle cx="17" cy="27" r="3.5" class="s-line"/>
      <line x1="9" y1="10" x2="39" y2="10" class="s-dim" marker-start="url(#ar-ink)" marker-end="url(#ar-ink)"/>`,
    solid: (() => { const P = iso(1, 24, 22); return isoBox(P, -10, -10, 0, 20, 20, 14); })(),
    dfam: `<path d="M8 40 H20 V30 l6 -6 l6 -6 l6 -6" class="s-line"/><path d="M20 30 v-14" class="s-dash"/>
      <path d="M20 22 a8 8 0 0 0 5.6 2.4" class="s-acc-l"/><line x1="4" y1="40" x2="44" y2="40" class="s-thin"/>`,
    export: `<path d="M12 6 H30 L38 14 V42 H12 Z" class="s-line"/><path d="M30 6 V14 H38" class="s-line"/>
      <text x="25" y="33" text-anchor="middle" style="font-size:9px;font-weight:700">3MF</text>`,
    slice: [0, 1, 2, 3].map((k) => `<path d="M8 ${36 - k * 7} l16 -6 l16 6 l-16 6 z" class="${k === 3 ? "s-top" : "s-mat"}"/>`).join(""),
    print: `<path d="M17 6 H31 V18 H17 Z" class="s-mat2"/><path d="M20 18 H28 L24 25 Z" class="s-mat2"/>
      <line x1="8" y1="34" x2="40" y2="34" class="s-acc-l"/><line x1="8" y1="38" x2="40" y2="38" class="s-line"/><line x1="8" y1="42" x2="40" y2="42" class="s-line"/>`,
  };
  D.workflow = (fig) => {
    const st = [
      ["ch-sketch", "sketch", "スケッチ", "輪郭と寸法を2Dで決める", "fc"],
      ["ch-partdesign", "solid", "立体化", "押し出し・切り抜き・丸め", "fc"],
      ["ch-dfam", "dfam", "印刷向けの調整", "向き・公差・オーバーハング", "fc"],
      ["ch-export", "export", "書き出し", "STEP／3MF／STL", "fc"],
      ["ch-slice", "slice", "スライス", "層ごとの経路を作る", "bs"],
      ["ch-print", "print", "印刷・仕上げ", "送信・監視・後処理", "bs"],
    ];
    cv(fig).innerHTML = `<ol class="wf">${st.map(([id, ic, t, d, side], k) => `
      <li class="wf-${side}"><a href="#${id}">
        <svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true">${ICON[ic]}</svg>
        <span><small>${k + 1}　${side === "fc" ? "FreeCAD" : "Bambu Studio"}</small><b>${t}</b>${d}</span></a></li>`).join("")}
      </ol>
      <p class="wf-back">うまくいかないときの戻り先は、多くの場合 <a href="#ch-dfam">3</a>（形を直す）か <a href="#ch-slice">5</a>（設定を直す）。</p>`;
  };

  /* ============================================================
     第1章
     ============================================================ */
  D.fdm = (fig) => {
    const c = cv(fig);
    c.innerHTML = `<div class="ctrl"><button class="btn" data-a="play">一時停止</button><span class="readout">層 <b class="ln">1</b> / 12</span></div>` +
      svg("0 0 480 300", `<g class="scene"></g>`);
    const g = c.querySelector(".scene"), ln = c.querySelector(".ln");
    const L = 12, LH = 12, X0 = 120, X1 = 300, BED = 262;
    let t = 0, paused = false;
    c.querySelector('[data-a="play"]').onclick = (e) => { paused = !paused; e.target.textContent = paused ? "再生" : "一時停止"; };
    const draw = () => {
      const per = 1.4, k = Math.min(L - 1, Math.floor(t / per)), p = Math.min(1, (t - k * per) / per);
      const dir = k % 2 === 0 ? 1 : -1;
      const nx = dir > 0 ? X0 + (X1 - X0) * p : X1 - (X1 - X0) * p;
      const tipY = BED - LH * (k + 1);
      let s = `<rect x="40" y="${BED}" width="330" height="10" class="s-mat2"/>` +
        text(205, BED + 30, "ビルドプレート（加熱）", "t-s t-m", "middle");
      for (let i = 0; i < k; i++) s += `<rect x="${X0}" y="${BED - LH * (i + 1)}" width="${X1 - X0}" height="${LH - 1}" rx="5" class="s-mat"/>`;
      const a = dir > 0 ? X0 : nx, b = dir > 0 ? nx : X1;
      if (b > a) s += `<rect x="${f(a)}" y="${tipY}" width="${f(b - a)}" height="${LH - 1}" rx="5" style="fill:var(--accent);opacity:.85"/>`;
      // ノズル周り
      s += `<line x1="${f(nx)}" y1="0" x2="${f(nx)}" y2="${tipY - 84}" style="stroke:var(--accent-2);stroke-width:4"/>`;
      for (let i = 0; i < 5; i++) s += `<rect x="${f(nx - 20)}" y="${tipY - 84 + i * 8}" width="40" height="4" class="s-mat2"/>`;
      s += `<rect x="${f(nx - 24)}" y="${tipY - 44}" width="48" height="26" rx="2" style="fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.4"/>`;
      s += poly([[nx - 9, tipY - 18], [nx + 9, tipY - 18], [nx + 2, tipY - 1], [nx - 2, tipY - 1]], "s-mat2");
      // 注記（右側固定）
      const lx = 392;
      s += note(nx + 20, tipY - 70, lx, 40, "ヒートシンク") +
        note(nx + 24, tipY - 32, lx, 92, "ヒーター 約190〜270℃") +
        note(nx + 4, tipY - 8, lx, 144, "ノズル 穴径 0.4mm") +
        note(X1 - 10, tipY + 6, lx, 196, "いま積んでいる層") +
        note(nx, 18, lx - 120, 18, "フィラメント φ1.75mm", "end");
      g.innerHTML = s;
      ln.textContent = k + 1;
    };
    H.animate(fig, (dt) => {
      if (!paused) { t += dt; if (t > 1.4 * L + 1.2) t = 0; }
      draw();
    });
    draw();
  };

  D.layers = (fig) => {
    const c = cv(fig);
    const HS = [0.08, 0.12, 0.16, 0.2, 0.24, 0.28, 0.32];
    c.innerHTML = `<div class="ctrl"><label>レイヤー高さ <input type="range" min="0" max="6" value="3"></label><output>0.20 mm</output></div>` +
      svg("0 0 480 270", `<g class="g"></g>`) + `<div class="readout"></div>`;
    const r = c.querySelector("input"), out = c.querySelector("output"), g = c.querySelector(".g"), ro = c.querySelector(".readout");
    const draw = () => {
      const h = HS[+r.value], U = 20, x0 = 70, base = 240, R = 10;
      let s = "";
      const n = Math.ceil(R / h - 1e-9);
      for (let k = 0; k < n; k++) {
        const z0 = k * h, zt = Math.min(R, z0 + h), zm = (z0 + zt) / 2;
        const w = Math.sqrt(Math.max(0, R * R - zm * zm));
        s += `<rect x="${x0}" y="${f(base - zt * U)}" width="${f(w * U)}" height="${f((zt - z0) * U)}" class="s-mat" style="stroke-width:.5"/>`;
      }
      s += `<path d="M${x0 + R * U} ${base} A ${R * U} ${R * U} 0 0 0 ${x0} ${base - R * U}" class="s-acc-l" style="stroke-dasharray:5 3"/>`;
      s += line(40, base, 330, base, "s-thin");
      s += note(x0 + 150, base - 140, 330, 70, "設計上の曲面", "start");
      s += note(x0 + 60, base - 192, 330, 40, "上部ほど段差が目立つ", "start");
      s += dimV(x0 - 18, base, base - R * U, "10mm", null, -1);
      g.innerHTML = s;
      out.textContent = h.toFixed(2) + " mm";
      ro.innerHTML = `層数 <b>${n}</b>　印刷時間（0.20mm を 1 とした目安） <b>×${(0.2 / h).toFixed(2)}</b>`;
    };
    r.addEventListener("input", draw); draw();
  };

  D.holes = (fig) => {
    let s = "";
    // 穴
    const ring = (cx, cy, r, n, j) => { const p = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const rr = r + (j ? Math.sin(i * 2.3) * j : 0); p.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); } return p; };
    const hole = ring(120, 110, 60, 22, 1.2);
    s += `<path d="M40 30 H200 V190 H40 Z M${H.pts(hole).split(" ").join(" L")} Z" class="s-mat" fill-rule="evenodd"/>`;
    s += `<circle cx="120" cy="110" r="68" class="s-acc-l" style="stroke-dasharray:5 3"/>`;
    s += text(120, 214, "穴：設計より小さくなる", "t-s t-b", "middle");
    s += line(120, 110, 120 + 68 * 0.707, 110 - 68 * 0.707, "s-dim", 'marker-end="url(#ar-ink)"');
    s += text(124, 104, "設計 φ5.0", "t-xs t-ink");
    // 軸
    s += `<circle cx="360" cy="110" r="76" class="s-mat"/>`;
    s += `<circle cx="360" cy="110" r="68" class="s-acc-l" style="stroke-dasharray:5 3"/>`;
    s += text(360, 214, "軸：設計より太くなる", "t-s t-b", "middle");
    s += line(360, 110, 360 + 68, 110, "s-dim", 'marker-end="url(#ar-ink)"');
    s += text(364, 104, "設計 φ5.0", "t-xs t-ink");
    s += text(250, 110, "点線＝設計値", "t-xs t-m", "middle");
    cv(fig).innerHTML = svg("0 0 480 225", s);
  };

  D.aniso = (fig) => {
    let s = "";
    const bracket = (ox, layered) => {
      let r = `<path d="M${ox} 40 h30 v130 h110 v30 h-140 z" class="s-mat"/>`;
      if (layered) for (let y = 48; y < 200; y += 8) {
        const x2 = y < 170 ? ox + 30 : ox + 140;
        r += line(ox, y, x2, y, "s-thin", 'stroke-width=".6"');
      }
      return r;
    };
    // 左：立てて印刷（層が水平）
    s += bracket(30, true);
    s += line(90, 60, 130, 60, "s-acc-l", 'marker-end="url(#ar-acc)" stroke-width="2.2"');
    s += text(134, 64, "力", "t-s t-acc");
    s += `<path d="M30 168 l6 -3 l6 3 l6 -3 l6 3 l6 -3" style="stroke:var(--ng);stroke-width:2;fill:none"/>`;
    s += text(100, 225, "立てて印刷 → 層の境目で割れる", "t-s t-b", "middle");
    s += line(10, 200, 200, 200, "s-thin");
    s += line(14, 196, 14, 150, "s-dim", 'marker-end="url(#ar-ink)"') + text(18, 150, "積層方向", "t-xs t-ink");
    // 右：寝かせて印刷（層は紙面と平行）
    s += bracket(270, false);
    s += line(330, 60, 370, 60, "s-acc-l", 'marker-end="url(#ar-acc)" stroke-width="2.2"');
    s += text(374, 64, "力", "t-s t-acc");
    s += `<circle cx="440" cy="60" r="7" class="s-dim"/><circle cx="440" cy="60" r="1.8" style="fill:var(--ink)"/>`;
    s += text(440, 84, "積層方向", "t-xs t-ink", "middle") + text(440, 97, "（手前向き）", "t-xs t-ink", "middle");
    s += text(340, 225, "側面を下に印刷 → 割れにくい", "t-s t-b", "middle");
    cv(fig).innerHTML = svg("0 0 480 235", s);
  };

  D.materials = (fig) => {
    const c = cv(fig);
    const M = [
      { n: "PLA", v: [5, 1, 2, 1, 2], noz: "190〜230", bed: "35〜65", heat: "約55℃", use: "試作、室内の小物・治具。最初の1巻に向く。" },
      { n: "PETG", v: [4, 2, 4, 2, 3], noz: "220〜260", bed: "60〜80", heat: "約70℃", use: "実用部品、水まわり。糸を引きやすい。" },
      { n: "ABS", v: [2, 4, 3, 2, 2], noz: "240〜270", bed: "90〜110", heat: "約95℃", use: "耐熱が要る部品。反りやすく、密閉型が望ましい。臭いあり。" },
      { n: "ASA", v: [2, 4, 3, 2, 5], noz: "240〜270", bed: "90〜110", heat: "約95℃", use: "屋外部品（紫外線に強い）。扱いは ABS と同程度。" },
      { n: "TPU", v: [3, 2, 5, 5, 3], noz: "200〜240", bed: "30〜60", heat: "—", use: "ゴム状の部品、滑り止め、緩衝材。低速で印刷する。" },
    ];
    const K = ["扱いやすさ", "耐熱性", "粘り強さ", "柔軟性", "耐候性"];
    c.innerHTML = `<div class="m-wrap"><div class="m-chart"></div><div class="m-radar"></div></div>
      <div class="ctrl" style="margin-top:6px"><label><input type="checkbox" class="m-all" checked> ほかの材料を薄く重ねる</label></div>
      <div class="info-pane"></div>`;
    const pane = c.querySelector(".info-pane");
    let cur = M[0], drawRadar = () => {};
    const show = (m) => {
      cur = m;
      pane.innerHTML = `<b>${m.n}</b>ノズル ${m.noz}℃／ベッド ${m.bed}℃／耐熱の目安 ${m.heat}<br>${m.use}`;
      drawRadar();
    };
    H.d3().then((d3) => {
      const W = 480, rowH = 34, top = 34, left = 64, colW = (W - left) / K.length;
      const svgSel = d3.select(c.querySelector(".m-chart")).append("svg").attr("viewBox", `0 0 ${W} ${top + rowH * M.length + 6}`);
      svgSel.selectAll("text.k").data(K).join("text").attr("class", "t-s t-m").attr("text-anchor", "middle")
        .attr("x", (_, i) => left + colW * i + colW / 2).attr("y", 18).text((d) => d);
      const row = svgSel.selectAll("g.row").data(M).join("g").attr("class", "row hot")
        .attr("transform", (_, i) => `translate(0,${top + i * rowH})`);
      row.append("rect").attr("class", "zone").attr("x", 0).attr("y", 0).attr("width", W).attr("height", rowH - 4).attr("rx", 3);
      row.append("text").attr("class", "t-b").attr("x", 8).attr("y", rowH / 2 + 2).text((d) => d.n);
      row.each(function (m) {
        const g = d3.select(this);
        m.v.forEach((v, ci) => {
          for (let k = 0; k < 5; k++) {
            g.append("circle").attr("cx", left + colW * ci + colW / 2 - 24 + k * 12).attr("cy", rowH / 2 - 2).attr("r", 4.2)
              .attr("style", k < v ? "fill:var(--text)" : "fill:none;stroke:var(--rule)");
          }
        });
      });
      // レーダーチャート
      const R = 92, cx = 150, cy = 128;
      const rs = d3.select(c.querySelector(".m-radar")).append("svg").attr("viewBox", "0 0 300 250");
      const ang = (i) => -Math.PI / 2 + (i / K.length) * Math.PI * 2;
      const pt = (i, v) => [cx + Math.cos(ang(i)) * (R * v) / 5, cy + Math.sin(ang(i)) * (R * v) / 5];
      const grid = rs.append("g");
      for (let lv = 1; lv <= 5; lv++) grid.append("polygon").attr("points", K.map((_, i) => pt(i, lv).join(",")).join(" "))
        .attr("style", `fill:none;stroke:var(--${lv === 5 ? "rule" : "border"});stroke-width:1`);
      K.forEach((k, i) => {
        const [x, y] = pt(i, 5);
        grid.append("line").attr("x1", cx).attr("y1", cy).attr("x2", x).attr("y2", y).attr("style", "stroke:var(--border)");
        const [lx, ly] = pt(i, 6.1);
        grid.append("text").attr("x", lx).attr("y", ly + 4).attr("text-anchor", Math.abs(lx - cx) < 8 ? "middle" : lx > cx ? "start" : "end").attr("class", "t-s").text(k);
      });
      const layer = rs.append("g");
      const all = c.querySelector(".m-all");
      drawRadar = () => {
        const data = all.checked ? [...M.filter((m) => m !== cur), cur] : [cur];
        layer.selectAll("g.shape").data(data, (d) => d.n).join(
          (en) => { const g = en.append("g").attr("class", "shape"); g.append("polygon"); g.append("g").attr("class", "dots"); return g; }
        ).each(function (m) {
          const g = d3.select(this), on = m === cur;
          g.raise();
          g.select("polygon").transition().duration(250).attr("points", m.v.map((v, i) => pt(i, v).join(",")).join(" "))
            .attr("style", on ? "fill:var(--accent);fill-opacity:.22;stroke:var(--accent);stroke-width:2.2" : "fill:none;stroke:var(--faint);stroke-width:1;stroke-dasharray:3 3");
          g.select(".dots").selectAll("circle").data(on ? m.v : []).join("circle").attr("r", 3.4)
            .attr("cx", (v, i) => pt(i, v)[0]).attr("cy", (v, i) => pt(i, v)[1]).attr("style", "fill:var(--accent)");
        });
        rs.selectAll("text.title").data([cur.n]).join("text").attr("class", "title t-b").attr("x", 6).attr("y", 18).text((d) => d);
      };
      all.addEventListener("change", drawRadar);
      row.on("click mouseenter", function (_, m) {
        row.classed("on", (d) => d === m); show(m);
      });
      row.filter((_, i) => i === 0).classed("on", true);
      show(M[0]);
    }).catch(() => { c.querySelector(".m-chart").textContent = "図の読み込みに失敗"; });
  };

  /* ============================================================
     第2章：FreeCAD の画面
     ============================================================ */
  D.fcui = (fig) => {
    const Z = [
      [0, 0, 480, 16, "メニューバー", "全コマンドの入口。消えたパネルは［表示］→［パネル］から、ツールバーは［表示］→［ツールバー］から戻す。"],
      [100, 16, 380, 24, "ツールバー", "選択中のワークベンチ用のツールが並ぶ。ワークベンチを切り替えると中身が入れ替わる。"],
      [0, 16, 100, 24, "ワークベンチ切替", "プルダウンで作業の種類を選ぶ。部品設計は Part Design。"],
      [0, 40, 140, 132, "コンボビュー：モデル", "文書内のオブジェクトと作成履歴（ツリー）。ダブルクリックで再編集。目のアイコン（またはスペースキー）で表示切替。"],
      [0, 172, 140, 128, "プロパティビュー", "選択したオブジェクトの全パラメータ。［データ］は形状の値、［ビュー］は色・透明度など見た目。"],
      [140, 40, 340, 210, "3Dビュー", "形状の表示と選択。面・辺・頂点をクリックで選択、Ctrl+クリックで追加選択。"],
      [416, 46, 58, 58, "ナビゲーションキューブ", "面・辺・角のクリックで標準ビューへ。矢印で90°回転。"],
      [140, 250, 340, 50, "レポートビュー", "警告・エラーの表示先。表示されていなければ［表示］→［パネル］→［レポートビュー］。"],
      [0, 300, 480, 20, "ステータスバー", "右端でナビゲーションスタイル（マウス操作の方式）と単位系を切り替えられる。"],
    ];
    const P = iso(2.2, 300, 150);
    let art = `<rect x="0" y="0" width="480" height="320" class="s-line" style="fill:var(--paper)"/>`;
    art += line(0, 16, 480, 16, "s-thin") + line(0, 40, 480, 40, "s-thin") + line(140, 40, 140, 300, "s-thin") +
      line(0, 172, 140, 172, "s-thin") + line(140, 250, 480, 250, "s-thin") + line(0, 300, 480, 300, "s-thin");
    ["ファイル", "編集", "表示", "ツール", "マクロ", "ヘルプ"].forEach((m, i) => (art += text(8 + i * 42, 12, m, "t-xs t-m")));
    art += `<rect x="6" y="20" width="88" height="16" rx="2" class="s-thin"/>` + text(12, 32, "Part Design ▾", "t-xs");
    for (let i = 0; i < 12; i++) art += `<rect x="${108 + i * 22}" y="21" width="16" height="14" rx="2" class="s-thin"/>`;
    art += `<rect x="4" y="44" width="40" height="13" rx="2" class="s-thin"/>` + text(9, 54, "モデル", "t-xs") + text(52, 54, "タスク", "t-xs t-m");
    ["▾ Body", "　Origin", "　Sketch", "　Pad", "　Sketch001", "　Pocket"].forEach((t, i) => (art += text(8, 76 + i * 15, t, "t-xs")));
    ["プロパティ　値", "Length　10 mm", "Type　Dimension", "Reversed　false"].forEach((t, i) => (art += text(8, 190 + i * 15, t, "t-xs t-m")));
    art += isoBox(P, -20, -14, 0, 40, 28, 16);
    art += `<g transform="translate(445 75)">${isoBox(iso(1, 0, 0), -11, -11, -8, 22, 22, 22)}</g>`;
    art += text(148, 266, "Report view：…", "t-xs t-m");
    art += text(474, 314, "CAD ▾　mm", "t-xs t-m", "end");
    const zones = Z.map(([x, y, w, h], i) => `<g class="hot" data-i="${i}"><rect class="zone" x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" rx="2"/>
      <circle cx="${x + w - 9}" cy="${y + 9}" r="7" style="fill:var(--accent)"/><text x="${x + w - 9}" y="${y + 12.5}" text-anchor="middle" style="font-size:9.5px;font-weight:700;fill:#fff">${i + 1}</text></g>`).join("");
    const c = cv(fig);
    c.innerHTML = svg("0 0 480 320", art + zones) + `<div class="info-pane"></div>`;
    const pane = c.querySelector(".info-pane");
    const sel = (i) => {
      c.querySelectorAll(".hot").forEach((g) => g.classList.toggle("on", +g.dataset.i === i));
      pane.innerHTML = `<b>${i + 1}. ${Z[i][4]}</b>${Z[i][5]}`;
    };
    c.querySelectorAll(".hot").forEach((g) => { g.addEventListener("click", () => sel(+g.dataset.i)); g.addEventListener("mouseenter", () => sel(+g.dataset.i)); });
    sel(3);
  };

  /* ============================================================
     第3章：スケッチ
     ============================================================ */
  D.planes = (fig) => {
    // FreeCAD と同じく、原点を中心にした3平面
    const P = iso(1.75, 220, 175);
    const L = 50;
    let s = "";
    const plane = (pts, v) => H.poly(pts.map((q) => P(...q)), "", `style="fill:var(${v});fill-opacity:.13;stroke:var(${v});stroke-width:1.2"`);
    s += plane([[-L, -L, 0], [L, -L, 0], [L, L, 0], [-L, L, 0]], "--ink");
    s += plane([[0, -L, 0], [0, L, 0], [0, L, L], [0, -L, L]], "--accent-2");
    s += plane([[-L, 0, 0], [L, 0, 0], [L, 0, L], [-L, 0, L]], "--accent");
    const ax = (to, lab) => { const a = P(0, 0, 0), b = P(...to); return line(a[0], a[1], b[0], b[1], "s-line", 'marker-end="url(#ar)"') + text(b[0] + 5, b[1] + 4, lab, "t-s t-b"); };
    s += ax([L + 18, 0, 0], "X") + ax([0, L + 18, 0], "Y") + ax([0, 0, L + 18], "Z");
    const lab = (p, t, cls, anchor = "middle") => { const q = P(...p); return text(q[0], q[1], t, cls, anchor); };
    s += lab([L * 0.55, -L * 0.55, 0], "XY 平面", "t-s t-b t-ink") + lab([L * 0.55, -L * 0.55, -9], "底面・上面の形", "t-xs t-ink");
    s += lab([L * 0.62, 0, L * 0.72], "XZ 平面", "t-s t-b t-acc") + lab([L * 0.62, 0, L * 0.72 - 9], "正面の形", "t-xs t-acc");
    s += lab([0, -L * 0.62, L * 0.72], "YZ 平面", "t-s t-b t-grn") + lab([0, -L * 0.62, L * 0.72 - 9], "側面の形", "t-xs t-grn");
    s += text(430, 292, "+X・−Y・+Z 側から見た向き（FreeCAD のアイソメと同じ）", "t-xs t-m", "end");
    cv(fig).innerHTML = svg("0 0 440 300", s);
  };

  D.sktools = (fig) => {
    const T = [
      ["直線", `<line x1="6" y1="30" x2="34" y2="10" class="s-line"/><circle cx="6" cy="30" r="2.2" class="s-acc"/><circle cx="34" cy="10" r="2.2" class="s-acc"/>`],
      ["ポリライン", `<path d="M5 32 L14 10 L26 26 L35 8" class="s-line"/>`],
      ["長方形", `<rect x="6" y="10" width="28" height="20" class="s-line"/>`],
      ["円", `<circle cx="20" cy="20" r="13" class="s-line"/><circle cx="20" cy="20" r="1.8" class="s-acc"/>`],
      ["円弧", `<path d="M7 28 A 15 15 0 0 1 33 28" class="s-line"/><circle cx="20" cy="31" r="1.8" class="s-acc"/>`],
      ["長穴", `<path d="M12 12 H28 A8 8 0 0 1 28 28 H12 A8 8 0 0 1 12 12 Z" class="s-line"/>`],
      ["フィレット", `<path d="M6 32 V18 A10 10 0 0 1 16 8 H34" class="s-line"/>`],
      ["構築線", `<line x1="5" y1="20" x2="35" y2="20" style="stroke:var(--ink);stroke-dasharray:4 3;stroke-width:1.4"/><circle cx="20" cy="20" r="11" style="stroke:var(--ink);stroke-dasharray:4 3;fill:none"/>`],
    ];
    cv(fig).innerHTML = `<ul class="icon-grid">${T.map(([n, i]) => `<li><svg viewBox="0 0 40 40" width="40" height="40">${i}</svg><span>${n}</span></li>`).join("")}</ul>`;
  };

  // 拘束と自由度
  D.constraints = (fig) => {
    const c = cv(fig);
    const C = [
      ["coin", "一致（4角）", 8], ["horiz", "水平（上下の辺）", 2], ["vert", "垂直（左右の辺）", 2],
      ["w", "距離：幅 40mm", 1], ["h", "距離：高さ 24mm", 1], ["org", "原点に一致", 2],
    ];
    const on = {};
    c.innerHTML = `<div class="ctrl cbtns">${C.map(([k, l]) => `<button class="btn" data-k="${k}" aria-pressed="false">${l}</button>`).join("")}
      <button class="btn" data-k="reset">はじめから</button></div>` + svg("0 0 420 250", `<g class="g"></g>`) + `<div class="readout"></div>`;
    const g = c.querySelector(".g"), ro = c.querySelector(".readout");
    const S = 4, OX = 70, OY = 200; // 1mm = 4px、原点(70,200)
    const base = [[18, 8], [62, 4], [57, 33], [13, 28]]; // ゆがんだ四角（mm）
    let cur = base.map((p) => p.slice()), anim = null;
    const target = () => {
      let p = base.map((q) => q.slice());
      if (on.horiz) { const a = (p[0][1] + p[1][1]) / 2, b = (p[2][1] + p[3][1]) / 2; p[0][1] = p[1][1] = a; p[2][1] = p[3][1] = b; }
      if (on.vert) { const a = (p[1][0] + p[2][0]) / 2, b = (p[0][0] + p[3][0]) / 2; p[1][0] = p[2][0] = a; p[0][0] = p[3][0] = b; }
      if (on.w && on.horiz && on.vert) { p[1][0] = p[2][0] = p[0][0] + 40; }
      if (on.h && on.horiz && on.vert) { p[2][1] = p[3][1] = p[0][1] + 24; }
      if (on.org) { const dx = p[0][0], dy = p[0][1]; p = p.map((q) => [q[0] - dx, q[1] - dy]); }
      return p;
    };
    const dof = () => 16 - C.reduce((s, [k, , n]) => s + (on[k] ? n : 0), 0);
    const render = () => {
      const X = (q) => OX + q[0] * S, Y = (q) => OY - q[1] * S;
      const full = dof() === 0;
      const col = full ? "var(--ok)" : "var(--text)";
      let s = line(OX - 40, OY, OX + 300, OY, "s-dash") + line(OX, OY + 30, OX, OY - 180, "s-dash");
      s += `<circle cx="${OX}" cy="${OY}" r="3" style="fill:var(--ink)"/>` + text(OX - 6, OY + 16, "原点", "t-xs t-ink", "end");
      for (let i = 0; i < 4; i++) {
        let a = cur[i], b = cur[(i + 1) % 4];
        if (!on.coin) { // 端点がずれて離れている
          const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
          a = [a[0] + (dx / L) * 1.6 + (i % 2 ? 0.8 : -0.8), a[1] + (dy / L) * 1.6 + 0.7];
          b = [b[0] - (dx / L) * 1.6, b[1] - (dy / L) * 1.6 - 0.6];
        }
        s += `<line x1="${f(X(a))}" y1="${f(Y(a))}" x2="${f(X(b))}" y2="${f(Y(b))}" style="stroke:${col};stroke-width:2.2"/>`;
        s += `<circle cx="${f(X(a))}" cy="${f(Y(a))}" r="2.6" style="fill:${col}"/><circle cx="${f(X(b))}" cy="${f(Y(b))}" r="2.6" style="fill:${col}"/>`;
      }
      const mid = (i, j) => [(X(cur[i]) + X(cur[j])) / 2, (Y(cur[i]) + Y(cur[j])) / 2];
      const badge = (p, t) => `<rect x="${f(p[0] - 8)}" y="${f(p[1] - 8)}" width="16" height="16" rx="2" style="fill:var(--accent)"/>` + text(p[0], p[1] + 4, t, "", "middle", 'style="font-size:10px;font-weight:700;fill:#fff"');
      if (on.horiz) { const m1 = mid(0, 1), m2 = mid(2, 3); s += badge([m1[0], m1[1] + 14], "H") + badge([m2[0], m2[1] - 14], "H"); }
      if (on.vert) { const m1 = mid(1, 2), m2 = mid(3, 0); s += badge([m1[0] + 14, m1[1]], "V") + badge([m2[0] - 14, m2[1]], "V"); }
      if (on.w && on.horiz && on.vert) s += dimH(X(cur[3]), X(cur[2]), Y(cur[3]) - 16, "40 mm", Y(cur[3]) - 2);
      if (on.h && on.horiz && on.vert) s += dimV(X(cur[1]) + 34, Y(cur[1]), Y(cur[2]), "24 mm", X(cur[1]) + 2);
      g.innerHTML = s;
      const n = dof();
      ro.innerHTML = full ? `<span class="st-ok">完全拘束（自由度 0）</span>　線の色が変わり、形と位置が確定した状態。`
        : `残りの自由度 <b>${n}</b>　${on.coin ? "" : "端点が離れている（輪郭が閉じていない）。"}${(on.w || on.h) && !(on.horiz && on.vert) ? "寸法は水平・垂直を決めてから入れると素直に効く。" : ""}`;
    };
    const go = () => {
      const from = cur.map((p) => p.slice()), to = target(), t0 = performance.now();
      cancelAnimationFrame(anim);
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 350), e = 1 - Math.pow(1 - k, 3);
        cur = from.map((p, i) => [p[0] + (to[i][0] - p[0]) * e, p[1] + (to[i][1] - p[1]) * e]);
        render(); if (k < 1) anim = requestAnimationFrame(step);
      };
      anim = requestAnimationFrame(step);
    };
    c.querySelector(".cbtns").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const k = b.dataset.k;
      if (k === "reset") { Object.keys(on).forEach((x) => delete on[x]); c.querySelectorAll(".cbtns [data-k]").forEach((x) => x.setAttribute("aria-pressed", "false")); }
      else { on[k] = !on[k]; b.setAttribute("aria-pressed", !!on[k]); }
      go();
    });
    render();
  };

  D.keytag = (fig) => {
    const U = 7, x0 = 60, y0 = 40, W = 50 * U, Ht = 20 * U, R = 4 * U;
    let s = `<rect x="${x0}" y="${y0}" width="${W}" height="${Ht}" rx="${R}" class="s-mat"/>`;
    s += `<circle cx="${x0 + 7 * U}" cy="${y0 + Ht / 2}" r="${2.5 * U}" style="fill:var(--fig-bg);stroke:var(--text);stroke-width:1.2"/>`;
    s += line(x0 + 7 * U, y0 - 6, x0 + 7 * U, y0 + Ht + 6, "s-dash") + line(x0 - 8, y0 + Ht / 2, x0 + W + 8, y0 + Ht / 2, "s-dash");
    s += `<text x="${x0 + 30 * U}" y="${y0 + Ht / 2 + 9}" text-anchor="middle" style="font-size:26px;font-weight:700;fill:none;stroke:var(--muted);stroke-width:1">TAG</text>`;
    s += dimH(x0, x0 + W, y0 + Ht + 28, "50", y0 + Ht + 2);
    s += dimV(x0 + W + 22, y0, y0 + Ht, "20", x0 + W + 2);
    s += dimH(x0, x0 + 7 * U, y0 - 16, "7", y0 + Ht / 2);
    s += note(x0 + 7 * U + 2.5 * U * 0.7, y0 + Ht / 2 - 2.5 * U * 0.7, x0 + 110, y0 - 22, "φ5");
    s += note(x0 + W - R * 0.3, y0 + R * 0.3, x0 + W - 10, y0 - 22, "R4", "end");
    s += note(x0 + 30 * U + 40, y0 + Ht / 2 + 4, x0 + 30 * U + 60, y0 + Ht + 48, "文字：深さ 0.6 のポケット");
    s += text(x0, y0 + Ht + 64, "板厚 3（単位 mm）", "t-xs t-m");
    cv(fig).innerHTML = svg("0 0 480 255", s);
  };
})();
