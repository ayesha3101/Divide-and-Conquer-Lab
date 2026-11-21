import { fmt } from '../dom.js';

const COLOR = { left: '#12907F', right: '#3B4BDB', strip: '#F2A33A', best: '#E5484D', dim: '#C2C9D6' };

/** API JSON (point indices, snake_case) → the shape the view draws from. */
export function hydrate(r) {
  const P = r.sorted, B = (b) => b && { d: b.d, pair: b.pair.map((i) => P[i]) };
  return {
    n: r.n, time: r.time_ms, calls: r.calls, ok: r.ok, sorted: P, best: B(r.best),
    steps: r.steps.map((e) => ({ ...e, midX: e.mid_x, strip: e.strip?.map((i) => P[i]), best: B(e.best) })),
  };
}

export const meta = (s) => ({
  title: 'Closest pair of points',
  subtitle: `${fmt(s.n)} points`,
  legend: [['Left half', COLOR.left], ['Right half', COLOR.right], ['Strip', COLOR.strip], ['Closest pair', COLOR.best]],
  ok: s.ok,
  stats: [
    ['Distance', s.best.d.toFixed(4), 'w big'],
    ['Pair', `<span class="mono">(${s.best.pair[0].join(', ')})<br>(${s.best.pair[1].join(', ')})</span>`, 'w'],
    ['Time', `${s.time.toFixed(2)} ms`],
    ['Recursive calls', fmt(s.calls)],
  ],
});

const tag = (cls, label) => `<span class="tag t-${cls}">${label}</span><br>`;
const describe = (e) => ({
  divide: () => `${tag('div', 'Divide')}Split <b>${fmt(e.hi - e.lo)}</b> points at <b>x = ${fmt(e.midX)}</b>. Solve left (${fmt(e.mid - e.lo)}) and right (${fmt(e.hi - e.mid)}) separately.`,
  base: () => `${tag('base', 'Base case')}Only <b>${e.hi - e.lo}</b> points left, so compare every pair. Smallest distance: <b>${isFinite(e.best.d) ? e.best.d.toFixed(2) : 'none'}</b>.`,
  combine: () => `${tag('com', 'Combine')}Best of the two halves: <b>${e.d0.toFixed(2)}</b>. Only <b>${e.strip.length}</b> points lie within that distance of the line, so just those are checked.<br>New best: <b>${e.best.d.toFixed(2)}</b>${e.best.d < e.d0 ? ' (a pair across the line won)' : ''}.`,
  done: () => `${tag('done', 'Done')}The closest pair is <b>${e.best.d.toFixed(4)}</b> apart, shown in red.`,
})[e.type]();

export function mount(stage, stepEl, s) {
  const cv = document.createElement('canvas');
  stage.replaceChildren(cv);
  const P = s.sorted;
  const [x0, x1] = [P[0][0], P[P.length - 1][0]];
  const ys = P.map((p) => p[1]);
  const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
  let cur = 0;

  function draw() {
    const e = s.steps[cur], dpr = devicePixelRatio || 1, W = cv.clientWidth;
    const dx = x1 - x0 || 1, dy = y1 - y0 || 1, pad = 22;
    const H = Math.round(Math.max(320, Math.min(560, (W * dy) / dx + 40)));
    cv.style.height = `${H}px`; cv.width = W * dpr; cv.height = H * dpr;
    const k = Math.min((W - 2 * pad) / dx, (H - 2 * pad) / dy);
    const X = (v) => (W - dx * k) / 2 + (v - x0) * k, Y = (v) => H - (H - dy * k) / 2 - (v - y0) * k;
    const c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const dot = (p, r, col) => { c.fillStyle = col; c.fillRect(X(p[0]) - r, Y(p[1]) - r, 2 * r, 2 * r); };

    P.forEach((p) => dot(p, 1.2, COLOR.dim));
    if (e.type !== 'done') {
      c.fillStyle = 'rgba(59,75,219,.06)';
      c.fillRect(X(P[e.lo][0]) - 4, 0, X(P[e.hi - 1][0]) - X(P[e.lo][0]) + 8, H);
      const mid = e.mid ?? e.hi;
      for (let i = e.lo; i < e.hi; i++) dot(P[i], 2.2, i < mid ? COLOR.left : COLOR.right);
      if (e.midX !== undefined) {
        if (e.type === 'combine') {
          c.fillStyle = 'rgba(242,163,58,.22)';
          c.fillRect(X(e.midX - e.d0), 0, X(e.midX + e.d0) - X(e.midX - e.d0), H);
          e.strip.forEach((p) => dot(p, 3, COLOR.strip));
        }
        c.strokeStyle = '#17202E'; c.lineWidth = 1.5; c.setLineDash([6, 5]);
        c.beginPath(); c.moveTo(X(e.midX), 0); c.lineTo(X(e.midX), H); c.stroke(); c.setLineDash([]);
      }
    }
    const pair = e.best?.pair;
    if (pair) {
      c.strokeStyle = c.fillStyle = COLOR.best; c.lineWidth = 2.5;
      c.beginPath(); c.moveTo(X(pair[0][0]), Y(pair[0][1])); c.lineTo(X(pair[1][0]), Y(pair[1][1])); c.stroke();
      pair.forEach((p) => { c.beginPath(); c.arc(X(p[0]), Y(p[1]), 4.5, 0, 7); c.fill(); });
      if (e.type === 'done') {
        c.lineWidth = 2; c.beginPath();
        c.arc(X((pair[0][0] + pair[1][0]) / 2), Y((pair[0][1] + pair[1][1]) / 2), Math.max(16, (e.best.d * k) / 2 + 12), 0, 7); c.stroke();
      }
    }
  }

  return { show(i) { cur = i; draw(); stepEl.innerHTML = describe(s.steps[i]); }, resize: draw };
}