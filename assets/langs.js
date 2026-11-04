/* Languages a list can have as its second language, the currencies a second price can be shown in, and small helpers
   for country names and flags. Shared by the page and the admin. English stays the first language of every list. */
(function () {
  'use strict';
  /* code → short label (on the switch), native name, script (which font subset to load; "other" = the phone's own font), rtl */
  const LANGS = {
    ru: { label: 'RU', name: 'Русский', script: 'cyrillic' },
    uk: { label: 'UK', name: 'Українська', script: 'cyrillic' },
    be: { label: 'BE', name: 'Беларуская', script: 'cyrillic' },
    kk: { label: 'KK', name: 'Қазақша', script: 'cyrillic' },
    bg: { label: 'BG', name: 'Български', script: 'cyrillic' },
    sr: { label: 'SR', name: 'Српски', script: 'cyrillic' },
    mk: { label: 'MK', name: 'Македонски', script: 'cyrillic' },
    tr: { label: 'TR', name: 'Türkçe', script: 'latin-ext' },
    de: { label: 'DE', name: 'Deutsch', script: 'latin' },
    fr: { label: 'FR', name: 'Français', script: 'latin' },
    es: { label: 'ES', name: 'Español', script: 'latin' },
    it: { label: 'IT', name: 'Italiano', script: 'latin' },
    pt: { label: 'PT', name: 'Português', script: 'latin' },
    nl: { label: 'NL', name: 'Nederlands', script: 'latin' },
    sv: { label: 'SV', name: 'Svenska', script: 'latin' },
    da: { label: 'DA', name: 'Dansk', script: 'latin' },
    nb: { label: 'NO', name: 'Norsk', script: 'latin' },
    fi: { label: 'FI', name: 'Suomi', script: 'latin' },
    pl: { label: 'PL', name: 'Polski', script: 'latin-ext' },
    cs: { label: 'CS', name: 'Čeština', script: 'latin-ext' },
    sk: { label: 'SK', name: 'Slovenčina', script: 'latin-ext' },
    hu: { label: 'HU', name: 'Magyar', script: 'latin-ext' },
    ro: { label: 'RO', name: 'Română', script: 'latin-ext' },
    hr: { label: 'HR', name: 'Hrvatski', script: 'latin-ext' },
    sl: { label: 'SL', name: 'Slovenščina', script: 'latin-ext' },
    lt: { label: 'LT', name: 'Lietuvių', script: 'latin-ext' },
    lv: { label: 'LV', name: 'Latviešu', script: 'latin-ext' },
    et: { label: 'ET', name: 'Eesti', script: 'latin-ext' },
    az: { label: 'AZ', name: 'Azərbaycanca', script: 'latin-ext' },
    vi: { label: 'VI', name: 'Tiếng Việt', script: 'latin-ext' },
    id: { label: 'ID', name: 'Bahasa Indonesia', script: 'latin' },
    el: { label: 'EL', name: 'Ελληνικά', script: 'other' },
    ka: { label: 'KA', name: 'ქართული', script: 'other' },
    hy: { label: 'HY', name: 'Հայերեն', script: 'other' },
    hi: { label: 'HI', name: 'हिन्दी', script: 'other' },
    th: { label: 'TH', name: 'ไทย', script: 'other' },
    zh: { label: 'ZH', name: '中文', script: 'other' },
    ja: { label: 'JA', name: '日本語', script: 'other' },
    ko: { label: 'KO', name: '한국어', script: 'other' },
    he: { label: 'HE', name: 'עברית', script: 'other', rtl: true },
    ar: { label: 'AR', name: 'العربية', script: 'other', rtl: true },
    fa: { label: 'FA', name: 'فارسی', script: 'other', rtl: true },
  };
  /* currencies a second price can be shown in (the browser formats them; this is just the menu) */
  const CURRENCIES = ['EUR', 'GBP', 'TRY', 'RUB', 'UAH', 'KZT', 'BYN', 'GEL', 'AMD', 'AZN', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'RSD', 'SEK', 'NOK', 'DKK', 'CHF', 'INR', 'CNY', 'JPY', 'KRW', 'THB', 'VND', 'IDR', 'AED', 'ILS', 'IRR', 'MKD', 'BRL', 'MXN', 'CAD', 'AUD', 'USD'];
  /* the money of the place a second language is spoken: picked for the owner when the language changes (Setup); any other can still be chosen */
  const LANG_CUR = { ru: 'RUB', uk: 'UAH', be: 'BYN', kk: 'KZT', bg: 'BGN', sr: 'RSD', mk: 'MKD', tr: 'TRY', de: 'EUR', fr: 'EUR', es: 'EUR', it: 'EUR', pt: 'EUR', nl: 'EUR', sv: 'SEK', da: 'DKK', nb: 'NOK', fi: 'EUR', pl: 'PLN', cs: 'CZK', sk: 'EUR', hu: 'HUF', ro: 'RON', hr: 'EUR', sl: 'EUR', lt: 'EUR', lv: 'EUR', et: 'EUR', az: 'AZN', vi: 'VND', id: 'IDR', el: 'EUR', ka: 'GEL', hy: 'AMD', hi: 'INR', th: 'THB', zh: 'CNY', ja: 'JPY', ko: 'KRW', he: 'ILS', ar: 'AED', fa: 'IRR' };
  /* the markets an item can be marked available in: EU as a block, then any country (ISO 3166 alpha-2) */
  const COUNTRIES = ['EU', 'TR', 'RU', 'UA', 'KZ', 'BY', 'GE', 'AM', 'AZ', 'US', 'GB', 'DE', 'FR', 'ES', 'IT', 'PT', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'RS', 'HR', 'SI', 'GR', 'CY', 'LT', 'LV', 'EE', 'IE', 'IL', 'AE', 'SA', 'IN', 'CN', 'HK', 'JP', 'KR', 'TH', 'VN', 'ID', 'MY', 'SG', 'AU', 'NZ', 'CA', 'MX', 'BR', 'AR', 'CL', 'ZA', 'EG', 'MA', 'KE', 'NG'];
  const EU_NAME = { en: 'Europe', ru: 'Европа', uk: 'Європа', tr: 'Avrupa', de: 'Europa', fr: 'Europe', es: 'Europa', it: 'Europa', pt: 'Europa', pl: 'Europa', nl: 'Europa', kk: 'Еуропа', hi: 'यूरोप', zh: '欧洲', ja: 'ヨーロッパ', ko: '유럽' };
  const names = {};
  /* "Turkey" / "Турция": the browser's own translation of a country name, in any language it knows */
  function regionName(code, lang) {
    if (code === 'EU') return EU_NAME[lang] || EU_NAME.en;
    const k = lang + ':' + code; if (names[k]) return names[k];
    let n = code;
    try { n = new Intl.DisplayNames([lang], { type: 'region' }).of(code) || code; } catch (e) {}
    return (names[k] = n);
  }
  const flag = (code) => code === 'EU' ? '🇪🇺' : String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
  /* a price in the second currency, formatted the way that language writes money ("≈ 5 100 ₽", "≈ ₺1.900") */
  function money(amount, currency, lang) {
    try { return new Intl.NumberFormat(lang, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount); } catch (e) { return Math.round(amount) + ' ' + currency; }
  }
  /* English prices are USD: a bare number or range gets its $ ("15" → "$15", "~15" → "~$15", "15–20", "349+", "3.5k", "15/yr");
     anything else stays exactly as typed: "$55", "€120", "15 TL", "1500 руб", "120 euro", "about 15", "free" */
  const BARE = /^[~≈<>]?\s*\d[\d\s.,]*k?(?:\s*[–—-]\s*\d[\d\s.,]*k?)?\+?(?:\s*\/\s*\p{L}+\.?)?$/iu;
  function usd(v) {
    const s = String(v == null ? '' : v).trim();
    return BARE.test(s) ? s.replace(/^([~≈<>]?\s*)/, (m, p) => p + '$') : s;
  }
  /* the English price names dollars (after usd): only then can it be converted at the USD rate */
  const isUSD = (v) => /\$|\bUSD\b/i.test(String(v == null ? '' : v));
  /* "$1,200", "~$55", "$11 800", "$3.5k", "$42–50" → 1200, 55, 11800, 3500, 42; nothing numeric → null */
  function priceUSD(v) {
    const m = String(v == null ? '' : v).replace(/\u00a0/g, ' ').match(/(\d(?:[\d,.]|\s(?=\d))*)\s*(k)?/i); if (!m) return null;
    const n = parseFloat(m[1].replace(/[\s,]/g, '')); return isFinite(n) ? n * (m[2] ? 1000 : 1) : null;
  }
  /* today's USD rates from a free, keyless, public-domain feed (fawazahmed0/currency-api on jsDelivr); used by the admin only */
  async function rates() {
    const r = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('rates ' + r.status);
    const j = await r.json(); return { date: j.date, usd: j.usd || {} };
  }
  window.Langs = { LANGS, CURRENCIES, COUNTRIES, LANG_CUR, regionName, flag, money, usd, isUSD, priceUSD, rates, info: (code) => LANGS[code] || { label: String(code || '').toUpperCase().slice(0, 3), name: code, script: 'other' } };
})();
