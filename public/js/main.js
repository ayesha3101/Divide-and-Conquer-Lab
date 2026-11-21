import { solve } from './api.js';
import { VIEWS } from './ui/views/index.js';
import { Player } from './ui/player.js';
import { initHome } from './ui/home.js';
import { $, show } from './ui/dom.js';

let view = null;
const player = new Player((i) => view?.show(i));

function showError(message) {
  $('err').textContent = message;
  show('err');
}

function showHome() {
  player.unload(); view = null;
  show('work', false); show('start'); show('err', false);
  $('fin').value = '';
}

function goHome(e) {
  e?.preventDefault();
  if (history.state?.view === 'work') history.back(); // keeps browser history in sync
  else showHome();
}

async function openFile({ file, want }) {
  document.body.style.cursor = 'progress';
  try {
    const raw = await solve(file, want);
    const { hydrate, meta, mount, extra } = VIEWS[raw.key];
    const solved = hydrate(raw), m = meta(solved);

        show('err', false); show('start', false); show('work');
    $('fname').textContent = file.name;
    $('wt').textContent = m.title;
    $('ws').textContent = m.subtitle;
    $('leg').innerHTML = m.legend.map(([label, color]) => `<span><i style="background:${color}"></i>${label}</span>`).join('') + (m.note ? `<span>${m.note}</span>` : '');
    $('stats').innerHTML = m.stats.map(([k, v, cls = '']) => `<div class="${cls}"><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    $('prodBox').replaceChildren();
    extra?.($('prodBox'), solved);

    view = mount($('stage'), $('step'), solved);
    player.load(solved.steps.length);
    history[history.state?.view === 'work' ? 'replaceState' : 'pushState']({ view: 'work' }, '');
  } catch (e) {
    showError(e.message);
  } finally {
    document.body.style.cursor = '';
  }
}

$('again').onclick = $('home').onclick = goHome;
addEventListener('resize', () => view?.resize());
addEventListener('popstate', showHome);
initHome({ onFile: openFile, onError: showError });
