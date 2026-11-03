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
    { id: 'clouds', name: { en: 'Clouds', ru: 'Облака' }, w: 96, h: 72, svg: '<path d="M14 30c-6 0-8-8-1-10 1-8 12-9 15-3 6-3 13 1 11 7 6 1 5 9-1 9H14z"/><path d="M58 60c-5 0-7-6-1-8 1-6 9-7 12-2 5-2 10 1 9 5 5 1 4 7-1 7H58z" opacity=".85"/><path d="M66 14c-4 0-5-5-1-6 1-4 7-5 9-1 4-2 7 1 6 4 4 0 3 5-1 5H66z" opacity=".7"/><path d="M14 58c-3 0-4-4-1-5 1-3 6-4 8-1 3-1 6 1 5 3 3 0 2 4-1 4H14z" opacity=".7"/>' },
    /* holiday season */
    { id: 'snow', name: { en: 'Snow', ru: 'Снег' }, w: 48, h: 48, holiday: true, svg: `<g transform="translate(14 14)"><path d="M0-7V7M-6-3.5L6 3.5M-6 3.5L6-3.5M0-7l-2 2M0-7l2 2M0 7l-2-2M0 7l2-2" ${S} stroke-width="1.1"/></g><g transform="translate(36 34) scale(.65)"><path d="M0-7V7M-6-3.5L6 3.5M-6 3.5L6-3.5" ${S} stroke-width="1.3"/></g><circle cx="40" cy="8" r="1"/><circle cx="8" cy="40" r="1.2"/><circle cx="26" cy="44" r=".8"/>` },
    { id: 'gifts', name: { en: 'Gift boxes', ru: 'Подарки' }, w: 40, h: 40, holiday: true, svg: `<rect x="10" y="15" width="20" height="16" rx="2" ${S} stroke-width="1.3"/><path d="M20 15v16M10 21h20" ${S} stroke-width="1.3"/><path d="M20 15c-5-7-9-1-3 0M20 15c5-7 9-1 3 0" ${S} stroke-width="1.2"/>` },
    { id: 'candy', name: { en: 'Candy cane', ru: 'Леденец' }, w: 16, h: 16, holiday: true, fixed: true, svg: '<path d="M-4 4l8-8M0 16L16 0M12 20l8-8" fill="none" stroke="#c9433a" stroke-width="4"/>' },
    { id: 'firs', name: { en: 'Snowy firs', ru: 'Ёлки в снегу' }, w: 64, h: 72, holiday: true, svg: `<path d="M20 12l-9 14h5l-7 11h6l-8 13h26l-8-13h6l-7-11h5z"/><path d="M20 12l-4 6h8zM17 26l-3 5h12l-3-5zM15 37l-4 6h18l-4-6z" fill="#fff" opacity=".55"/><path d="M18 50h4v6h-4z"/><path d="M50 30l-6 9h4l-5 8h4l-6 9h18l-6-9h4l-5-8h4z" opacity=".85"/><path d="M50 30l-3 4h6zM48 39l-2 4h8l-2-4z" fill="#fff" opacity=".5"/><path d="M48.5 56h3v5h-3z"/><circle cx="8" cy="8" r="1.1"/><circle cx="40" cy="6" r=".9"/><circle cx="58" cy="18" r="1.1"/><circle cx="6" cy="54" r="1"/><circle cx="34" cy="62" r=".9"/><circle cx="60" cy="68" r="1.1"/><circle cx="28" cy="20" r=".8"/>` },
    { id: 'baubles', name: { en: 'Baubles', ru: 'Шары' }, w: 36, h: 44, holiday: true, svg: `<path d="M12 0v9" ${S} stroke-width="1"/><path d="M9.5 9h5v2.5h-5z"/><circle cx="12" cy="19" r="6.5" ${S} stroke-width="1.3"/><path d="M7 17q5-3 10 0" ${S} stroke-width=".9"/><path d="M30 22v6" ${S} stroke-width="1"/><path d="M28.3 28h3.4v1.8h-3.4z"/><circle cx="30" cy="35" r="4.2" ${S} stroke-width="1.2"/>` },
  ];
  /* Premium: tiles from The Pattern Library (thepatternlibrary.com, "for you to use freely in your designs"), by the designers
     named here; served from img/patterns/<id>.webp, 320 px or smaller. Nothing is fetched until a tile is chosen. */
  const TILES = [
    { id: 'tpl-kale-salad', name: 'Kale Salad', by: 'Claudio Guglieri', w: 71, h: 320 },
    { id: 'tpl-fancy-pants', name: 'Fancy Pants', by: 'Anton Repponen', w: 320, h: 160 },
    { id: 'tpl-ripples', name: 'Ripples', by: 'Claudio Guglieri', w: 320, h: 117 },
    { id: 'tpl-leather-nunchuck', name: 'Leather Nunchuck', by: 'Claudio Guglieri', w: 160, h: 320 },
    { id: 'tpl-chalkboard', name: 'Chalkboard', by: 'Claudio Guglieri', w: 308, h: 320 },
    { id: 'tpl-fiesta', name: 'Fiesta', by: 'Julien Bailly', w: 259, h: 320 },
    { id: 'tpl-knitting', name: 'Knitting', by: 'Julien Bailly', w: 171, h: 140 },
    { id: 'tpl-naranjas', name: 'Naranjas', by: 'Natalia de Frutos', w: 262, h: 283 },
    { id: 'tpl-kiwis', name: 'Kiwis', by: 'Natalia de Frutos', w: 207, h: 230 },
    { id: 'tpl-cuadros', name: 'Cuadros', by: 'Natalia de Frutos', w: 233, h: 232 },
    { id: 'tpl-maze', name: 'Maze', by: 'Julien Bailly', w: 320, h: 120 },
    { id: 'tpl-wild-sea', name: 'Wild Sea', by: 'Henry Daubrez', w: 175, h: 175 },
    { id: 'tpl-the-illusionist', name: 'The Illusionist', by: 'Henry Daubrez', w: 119, h: 119 },
    { id: 'tpl-magnus-2050', name: 'Magnus 2050', by: 'Kristoffer Brady', w: 193, h: 320 },
    { id: 'tpl-magnus-2051', name: 'Magnus 2051', by: 'Kristoffer Brady', w: 193, h: 320 },
    { id: 'tpl-magnus-2052', name: 'Magnus 2052', by: 'Kristoffer Brady', w: 193, h: 320 },
    { id: 'tpl-nyc-candy', name: 'NYC Candy', by: 'Claudio Guglieri', w: 187, h: 320 },
    { id: 'tpl-bunting-flag', name: 'Bunting flag', by: 'Raul Varela', w: 320, h: 128 },
    { id: 'tpl-canvas-orange', name: 'Canvas Orange', by: 'Raul Varela', w: 140, h: 100 },
    { id: 'tpl-bicycles', name: 'Bicycles', by: 'Shaun Fox', w: 320, h: 320 },
    { id: 'tpl-hodgepodge', name: 'Hodgepodge', by: 'Anatoliy Gromov', w: 320, h: 320 },
    { id: 'tpl-retro-furnish', name: 'Retro Furnish', by: 'Heury & Heury', w: 213, h: 320 },
    { id: 'tpl-jade', name: 'Jade', by: 'Jade Meneguel', w: 118, h: 117 },
    { id: 'tpl-plaid', name: 'Plaid', by: 'Alexey Tretina', w: 155, h: 155 },
    { id: 'tpl-kitty', name: 'Kitty', by: 'Penny Yu', w: 250, h: 250 },
    { id: 'tpl-quake', name: 'Quake', by: 'Nina Geometrieva', w: 188, h: 320 },
    { id: 'tpl-flowers', name: 'Flowers', by: 'Débora Sayuri', w: 320, h: 320 },
    { id: 'tpl-science', name: 'Science', by: 'Fabricio Marques', w: 320, h: 240 },
    { id: 'tpl-hotdogs', name: 'Hotdogs', by: 'Román Jusdado', w: 320, h: 320 },
    { id: 'tpl-design-tools', name: 'Design Tools', by: 'Miguel Angel Avila', w: 320, h: 268 },
    { id: 'tpl-green-goblin', name: 'Green Goblin', by: 'Dmitry Grigorev', w: 320, h: 320 },
    { id: 'tpl-isometropolis', name: 'Isometropolis', by: 'Alan Geraghty', w: 300, h: 173 },
    { id: 'tpl-special-delivery', name: 'Special Delivery', by: 'Matt Delbridge', w: 320, h: 320 },
    { id: 'tpl-white-wood', name: 'White Wood', by: 'Claudio Guglieri', w: 148, h: 320 },
    { id: 'tpl-sushi', name: 'Sushi', by: 'Claudio Guglieri', w: 320, h: 155 },
    { id: 'tpl-junk-mail', name: 'Junk Mail', by: 'Matt Delbridge', w: 300, h: 300 },
    { id: 'tpl-escape-flight', name: 'Escape Flight', by: 'Claudio Guglieri', w: 320, h: 141 },
    { id: 'tpl-subway-lines', name: 'Subway Lines', by: 'Marc Anderson', w: 320, h: 286 },
    { id: 'tpl-untitled-1', name: 'Untitled 1', by: 'Daniel Marcos Perujo', w: 189, h: 320 },
    { id: 'tpl-dark-wood', name: 'Dark Wood', by: 'Claudio Guglieri', w: 320, h: 100 },
    { id: 'tpl-ocean', name: 'Ocean', by: 'Jon Vlasach', w: 320, h: 320 },
    { id: 'tpl-guglieri-speciale', name: 'Guglieri Speciale', by: 'Jon Vlasach', w: 246, h: 320 },
    { id: 'tpl-geometrica', name: 'Geometrica', by: 'Guy Moorhouse', w: 250, h: 250 },
    { id: 'tpl-glitch', name: 'Glitch', by: 'Tim Green', w: 320, h: 226 },
    { id: 'tpl-asteroids', name: 'Asteroids', by: 'Sanja Kusturica', w: 311, h: 320 },
    { id: 'tpl-celebration', name: 'Celebration', by: 'Prabhu Kandavelu', w: 239, h: 320 },
    { id: 'tpl-ahoy', name: 'Ahoy', by: 'Lorena G', w: 193, h: 320 },
  ];
  const tile = (id) => TILES.find(t => t.id === id) || null;
  const byId = (id) => P.find(p => p.id === id) || null;
  let n = 0;
  /* a full-size SVG that fills its box with the pattern; colour and scale are the owner's, strength is set on the box (opacity) */
  function svg(id, o) {
    const p = byId(id); if (!p) return '';
    const raw = (o && o.color) || 'currentColor', color = raw === 'currentColor' || /^#[0-9a-f]{3,8}$/i.test(raw) ? raw : 'currentColor', scale = Math.max(.4, Math.min(3, +(o && o.scale) || 1)), pid = 'bgp-' + id + '-' + (++n);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true" focusable="false" style="display:block;color:${color}"><defs><pattern id="${pid}" width="${p.w}" height="${p.h}" patternUnits="userSpaceOnUse" patternTransform="scale(${scale})"><g fill="currentColor">${p.svg}</g></pattern></defs><rect width="100%" height="100%" fill="url(#${pid})"/></svg>`;
  }
  window.Patterns = { list: P, byId, svg, tiles: TILES, tile };
})();
