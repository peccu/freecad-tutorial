/* ============================================================
   ビューア本体
   - chapters/*.html を読み込み、目次・検索・進捗・URL を生成
   - 章ファイルの書式：
       <section class="chapter" id="ch-xxx" data-no="6" data-title="…" data-part="…">
         <article class="slide opener" data-title="…">…</article>   ← 章扉（目次が自動で入る）
         <article class="slide" data-title="…">…</article>
   - 図：<figure class="fig" data-demo="名前">…<figcaption>…</figcaption></figure>
         → 図番号を自動付与し、表示時に window.Demos[名前](要素) を1回だけ実行
   ============================================================ */
(() => {
  "use strict";
  const CHAPTER_FILES = [
    "00-intro", "01-fdm", "02-fcui", "03-sketch", "04-partdesign", "05-param", "06-dfam",
    "07-assembly", "08-export", "09-bsbasic", "10-slice", "11-bsadv", "12-print",
    "13-trouble", "14-project", "15-appendix",
  ];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem("fct:" + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("fct:" + k, JSON.stringify(v)); } catch { /* 保存不可の環境では無視 */ } },
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  window.Demos = window.Demos || {};

  async function boot() {
    const main = $("#content");
    try {
      const htmls = await Promise.all(CHAPTER_FILES.map((f) =>
        fetch(`chapters/${f}.html`).then((r) => { if (!r.ok) throw new Error(f); return r.text(); })));
      main.innerHTML = htmls.join("\n");
    } catch (e) {
      main.innerHTML = `<div class="load-error"><h2>章ファイルを読み込めない</h2>
        <p>ファイルを直接開いた場合（file://）はブラウザの制限で読み込めない。フォルダで簡易サーバーを起動して開く。</p>
        <pre><code>python3 -m http.server 8000</code></pre><p>→ <code>http://localhost:8000/</code></p></div>`;
      return;
    }
    init();
  }

  function init() {
    /* ---------- 章・スライドの収集 ---------- */
    const chapters = $$(".chapter").map((el) => ({
      el, id: el.id, title: el.dataset.title, part: el.dataset.part || "", no: el.dataset.no || "",
      slides: $$(".slide", el).map((s, si) => ({
        el: s, title: s.dataset.title || s.querySelector("h1,h2")?.textContent.trim() || `${si + 1}`,
      })),
    }));
    const flat = [];
    chapters.forEach((c, ci) => {
      const noLabel = /^\d+$/.test(c.no) ? `第${c.no}章` : c.no;
      c.slides.forEach((s, si) => {
        s.el.id = `${c.id}--${si + 1}`;
        const crumb = document.createElement("div");
        crumb.className = "crumb";
        crumb.innerHTML = `<span>${esc(noLabel)}　${esc(c.title)}</span><span>${si + 1} / ${c.slides.length}</span>`;
        s.el.prepend(crumb);
        flat.push({ c, ci, s, si, key: `${c.id}/${si + 1}` });
      });
      const h = document.createElement("div");
      h.className = "chapter-heading";
      h.textContent = `${noLabel}　${c.title}`;
      c.el.prepend(h);
      // 章扉：章ラベルと章内目次
      const op = $(".slide.opener", c.el);
      if (op) {
        if (!$(".ch-label", op)) op.querySelector("h1")?.insertAdjacentHTML("beforebegin", `<div class="ch-label">${esc(noLabel)}</div>`);
        const toc = document.createElement("ol");
        toc.className = "chapter-toc";
        toc.innerHTML = c.slides.slice(1).map((s, k) => `<li><a href="#${c.id}/${k + 2}"><span>${c.no}.${k + 1}</span>${esc(s.title)}</a></li>`).join("");
        op.append(toc);
      }
      // 図番号
      $$("figure.fig", c.el).forEach((f, k) => {
        const cap = $("figcaption", f);
        if (cap) cap.insertAdjacentHTML("afterbegin", `<span class="no">図 ${esc(c.no)}-${k + 1}</span>`);
      });
    });

    let cur = 0;
    const seen = new Set(store.get("seen", []));

    /* ---------- 目次 ---------- */
    const nav = $("#nav");
    let lastPart = null;
    chapters.forEach((c, ci) => {
      if (c.part !== lastPart) {
        nav.insertAdjacentHTML("beforeend", `<div class="part">${esc(c.part)}</div>`);
        lastPart = c.part;
      }
      const d = document.createElement("details");
      d.dataset.ci = ci;
      d.innerHTML = `<summary><span class="ch-no">${esc(c.no)}</span><span class="ch-title">${esc(c.title)}</span><span class="ch-prog"></span></summary>` +
        `<ol>${c.slides.map((s, si) => `<li><a href="#${c.id}/${si + 1}">${esc(s.title)}</a></li>`).join("")}</ol>`;
      nav.append(d);
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) document.body.classList.remove("nav-open-sm");
    });

    function refreshNav() {
      $$("details", nav).forEach((d) => {
        const ci = +d.dataset.ci, c = chapters[ci];
        const n = c.slides.filter((_, si) => seen.has(`${c.id}/${si + 1}`)).length;
        const prog = $(".ch-prog", d);
        prog.textContent = `${n}/${c.slides.length}`;
        prog.classList.toggle("done", n === c.slides.length);
        d.classList.toggle("current", ci === flat[cur].ci);
        $$("a", d).forEach((a, si) => {
          a.classList.toggle("seen", seen.has(`${c.id}/${si + 1}`));
          a.classList.toggle("active", ci === flat[cur].ci && si === flat[cur].si);
        });
      });
      $("#progress").style.width = `${(seen.size / flat.length) * 100}%`;
      $("#progress-text").textContent = `${Math.round((seen.size / flat.length) * 100)}%`;
    }

    /* ---------- デモの遅延初期化 ---------- */
    const started = new WeakSet();
    function startDemos(root) {
      $$("[data-demo]", root).forEach((el) => {
        if (started.has(el)) return;
        const fn = window.Demos[el.dataset.demo];
        if (!fn) return;
        started.add(el);
        try { fn(el); } catch (err) { console.error("demo", el.dataset.demo, err); }
      });
    }

    /* ---------- 表示切替 ---------- */
    const isDoc = () => document.body.classList.contains("mode-doc");
    function go(i, { scroll = true } = {}) {
      i = Math.max(0, Math.min(flat.length - 1, i));
      const prev = flat[cur], next = flat[i];
      prev.s.el.classList.remove("active");
      prev.c.el.classList.remove("active");
      next.c.el.classList.add("active");
      next.s.el.classList.add("active");
      cur = i;
      seen.add(next.key);
      store.set("seen", [...seen]);
      store.set("last", next.key);
      if (location.hash.slice(1) !== next.key) history.replaceState(null, "", "#" + next.key);
      const d = $(`details[data-ci="${next.ci}"]`, nav);
      if (d && !d.open) d.open = true;
      $("#where").textContent = `${next.c.no}. ${next.c.title} ― ${next.s.title}`;
      $("#prev").disabled = i === 0;
      $("#next").disabled = i === flat.length - 1;
      document.title = `${next.s.title}｜FreeCAD × Bambu Studio 3Dプリント入門`;
      refreshNav();
      startDemos(next.s.el);
      if (scroll) {
        if (isDoc()) next.s.el.scrollIntoView({ block: "start" });
        else window.scrollTo(0, 0);
        $(`a.active`, nav)?.scrollIntoView({ block: "nearest" });
      }
      window.dispatchEvent(new CustomEvent("slidechange"));
    }
    const indexOfKey = (key) => flat.findIndex((f) => f.key === key || (f.si === 0 && f.c.id === key));

    function setMode(mode) {
      document.body.classList.toggle("mode-doc", mode === "doc");
      document.body.classList.toggle("mode-slide", mode !== "doc");
      $("#mode-btn").textContent = mode === "doc" ? "スライド表示へ" : "一覧表示へ";
      store.set("mode", mode);
      go(cur);
    }

    // 一覧表示：スクロール位置に追従し、見えた図を初期化
    const io = new IntersectionObserver((entries) => {
      if (!isDoc()) return;
      entries.forEach((e) => { if (e.isIntersecting) startDemos(e.target); });
      const vis = entries.filter((e) => e.isIntersecting && e.intersectionRatio > 0).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (vis) {
        const i = flat.findIndex((f) => f.s.el === vis.target);
        if (i >= 0 && i !== cur) go(i, { scroll: false });
      }
    }, { rootMargin: "-25% 0px -60% 0px" });
    flat.forEach((f) => io.observe(f.s.el));

    window.addEventListener("hashchange", () => {
      const i = indexOfKey(decodeURIComponent(location.hash.slice(1)));
      if (i >= 0 && i !== cur) go(i);
    });

    /* ---------- ボタン ---------- */
    $("#prev").onclick = () => go(cur - 1);
    $("#next").onclick = () => go(cur + 1);
    $("#mode-btn").onclick = () => setMode(isDoc() ? "slide" : "doc");
    $("#nav-btn").onclick = () => {
      if (matchMedia("(max-width: 960px)").matches) document.body.classList.toggle("nav-open-sm");
      else { document.body.classList.toggle("nav-closed"); store.set("navClosed", document.body.classList.contains("nav-closed")); }
    };
    $("#theme-btn").onclick = () => {
      const root = document.documentElement;
      const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
      root.dataset.theme = dark ? "light" : "dark";
      store.set("theme", root.dataset.theme);
      window.dispatchEvent(new CustomEvent("themechange"));
    };
    $("#reset-btn").onclick = () => {
      if (!confirm("既読・チェックリスト・確認問題の記録をすべて消去する（取り消し不可）")) return;
      try { Object.keys(localStorage).filter((k) => k.startsWith("fct:")).forEach((k) => localStorage.removeItem(k)); } catch {}
      location.reload();
    };
    // 目次外側タップで閉じる（スマホ）
    document.addEventListener("click", (e) => {
      if (document.body.classList.contains("nav-open-sm") && !e.target.closest("#nav, #nav-btn")) document.body.classList.remove("nav-open-sm");
    });

    /* ---------- 検索 ---------- */
    const searchModal = $("#search-modal"), searchInput = $("#search-input"), results = $("#search-results");
    const index = flat.map((f) => ({ f, text: (f.s.title + " " + f.s.el.textContent).replace(/\s+/g, " ") }));
    let sel = 0;
    const openSearch = () => { searchModal.classList.add("open"); searchInput.value = ""; renderResults(); searchInput.focus(); };
    const closeModals = () => { $$(".modal.open").forEach((m) => m.classList.remove("open")); document.activeElement?.blur(); };
    function renderResults() {
      const words = searchInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const hits = (words.length ? index.filter((x) => words.every((w) => x.text.toLowerCase().includes(w))) : index).slice(0, 50);
      sel = 0;
      results.innerHTML = hits.map((h, k) => {
        let snip = "";
        if (words.length) {
          const pos = h.text.toLowerCase().indexOf(words[0]);
          snip = esc(h.text.slice(Math.max(0, pos - 28), pos + 56));
          words.forEach((w) => { snip = snip.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), (m) => `<mark>${m}</mark>`); });
          snip = " … " + snip + " …";
        }
        return `<li><a href="#${h.f.key}" class="${k === 0 ? "sel" : ""}">${esc(h.f.s.title)}<small>${esc(h.f.c.no + ". " + h.f.c.title)}${snip}</small></a></li>`;
      }).join("") || `<li style="padding:12px;color:var(--muted)">該当なし</li>`;
    }
    searchInput.addEventListener("input", renderResults);
    searchInput.addEventListener("keydown", (e) => {
      const links = $$("a", results);
      if (!links.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        links[sel]?.classList.remove("sel");
        sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
        links[sel].classList.add("sel");
        links[sel].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") { e.preventDefault(); links[sel].click(); }
    });
    results.addEventListener("click", (e) => { if (e.target.closest("a")) closeModals(); });
    $("#search-btn").onclick = openSearch;
    $("#help-btn").onclick = () => $("#help-modal").classList.add("open");
    $$(".modal").forEach((m) => m.addEventListener("click", (e) => { if (e.target === m) closeModals(); }));

    /* ---------- キーボード ---------- */
    document.addEventListener("keydown", (e) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.closest?.(".three-wrap");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); return; }
      if (e.key === "Escape") { closeModals(); document.body.classList.remove("nav-open-sm"); return; }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if ($(".modal.open")) return;
      switch (e.key) {
        case "ArrowRight": case "PageDown": if (!isDoc()) { e.preventDefault(); go(cur + 1); } break;
        case "ArrowLeft": case "PageUp": if (!isDoc()) { e.preventDefault(); go(cur - 1); } break;
        case "/": e.preventDefault(); openSearch(); break;
        case "d": setMode(isDoc() ? "slide" : "doc"); break;
        case "t": $("#nav-btn").click(); break;
        case "?": $("#help-modal").classList.add("open"); break;
      }
    });

    /* ---------- スワイプ（スマホ） ---------- */
    let tx = null, ty = 0;
    const main = $("#content");
    main.addEventListener("touchstart", (e) => {
      if (isDoc() || e.touches.length !== 1 || e.target.closest(".canvas, .table-wrap, input, .tabs-bar, .chips, pre")) { tx = null; return; }
      tx = e.touches[0].clientX; ty = e.touches[0].clientY;
    }, { passive: true });
    main.addEventListener("touchend", (e) => {
      if (tx == null) return;
      const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
      tx = null;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 2) go(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });

    /* ---------- 用語ツールチップ ---------- */
    const G = window.GLOSSARY || {};
    const tip = document.createElement("div");
    tip.className = "tooltip"; tip.hidden = true; document.body.append(tip);
    let tipFor = null, shownAt = 0;
    function showTip(el) {
      const key = el.dataset.term || el.textContent.trim();
      const g = G[key];
      if (!g) return;
      if (tipFor !== el) shownAt = Date.now();
      tipFor = el;
      tip.innerHTML = `<b>${esc(key)}${g.en ? `　<span class="tip-en">${esc(g.en)}</span>` : ""}</b>${esc(g.desc)}`;
      tip.hidden = false;
      const r = el.getBoundingClientRect();
      const top = r.bottom + 8 + tip.offsetHeight > innerHeight ? r.top - tip.offsetHeight - 8 : r.bottom + 8;
      tip.style.top = top + "px";
      tip.style.left = Math.max(8, Math.min(innerWidth - tip.offsetWidth - 8, r.left)) + "px";
    }
    const hideTip = () => { tip.hidden = true; tipFor = null; };
    // 各章の初出の用語に英語名を添える
    chapters.forEach((c) => {
      const done = new Set();
      $$(".term", c.el).forEach((el) => {
        const key = el.dataset.term || el.textContent.trim(), g = G[key];
        if (!g?.en || done.has(key) || el.closest("h1,h2,h3,figcaption")) return;
        done.add(key);
        el.insertAdjacentHTML("afterend", `<span class="en">${esc(g.en.replace(/（.*）/, ""))}</span>`);
      });
    });
    $$(".term").forEach((el) => {
      el.tabIndex = 0;
      el.addEventListener("mouseenter", () => showTip(el));
      el.addEventListener("mouseleave", hideTip);
      el.addEventListener("focus", () => showTip(el));
      el.addEventListener("blur", hideTip);
      // タップでは mouseenter → click が続けて来るため、表示直後の click では閉じない
      el.addEventListener("click", (e) => { e.stopPropagation(); tipFor === el && Date.now() - shownAt > 400 ? hideTip() : showTip(el); });
    });
    document.addEventListener("click", hideTip);
    window.addEventListener("scroll", hideTip, { passive: true });

    // 用語集一覧
    const gl = $("#glossary-list");
    if (gl) {
      const keys = Object.keys(G).sort((a, b) => (G[a].cat + a).localeCompare(G[b].cat + b, "ja"));
      gl.innerHTML = keys.map((k) => `<dt data-k="${esc(k)}">${esc(k)}${G[k].en ? `<span class="gl-en">${esc(G[k].en)}</span>` : ""}<small>${esc(G[k].cat)}</small></dt><dd data-k="${esc(k)}">${esc(G[k].desc)}${G[k].see ? ` <a href="#${G[k].see}">該当章へ</a>` : ""}</dd>`).join("");
      $("#glossary-filter")?.addEventListener("input", (e) => {
        const q = e.target.value.trim().toLowerCase();
        $$("dt,dd", gl).forEach((n) => {
          const k = n.dataset.k;
          n.classList.toggle("hidden", !!q && !(k + (G[k].en || "") + G[k].desc + G[k].cat).toLowerCase().includes(q));
        });
      });
    }

    /* ---------- 確認問題 ---------- */
    const quizState = store.get("quiz", {});
    $$(".quiz").forEach((qz, qi) => {
      const id = qz.dataset.id || `q${qi}`;
      const btns = $$(".opts button", qz);
      const answer = (b, save) => {
        btns.forEach((x) => { x.disabled = true; if (x.hasAttribute("data-correct")) x.classList.add("correct"); });
        if (!b.hasAttribute("data-correct")) b.classList.add("wrong");
        qz.classList.add("answered");
        if (save) { quizState[id] = btns.indexOf(b); store.set("quiz", quizState); }
      };
      btns.forEach((b) => b.addEventListener("click", () => answer(b, true)));
      if (quizState[id] != null && btns[quizState[id]]) answer(btns[quizState[id]], false);
      const retry = document.createElement("button");
      retry.className = "btn"; retry.textContent = "解き直す"; retry.style.marginLeft = "8px";
      retry.onclick = () => {
        btns.forEach((x) => { x.disabled = false; x.classList.remove("correct", "wrong"); });
        qz.classList.remove("answered"); delete quizState[id]; store.set("quiz", quizState);
      };
      $(".explain", qz)?.append(retry);
    });

    /* ---------- チェックリスト ---------- */
    $$(".checklist").forEach((ul) => {
      const key = "check:" + (ul.dataset.key || "default");
      const state = store.get(key, {});
      $$(":scope > li", ul).forEach((li, k) => {
        const label = document.createElement("label");
        const cb = document.createElement("input");
        cb.type = "checkbox"; cb.checked = !!state[k];
        const span = document.createElement("span");
        span.innerHTML = li.innerHTML;
        label.append(cb, span); li.replaceChildren(label);
        cb.addEventListener("change", () => { state[k] = cb.checked; store.set(key, state); });
      });
      if (ul.dataset.reset != null) {
        const b = document.createElement("button");
        b.className = "btn"; b.textContent = "チェックを外す";
        b.onclick = () => { $$("input", ul).forEach((c) => (c.checked = false)); store.set(key, {}); };
        ul.after(b);
      }
    });

    /* ---------- 手順（1つずつ表示） ---------- */
    $$(".steps.progressive").forEach((ol) => {
      const items = $$(":scope > li", ol);
      let shown = 1;
      const ctrl = document.createElement("div");
      ctrl.className = "steps-ctrl";
      ctrl.innerHTML = `<button class="btn" data-a="next">次の手順</button><button class="btn" data-a="all">すべて表示</button><button class="btn" data-a="reset">最初から</button>`;
      const render = () => {
        items.forEach((li, k) => li.classList.toggle("hidden", k >= shown));
        ctrl.querySelector('[data-a="next"]').disabled = shown >= items.length;
      };
      ctrl.addEventListener("click", (e) => {
        const a = e.target.dataset.a;
        if (a === "next") shown = Math.min(items.length, shown + 1);
        if (a === "all") shown = items.length;
        if (a === "reset") shown = 1;
        render();
      });
      ol.after(ctrl); render();
    });

    /* ---------- タブ ---------- */
    $$(".tabs").forEach((t) => {
      const panels = $$(":scope > .tab", t);
      const bar = document.createElement("div");
      bar.className = "tabs-bar"; bar.setAttribute("role", "tablist");
      panels.forEach((p, k) => {
        p.classList.add("tab-panel"); p.hidden = k !== 0;
        const b = document.createElement("button");
        b.textContent = p.dataset.label; b.setAttribute("role", "tab"); b.setAttribute("aria-selected", k === 0);
        b.onclick = () => {
          panels.forEach((x, j) => (x.hidden = j !== k));
          $$("button", bar).forEach((x, j) => x.setAttribute("aria-selected", j === k));
          startDemos(p);
        };
        bar.append(b);
      });
      t.prepend(bar);
    });

    /* ---------- 起動 ---------- */
    if (store.get("navClosed", false)) document.body.classList.add("nav-closed");
    const fromHash = indexOfKey(decodeURIComponent(location.hash.slice(1)));
    const last = store.get("last", null);
    const li = last ? indexOfKey(last) : -1;
    const resume = $("#resume-btn");
    if (resume && li > 0) {
      resume.hidden = false;
      resume.textContent = `前回の続き：${flat[li].c.no}. ${flat[li].s.title}`;
      resume.onclick = () => go(li);
    }
    cur = fromHash >= 0 ? fromHash : 0;
    setMode(store.get("mode", "slide"));
    window.TutorialGo = (key) => { const i = indexOfKey(key); if (i >= 0) go(i); };
  }

  const t = store.get("theme", null);
  if (t) document.documentElement.dataset.theme = t;
  boot();
})();
