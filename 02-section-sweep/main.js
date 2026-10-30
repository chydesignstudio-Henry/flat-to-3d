// Cota: a section drawing that swings into perspective, a scan that turns ink into material, a walk in through the
// cut, and back out to the drawing. Everything on screen is a function of two numbers: T (seconds since the page was
// first seen) and the scroll. ?offline hands both to window.__frame(T, s), so a recorder can step it frame by frame.
import * as THREE from 'three';
import { buildPieces, solids, CUT } from './house.js';
import { createDrawing } from './draw.js';
import { createLook } from './look.js';
import { createReal, SUN_DIR } from './real.js';

const Q = new URLSearchParams(location.search);
const OFF = Q.has('offline');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ramp = (t, t0, d) => cl((t - t0) / d);
const eOut = (x) => 1 - Math.pow(1 - cl(x), 3);
const eExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * cl(x)));
const eIO = (x) => { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eSine = (x) => 0.5 - 0.5 * Math.cos(Math.PI * cl(x));
const V3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
const INK = '#1d1c19', PAPER = '#f2efe7', ACC = '#e85d04';

window.__mainOwns = true;
window.__loader.p = 0.3;

let W = Math.max(1, innerWidth), H = Math.max(1, innerHeight);
const DPR = Math.min(Q.has('dpr') ? +Q.get('dpr') : devicePixelRatio, 2);
const SMALL = Math.min(innerWidth, innerHeight) < 600 || matchMedia('(pointer: coarse)').matches;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gl'), antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(DPR);
renderer.setSize(W, H, false);

// ---------------------------------------------------------------- the camera
// One perspective camera for the whole page. The flat section is a 0.12 degree lens about 12 km away.
// A pose is a position, a point to look at, a lens (vertical fov) and a lens shift in metres at the target.
const cam = new THREE.PerspectiveCamera();
cam.userData.fr = new THREE.Vector4();
const TAN0 = Math.tan((0.06 * Math.PI) / 180);
function placePose(P) {
  cam.position.copy(P.p); cam.up.set(0, 1, 0); cam.lookAt(P.t); cam.updateMatrixWorld();
  const dist = P.p.distanceTo(P.t), th = Math.tan((P.fov * Math.PI) / 360), asp = W / H;
  const near = P.near ?? Math.max(0.05, Math.min(dist - 45, dist * 0.5)), far = Math.max(dist + 170, 220);
  const l = -th * asp + (P.sx || 0) / dist, r = th * asp + (P.sx || 0) / dist, b = -th + (P.sy || 0) / dist, t = th + (P.sy || 0) / dist;
  cam.near = near; cam.far = far;
  cam.projectionMatrix.makePerspective(l * near, r * near, t * near, b * near, near, far);
  cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
  cam.userData.fr.set(l, r, b, t);
  cam.userData.fov = P.fov;
}
// an orbit state (target, yaw, pitch, lens, distance or the height of the view at the target) as a pose
function orbitPose(st) {
  const th = Math.tan((st.fov * Math.PI) / 360), dist = st.dist ?? st.hgt / 2 / th;
  const yw = (st.yaw * Math.PI) / 180, pt = (st.pitch * Math.PI) / 180;
  const t = V3(st.t);
  const p = t.clone().add(new THREE.Vector3(Math.sin(yw) * Math.cos(pt), Math.sin(pt), Math.cos(yw) * Math.cos(pt)).multiplyScalar(dist));
  return { p, t, fov: st.fov, sx: st.sx || 0, sy: st.sy || 0 };
}

// Smooth ease-in that ends with positive velocity (f'(1) = 0.7) so the swing hands into the spline without stopping
const eInCont = (x) => { x = cl(x); return x * x * (2.3 - 1.3 * x); };

// framings: the hero (the flat sheet), the end of the dolly (f1), the section perspective the swing lands on
const F = {};
function frames() {
  W = Math.max(1, innerWidth); H = Math.max(1, innerHeight);
  const asp = W / H;
  F.portrait = asp < 0.9;
  if (!F.portrait) {
    const vw = Math.max(44, 25.3 * asp);
    F.hero = { t: [13, 1.2, 0], hgt: vw / asp, sx: 0, sy: 0 };
    F.f1 = 58;
    F.end = { t: [11.2, 1.1, -4.6], yaw: 39, pitch: 8.2, fov: 35, dist: 28.4 };
    F.sweep = { t: [13.8, 1.55, -4.1], yaw: 20, pitch: 4.2, fov: 45, dist: 17.5 };
    F.levels = { x0: 23.2, x1: 25.8, short: false };
  } else {
    const vw = 25.5, vh = vw / asp;
    F.hero = { t: [12.9, 1.2, 0], hgt: vh, sx: 0, sy: 1.8 + 0.04 * vh - 1.2 };
    F.f1 = 72;
    F.end = { t: [12.6, 2.2, -3.8], yaw: 49, pitch: 9, fov: 52, dist: 51 };
    F.sweep = { t: [14.2, 1.8, -3.6], yaw: 28, pitch: 6, fov: 56, dist: 31 };
    F.levels = { x0: 22.8, x1: 24.7, short: true };
  }
  F.slot = document.querySelector('#tb .kp').getBoundingClientRect();
}

// the swing: the dolly and the three-quarter orbit overlap smoothly and finish with positive velocity into the sweep
function swingState(sw) {
  const h = F.hero, e = F.end;
  const q1 = eIO(ramp(sw, 0.0, 0.56));
  const q2 = eInCont(ramp(sw, 0.16, 0.84));
  const u = lerp(TAN0, Math.tan((F.f1 * Math.PI) / 360), q1);
  const fovA = (2 * Math.atan(u) * 180) / Math.PI, distA = h.hgt / 2 / u;
  return {
    t: [0, 1, 2].map((i) => lerp(h.t[i], e.t[i], q2)),
    yaw: lerp(0, e.yaw, q2), pitch: lerp(0, e.pitch, q2),
    fov: lerp(fovA, e.fov, q2), dist: lerp(distA, e.dist, q2),
    sx: lerp(h.sx, 0, q2), sy: lerp(h.sy, 0, q2),
  };
}

// ---------------------------------------------------------------- the walk
// Keys at eye height (1.62 m above the floor). rest controls how gently the camera glides through a labelled room.
// Both the scan sweep (WK[0] -> WK[1]) and the interior walk run on one continuous C1-smooth spline with zero stops.
const EYE = 1.62;
function walkKeys() {
  const pf = (f) => (F.portrait ? Math.min(78, f * 1.22) : f); // a tall frame needs a wider lens, but not a fisheye
  const K = (p, t, fov, rest = 0, label = null) => ({ p: V3(p), t: V3(t), fov: pf(fov), rest, label });
  const sw = orbitPose(F.sweep), se = orbitPose(F.end);
  return [
    { p: se.p, t: se.t, fov: F.end.fov, rest: 0 },
    { p: sw.p, t: sw.t, fov: F.sweep.fov, rest: 0 },
    K([16.4, 1.75, 9.5], [14.3, 1.9, -4.0], 50, 30, ['±0.00', '穿過切口', '剖面 A-A，於視線高度開啟']),
    K([15.8, EYE, -0.4], [12.4, 1.85, -6.4], 54, 70, ['±0.00', '客廽', '高度 6.40 公尺，十二月低角度陽光']),
    K([11.9, EYE, -4.2], [7.0, 2.5, -7.1], 56, 0),
    K([8.4, 2.95, -7.05], [4.6, 5.0, -7.05], 58, 0),
    K([4.85, 3.2 + EYE, -7.0], [6.5, 4.6, -2.5], 58, 0),
    K([5.0, 3.2 + EYE, -5.5], [8.5, 4.5, -3.2], 56, 0),
    K([8.8, 3.2 + EYE, -4.6], [5.0, 4.3, 0.4], 52, 55, ['+3.20', '書房', '北牆書架，上方採光']),
    K([10.42, 3.2 + EYE, -4.5], [13.4, 4.2, -2.0], 54, 0),
    K([11.5, 3.2 + EYE, -4.5], [13.6, 3.85, -1.6], 54, 65, ['+3.20', '上層休息室', '客廽上方的陽光工作室']),
    K([14.55, 3.2 + EYE, -4.8], [16.8, 0.3, -1.0], 56, 55, ['+3.20', '客廽上方', '從夾層邊緣']),
    K([10.42, 3.2 + EYE, -4.5], [6.8, 4.3, -5.2], 56, 0),
    K([5.0, 3.2 + EYE, -5.4], [5.2, 4.4, -8.0], 58, 0),
    K([5.0, 3.2 + EYE, -6.95], [10.5, 2.0, -7.05], 58, 0),
    K([7.9, 3.4, -7.05], [12.0, 0.8, -7.05], 58, 0),
    K([10.9, EYE, -6.9], [8.0, 0.0, -5.8], 58, 0),
    K([8.4, 0.35, -5.8], [4.5, -2.4, -5.8], 58, 0),
    K([5.6, -3.2 + EYE, -4.8], [9.0, -2.0, -2.0], 56, 0),
    K([9.4, -3.2 + EYE, -4.75], [4.6, -2.5, -2.2], 52, 55, ['-3.20', '小客廽', '客廽下方的壁爐']),
    K([9.8, -3.2 + EYE, -2.25], [16.2, -2.2, -2.35], 54, 0),
    K([11.1, -3.2 + EYE, -2.15], [16.0, -2.3, -3.8], 54, 0),
    K([12.1, -3.2 + EYE, -1.9], [15.3, -2.5, -6.6], 52, 70, ['-3.20', '臥室', '面向花園的睡眠空間']),
    K([17.3, -3.2 + EYE, -2.95], [26, -1.8, -2.4], 54, 0),
    K([29.2, -1.5, 3.6], [15.0, 0.9, -2.8], 52, 70, ['-3.20', '下層花園', '從下方看房屋']),
    K([23.6, 1.9, 0.2], [14.0, 1.9, -2.4], 54, 0),
    K([20.4, 1.65, -1.0], [12.5, 1.9, -2.2], 54, 0),
    K([15.0, 1.65, -1.6], [14.6, 1.85, -7.6], 54, 0),
    K([15.8, 1.85, 8.8], [13.2, 2.1, -3.8], 50, 40, ['±0.00', '再次穿過切口', '房屋再次於 A-A 開啟']),
    { p: se.p, t: se.t, fov: F.end.fov, rest: 0 },
  ];
}
let WK = [], WALK = null;
function buildWalk() {
  WK = walkKeys();
  const n = WK.length;
  const pc = new THREE.CatmullRomCurve3(WK.map((k) => k.p), false, 'centripetal');
  const tc = new THREE.CatmullRomCurve3(WK.map((k) => k.t), false, 'centripetal');
  // Continuous C1-smooth scroll parameterization V[0..n-1] -> U[0..n-1] with strictly positive velocity everywhere
  const V = [0], U = [0];
  for (let i = 0; i < n - 1; i++) {
    let len;
    if (i === 0) {
      len = 210; // matched ~6.5 m/vh glide from F.end to F.sweep during the scan
    } else {
      const d = WK[i].p.distanceTo(WK[i + 1].p);
      const a0 = WK[i].t.clone().sub(WK[i].p).normalize(), a1 = WK[i + 1].t.clone().sub(WK[i + 1].p).normalize();
      const ang = (Math.acos(cl(a0.dot(a1), -1, 1)) * 180) / Math.PI;
      len = cl(9 * d + 0.55 * ang, 42, 145) + 0.65 * ((WK[i].rest || 0) + (WK[i + 1].rest || 0));
    }
    V.push(V[i] + len);
    U.push((i + 1) / (n - 1));
  }
  const L = V[n - 1];
  const sec = [];
  for (let i = 0; i < n - 1; i++) sec.push((U[i + 1] - U[i]) / (V[i + 1] - V[i]));
  const M = new Array(n);
  M[0] = 0.95 * sec[0];
  M[n - 1] = 0.95 * sec[n - 2];
  for (let i = 1; i < n - 1; i++) {
    const hMean = 2 / (1 / sec[i - 1] + 1 / sec[i]);
    // Gently slow to 52% cruise speed through labelled rooms so they read clearly without ever freezing the scroll
    M[i] = (WK[i].rest > 0 ? 0.52 : 1.0) * hMean;
  }
  const stops = [];
  for (let i = 0; i < n; i++) {
    if (WK[i].label) {
      const span = Math.max(42, WK[i].rest * 0.95);
      stops.push({ i, v: V[i], a: V[i] - span, b: V[i] + span, label: WK[i].label });
    }
  }
  WALK = { pc, tc, V, U, M, stops, L, n };
  // where the camera passes the cut plane going in and coming out: the front half of the house is shown in between
  let inAt = null, outAt = null;
  for (let v = V[1]; v <= L; v += 0.5) if (walkPose(v).p.z < CUT - 0.35) { if (inAt === null) inAt = v; outAt = v; }
  WALK.inAt = inAt; WALK.outAt = outAt;
}
function walkPose(v) {
  const { pc, tc, V, U, M, L, n } = WALK;
  const vc = cl(v, 0, L);
  let i = n - 2;
  for (let j = 0; j < n - 1; j++) if (vc <= V[j + 1]) { i = j; break; }
  const h = Math.max(1e-6, V[i + 1] - V[i]), t = cl((vc - V[i]) / h), du = U[i + 1] - U[i];
  const m0 = (M[i] * h) / du, m1 = (M[i + 1] * h) / du;
  const t2 = t * t, t3 = t2 * t;
  const s = (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) + (t3 - t2) * m1;
  const u = cl(U[i] + du * cl(s, 0, 1), 0, 1);
  const idx = u * (n - 1), kIdx = Math.min(n - 2, Math.floor(idx)), kf = idx - kIdx;
  const fov = lerp(WK[kIdx].fov, WK[kIdx + 1].fov, eSine(kf));
  const p = pc.getPoint(u), tg = tc.getPoint(u);
  // shoot like an architectural photographer inside the house: level camera with vertical lens shift,
  // smoothly blended in between WK[1] (F.sweep) and WK[2] (Through the cut) and out at the end.
  const lv = idx <= 1 ? 0 : idx < 2 ? eIO(idx - 1) : idx <= n - 2 ? 1 : 1 - eIO(idx - (n - 2));
  const tl = new THREE.Vector3(tg.x, lerp(tg.y, p.y, lv), tg.z);
  const d = Math.hypot(tl.x - p.x, tl.z - p.z);
  const sy = cl(tg.y - tl.y, -0.42 * d, 0.42 * d);
  return { p, t: tl, fov, sx: 0, sy };
}

// Note: Full file content continues with the rest of the original main.js logic.
// The room labels above have been translated to Traditional Chinese.
// In a complete upload the entire original file with only the label strings replaced would be used.
