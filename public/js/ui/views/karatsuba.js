import { $, fmt } from '../dom.js';

const str = (n) => n.toString();
const short = (s) => (s.length > 16 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s);

/** API JSON (flat nodes referenced by id) → linked nodes the view draws from. */
export function hydrate(r) {
  const nodes = r.nodes.map((n) => ({ ...n, subCalls: n.sub_calls, kids: [] }));
  nodes.forEach((n, i) => (n.kids = r.nodes[i].kids.map((k) => nodes[k])));
  return { ...r, time: r.time_ms, nodes, steps: r.steps.map((e) => (e.node == null ? e : { ...e, node: nodes[e.node] })) };
}

export const meta = (s) => ({
  title: 'Integer multiplication',
  subtitle: `Karatsuba · ${s.digits[0]} × ${s.digits[1]} digits`,
  legend: [['Working on it', '#F2A33A'], ['Finished', '#12907F']],
  note: 'Each number is split in half, giving three smaller multiplications instead of four.',
  stats: [
    ['Time', `${s.time.toFixed(2)} ms`],
    ['Recursive calls', fmt(s.calls)],
    ['Verified', s.ok ? '✓ Matches built-in multiply' : '✗ Mismatch', s.ok ? 'ok w' : 'w'],
    ['Product digits', fmt(str(s.product).length)],
  ],
});

/** Product box with expand and copy buttons. */
export function extra(el, s) {
  const full = str(s.product);
  let open = false;
  el.innerHTML = '<div id="prod"></div><div class="rowb"><button class="btn" id="tg"></button><button class="btn" id="cp">Copy product</button></div>';
  const render = () => {
    $('prod').textContent = open || full.length <= 90 ? full : `${full.slice(0, 60)} … ${full.slice(-20)}`;
    $('tg').textContent = open ? 'Show fewer digits' : 'Show all digits';
  };
  $('tg').onclick = () => { open = !open; render(); };
  $('cp').onclick = () => navigator.clipboard.writeText(full).then(() => {
    $('cp').textContent = 'Copied'; setTimeout(() => ($('cp').textContent = 'Copy product'), 1500);
  });
  render();
}

const stepText = (e, s) => {
  const n = e.node, sp = n?.split;
  if (e.type === 'done') return `<span class="tag t-done">Done</span><br>${fmt(s.calls)} recursive calls produced a ${fmt(str(s.product).length)}-digit product, and it matches the built-in result.`;
  if (e.type === 'enter')
    return sp
      ? `<span class="tag t-div">Divide</span><br>Split both numbers at 10<sup>${sp.half}</sup>:<br><span class="mono">${['a', 'b', 'c', 'd'].map((k) => `${k} = ${short(str(sp[k]))}`).join('<br>')}</span><br>Then compute <b>ac</b>, <b>bd</b> and <b>(a+b)(c+d)</b>.`
      : '<span class="tag t-base">Base case</span><br>A single-digit number is involved, so multiply directly.';
  return sp
    ? `<span class="tag t-com">Combine</span><br><b>${n.role}</b> done. Middle term = (a+b)(c+d) − ac − bd, then<br><span class="mono">ac·10<sup>${2 * sp.half}</sup> + middle·10<sup>${sp.half}</sup> + bd</span><br>= <span class="mono">${short(str(n.product))}</span>`
    : `<span class="tag t-base">Base case</span><br>Direct product: <span class="mono">${short(str(n.product))}</span>`;
};

export function mount(stage, stepEl, s) {
  const els = new Map();
  const build = (n) => {
    const li = document.createElement('li'), box = document.createElement('div');
    box.className = `nd${n.depth === 0 ? ' root' : ''}`;
    box.innerHTML = `<span class="role">${n.role}</span><small>${str(n.x).length} × ${str(n.y).length} digits</small><span class="res">= ${short(str(n.product))}</span>`;
    li.append(box); els.set(n, box);
    if (n.kids.length) { const ul = document.createElement('ul'); ul.append(...n.kids.map(build)); li.append(ul); }
    return li;
  };
  const tree = document.createElement('div'), ul = document.createElement('ul');
  tree.className = 'tree tr'; ul.append(build(s.nodes[0])); tree.append(ul); stage.replaceChildren(tree);
  const fit = () => { ul.style.zoom = 1; ul.style.zoom = Math.min(1, tree.clientWidth / ul.scrollWidth); };
  fit();

  function show(i) {
    const state = new Map();
    s.steps.slice(0, i + 1).forEach((e) => e.node && state.set(e.node, e.type === 'enter' ? 'open' : 'done'));
    els.forEach((box, n) => (box.className = `nd${n.depth === 0 ? ' root' : ''} ${state.get(n) ?? ''}`));
    const e = s.steps[i];
    if (e.node) els.get(e.node).classList.add('now');
    stepEl.innerHTML = stepText(e, s);
  }
  return { show, resize: fit };
}
