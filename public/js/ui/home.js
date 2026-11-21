import { $ } from './dom.js';
import { SAMPLES } from '../samples.js';

/** Wires the two algorithm cards: click or drop to open a file, plus a sample dropdown. */
export function initHome({ onFile, onError }) {
  let want = null; // algorithm key of the card the user picked

  $('fin').onchange = (e) => e.target.files[0] && onFile({ file: e.target.files[0], want });

  for (const card of document.querySelectorAll('.opt')) {
    const key = card.dataset.k, select = card.querySelector('.smp');
    const pick = () => { want = key; $('fin').click(); };

    card.onclick = (e) => { if (!select.contains(e.target)) pick(); };
    card.ondragenter = () => card.classList.add('over');
    card.ondragleave = (e) => { if (!card.contains(e.relatedTarget)) card.classList.remove('over'); };
    card.ondrop = (e) => {
      e.preventDefault(); e.stopPropagation(); card.classList.remove('over');
      if (e.dataTransfer.files[0]) onFile({ file: e.dataTransfer.files[0], want: key });
    };

    for (const s of SAMPLES.filter((s) => s.key === key)) select.add(new Option(s.label, s.file));
    select.onchange = async () => {
      const path = select.value; select.value = '';
      if (!path) return;
      try {
        const res = await fetch(`samples/${path}`);
        if (!res.ok) throw new Error();
        onFile({ file: new File([await res.blob()], path.split('/').pop()), want: key });
      } catch {
        onError(`Couldn’t load the sample file samples/${path}. Make sure the public/samples folder is deployed.`);
      }
    };
  }
  addEventListener('dragover', (e) => e.preventDefault());
  addEventListener('drop', (e) => { e.preventDefault(); if (e.dataTransfer.files[0]) onFile({ file: e.dataTransfer.files[0], want: null }); });
}