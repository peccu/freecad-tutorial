/* ============================================================
   第4〜8章の図
   ============================================================ */
(function () {
  "use strict";
  const D = window.Demos, H = window.FigHelpers;
  const { cv, svg, f, poly, text, line, dimH, dimV, note, iso, isoBox } = H;
  const mini = (items, vb = "0 0 200 140") => `<div class="mini-grid">${items.map(([t, s, d]) =>
    `<div><div class="mini-svg">${svg(vb, s)}</div><b>${t.split("|")[0]}${t.includes("|") ? `<span class="en">${t.split("|")[1]}</span>` : ""}</b>${d ? `<span>${d}</span>` : ""}</div>`).join("")}</div>`;

  /* ============================================================
     第4章：Part Design
     ============================================================ */
  D.history = (fig) => {
    const c = cv(fig);
    const F = [
      ["Sketch", "スケッチ：底面の長方形"], ["Pad", "パッド：高さ 20mm"], ["Sketch001", "スケッチ：上面に円"],
      ["Pocket", "ポケット：円で貫通"], ["Fillet", "フィレット：上の辺を丸める"],
    ];
    let tip = F.length - 1;
    c.innerHTML = `<div class="two wide-left"><div class="hist-svg"></div><div><div class="tree">
      <div class="tree-row muted">▾ Body</div><div class="tree-row muted">　　Origin</div>
      ${F.map(([n], i) => `<button class="tree-row" data-i="${i}">　　${n}<span class="tipmark"> ◀ Tip</span></button>`).join("")}
      </div><div class="readout"></div></div></div>`;
    const area = c.querySelector(".hist-svg"), ro = c.querySelector(".readout");
    const P = iso(2.3, 210, 95);
    const render = () => {
      let s = "";
      const w = 60, d = 36, h = 20, x = -30, y = -18;
      if (tip === 0) s += H.poly([P(x, y, 0), P(x + w, y, 0), P(x + w, y + d, 0), P(x, y + d, 0)], "", 'style="fill:none;stroke:var(--ink);stroke-width:1.6"');
      else if (tip < 4) s += isoBox(P, x, y, 0, w, d, h);
      else {
        const r = 4;
        s += isoBox(P, x, y, 0, w, d, h - r);
        // 丸めた上辺（模式）
        s += H.poly([P(x, y, h - r), P(x + w, y, h - r), P(x + w - r * 0.2, y + r * 0.2, h), P(x + r * 0.2, y + r * 0.2, h)], "s-mat");
        s += H.poly([P(x + w, y, h - r), P(x + w, y + d, h - r), P(x + w - r * 0.2, y + d - r * 0.2, h), P(x + w - r * 0.2, y + r * 0.2, h)], "s-mat2");
        s += H.poly([P(x + r * 0.2, y + r * 0.2, h), P(x + w - r * 0.2, y + r * 0.2, h), P(x + w - r * 0.2, y + d - r * 0.2, h), P(x + r * 0.2, y + d - r * 0.2, h)], "s-top");
      }
      if (tip === 2) s += H.isoCircle(P, 0, 0, h, 9, "", 40).replace("<polygon", '<polygon style="fill:none;stroke:var(--ink);stroke-width:1.6"');
      if (tip >= 3) s += H.isoCircle(P, 0, 0, h, 9, "s-mat2");
      area.innerHTML = svg("0 0 420 200", s);
      c.querySelectorAll(".tree-row[data-i]").forEach((b) => {
        const i = +b.dataset.i;
        b.classList.toggle("is-tip", i === tip); b.classList.toggle("after", i > tip);
      });
      ro.innerHTML = `<b>${F[tip][1]}</b><br>${tip < F.length - 1 ? "Tip より下のフィーチャは計算されず、形状に反映されない。" : "最後のフィーチャが Tip。これがボディの最終形状。"}`;
    };
    c.querySelector(".tree").addEventListener("click", (e) => {
      const b = e.target.closest("[data-i]"); if (!b) return; tip = +b.dataset.i; render();
    });
    render();
  };

  D.addfeat = (fig) => {
    const P = iso(1.6, 100, 78);
    const pad = H.poly([P(-25, -15, 0), P(25, -15, 0), P(25, 15, 0), P(-25, 15, 0)], "", 'style="fill:none;stroke:var(--ink);stroke-dasharray:4 3;stroke-width:1.4"') +
      isoBox(P, -25, -15, 0, 50, 30, 22).replace(/class="s-/g, 'style="opacity:.92" class="s-') +
      line(...P(25, -15, 0), ...P(25, -15, 30), "s-acc-l", 'marker-end="url(#ar-acc)"');
    const rev = `<path d="M100 22 L100 128" class="s-dash"/><path d="M100 30 h22 q-6 30 10 55 q10 20 -6 43 h-26" style="fill:none;stroke:var(--ink);stroke-width:1.6"/>
      <path d="M100 30 h-22 q6 30 -10 55 q-10 20 6 43 h26" class="s-thin"/>
      <ellipse cx="100" cy="30" rx="22" ry="6" class="s-thin"/><ellipse cx="100" cy="128" rx="26" ry="7" class="s-thin"/>
      <path d="M136 50 a40 12 0 0 1 -16 18" class="s-acc-l" marker-end="url(#ar-acc)"/>`;
    const loft = H.poly([P(-22, -22, 0), P(22, -22, 0), P(22, 22, 0), P(-22, 22, 0)], "s-thin") +
      H.isoCircle(P, 0, 0, 40, 14, "", 36).replace("<polygon", '<polygon style="fill:none;stroke:var(--ink);stroke-width:1.6"') +
      [[-22, -22], [22, -22], [22, 22], [-22, 22]].map(([x, y]) => { const a = P(x, y, 0), b = P(x * 0.64, y * 0.64, 40); return line(a[0], a[1], b[0], b[1], "s-thin"); }).join("");
    const pipe = `<path d="M30 120 C 70 120, 80 40, 170 36" class="s-dash"/>` +
      [0, 0.25, 0.5, 0.75, 1].map((t) => {
        const x = (1 - t) ** 3 * 30 + 3 * (1 - t) ** 2 * t * 70 + 3 * (1 - t) * t * t * 80 + t ** 3 * 170;
        const y = (1 - t) ** 3 * 120 + 3 * (1 - t) ** 2 * t * 120 + 3 * (1 - t) * t * t * 40 + t ** 3 * 36;
        return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="6" ry="13" transform="rotate(${f(-50 * t + 10)} ${f(x)} ${f(y)})" style="fill:none;stroke:${t === 0 ? "var(--ink)" : "var(--muted)"};stroke-width:${t === 0 ? 1.6 : 1}"/>`;
      }).join("");
    cv(fig).innerHTML = mini([
      ["パッド|Pad", pad, "スケッチを押し出す"], ["回転|Revolution", rev, "断面を軸まわりに回す"],
      ["ロフト|Additive Loft", loft, "2つ以上の断面をつなぐ"], ["パイプ|Additive Pipe", pipe, "断面を経路に沿わせる"],
    ]);
  };

  D.holes2 = (fig) => {
    const T = 60, B = 130;
    let s = `<rect x="10" y="${T}" width="460" height="${B - T}" style="fill:url(#hatch);stroke:var(--text);stroke-width:1.2"/>`;
    const cut = (d) => `<path d="${d}" style="fill:var(--fig-bg);stroke:var(--text);stroke-width:1.2"/>`;
    s += cut(`M58 ${T} h24 v${B - T} h-24 z`);
    s += cut(`M163 ${T} h44 v20 h-10 v${B - T - 20} h-24 v-${B - T - 20} h-10 z`);
    s += cut(`M276 ${T} h48 l-12 12 v${B - T - 12} h-24 v-${B - T - 12} z`);
    s += cut(`M392 ${T} h18 v${B - T} h-18 z`);
    for (let y = T + 6; y < B; y += 8) s += line(388, y, 392, y + 4, "s-thin") + line(410, y + 4, 414, y, "s-thin");
    [[70, "単純穴", "Simple hole", "通し穴・位置決め"], [185, "座ぐり", "Counterbore", "ボルト頭を沈める"], [300, "皿穴", "Countersink", "皿ネジ用（90°）"], [401, "下穴", "Tap drill", "タッピングで直接締める"]]
      .forEach(([x, t, en, d]) => { s += text(x, 22, t, "t-s t-b", "middle") + text(x, 36, en, "t-xs t-m", "middle") + text(x, 50, d, "t-xs t-m", "middle"); });
    s += text(10, 156, "断面図。ハッチングが材料。", "t-xs t-m");
    cv(fig).innerHTML = svg("0 0 480 165", s);
  };

  D.finish = (fig) => {
    const fil = `<path d="M30 120 V60 A30 30 0 0 1 60 30 H170" class="s-line" style="stroke-width:2"/><path d="M30 120 H170 V30" class="s-thin"/>
      <path d="M30 120 V30 H170" class="s-dash"/>` + note(40, 40, 120, 70, "R");
    const cha = `<path d="M30 120 V58 L58 30 H170" class="s-line" style="stroke-width:2"/><path d="M30 120 H170 V30" class="s-thin"/>
      <path d="M30 58 V30 H58" class="s-dash"/>` + note(44, 44, 120, 70, "C（面取り）");
    const thk = `<path d="M30 30 V120 H170 V30 H156 V106 H44 V30 Z" class="s-mat"/><path d="M30 30 H170" class="s-acc-l" style="stroke-dasharray:4 3"/>` +
      text(100, 24, "選んだ面を開口にする", "t-xs t-acc", "middle") + note(37, 80, 80, 80, "肉厚");
    const dra = `<path d="M50 30 L30 120 H170 L150 30 Z" class="s-mat"/><path d="M50 30 V120" class="s-dash"/>` +
      `<path d="M50 70 a40 40 0 0 0 -9 0" class="s-acc-l"/>` + text(58, 74, "勾配", "t-xs t-acc");
    cv(fig).innerHTML = mini([
      ["フィレット|Fillet", fil, "角を丸める"], ["面取り|Chamfer", cha, "角を斜めに落とす"],
      ["厚み|Thickness", thk, "中をくり抜いて殻にする"], ["抜き勾配|Draft", dra, "面に傾斜をつける"],
    ]);
  };

  D.pattern = (fig) => {
    const mir = `<path d="M100 20 V130" class="s-dash"/><path d="M100 40 H50 V60 H70 V110 H100" class="s-mat"/>
      <path d="M100 40 H150 V60 H130 V110 H100" style="fill:none;stroke:var(--ink);stroke-dasharray:4 3;stroke-width:1.4"/>` + text(104, 134, "鏡映面", "t-xs t-m");
    let lin = `<rect x="20" y="45" width="160" height="60" rx="4" class="s-mat"/>`;
    for (let i = 0; i < 4; i++) lin += `<circle cx="${42 + i * 38}" cy="75" r="9" style="fill:var(--fig-bg);stroke:${i ? "var(--ink)" : "var(--text)"};stroke-width:1.3;${i ? "stroke-dasharray:3 2" : ""}"/>`;
    lin += line(42, 118, 156, 118, "s-acc-l", 'marker-end="url(#ar-acc)"') + text(100, 134, "4個・間隔 38", "t-xs t-acc", "middle");
    let pol = `<circle cx="100" cy="72" r="56" class="s-mat"/><circle cx="100" cy="72" r="14" style="fill:var(--fig-bg);stroke:var(--text)"/>`;
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 - Math.PI / 2; pol += `<circle cx="${f(100 + 36 * Math.cos(a))}" cy="${f(72 + 36 * Math.sin(a))}" r="7" style="fill:var(--fig-bg);stroke:${i ? "var(--ink)" : "var(--text)"};stroke-width:1.3;${i ? "stroke-dasharray:3 2" : ""}"/>`; }
    pol += `<path d="M138 36 a52 52 0 0 1 14 30" class="s-acc-l" marker-end="url(#ar-acc)"/>`;
    cv(fig).innerHTML = mini([["ミラー|Mirrored", mir, "面に対して反転複写"], ["直線パターン|LinearPattern", lin, "方向と間隔で並べる"], ["円形パターン|PolarPattern", pol, "軸まわりに並べる"]]);
  };

  D.clip = (fig) => {
    const cx = 240, cy = 104, ro = 60, ri = 44, gap = 34;
    const a1 = -Math.PI / 2 + gap / 60, a2 = -Math.PI / 2 - gap / 60;
    const P = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const [o1, o2, i1, i2] = [P(ro, a1), P(ro, a2), P(ri, a1), P(ri, a2)];
    let s = `<path d="M${f(o1[0])} ${f(o1[1])} A${ro} ${ro} 0 1 1 ${f(o2[0])} ${f(o2[1])} L${f(i2[0])} ${f(i2[1])} A${ri} ${ri} 0 1 0 ${f(i1[0])} ${f(i1[1])} Z" class="s-mat"/>`;
    s += `<rect x="90" y="${cy + ro - 6}" width="300" height="20" class="s-mat"/>`;
    s += `<rect x="112" y="${cy + ro - 6}" width="22" height="20" style="fill:var(--fig-bg);stroke:var(--text)"/><rect x="346" y="${cy + ro - 6}" width="22" height="20" style="fill:var(--fig-bg);stroke:var(--text)"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="34" style="fill:var(--accent-soft);stroke:var(--accent);stroke-dasharray:4 3"/>` + text(cx, cy + 4, "ケーブル", "t-xs t-acc", "middle");
    s += line(cx - ri, cy - 14, cx + ri, cy - 14, "s-dim", 'marker-start="url(#ar-ink)" marker-end="url(#ar-ink)"') + note(cx - ri + 4, cy - 14, 150, 40, "内径＝ケーブル径＋0.4", "end");
    s += note((o1[0] + i2[0]) / 2 + 2, o1[1] - 4, cx + 90, 26, "開口＝ケーブル径の 0.7〜0.8 倍");
    s += note(cx + ro - 6, cy + 10, 420, 110, "肉厚 1.6〜2.0");
    s += note(123, cy + ro + 4, 60, 205, "M3 皿ネジ穴", "end");
    s += text(20, 236, "正面図（押し出し方向＝奥行き 10mm）", "t-xs t-m");
    cv(fig).innerHTML = svg("0 0 480 245", s);
  };

  /* ============================================================
     第5章：パラメトリック
     ============================================================ */
  D.expr = (fig) => {
    const c = cv(fig);
    c.innerHTML = `<div class="table-wrap"><table class="prop">
      <tr><th>オブジェクト.プロパティ</th><th>入力</th><th class="num">結果</th></tr>
      <tr><td>Spreadsheet.<b>width</b></td><td><input type="number" class="in-w" value="60" step="1" min="10" max="200"> mm</td><td class="num r-w"></td></tr>
      <tr><td>Spreadsheet.<b>screw</b></td><td><input type="number" class="in-s" value="3" step="0.5" min="2" max="6"> mm</td><td class="num r-s"></td></tr>
      <tr><td>Pad.Length</td><td><code>=Spreadsheet.width / 2</code></td><td class="num r-1"></td></tr>
      <tr><td>Hole.Diameter</td><td><code>=Spreadsheet.screw + 0.3</code></td><td class="num r-2"></td></tr>
      <tr><td>LinearPattern.Occurrences</td><td><code>=floor(Spreadsheet.width / 20)</code></td><td class="num r-3"></td></tr>
    </table></div>`;
    const w = c.querySelector(".in-w"), sc = c.querySelector(".in-s");
    const upd = () => {
      const W = +w.value || 0, Sv = +sc.value || 0;
      c.querySelector(".r-w").textContent = W + " mm"; c.querySelector(".r-s").textContent = Sv + " mm";
      c.querySelector(".r-1").textContent = (W / 2).toFixed(1) + " mm";
      c.querySelector(".r-2").textContent = (Sv + 0.3).toFixed(1) + " mm";
      c.querySelector(".r-3").textContent = Math.floor(W / 20) + " 個";
    };
    w.addEventListener("input", upd); sc.addEventListener("input", upd); upd();
  };

  D.refs = (fig) => {
    const rows = [["width", "60"], ["depth", "40"], ["height", "30"], ["wall", "2"], ["clr", "0.2"]];
    let s = `<rect x="20" y="20" width="150" height="${22 * (rows.length + 1)}" class="s-line" style="fill:var(--paper)"/>`;
    s += text(28, 36, "別名", "t-xs t-m") + text(110, 36, "値", "t-xs t-m") + line(20, 42, 170, 42, "s-thin") + line(100, 20, 100, 20 + 22 * (rows.length + 1), "s-thin");
    rows.forEach(([a, v], i) => { s += text(28, 58 + i * 22, a, "t-s t-b") + text(110, 58 + i * 22, v, "t-s") + line(20, 64 + i * 22, 170, 64 + i * 22, "s-thin", 'stroke-width=".4"'); });
    s += text(20, 14, "Spreadsheet", "t-xs t-m");
    const tg = [["本体スケッチ", ["width", "depth"], 34], ["本体パッド", ["height"], 88], ["厚み", ["wall"], 142], ["フタのスケッチ", ["width", "depth", "wall", "clr"], 196]];
    tg.forEach(([n, uses, y]) => {
      s += `<rect x="320" y="${y - 16}" width="140" height="30" rx="3" class="s-line" style="fill:var(--paper)"/>` + text(390, y + 4, n, "t-s", "middle");
      uses.forEach((u) => { const ri = rows.findIndex((r) => r[0] === u); s += `<path d="M170 ${54 + ri * 22} C 250 ${54 + ri * 22}, 250 ${y}, 318 ${y}" class="s-dim" style="opacity:.75" marker-end="url(#ar-ink)"/>`; });
    });
    cv(fig).innerHTML = svg("0 0 480 230", s);
  };

  D.fitgap = (fig) => {
    const c = cv(fig);
    c.innerHTML = `<div class="ctrl"><label>片側のすき間 <input type="range" min="0" max="12" value="4"></label><output></output></div>` +
      svg("0 0 480 240", `<g class="g"></g>`) + `<div class="readout"></div>`;
    const r = c.querySelector("input"), out = c.querySelector("output"), g = c.querySelector(".g"), ro = c.querySelector(".readout");
    const draw = () => {
      const gp = +r.value * 0.05, U = 30;
      const wx = 60, wall = 2 * U, lipW = 1.5 * U, top = 70;
      let s = `<rect x="${wx}" y="${top}" width="${wall}" height="160" class="s-mat"/>` + text(wx + wall / 2, 225, "本体の壁", "t-xs", "middle");
      s += `<rect x="30" y="${top - 30}" width="420" height="30" class="s-mat2"/>` + text(300, top - 11, "フタ", "t-xs", "middle");
      const lx = wx + wall + gp * U;
      s += `<rect x="${f(lx)}" y="${top}" width="${lipW}" height="90" class="s-mat2"/>` + text(lx + lipW + 8, top + 50, "フタの爪（リップ）", "t-xs");
      if (gp > 0) s += `<rect x="${wx + wall}" y="${top}" width="${f(gp * U)}" height="90" style="fill:var(--accent);opacity:.35"/>`;
      s += line(wx + wall, top + 110, f(lx), top + 110, "s-dim", gp > 0.05 ? 'marker-start="url(#ar-ink)" marker-end="url(#ar-ink)"' : "") +
        text(wx + wall + 4, top + 128, "すき間", "t-xs t-ink");
      s += text(320, top + 130, "← 外側　　内側 →", "t-xs t-m", "middle");
      g.innerHTML = s;
      out.textContent = gp.toFixed(2) + " mm";
      const v = gp < 0.08 ? ["st-ng", "入らない、または強く押し込む"] : gp < 0.18 ? ["st-warn", "圧入ぎみ。抜けにくい固定向き"] :
        gp < 0.33 ? ["st-ok", "手で着脱できる、すきまばめ"] : ["st-warn", "がたつく。動く部品向き"];
      ro.innerHTML = `<span class="${v[0]}">${v[1]}</span>　実際の値は機種・材料・向きで変わる。<a href="#ch-dfam/6">テストピース</a>で決める。`;
    };
    r.addEventListener("input", draw); draw();
  };

  D.tnp = (fig) => {
    const c = cv(fig);
    let changed = false, mode = "new";
    c.innerHTML = `<div class="ctrl"><button class="btn" data-a="chg" aria-pressed="false">前の工程を変更（穴を追加）</button>
      ${H.seg([["old", "0.x 系"], ["new", "1.0 以降"], ["datum", "データム平面基準"]], mode, "挙動")}</div>` +
      svg("0 0 480 220", `<g class="g"></g>`) + `<div class="readout"></div>`;
    const g = c.querySelector(".g"), ro = c.querySelector(".readout");
    const P = iso(2.2, 210, 110);
    const draw = () => {
      let s = isoBox(P, -30, -20, 0, 60, 40, 24);
      if (changed) { s += H.isoCircle(P, -16, 0, 24, 6, "s-mat2"); }
      const topName = changed ? "Face9" : "Face6";
      const q = P(18, -16, 24);
      s += text(q[0], q[1] - 2, topName, "t-xs t-m", "middle");
      const wrong = changed && mode === "old";
      if (mode === "datum") {
        s += H.poly([P(-40, -30, 34), P(40, -30, 34), P(40, 30, 34), P(-40, 30, 34)], "", 'style="fill:var(--ink);fill-opacity:.06;stroke:var(--ink);stroke-dasharray:4 3"');
        const dp = P(40, -30, 34); s += text(dp[0] + 4, dp[1], "データム平面", "t-xs t-ink");
      }
      if (wrong) {
        // 側面に飛んだスケッチ
        const pts = []; for (let i = 0; i < 36; i++) { const a = (i / 36) * Math.PI * 2; pts.push(P(30, 0 + 9 * Math.cos(a), 12 + 9 * Math.sin(a))); }
        s += H.poly(pts, "", 'style="fill:none;stroke:var(--ng);stroke-width:2"');
        const w = P(30, 20, 26); s += text(w[0] + 6, w[1], "スケッチが別の面へ", "t-s", "start", 'style="fill:var(--ng);font-weight:700"');
      } else {
        s += H.isoCircle(P, 10, 4, 24, 9, "", 36).replace("<polygon", '<polygon style="fill:none;stroke:var(--ok);stroke-width:2"');
      }
      g.innerHTML = s;
      ro.innerHTML = !changed ? "上面（内部名 Face6）にスケッチを貼り付けた状態。前の工程を変更してみる。" :
        mode === "old" ? `<span class="st-ng">面の番号が変わり、参照先がずれた。</span>これがトポロジカルネーミング問題。` :
        mode === "new" ? `<span class="st-ok">1.0 以降は多くの場合で参照が保たれる。</span>ただし完全ではない。` :
        `<span class="st-ok">面ではなくデータム平面を参照していれば、番号の変化に影響されない。</span>`;
    };
    c.querySelector('[data-a="chg"]').onclick = (e) => { changed = !changed; e.target.setAttribute("aria-pressed", changed); draw(); };
    H.bindSeg(c, (v) => { mode = v; draw(); });
    draw();
  };

  /* ============================================================
     第6章：印刷を意識した設計
     ============================================================ */
  D.overhang = (fig) => {
    const c = cv(fig);
    c.innerHTML = `<div class="ctrl"><label>垂直からの傾き <input type="range" min="0" max="80" value="30"></label><output></output><span class="st"></span></div>` +
      svg("0 0 480 220", `<g class="g"></g>`) + `<div class="readout"></div>`;
    const r = c.querySelector("input"), out = c.querySelector("output"), st = c.querySelector(".st"), g = c.querySelector(".g"), ro = c.querySelector(".readout");
    const draw = () => {
      const a = +r.value, lh = 12, n = 14, w = 110, x0 = 50;
      const off = Math.tan((a * Math.PI) / 180) * lh;
      let s = line(10, 205, 470, 205, "s-thin");
      for (let k = 0; k < n; k++) {
        const x = x0 + off * k, y = 205 - lh * (k + 1);
        if (x + w > 470) break;
        const sag = a > 60 && k > 0 ? Math.min(6, (off - lh * 0.9) * 0.15) : 0;
        s += `<rect x="${f(x)}" y="${f(y + sag)}" width="${w}" height="${lh - 1.5}" rx="5" class="${k === 0 ? "s-mat2" : "s-mat"}"/>`;
        if (k > 0 && off > w * 0.0 && a > 45) s += `<rect x="${f(x + w - off)}" y="${f(y + sag)}" width="${f(Math.min(off, w))}" height="${lh - 1.5}" rx="5" style="fill:var(--ng);opacity:${a > 60 ? 0.45 : 0.25}"/>`;
      }
      s += line(x0 + w, 205, x0 + w, 30, "s-dash");
      g.innerHTML = s;
      out.textContent = a + "°";
      const [cls, msg] = a <= 45 ? ["st-ok", "サポートなしで印刷できる"] : a <= 60 ? ["st-warn", "条件次第（冷却・速度・材料）"] : ["st-ng", "サポートが必要"];
      st.className = "st " + cls; st.textContent = msg;
      ro.innerHTML = `1層ごとのせり出し <b>${(Math.tan((a * Math.PI) / 180) * 0.2).toFixed(2)} mm</b>（レイヤー高さ 0.2mm 時）。線幅 0.42mm の半分を超えるあたりから垂れ始める。`;
    };
    r.addEventListener("input", draw); draw();
  };

  D.teardrop = (fig) => {
    const panel = (ox, kind) => {
      const cx = ox + 75, cy = 100, r = 36;
      let hole;
      if (kind === "circle") hole = `M${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} Z`;
      if (kind === "tear") { const t = r / Math.SQRT2; hole = `M${f(cx - t)} ${f(cy - t)} L${cx} ${f(cy - r * Math.SQRT2)} L${f(cx + t)} ${f(cy - t)} A${r} ${r} 0 1 1 ${f(cx - t)} ${f(cy - t)} Z`; }
      if (kind === "d") { const t = r * 0.8; hole = `M${f(cx - r * 0.6)} ${f(cy - t)} H${f(cx + r * 0.6)} A${r} ${r} 0 1 1 ${f(cx - r * 0.6)} ${f(cy - t)} Z`; }
      let s = `<path d="M${ox + 10} 30 h130 v140 h-130 z ${hole}" class="s-mat" fill-rule="evenodd"/>`;
      if (kind === "circle") s += `<path d="M${f(cx - r * 0.707)} ${f(cy - r * 0.707)} A${r} ${r} 0 0 1 ${f(cx + r * 0.707)} ${f(cy - r * 0.707)}" style="stroke:var(--ng);stroke-width:4;fill:none;opacity:.75"/>`;
      if (kind === "tear") s += `<path d="M${cx - 18} ${f(cy - r * Math.SQRT2 + 18)} a16 16 0 0 0 9 -9" class="s-acc-l"/>` + text(cx - 34, f(cy - r * Math.SQRT2 + 24), "45°", "t-xs t-acc", "end");
      if (kind === "d") s += `<line x1="${f(cx - r * 0.6)}" y1="${f(cy - r * 0.8)}" x2="${f(cx + r * 0.6)}" y2="${f(cy - r * 0.8)}" style="stroke:var(--warn);stroke-width:3"/>`;
      return s;
    };
    let s = panel(0, "circle") + panel(160, "tear") + panel(320, "d");
    s += text(85, 192, "真円：上部が垂れる", "t-s t-b", "middle") + text(245, 192, "ティアドロップ", "t-s t-b", "middle") + text(405, 192, "上部を平らに（ブリッジ）", "t-s t-b", "middle");
    s += text(85, 208, "赤＝ほぼ水平な天井", "t-xs t-m", "middle") + text(245, 208, "天井を45°に収める", "t-xs t-m", "middle") + text(405, 208, "短い橋渡しなら垂れにくい", "t-xs t-m", "middle");
    s += text(240, 18, "水平方向の穴（断面）。印刷時の上方向は紙面の上。", "t-xs t-m", "middle");
    cv(fig).innerHTML = svg("0 0 480 215", s);
  };

  D.walllines = (fig) => {
    const c = cv(fig);
    c.innerHTML = `<div class="ctrl"><label>壁の厚さ <input type="range" min="0.3" max="2.4" step="0.02" value="1.0"></label><output></output></div>` +
      svg("0 0 480 170", `<g class="g"></g>`) + `<div class="readout"></div>`;
    const r = c.querySelector("input"), out = c.querySelector("output"), g = c.querySelector(".g"), ro = c.querySelector(".readout");
    const LW = 0.42, U = 160;
    const draw = () => {
      const t = +r.value, n = Math.floor(t / LW + 0.05), rest = Math.max(0, t - n * LW);
      const x0 = 240 - (t * U) / 2;
      let s = `<rect x="${f(x0)}" y="20" width="${f(t * U)}" height="128" class="s-dash"/>`;
      for (let L = 0; L < 4; L++) {
        const y = 116 - L * 32;
        for (let k = 0; k < n; k++) {
          const xi = k < Math.ceil(n / 2) ? x0 + k * LW * U : x0 + t * U - (n - k) * LW * U;
          s += `<rect x="${f(xi + 1)}" y="${y}" width="${f(LW * U - 2)}" height="30" rx="13" class="s-mat"/>`;
        }
        if (rest > 0.04 && n > 0) {
          const gx = x0 + Math.ceil(n / 2) * LW * U;
          s += `<rect x="${f(gx)}" y="${y}" width="${f(rest * U)}" height="30" style="fill:url(#hatch-acc);stroke:var(--accent);stroke-width:.8"/>`;
        }
      }
      s += dimH(x0, x0 + t * U, 14, t.toFixed(2) + " mm");
      s += text(240, 166, `線幅 ${LW}mm の線が ${n} 本`, "t-xs t-m", "middle");
      g.innerHTML = s;
      out.textContent = t.toFixed(2) + " mm";
      ro.innerHTML = n === 0 ? `<span class="st-ng">線幅より細く、印刷されない。</span>` :
        rest > 0.08 ? `<span class="st-warn">端数 ${rest.toFixed(2)}mm が隙間（朱のハッチング）になる。</span>細い充填線で埋まるが、強度・外観が不安定。` :
        `<span class="st-ok">線幅のほぼ整数倍。</span>壁はすき間なく埋まる。目安：0.84／1.26／1.68mm。`;
    };
    r.addEventListener("input", draw); draw();
  };

  D.elephant = (fig) => {
    const part = (ox, chamfer) => {
      let s = chamfer ? `<path d="M${ox + 20} 40 H${ox + 180} V144 L${ox + 172} 152 H${ox + 28} L${ox + 20} 144 Z" class="s-mat"/>`
        : `<path d="M${ox + 20} 40 H${ox + 180} V152 H${ox + 20} Z" class="s-mat"/>`;
      s += `<path d="M${ox + (chamfer ? 22 : 15)} 152 q-3 -3 ${chamfer ? 4 : -1} -8 H${ox + (chamfer ? 178 : 185)} q${chamfer ? 4 : -1} 5 ${chamfer ? -2 : -1} 8 Z" style="fill:var(--accent);opacity:.55"/>`;
      s += line(ox, 152, ox + 200, 152, "s-line");
      return s;
    };
    let s = part(20, false) + part(260, true);
    s += note(36, 148, 60, 24, "第1層がはみ出す") + note(450, 148, 470, 24, "面取り 0.4〜0.6", "end");
    s += text(120, 176, "そのまま", "t-s t-b", "middle") + text(360, 176, "底辺に小さな面取り", "t-s t-b", "middle");
    cv(fig).innerHTML = svg("0 0 480 185", s);
  };

  D.nuttrap = (fig) => {
    const cx = 120, cy = 110, af = 5.7, U = 16, R = (af / Math.sqrt(3)) * U;
    const hex = []; for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; hex.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); }
    let s = `<rect x="30" y="20" width="180" height="180" class="s-mat"/>` + poly(hex, "", 'style="fill:var(--fig-bg);stroke:var(--text);stroke-width:1.3"') +
      `<circle cx="${cx}" cy="${cy}" r="${1.65 * U}" style="fill:var(--surface-2);stroke:var(--text)"/>`;
    s += dimV(cx - R - 18, cy - (af / 2) * U, cy + (af / 2) * U, "5.7", cx - (R * 0.5), -1);
    s += text(120, 216, "上面図", "t-xs t-m", "middle");
    // 断面
    const sx = 270, top = 50, T = 8 * U / 1.6;
    s += `<rect x="${sx}" y="${top}" width="190" height="${T}" style="fill:url(#hatch);stroke:var(--text)"/>`;
    s += `<rect x="${sx + 95 - 1.65 * U}" y="${top}" width="${3.3 * U}" height="${T}" style="fill:var(--fig-bg);stroke:var(--text)"/>`;
    s += `<rect x="${sx + 95 - (af / 2) * U}" y="${top + T - 2.6 * U}" width="${af * U}" height="${2.6 * U}" style="fill:var(--fig-bg);stroke:var(--text)"/>`;
    s += dimV(sx + 200, top + T - 2.6 * U, top + T, "2.6", sx + 190);
    s += note(sx + 95, top + 10, sx + 150, 26, "通し穴 φ3.3");
    s += text(sx + 95, 216, "断面図（M3 ナット：二面幅 5.5・厚さ 2.4）", "t-xs t-m", "middle");
    cv(fig).innerHTML = svg("0 0 480 225", s);
  };

  D.snap = (fig) => {
    const c = cv(fig);
    let ok = true;
    c.innerHTML = `<div class="ctrl">${H.seg([["ok", "層が梁に沿う"], ["ng", "層が梁を横切る"]], "ok", "向き")}</div>` + svg("0 0 480 220", `<g class="g"></g>`) + `<div class="readout"></div>`;
    const g = c.querySelector(".g"), ro = c.querySelector(".readout");
    const draw = () => {
      let s = `<path d="M120 200 V40 h18 l14 18 h-14 V200 Z" class="s-mat"/>`;
      s += `<rect x="60" y="200" width="160" height="14" class="s-mat2"/>`;
      if (ok) for (let x = 123; x < 138; x += 4) s += line(x, 60, x, 200, "s-thin", 'stroke-width=".7"');
      else for (let y = 46; y < 200; y += 6) s += line(120, y, 138, y, "s-thin", 'stroke-width=".7"');
      s += `<path d="M155 50 q20 0 30 10" class="s-acc-l" marker-end="url(#ar-acc)"/>` + text(190, 66, "押し込むと梁がしなる", "t-xs t-acc");
      if (!ok) s += `<path d="M116 192 l6 -3 l6 3 l6 -3 l6 3" style="stroke:var(--ng);stroke-width:2;fill:none"/>` + text(146, 196, "根元で割れる", "t-s", "start", 'style="fill:var(--ng);font-weight:700"');
      s += `<g transform="translate(330 60)"><rect x="0" y="0" width="120" height="120" class="s-line" style="fill:var(--paper)"/>` +
        text(60, -8, "プレート上の置き方", "t-xs t-m", "middle") +
        (ok ? `<rect x="14" y="70" width="92" height="16" class="s-mat"/><rect x="14" y="86" width="92" height="20" class="s-mat2"/>` + text(60, 60, "寝かせる", "t-xs", "middle")
            : `<rect x="52" y="14" width="16" height="72" class="s-mat"/><rect x="14" y="86" width="92" height="20" class="s-mat2"/>` + text(92, 40, "立てる", "t-xs", "middle")) +
        line(0, 106, 120, 106, "s-line") + `</g>`;
      g.innerHTML = s;
      ro.innerHTML = ok ? `<span class="st-ok">しなりに強い。</span>曲げの力が層の内部（線の長手方向）にかかる。` : `<span class="st-ng">層間に引張りがかかり、数回で折れる。</span>`;
    };
    H.bindSeg(c, (v) => { ok = v === "ok"; draw(); });
    draw();
  };

  D.split = (fig) => {
    let s = `<rect x="20" y="30" width="200" height="140" class="s-dash"/>` + text(120, 22, "ビルドプレート 256mm 角", "t-xs t-m", "middle");
    s += `<rect x="40" y="80" width="300" height="44" rx="6" class="s-mat"/>` + text(190, 106, "全長 300mm の部品", "t-s", "middle");
    s += `<path d="M200 70 V134" style="stroke:var(--ng);stroke-width:1.5;stroke-dasharray:5 3"/>` + text(206, 150, "はみ出す", "t-xs", "start", 'style="fill:var(--ng)"');
    s += line(350, 102, 380, 102, "s-line", 'marker-end="url(#ar)"');
    const piece = (x, y, w, pins) => `<rect x="${x}" y="${y}" width="${w}" height="44" rx="6" class="s-mat"/>` +
      pins.map(([px, kind]) => kind === "pin" ? `<rect x="${px}" y="${y + 14}" width="10" height="16" rx="2" class="s-mat2"/>` : `<rect x="${px}" y="${y + 13}" width="11" height="18" rx="2" style="fill:var(--fig-bg);stroke:var(--text)"/>`).join("");
    s += piece(390, 40, 80, [[470, "pin"]]) + piece(390, 120, 80, [[390, "hole"]]);
    s += text(430, 196, "ダボ穴とピンで位置決め", "t-xs t-m", "middle");
    cv(fig).innerHTML = svg("0 0 490 205", s);
  };

  /* ============================================================
     第7章：アセンブリ
     ============================================================ */
  D.joints = (fig) => {
    const fixed = `<rect x="30" y="50" width="70" height="50" class="s-mat"/><rect x="100" y="40" width="70" height="70" class="s-mat2"/>
      <path d="M92 60 h16 v24 h-16 z" class="s-line" style="fill:var(--paper)"/><path d="M96 60 v-6 a4 4 0 0 1 8 0 v6" class="s-line"/>`;
    const rev = `<rect x="30" y="64" width="70" height="22" class="s-mat"/><rect x="100" y="64" width="70" height="22" class="s-mat2" transform="rotate(-25 100 75)"/>
      <circle cx="100" cy="75" r="8" class="s-line" style="fill:var(--paper)"/><path d="M150 40 a50 50 0 0 1 16 34" class="s-acc-l" marker-end="url(#ar-acc)"/>`;
    const sld = `<rect x="20" y="88" width="160" height="12" class="s-mat2"/><rect x="70" y="58" width="50" height="30" class="s-mat"/>
      <line x1="60" y1="46" x2="130" y2="46" class="s-acc-l" marker-start="url(#ar-acc)" marker-end="url(#ar-acc)"/>`;
    const cyl = `<rect x="40" y="55" width="80" height="40" class="s-mat"/><rect x="20" y="68" width="160" height="14" rx="7" class="s-mat2"/>
      <line x1="140" y1="45" x2="180" y2="45" class="s-acc-l" marker-start="url(#ar-acc)" marker-end="url(#ar-acc)"/><path d="M150 112 a20 8 0 1 0 24 0" class="s-acc-l" marker-end="url(#ar-acc)"/>`;
    cv(fig).innerHTML = mini([["固定|Fixed", fixed, "動かない"], ["回転|Revolute", rev, "1軸まわりに回る（ヒンジ）"], ["スライダー|Slider", sld, "1方向に滑る"], ["円筒|Cylindrical", cyl, "回転＋軸方向の移動"]]);
  };

  D.interfere = (fig) => {
    let s = `<rect x="60" y="40" width="200" height="120" rx="8" style="fill:var(--ink);fill-opacity:.12;stroke:var(--ink);stroke-width:1.4"/>`;
    s += `<rect x="210" y="70" width="200" height="110" rx="8" style="fill:var(--accent-2);fill-opacity:.12;stroke:var(--accent-2);stroke-width:1.4"/>`;
    s += `<rect x="210" y="70" width="50" height="90" style="fill:var(--ng);opacity:.55"/>`;
    s += text(120, 100, "本体", "t-s t-ink", "middle") + text(350, 130, "フタ", "t-s t-grn", "middle");
    s += note(235, 115, 300, 30, "共通部分に体積がある＝干渉");
    cv(fig).innerHTML = svg("0 0 480 200", s);
  };

  /* ============================================================
     第8章：書き出し
     ============================================================ */
  D.tess = (fig) => {
    const c = cv(fig);
    const DV = [0.5, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005];
    c.innerHTML = `<div class="ctrl"><label>最大偏差 <input type="range" min="0" max="6" value="2"></label><output></output></div>` +
      svg("0 0 480 230", `<g class="g"></g>`) + `<div class="readout"></div>`;
    const r = c.querySelector("input"), out = c.querySelector("output"), g = c.querySelector(".g"), ro = c.querySelector(".readout");
    const draw = () => {
      const d = DV[+r.value], R = 10, U = 9, cx = 120, cy = 115;
      const n = Math.max(3, Math.ceil(Math.PI / Math.acos(1 - d / R)));
      let s = `<circle cx="${cx}" cy="${cy}" r="${R * U}" class="s-acc-l" style="stroke-dasharray:4 3"/>`;
      const p = []; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; p.push([cx + R * U * Math.cos(a), cy + R * U * Math.sin(a)]); }
      s += poly(p, "", 'style="fill:var(--fill-1);fill-opacity:.6;stroke:var(--text);stroke-width:1"');
      s += text(cx, cy + R * U + 22, "φ20 の円", "t-xs t-m", "middle");
      // 拡大図
      const zx = 340, zy = 70, half = 100, sag = Math.min(60, d * 400);
      s += `<path d="M${zx - half} ${zy + 60} Q ${zx} ${zy + 60 - sag * 2} ${zx + half} ${zy + 60}" class="s-acc-l" style="stroke-dasharray:4 3"/>`;
      s += line(zx - half, zy + 60, zx + half, zy + 60, "s-line");
      s += line(zx, zy + 60, zx, zy + 60 - sag, "s-dim", sag > 8 ? 'marker-start="url(#ar-ink)" marker-end="url(#ar-ink)"' : "");
      s += text(zx + 6, zy + 56 - sag / 2, "偏差", "t-xs t-ink");
      s += text(zx, zy + 90, "1辺の拡大（模式）", "t-xs t-m", "middle");
      g.innerHTML = s;
      out.textContent = d + " mm";
      const tri = 4 * n, kb = (84 + 50 * tri) / 1024;
      ro.innerHTML = `円周の分割数 <b>${n}</b>　φ20×10 の円柱で三角形 約 <b>${tri}</b> 枚（STL 約 ${kb < 1024 ? kb.toFixed(1) + " KB" : (kb / 1024).toFixed(1) + " MB"}）。` +
        (d >= 0.2 ? "　曲面が角張って見える。" : d <= 0.01 ? "　見た目の差はほぼなく、ファイルだけ大きくなる。" : "　3Dプリントには十分な範囲。");
    };
    r.addEventListener("input", draw); draw();
  };
})();
