/* Wall patterns: hand-drawn seamless tiles in one colour (currentColor), so the owner tints them and sets how strong they show.
   Shared by the page (the wall behind the cards) and the admin (the picker). Nothing here is fetched: it is all inline SVG. */
(function () {
  'use strict';
  const S = 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"';
  const P = [
    { id: 'dots', name: { en: 'Polka dots', ru: 'Горошек' }, w: 22, h: 22, svg: '<circle cx="11" cy="11" r="1.7"/>' },
    { id: 'grid', name: { en: 'Graph paper', ru: 'Клетка' }, w: 28, h: 28, svg: `<path d="M0 .5H28M.5 0V28" ${S} stroke-width="1"/>` },
    { id: 'stripes', name: { en: 'Stripes', ru: 'Полоски' }, w: 16, h: 16, svg: `<path d="M-4 4l8-8M0 16L16 0M12 20l8-8" ${S} stroke-width="3"/>` },
    { id: 'linen', name: { en: 'Linen', ru: 'Лён' }, w: 8, h: 8, svg: `<path d="M0 2h8M0 6h8" ${S} stroke-width=".7"/><path d="M2 0v8M6 0v8" ${S} stroke-width=".7" opacity=".55"/>` },
    { id: 'kraft', name: { en: 'Kraft paper', ru: 'Крафт' }, w: 48, h: 48, svg: `<path d="M4 10l9 2M20 5l6 4M30 20l10 1M8 30l7 5M26 38l9-2M40 8l4 6M14 44l10 1M36 30l8 3M2 22l6-3M44 44l3-5M22 26l5-3M10 16l-4 5" ${S} stroke-width="1"/>` },
    { id: 'cork', name: { en: 'Cork board', ru: 'Пробка' }, w: 40, h: 40, svg: '<circle cx="6" cy="8" r="1.4"/><circle cx="22" cy="4" r=".9"/><circle cx="34" cy="14" r="1.8"/><circle cx="14" cy="22" r="1.1"/><circle cx="28" cy="30" r="1.5"/><circle cx="4" cy="34" r=".8"/><circle cx="38" cy="36" r="1"/><circle cx="18" cy="38" r="1.3"/><circle cx="30" cy="2" r=".7"/><circle cx="10" cy="14" r=".6"/>' },
    { id: 'waves', name: { en: 'Waves', ru: 'Волны' }, w: 40, h: 14, svg: `<path d="M0 7c5-6 15-6 20 0s15 6 20 0" ${S} stroke-width="1.2"/>` },
    { id: 'herringbone', name: { en: 'Herringbone', ru: 'Ёлочка' }, w: 32, h: 16, svg: `<path d="M0 12L12 0M4 16L16 4M16 12L28 0M20 16L32 4M16 4L4 16M28 0" ${S} stroke-width="1.1"/>` },
    { id: 'plus', name: { en: 'Little crosses', ru: 'Крестики' }, w: 24, h: 24, svg: `<path d="M12 8v8M8 12h8" ${S} stroke-width="1.6"/>` },
    { id: 'stars', name: { en: 'Sparkles', ru: 'Искры' }, w: 48, h: 48, svg: '<path d="M24 16l1.6 5.4L31 23l-5.4 1.6L24 30l-1.6-5.4L17 23l5.4-1.6z"/><path d="M8 36l.9 3.1L12 40l-3.1.9L8 44l-.9-3.1L4 40l3.1-.9z"/><path d="M40 4l.9 3.1L44 8l-3.1.9L40 12l-.9-3.1L36 8l3.1-.9z"/>' },
    { id: 'gingham', name: { en: 'Gingham', ru: 'Виши' }, w: 24, h: 24, svg: '<rect width="12" height="12" opacity=".55"/><rect x="12" y="12" width="12" height="12" opacity=".55"/><rect x="12" width="12" height="12" opacity=".2"/><rect y="12" width="12" height="12" opacity=".2"/>' },
    { id: 'confetti', name: { en: 'Confetti', ru: 'Конфетти' }, w: 48, h: 48, fixed: true, svg: '<rect x="6" y="8" width="6" height="3" rx="1" transform="rotate(-20 9 9)" fill="#d99d85"/><rect x="26" y="4" width="6" height="3" rx="1" transform="rotate(30 29 5)" fill="#8fb08a"/><rect x="38" y="20" width="6" height="3" rx="1" transform="rotate(-50 41 21)" fill="#cfa74a"/><rect x="14" y="28" width="6" height="3" rx="1" transform="rotate(15 17 29)" fill="#7f9bb8"/><rect x="30" y="38" width="6" height="3" rx="1" transform="rotate(-30 33 39)" fill="#d99d85"/><rect x="4" y="40" width="6" height="3" rx="1" transform="rotate(40 7 41)" fill="#8fb08a"/><circle cx="24" cy="20" r="1.6" fill="#cfa74a"/><circle cx="42" cy="44" r="1.4" fill="#7f9bb8"/>' },
    /* holiday season */
    { id: 'snow', name: { en: 'Snow', ru: 'Снег' }, w: 48, h: 48, holiday: true, svg: `<g transform="translate(14 14)"><path d="M0-7V7M-6-3.5L6 3.5M-6 3.5L6-3.5M0-7l-2 2M0-7l2 2M0 7l-2-2M0 7l2-2" ${S} stroke-width="1.1"/></g><g transform="translate(36 34) scale(.65)"><path d="M0-7V7M-6-3.5L6 3.5M-6 3.5L6-3.5" ${S} stroke-width="1.3"/></g><circle cx="40" cy="8" r="1"/><circle cx="8" cy="40" r="1.2"/><circle cx="26" cy="44" r=".8"/>` },
    { id: 'garland', name: { en: 'Garland', ru: 'Гирлянда' }, w: 48, h: 20, holiday: true, svg: `<path d="M0 3q12 10 24 0t24 0" ${S} stroke-width="1"/><circle cx="12" cy="10" r="2.2"/><circle cx="36" cy="10" r="2.2"/><path d="M12 7.5v-1.5M36 7.5v-1.5" ${S} stroke-width="1"/>` },
    { id: 'gifts', name: { en: 'Gift boxes', ru: 'Подарки' }, w: 40, h: 40, holiday: true, svg: `<rect x="10" y="15" width="20" height="16" rx="2" ${S} stroke-width="1.3"/><path d="M20 15v16M10 21h20" ${S} stroke-width="1.3"/><path d="M20 15c-5-7-9-1-3 0M20 15c5-7 9-1 3 0" ${S} stroke-width="1.2"/>` },
    { id: 'candy', name: { en: 'Candy cane', ru: 'Леденец' }, w: 16, h: 16, holiday: true, fixed: true, svg: '<path d="M-4 4l8-8M0 16L16 0M12 20l8-8" fill="none" stroke="#c9433a" stroke-width="4"/>' },
    { id: 'pine', name: { en: 'Pine sprigs', ru: 'Хвоя' }, w: 48, h: 48, holiday: true, svg: `<path d="M8 40L26 12M12 32l-6-2M15 27l-5-4M18 22l-3-5M21 17l-1-6M10 36l-6 2M24 15l5-1" ${S} stroke-width="1.2"/><path d="M44 44L30 24M42 38l5 1M39 33l5-2M36 28l4-3M33 25l2-5" ${S} stroke-width="1.1"/>` },
    { id: 'baubles', name: { en: 'Baubles', ru: 'Шары' }, w: 36, h: 44, holiday: true, svg: `<path d="M12 0v9" ${S} stroke-width="1"/><path d="M9.5 9h5v2.5h-5z"/><circle cx="12" cy="19" r="6.5" ${S} stroke-width="1.3"/><path d="M7 17q5-3 10 0" ${S} stroke-width=".9"/><path d="M30 22v6" ${S} stroke-width="1"/><path d="M28.3 28h3.4v1.8h-3.4z"/><circle cx="30" cy="35" r="4.2" ${S} stroke-width="1.2"/>` },
  ];
  const byId = (id) => P.find(p => p.id === id) || null;
  let n = 0;
  /* a full-size SVG that fills its box with the pattern; colour and scale are the owner's, strength is set on the box (opacity) */
  function svg(id, o) {
    const p = byId(id); if (!p) return '';
    const raw = (o && o.color) || 'currentColor', color = raw === 'currentColor' || /^#[0-9a-f]{3,8}$/i.test(raw) ? raw : 'currentColor', scale = Math.max(.4, Math.min(3, +(o && o.scale) || 1)), pid = 'bgp-' + id + '-' + (++n);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true" focusable="false" style="display:block;color:${color}"><defs><pattern id="${pid}" width="${p.w}" height="${p.h}" patternUnits="userSpaceOnUse" patternTransform="scale(${scale})"><g fill="currentColor">${p.svg}</g></pattern></defs><rect width="100%" height="100%" fill="url(#${pid})"/></svg>`;
  }
  window.Patterns = { list: P, byId, svg };
})();
