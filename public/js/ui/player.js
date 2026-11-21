import { $ } from './dom.js';

const PLAY = '<path d="M4 2l10 6-10 6z"/>';
const PAUSE = '<path d="M3 2h4v12H3zM9 2h4v12H9z"/>';
const delay = () => 1200 * 0.012 ** (($('speed').value - 1) / 99); // 1200 ms … ~15 ms

/** Transport controls (play, step, scrub, speed, keyboard) over a list of N steps. */
export class Player {
  #i = 0; #n = 0; #timer = null;

  constructor(onChange) {
    this.onChange = onChange;
    $('play').onclick = () => this.toggle();
    $('next').onclick = () => this.step(1);
    $('prev').onclick = () => this.step(-1);
    $('last').onclick = () => this.seek(this.#n - 1);
    $('scrub').oninput = (e) => this.seek(+e.target.value);
    addEventListener('keydown', (e) => {
      if (!this.#n) return;
      if (e.key === ' ' && e.target.tagName !== 'BUTTON') { e.preventDefault(); this.toggle(); }
      else if (e.key === 'ArrowRight') this.step(1);
      else if (e.key === 'ArrowLeft') this.step(-1);
    });
  }

  load(n) { this.pause(); this.#n = n; $('scrub').max = n - 1; this.#go(0); }
  unload() { this.pause(); this.#n = 0; }
  step(d) { this.pause(); this.#go(this.#i + d); }
  seek(i) { this.pause(); this.#go(i); }

  toggle() {
    if (this.#timer) return this.pause();
    if (this.#i >= this.#n - 1) this.#go(0);
    $('pi').innerHTML = PAUSE;
    const tick = () => { this.#go(this.#i + 1); if (this.#timer) this.#timer = setTimeout(tick, delay()); };
    this.#timer = setTimeout(tick, delay());
  }

  pause() { clearTimeout(this.#timer); this.#timer = null; $('pi').innerHTML = PLAY; }

  #go(i) {
    this.#i = Math.max(0, Math.min(this.#n - 1, i));
    const last = this.#i === this.#n - 1;
    $('scrub').value = this.#i;
    $('cnt').textContent = `Step ${this.#i + 1} / ${this.#n}`;
    $('prev').disabled = this.#i === 0;
    $('next').disabled = $('last').disabled = last;
    this.onChange(this.#i);
    if (last) this.pause();
  }
}
