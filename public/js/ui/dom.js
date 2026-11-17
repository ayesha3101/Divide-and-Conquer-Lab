export const $ = (id) => document.getElementById(id);
export const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
export const show = (id, on = true, display = 'block') => ($(id).style.display = on ? display : 'none');
