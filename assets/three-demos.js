/* ============================================================
   WebGL（three.js）の図
   座標系は CAD と同じ Z 上向き。単位は mm。
   ============================================================ */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const col = (v) => new THREE.Color(css(v) || "#999");

function setup(container, { ortho = 0, hint = "ドラッグで回転・ホイール／ピンチで拡大" } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "three-wrap";
  wrap.tabIndex = 0;
  wrap.innerHTML = `<div class="hud"></div><div class="hint">${hint}</div>`;
  container.append(wrap);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearColor(0x000000, 0);
  wrap.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = ortho ? new THREE.OrthographicCamera(-1, 1, 1, -1, -2000, 2000) : new THREE.PerspectiveCamera(30, 1, 1, 4000);
  camera.up.set(0, 0, 1);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  const hemi = new THREE.HemisphereLight(0xffffff, 0x80786a, 1.7);
  hemi.position.set(0, 0, 1);
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(-50, -80, 120);
  const fill = new THREE.DirectionalLight(0xffffff, 0.45);
  fill.position.set(80, 60, 30);
  scene.add(hemi, key, fill);
  const resize = () => {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    if (ortho) {
      const a = w / h;
      camera.left = -ortho * a; camera.right = ortho * a; camera.top = ortho; camera.bottom = -ortho;
    } else camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(wrap);
  resize();
  let on = false;
  const hooks = [];
  const loop = () => {
    if (!on) return;
    hooks.forEach((f) => f());
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  };
  new IntersectionObserver((es) => {
    const v = es[0].isIntersecting;
    if (v && !on) { on = true; resize(); loop(); } else if (!v) on = false;
  }).observe(wrap);
  return { wrap, hud: wrap.querySelector(".hud"), renderer, scene, camera, controls, hooks };
}

function bed(size = 120, step = 10) {
  const g = new THREE.Group();
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ color: col("--bed"), roughness: 1 }));
  plate.position.z = -0.05;
  const grid = new THREE.GridHelper(size, size / step, col("--rule"), col("--border"));
  grid.rotation.x = Math.PI / 2;
  g.add(plate, grid);
  g.userData.refresh = () => {
    plate.material.color.copy(col("--bed"));
    const gc = grid.geometry.attributes.color, a = col("--rule"), b2 = col("--border");
    const center = size / step / 2; // GridHelper は中心線だけ color1、他は color2
    for (let i = 0; i < gc.count; i++) { const c = Math.floor(i / 4) === center ? a : b2; gc.setXYZ(i, c.r, c.g, c.b); }
    gc.needsUpdate = true;
  };
  return g;
}

function rrect(w, d, r, path = new THREE.Shape(), cx = 0, cy = 0) {
  r = Math.max(0.2, Math.min(r, w / 2 - 0.01, d / 2 - 0.01));
  const x = cx - w / 2, y = cy - d / 2;
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y); path.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  path.lineTo(x + w, y + d - r); path.absarc(x + w - r, y + d - r, r, 0, Math.PI / 2, false);
  path.lineTo(x + r, y + d); path.absarc(x + r, y + d - r, r, Math.PI / 2, Math.PI, false);
  path.lineTo(x, y + r); path.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return path;
}
const ring = (w, d, r, t) => {
  const s = rrect(w, d, r);
  s.holes.push(rrect(w - 2 * t, d - 2 * t, Math.max(0.2, r - t), new THREE.Path()));
  return s;
};
const extrude = (shape, depth, seg = 8) => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: seg });

function modelMat() { return new THREE.MeshStandardMaterial({ color: col("--model"), roughness: 0.75, metalness: 0, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }); }
function edgeLines(geo, angle = 25) { return new THREE.LineSegments(new THREE.EdgesGeometry(geo, angle), new THREE.LineBasicMaterial({ color: col("--text"), transparent: true, opacity: 0.7 })); }

function onTheme(fn) { window.addEventListener("themechange", fn); matchMedia("(prefers-color-scheme: dark)").addEventListener("change", fn); }

/* ============================================================
   第2章：標準ビュー
   ============================================================ */
export function views(fig, c) {
  const V = setup(c, { ortho: 42, hint: "ドラッグで回転・数字キーで視点" });
  // L字ブロック＋円柱ボス（向きが分かる非対称形）
  const g = new THREE.Group();
  const prof = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(50, 0), new THREE.Vector2(50, 10), new THREE.Vector2(14, 10), new THREE.Vector2(14, 34), new THREE.Vector2(0, 34)]);
  const body = extrude(prof, 30);
  body.applyMatrix4(new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1)); // 断面を XZ に置き Y 方向へ押し出し
  body.translate(-25, -15, 0);
  body.scale(1, -1, 1); body.computeVertexNormals();
  const boss = new THREE.CylinderGeometry(6, 6, 8, 32);
  boss.rotateX(Math.PI / 2); boss.translate(10, 0, 14);
  const mat = modelMat();
  [body, boss].forEach((geo) => { g.add(new THREE.Mesh(geo, mat)); g.add(edgeLines(geo)); });
  // 軸
  const axes = new THREE.Group();
  [[1, 0, 0, 0xc0392b], [0, 1, 0, 0x2c7a4b], [0, 0, 1, 0x2f5d8c]].forEach(([x, y, z, cc]) => {
    axes.add(new THREE.ArrowHelper(new THREE.Vector3(x, y, z), new THREE.Vector3(-34, -24, 0), 14, cc, 3, 2));
  });
  V.scene.add(g, axes);
  const VIEWS = {
    0: ["アイソメ", [1, -1, 1]], 1: ["正面", [0, -1, 0]], 2: ["上面", [0, 0, 1]], 3: ["右側面", [1, 0, 0]],
    4: ["背面", [0, 1, 0]], 5: ["底面", [0, 0, -1]], 6: ["左側面", [-1, 0, 0]],
  };
  const target = new THREE.Vector3(0, 0, 14);
  V.controls.target.copy(target);
  let anim = null;
  const setView = (k) => {
    const [name, d] = VIEWS[k];
    const dir = new THREE.Vector3(...d).normalize();
    const from = V.camera.position.clone().sub(target).normalize(), t0 = performance.now();
    const up = Math.abs(dir.z) > 0.99 ? new THREE.Vector3(0, dir.z > 0 ? 1 : -1, 0) : new THREE.Vector3(0, 0, 1);
    anim = (t) => {
      const k2 = Math.min(1, (t - t0) / 450), e = 1 - Math.pow(1 - k2, 3);
      const v = from.clone().lerp(dir, e);
      if (v.lengthSq() < 1e-6) v.copy(dir);
      V.camera.position.copy(target).add(v.normalize().multiplyScalar(200));
      V.camera.up.copy(new THREE.Vector3(0, 0, 1).lerp(up, e).normalize());
      V.camera.lookAt(target);
      if (k2 >= 1) anim = null;
    };
    V.hud.textContent = `${k}：${name}`;
    c.querySelectorAll("[data-v]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.v === String(k)));
  };
  const fit = () => { V.camera.zoom = 1; V.camera.updateProjectionMatrix(); V.hud.textContent = "V, F：全体表示"; };
  V.hooks.push(() => { if (anim) anim(performance.now()); });
  V.camera.position.set(200, -200, 200).add(target);
  const ctrl = document.createElement("div");
  ctrl.className = "ctrl";
  ctrl.innerHTML = `<span class="seg">${Object.entries(VIEWS).map(([k, [n]]) => `<button data-v="${k}" aria-pressed="${k === "0"}"><kbd>${k}</kbd> ${n}</button>`).join("")}</span>
    <button class="btn" data-fit>V, F 全体表示</button>`;
  c.prepend(ctrl);
  ctrl.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.fit != null) fit(); else setView(+b.dataset.v);
  });
  let lastV = 0;
  V.wrap.addEventListener("keydown", (e) => {
    if (VIEWS[e.key]) { setView(+e.key); e.preventDefault(); }
    if (e.key === "v") lastV = performance.now();
    if (e.key === "f" && performance.now() - lastV < 1200) fit();
  });
  setView(0);
  onTheme(() => { mat.color.copy(col("--model")); });
}

/* ============================================================
   第5・14章：パラメトリックな箱
   ============================================================ */
export function parambox(fig, c) {
  const P = { W: 60, D: 40, Hh: 30, t: 2, clr: 0.2, open: 1 };
  const ctrl = document.createElement("div");
  ctrl.className = "ctrl";
  const R = (k, label, min, max, step, unit) => `<label>${label} <input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${P[k]}"></label><output data-o="${k}"></output>`;
  ctrl.innerHTML = R("W", "width", 30, 100, 1) + R("D", "depth", 20, 80, 1) + R("Hh", "height", 10, 60, 1) + R("t", "wall", 1.2, 4, 0.2) +
    R("clr", "clr", 0, 0.6, 0.05) + `<button class="btn" data-open aria-pressed="true">フタを浮かせる</button>`;
  c.append(ctrl);
  const V = setup(c);
  const ro = document.createElement("div"); ro.className = "readout"; c.append(ro);
  const b = bed(160);
  const mat = modelMat(), lidMat = new THREE.MeshStandardMaterial({ color: col("--accent"), roughness: 0.7 });
  const group = new THREE.Group();
  V.scene.add(b, group);
  const rebuild = () => {
    group.children.forEach((o) => o.geometry?.dispose());
    group.clear();
    const { W, D, Hh, t, clr } = P, r = 4, floor = t, lipH = 5, lipW = 1.6;
    const floorG = extrude(rrect(W, D, r), floor);
    const wallG = extrude(ring(W, D, r, t), Hh - floor); wallG.translate(0, 0, floor);
    const lidZ = Hh + (P.open ? 18 : 0);
    const lidG = extrude(rrect(W, D, r), t); lidG.translate(0, 0, lidZ);
    const iw = W - 2 * t - 2 * clr, id = D - 2 * t - 2 * clr;
    const lipG = extrude(ring(iw, id, Math.max(0.3, r - t), lipW), lipH); lipG.translate(0, 0, lidZ - lipH);
    [floorG, wallG].forEach((g) => { group.add(new THREE.Mesh(g, mat)); group.add(edgeLines(g)); });
    [lidG, lipG].forEach((g) => { group.add(new THREE.Mesh(g, lidMat)); group.add(edgeLines(g)); });
    ctrl.querySelectorAll("output").forEach((o) => (o.textContent = (+P[o.dataset.o]).toFixed(o.dataset.o === "clr" || o.dataset.o === "t" ? 2 : 0)));
    const inW = W - 2 * t, inD = D - 2 * t, inH = Hh - floor;
    ro.innerHTML = `内寸 <b>${inW.toFixed(1)} × ${inD.toFixed(1)} × ${inH.toFixed(1)}</b> mm　フタの爪の外寸 <b>${iw.toFixed(2)} × ${id.toFixed(2)}</b> mm（＝内寸 − 2×clr）`;
  };
  ctrl.addEventListener("input", (e) => { const k = e.target.dataset.k; if (k) { P[k] = +e.target.value; rebuild(); } });
  ctrl.querySelector("[data-open]").onclick = (e) => { P.open = P.open ? 0 : 1; e.target.setAttribute("aria-pressed", !!P.open); rebuild(); };
  V.camera.position.set(110, -150, 120);
  V.controls.target.set(0, 0, 18);
  rebuild();
  onTheme(() => { mat.color.copy(col("--model")); lidMat.color.copy(col("--accent")); b.userData.refresh(); });
}

/* ============================================================
   第6章：印刷向きとオーバーハング
   ============================================================ */
export function orient(fig, c) {
  const ctrl = document.createElement("div");
  ctrl.className = "ctrl";
  ctrl.innerHTML = `<span class="seg">
      <button data-p="stand" aria-pressed="true">立てる</button><button data-p="back" aria-pressed="false">背面を下</button>
      <button data-p="side" aria-pressed="false">側面を下</button><button data-p="flip" aria-pressed="false">逆さ</button></span>
    <button class="btn" data-r="x">X軸 90°</button><button class="btn" data-r="y">Y軸 90°</button>
    <label>許容角（垂直から） <input type="range" min="30" max="70" step="5" value="45"></label><output></output>`;
  c.append(ctrl);
  const V = setup(c);
  const ro = document.createElement("div"); ro.className = "readout"; c.append(ro);
  // 壁掛けフック（断面を幅 20mm で押し出し）
  const prof = new THREE.Shape([[0, 0], [26, 0], [26, 14], [22, 14], [22, 5], [4, 5], [4, 50], [0, 50]].map(([y, z]) => new THREE.Vector2(y, z)));
  let base = extrude(prof, 20);
  if (base.index) base = base.toNonIndexed();
  base.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1));
  base.translate(-10, -13, -25);
  const geo = base.clone();
  const colors = new Float32Array(geo.attributes.position.count * 3);
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const mesh = new THREE.Mesh(geo, mat);
  const edges = edgeLines(geo);
  const b = bed(120);
  // サポートが入る空間（赤い面からプレートまで）を半透明で表示
  const supMat = new THREE.MeshBasicMaterial({ color: col("--ng"), transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
  const sup = new THREE.Mesh(new THREE.BufferGeometry(), supMat);
  V.scene.add(b, mesh, edges, sup);
  const q = new THREE.Quaternion();
  let thr = 45;
  const PRESET = {
    stand: new THREE.Quaternion(),
    back: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2),
    side: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2),
    flip: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI),
  };
  const apply = () => {
    const m = new THREE.Matrix4().makeRotationFromQuaternion(q);
    geo.attributes.position.copy(base.attributes.position);
    geo.applyMatrix4(m);
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    geo.translate(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, -bb.min.z);
    geo.computeVertexNormals();
    const pos = geo.attributes.position, cN = col("--model"), cR = col("--ng"), cB = col("--accent-2");
    const a = new THREE.Vector3(), b2 = new THREE.Vector3(), c2 = new THREE.Vector3(), n = new THREE.Vector3();
    let red = 0, maxZ = 0;
    const sp = [];
    const prism = (p, q, r) => {
      const [p0, q0, r0] = [p, q, r].map((v) => [v.x, v.y, 0]);
      const [P1, Q1, R1] = [p, q, r].map((v) => [v.x, v.y, v.z]);
      sp.push(...P1, ...Q1, ...R1, ...p0, ...r0, ...q0);
      [[P1, Q1, q0, p0], [Q1, R1, r0, q0], [R1, P1, p0, r0]].forEach(([A, B, C, Dd]) => sp.push(...A, ...B, ...C, ...A, ...C, ...Dd));
    };
    for (let i = 0; i < pos.count; i += 3) {
      a.fromBufferAttribute(pos, i); b2.fromBufferAttribute(pos, i + 1); c2.fromBufferAttribute(pos, i + 2);
      maxZ = Math.max(maxZ, a.z, b2.z, c2.z);
      n.subVectors(c2, b2).cross(new THREE.Vector3().subVectors(a, b2)).normalize();
      const area = new THREE.Vector3().subVectors(b2, a).cross(new THREE.Vector3().subVectors(c2, a)).length() / 2;
      const onBed = Math.max(a.z, b2.z, c2.z) < 0.05;
      let cc = cN;
      if (onBed) cc = cB;
      else if (n.z < -1e-3) {
        const ang = (Math.asin(Math.min(1, -n.z)) * 180) / Math.PI;
        if (ang > thr) { cc = cR; red += area; prism(a.clone(), b2.clone(), c2.clone()); }
      }
      for (let k = 0; k < 3; k++) colors.set([cc.r, cc.g, cc.b], (i + k) * 3);
    }
    geo.attributes.color.needsUpdate = true;
    sup.geometry.dispose();
    sup.geometry = new THREE.BufferGeometry();
    sup.geometry.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    supMat.color.copy(cR);
    geo.attributes.position.needsUpdate = true;
    edges.geometry.dispose(); edges.geometry = new THREE.EdgesGeometry(geo, 25);
    // 強度：積層方向（上）がフック断面の押し出し方向（モデルX）と一致すれば強い
    const upInModel = new THREE.Vector3(0, 0, 1).applyQuaternion(q.clone().invert());
    const strong = Math.abs(upInModel.x) > 0.9;
    ro.innerHTML = `サポートが要る面積 <b>${Math.round(red)} mm²</b>　高さ <b>${maxZ.toFixed(0)} mm</b>（0.2mm で ${Math.ceil(maxZ / 0.2)} 層）　` +
      (strong ? `<span class="st-ok">強度：層が断面に沿い、曲げに強い</span>` : `<span class="st-ng">強度：腕の付け根で層間が引っ張られ、割れやすい</span>`) +
      `<br><span style="color:var(--ng)">■</span>サポートが要る面と、その下に入るサポートの範囲　<span style="color:var(--accent-2)">■</span>プレートに接する面`;
  };
  ctrl.addEventListener("click", (e) => {
    const bt = e.target.closest("button"); if (!bt) return;
    if (bt.dataset.p) {
      q.copy(PRESET[bt.dataset.p]);
      ctrl.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", x === bt));
    }
    if (bt.dataset.r) {
      q.premultiply(new THREE.Quaternion().setFromAxisAngle(bt.dataset.r === "x" ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0), Math.PI / 2));
      ctrl.querySelectorAll("[data-p]").forEach((x) => x.setAttribute("aria-pressed", "false"));
    }
    apply();
  });
  const rg = ctrl.querySelector("input"), out = ctrl.querySelector("output");
  rg.addEventListener("input", () => { thr = +rg.value; out.textContent = thr + "°"; apply(); });
  out.textContent = thr + "°";
  V.camera.position.set(120, -140, 90);
  V.controls.target.set(0, 0, 14);
  apply();
  onTheme(() => { apply(); b.userData.refresh(); });
}

/* ============================================================
   第12章：層ごとのプレビュー
   ============================================================ */
export function slice(fig, c) {
  const W = 40, Dd = 30, Hh = 16, r = 4, lh = 0.2, lw = 0.45, floorN = 6;
  const N = Math.round(Hh / lh);
  const ctrl = document.createElement("div");
  ctrl.className = "ctrl";
  ctrl.innerHTML = `<label>層 <input type="range" min="1" max="${N}" value="${N}"></label><output></output>
    <button class="btn" data-play>積層を再生</button>`;
  c.append(ctrl);
  const V = setup(c);
  const ro = document.createElement("div"); ro.className = "readout"; c.append(ro);
  const b = bed(100);
  V.scene.add(b);
  const ringG = (k) => { const g = extrude(ring(W - 2 * lw * k, Dd - 2 * lw * k, Math.max(0.3, r - lw * k), lw * 0.92), lh * 0.86, 6); return g; };
  const outerG = ringG(0), innerG = ringG(1);
  const mOuter = new THREE.MeshStandardMaterial({ color: col("--accent"), roughness: 0.6 });
  const mInner = new THREE.MeshStandardMaterial({ color: col("--warn"), roughness: 0.6 });
  const mFloor = new THREE.MeshStandardMaterial({ color: col("--ink"), roughness: 0.6 });
  const outer = new THREE.InstancedMesh(outerG, mOuter, N), inner = new THREE.InstancedMesh(innerG, mInner, N);
  const M = new THREE.Matrix4();
  for (let k = 0; k < N; k++) { M.makeTranslation(0, 0, k * lh); outer.setMatrixAt(k, M); inner.setMatrixAt(k, M); }
  // 底面：±45°の線を交互に
  const fw = W - 4 * lw, fd = Dd - 4 * lw;
  const lineGeo = (ang) => {
    const gs = [];
    const L = Math.hypot(fw, fd);
    for (let o = -L / 2; o <= L / 2; o += lw) {
      // 長方形内に収まる区間を求める（中心からの法線方向オフセット o）
      const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
      let t0 = -Infinity, t1 = Infinity;
      const px = nx * o, py = ny * o;
      [[dx, px, fw / 2 - r * 0.4], [dy, py, fd / 2 - r * 0.4]].forEach(([d, p, h]) => {
        if (Math.abs(d) < 1e-6) { if (Math.abs(p) > h) { t0 = 1; t1 = 0; } return; }
        const a = (-h - p) / d, bb = (h - p) / d;
        t0 = Math.max(t0, Math.min(a, bb)); t1 = Math.min(t1, Math.max(a, bb));
      });
      if (t1 - t0 < 0.5) continue;
      const g = new THREE.BoxGeometry(t1 - t0, lw * 0.9, lh * 0.86);
      g.rotateZ(ang);
      const mid = (t0 + t1) / 2;
      g.translate(px + dx * mid, py + dy * mid, lh * 0.43);
      gs.push(g);
    }
    return gs;
  };
  const merge = (gs) => {
    const ngs = gs.map((g) => (g.index ? g.toNonIndexed() : g));
    let n = 0; ngs.forEach((g) => (n += g.attributes.position.count));
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
    ngs.forEach((ng) => { pos.set(ng.attributes.position.array, o * 3); nor.set(ng.attributes.normal.array, o * 3); o += ng.attributes.position.count; });
    const out = new THREE.BufferGeometry(); out.setAttribute("position", new THREE.BufferAttribute(pos, 3)); out.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); return out;
  };
  const fA = merge(lineGeo(Math.PI / 4)), fB = merge(lineGeo(-Math.PI / 4));
  const floorA = new THREE.InstancedMesh(fA, mFloor, Math.ceil(floorN / 2)), floorB = new THREE.InstancedMesh(fB, mFloor, Math.floor(floorN / 2));
  for (let k = 0; k < floorN; k++) { M.makeTranslation(0, 0, k * lh); (k % 2 ? floorB : floorA).setMatrixAt(Math.floor(k / 2), M); }
  const hi = new THREE.Color(0xffffff), cO = col("--accent"), cI = col("--warn");
  mOuter.color.set(0xffffff); mInner.color.set(0xffffff); // 色はインスタンスごとに付ける
  V.scene.add(outer, inner, floorA, floorB);
  const rg = ctrl.querySelector("input"), out = ctrl.querySelector("output");
  let cur = N, play = false, tick = 0;
  const show = (n) => {
    cur = n;
    outer.count = n; inner.count = n;
    floorA.count = Math.min(Math.ceil(floorN / 2), Math.ceil(n / 2));
    floorB.count = Math.min(Math.floor(floorN / 2), Math.floor(n / 2));
    for (let k = 0; k < N; k++) { const top = k === n - 1; outer.setColorAt(k, top ? hi : cO); inner.setColorAt(k, top ? hi : cI); }
    outer.instanceColor.needsUpdate = true; inner.instanceColor.needsUpdate = true;
    rg.value = n; out.textContent = `${n} / ${N}`;
    ro.innerHTML = `高さ <b>${(n * lh).toFixed(1)} mm</b>　` + (n <= floorN ? "底面（ソリッド）を ±45° の線で交互に敷き詰めている。" : "壁だけを積んでいる（上が開いた箱）。") +
      `<br><span style="color:var(--accent)">■</span>外壁　<span style="color:var(--warn)">■</span>内壁　<span style="color:var(--ink)">■</span>底面　白＝いま積んでいる層`;
  };
  rg.addEventListener("input", () => { play = false; show(+rg.value); });
  ctrl.querySelector("[data-play]").onclick = () => { play = true; tick = 0; show(1); };
  V.hooks.push(() => {
    if (!play) return;
    if (++tick % 2 === 0) { if (cur < N) show(cur + 1); else play = false; }
  });
  V.camera.position.set(70, -90, 70);
  V.controls.target.set(0, 0, 6);
  show(N);
  onTheme(() => { cO.copy(col("--accent")); cI.copy(col("--warn")); mFloor.color.copy(col("--ink")); b.userData.refresh(); show(cur); });
}
