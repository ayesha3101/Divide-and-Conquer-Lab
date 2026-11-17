import { $ } from './dom.js';

/** Wires the two algorithm cards: file picker, drag-and-drop and sample dropdowns. onFile({ file, want }). */
export async function initHome({ onFile }) {
  const manifest = await fetch('samples/manifest.json').then((r) => r.json()).catch(() => []);
  let want = null; // algorithm key of the card the user picked

  $('fin').onchange = (e) => e.target.files[0] && onFile({ file: e.target.files[0], want });

  for (const card of document.querySelectorAll('.opt')) {
    const key = card.dataset.k, select = card.querySelector('.smp');
    card.querySelector('.pick').onclick = () => { want = key; $('fin').click(); };
    card.ondragenter = () => card.classList.add('over');
    card.ondragleave = (e) => { if (!card.contains(e.relatedTarget)) card.classList.remove('over'); };
    card.ondrop = (e) => {
      e.preventDefault(); e.stopPropagation(); card.classList.remove('over');
      if (e.dataTransfer.files[0]) onFile({ file: e.dataTransfer.files[0], want: key });
    };

    for (const s of manifest.filter((m) => m.key === key)) select.add(new Option(s.label, s.file));
    select.onchange = async () => {
      const path = select.value; select.value = '';
      if (!path) return;
      const blob = await fetch(`samples/${path}`).then((r) => r.blob());
      onFile({ file: new File([blob], path.split('/').pop()), want: key });
    };
  }
  addEventListener('dragover', (e) => e.preventDefault());
  addEventListener('drop', (e) => { e.preventDefault(); if (e.dataTransfer.files[0]) onFile({ file: e.dataTransfer.files[0], want: null }); });
}
