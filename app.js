/**
 * Nepal License Plate Visualizer (app.js)
 * Simple, image-focused visualizer that converts Latin Nepal plate numbers into:
 * 1. The last 4 digits in Nepali (Devanagari) characters
 * 2. Full 1-line (front) and 2-line (back) plate visuals with short captions underneath
 * 3. An optional "Show Details" section explaining character transformation and plate rules
 *
 * Security Notes (Mandatory Secure Web Skills):
 * - All user inputs are validated against a strict allow-list and capped at 50 chars.
 * - DOM manipulation exclusively uses safe APIs (createElement, textContent, replaceChildren).
 *   Zero usage of innerHTML, outerHTML, document.write, or insertAdjacentHTML.
 * - TODO(security): Backend authentication, session cookies, CSRF tokens, SQL queries,
 *   and file upload scanning are N/A for this static client-side-only web tool.
 */

(function () {
  'use strict';

  const MAX_INPUT_LENGTH = 50;
  const ALLOWED_INPUT_REGEX = /^[A-Za-z0-9\s.\-\u0900-\u097FÑñ]*$/;

  const DEVANAGARI_DIGITS = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
  };

  const DEVA_TO_LATIN_DIGIT = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
  };

  const ZONES = {
    ME: { code: 'ME', deva: 'मे', name: 'Mechi' },
    KO: { code: 'KO', deva: 'को', name: 'Kosi' },
    SA: { code: 'SA', deva: 'स', name: 'Sagarmatha' },
    JA: { code: 'JA', deva: 'ज', name: 'Janakpur' },
    BA: { code: 'BA', deva: 'बा', name: 'Bagmati' },
    NA: { code: 'NA', deva: 'ना', name: 'Narayani' },
    GA: { code: 'GA', deva: 'ग', name: 'Gandaki' },
    LU: { code: 'LU', deva: 'लु', name: 'Lumbini' },
    DH: { code: 'DH', deva: 'ध', name: 'Dhawalagiri' },
    RA: { code: 'RA', deva: 'रा', name: 'Rapti' },
    BHE: { code: 'BHE', deva: 'भे', name: 'Bheri' },
    KA: { code: 'KA', deva: 'क', name: 'Karnali' },
    SE: { code: 'SE', deva: 'से', name: 'Seti' },
    MA: { code: 'MA', deva: 'म', name: 'Mahakali' }
  };

  const ZONE_ALIASES = {
    ME: 'ME', MECHI: 'ME',
    KO: 'KO', KOSI: 'KO', KOSHI: 'KO',
    SA: 'SA', SAGARMATHA: 'SA',
    JA: 'JA', JANAKPUR: 'JA',
    BA: 'BA', BAA: 'BA', BAGMATI: 'BA',
    NA: 'NA', NAA: 'NA', NARAYANI: 'NA',
    GA: 'GA', GANDAKI: 'GA',
    LU: 'LU', LUMBINI: 'LU',
    DH: 'DH', DHA: 'DH', DHAULAGIRI: 'DH', DHAWALAGIRI: 'DH',
    RA: 'RA', RAA: 'RA', RAPTI: 'RA',
    BHE: 'BHE', VE: 'BHE', BHERI: 'BHE',
    KA: 'KA', KARNALI: 'KA',
    SE: 'SE', SETI: 'SE',
    MA: 'MA', MAHAKALI: 'MA',
    'मे': 'ME', 'को': 'KO', 'स': 'SA', 'ज': 'JA', 'बा': 'BA',
    'ना': 'NA', 'ग': 'GA', 'लु': 'LU', 'ध': 'DH', 'रा': 'RA',
    'भे': 'BHE', 'क': 'KA', 'से': 'SE', 'म': 'MA'
  };

  const CATEGORIES = {
    KA: { code: 'KA', deva: 'क', plateType: 'private', desc: 'Private Heavy Vehicle' },
    CHA: { code: 'CHA', deva: 'च', plateType: 'private', desc: 'Private Car / Light Vehicle' },
    PA: { code: 'PA', deva: 'प', plateType: 'private', desc: 'Private Motorcycle / Scooter' },
    KHA: { code: 'KHA', deva: 'ख', plateType: 'commercial', desc: 'Commercial Bus / Truck' },
    JA: { code: 'JA', deva: 'ज', plateType: 'commercial', desc: 'Commercial Taxi / Light Vehicle' },
    PHA: { code: 'PHA', deva: 'फ', plateType: 'commercial', desc: 'Commercial Auto / 2-3 Wheeler' },
    HA: { code: 'HA', deva: 'ह', plateType: 'commercial', desc: 'Commercial Tractor' },
    YA: { code: 'YA', deva: 'य', plateType: 'tourist', desc: 'Tourist Vehicle' },
    GA: { code: 'GA', deva: 'ग', plateType: 'government', desc: 'Government Heavy Vehicle' },
    JHA: { code: 'JHA', deva: 'झ', plateType: 'government', desc: 'Government Car / Light Vehicle' },
    BA: { code: 'BA', deva: 'ब', plateType: 'government', desc: 'Government Motorcycle' },
    GHA: { code: 'GHA', deva: 'घ', plateType: 'corporation', desc: 'Corporation Heavy Vehicle' },
    NYA: { code: 'NYA', deva: 'ञ', plateType: 'corporation', desc: 'Corporation Light Vehicle' },
    CD: { code: 'CD', deva: 'सी.डी.', plateType: 'diplomatic', desc: 'Diplomatic Vehicle' }
  };

  const CATEGORY_ALIASES = {
    KA: 'KA', K: 'KA', 'क': 'KA',
    CHA: 'CHA', CA: 'CHA', CH: 'CHA', C: 'CHA', 'च': 'CHA',
    PA: 'PA', P: 'PA', 'प': 'PA',
    KHA: 'KHA', KH: 'KHA', 'ख': 'KHA',
    JA: 'JA', J: 'JA', 'ज': 'JA',
    PHA: 'PHA', FA: 'PHA', PH: 'PHA', F: 'PHA', 'फ': 'PHA',
    HA: 'HA', H: 'HA', 'ह': 'HA',
    YA: 'YA', Y: 'YA', 'य': 'YA',
    GA: 'GA', G: 'GA', 'ग': 'GA',
    JHA: 'JHA', JH: 'JHA', 'झ': 'JHA',
    BA: 'BA', B: 'BA', 'ब': 'BA',
    GHA: 'GHA', GH: 'GHA', 'घ': 'GHA',
    NYA: 'NYA', 'ÑA': 'NYA', NA: 'NYA', YNA: 'NYA', 'ञ': 'NYA',
    CD: 'CD', 'C.D.': 'CD', 'सी.डी.': 'CD', 'सीडी': 'CD'
  };

  const PHONETIC_FALLBACK = {
    A: 'अ', AA: 'आ', KA: 'क', KHA: 'ख', GA: 'ग', GHA: 'घ',
    CHA: 'च', CA: 'च', JA: 'ज', JHA: 'झ', NYA: 'ञ',
    TA: 'त', DA: 'द', DHA: 'ध', NA: 'न', NAA: 'ना',
    PA: 'प', PHA: 'फ', FA: 'फ', BA: 'ब', BAA: 'बा', BHE: 'भे', MA: 'म',
    YA: 'य', RA: 'र', RAA: 'रा', LA: 'ल', LU: 'लु',
    SA: 'स', SE: 'से', HA: 'ह', KO: 'को', ME: 'मे', PRA: 'प्र', PRADESH: 'प्रदेश'
  };

  const VALID_THEMES = {
    private: true,
    commercial: true,
    tourist: true,
    government: true,
    corporation: true,
    diplomatic: true
  };

  const state = {
    rawInput: 'BA 2 CHA 1234',
    selectedType: 'auto',
    detailsOpen: false
  };

  function toDevanagariDigits(numStr) {
    let out = '';
    for (let i = 0; i < numStr.length; i++) {
      const ch = numStr[i];
      out += DEVANAGARI_DIGITS[ch] ? DEVANAGARI_DIGITS[ch] : ch;
    }
    return out;
  }

  function normalizeDigitsToAscii(str) {
    let out = '';
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      out += DEVA_TO_LATIN_DIGIT[ch] ? DEVA_TO_LATIN_DIGIT[ch] : ch;
    }
    return out;
  }

  function tokenizePlate(inputStr) {
    const normalized = normalizeDigitsToAscii(inputStr.trim().toUpperCase())
      .replace(/C\.D\./g, ' CD ')
      .replace(/बा\.प्र\./g, ' BAPRA ');

    const roughParts = normalized.split(/[\s.\-]+/).filter(Boolean);
    const tokens = [];

    for (let i = 0; i < roughParts.length; i++) {
      const subParts = roughParts[i].match(/[A-ZÑ\u0900-\u097F]+|[0-9]+/g);
      if (subParts) {
        for (let j = 0; j < subParts.length; j++) {
          tokens.push(subParts[j]);
        }
      }
    }
    return tokens;
  }

  function parsePlateInput(rawInput) {
    const tokens = tokenizePlate(rawInput);

    if (tokens.length === 0) {
      return {
        detectedType: 'private',
        lastDigitsLatin: '1234',
        lastDigitsDeva: '१२३४',
        singleLine: 'बा २ च १२३४',
        line1Standard: 'बा २ च',
        line2Standard: '१२३४',
        line1Split: 'बा २',
        line2Split: 'च १२३४',
        breakdownTokens: []
      };
    }

    // Standard 4-part Zonal match: [Zone] [Lot] [Category] [Serial]
    if (
      tokens.length === 4 &&
      !/^[0-9]+$/.test(tokens[0]) &&
      /^[0-9]+$/.test(tokens[1]) &&
      !/^[0-9]+$/.test(tokens[2]) &&
      /^[0-9]+$/.test(tokens[3])
    ) {
      const zKey = ZONE_ALIASES[tokens[0]];
      const zoneInfo = (zKey && ZONES[zKey]) ? ZONES[zKey] : {
        code: tokens[0],
        deva: PHONETIC_FALLBACK[tokens[0]] || tokens[0],
        name: 'Zone'
      };

      const lotLatin = tokens[1];
      const lotDeva = toDevanagariDigits(lotLatin);

      const cKey = CATEGORY_ALIASES[tokens[2]];
      const catInfo = (cKey && CATEGORIES[cKey]) ? CATEGORIES[cKey] : {
        code: tokens[2],
        deva: PHONETIC_FALLBACK[tokens[2]] || tokens[2],
        plateType: 'private',
        desc: 'Category'
      };

      const serialLatin = tokens[3];
      const serialDeva = toDevanagariDigits(serialLatin);

      return {
        detectedType: catInfo.plateType,
        lastDigitsLatin: serialLatin,
        lastDigitsDeva: serialDeva,
        singleLine: zoneInfo.deva + ' ' + lotDeva + ' ' + catInfo.deva + ' ' + serialDeva,
        line1Standard: zoneInfo.deva + ' ' + lotDeva + ' ' + catInfo.deva,
        line2Standard: serialDeva,
        line1Split: zoneInfo.deva + ' ' + lotDeva,
        line2Split: catInfo.deva + ' ' + serialDeva,
        breakdownTokens: [
          { role: 'Zone', latin: tokens[0], deva: zoneInfo.deva, meaning: zoneInfo.name },
          { role: 'Lot #', latin: lotLatin, deva: lotDeva, meaning: 'Batch number' },
          { role: 'Category', latin: tokens[2], deva: catInfo.deva, meaning: catInfo.desc },
          { role: 'Number', latin: serialLatin, deva: serialDeva, meaning: 'Vehicle digits' }
        ]
      };
    }

    // General / Provincial / Partial fallback
    const devaParts = [];
    const breakdownTokens = [];
    let detectedType = 'private';
    let lastDigitsLatin = '';
    let lastDigitsDeva = '';

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (/^[0-9]+$/.test(tok)) {
        const isLast = i === tokens.length - 1;
        const dNum = toDevanagariDigits(tok);
        devaParts.push(dNum);
        lastDigitsLatin = tok;
        lastDigitsDeva = dNum;
        breakdownTokens.push({
          role: isLast ? 'Number' : 'Lot / Code',
          latin: tok,
          deva: dNum,
          meaning: isLast ? 'Vehicle digits' : 'Registration code'
        });
      } else if (i === 0 && ZONE_ALIASES[tok] && tokens.length >= 3) {
        const z = ZONES[ZONE_ALIASES[tok]];
        devaParts.push(z.deva);
        breakdownTokens.push({ role: 'Zone', latin: tok, deva: z.deva, meaning: z.name });
      } else if (CATEGORY_ALIASES[tok]) {
        const c = CATEGORIES[CATEGORY_ALIASES[tok]];
        detectedType = c.plateType;
        devaParts.push(c.deva);
        breakdownTokens.push({ role: 'Category', latin: tok, deva: c.deva, meaning: c.desc });
      } else if (ZONE_ALIASES[tok]) {
        const z = ZONES[ZONE_ALIASES[tok]];
        devaParts.push(z.deva);
        breakdownTokens.push({ role: 'Zone', latin: tok, deva: z.deva, meaning: z.name });
      } else {
        const fb = PHONETIC_FALLBACK[tok] || tok;
        devaParts.push(fb);
        breakdownTokens.push({ role: 'Code', latin: tok, deva: fb, meaning: 'Code' });
      }
    }

    const singleLine = devaParts.join(' ');
    const lastPart = devaParts[devaParts.length - 1] || '';
    const topParts = devaParts.length > 1 ? devaParts.slice(0, -1).join(' ') : singleLine;
    const splitTop = devaParts.length > 2 ? devaParts.slice(0, -2).join(' ') : topParts;
    const splitBottom = devaParts.length > 2 ? devaParts.slice(-2).join(' ') : lastPart;

    if (!lastDigitsDeva) {
      lastDigitsLatin = tokens[tokens.length - 1];
      lastDigitsDeva = lastPart;
    }

    return {
      detectedType: detectedType,
      lastDigitsLatin: lastDigitsLatin,
      lastDigitsDeva: lastDigitsDeva,
      singleLine: singleLine,
      line1Standard: topParts,
      line2Standard: lastPart,
      line1Split: splitTop,
      line2Split: splitBottom,
      breakdownTokens: breakdownTokens
    };
  }

  /**
   * Build a realistic plate graphic using native DOM elements + CSS Flexbox
   * so Devanagari ligatures and centering render accurately on iOS Chrome/Safari and Desktop.
   */
  function createPlateElement(options) {
    const lines = options.lines;
    const themeKey = VALID_THEMES[options.themeKey] ? options.themeKey : 'private';
    const isSingleLine = lines.length === 1;

    const plate = document.createElement('div');
    plate.className = 'plate-graphic ' +
      (isSingleLine ? 'plate-1line ' : 'plate-2line ') +
      'plate-theme-' + themeKey;
    plate.setAttribute('role', 'img');
    plate.setAttribute('aria-label', options.caption + ': ' + lines.join(' '));

    const rim = document.createElement('div');
    rim.className = 'plate-inner-rim';
    plate.appendChild(rim);

    const boltLeft = document.createElement('span');
    boltLeft.className = 'plate-bolt bolt-left';
    plate.appendChild(boltLeft);

    const boltRight = document.createElement('span');
    boltRight.className = 'plate-bolt bolt-right';
    plate.appendChild(boltRight);

    if (isSingleLine) {
      const lineEl = document.createElement('div');
      lineEl.className = 'plate-line plate-line-single' + (lines[0].length > 12 ? ' plate-line-long' : '');
      lineEl.textContent = lines[0];
      plate.appendChild(lineEl);
    } else {
      const topEl = document.createElement('div');
      topEl.className = 'plate-line plate-line-top' + (lines[0].length > 9 ? ' plate-line-long' : '');
      topEl.textContent = lines[0];

      const bottomEl = document.createElement('div');
      bottomEl.className = 'plate-line plate-line-bottom';
      bottomEl.textContent = lines[1];

      plate.appendChild(topEl);
      plate.appendChild(bottomEl);
    }

    return plate;
  }

  function renderApp() {
    const parsed = parsePlateInput(state.rawInput);
    const effectiveType = state.selectedType === 'auto' ? parsed.detectedType : state.selectedType;

    // 1. Render Last 4 Digits in Nepali Language (not in a plate)
    const digitsDisplay = document.getElementById('last-digits-display');
    const digitsCaption = document.getElementById('last-digits-caption');
    if (digitsDisplay) {
      digitsDisplay.textContent = parsed.lastDigitsDeva;
    }
    if (digitsCaption) {
      digitsCaption.textContent = parsed.lastDigitsLatin + ' → ' + parsed.lastDigitsDeva;
    }

    // 2. Render Full Plate Graphics with Short Captions Underneath
    const galleryEl = document.getElementById('plates-gallery');
    if (galleryEl) {
      galleryEl.replaceChildren();

      const plates = [
        {
          caption: 'Front Plate (1-Line)',
          lines: [parsed.singleLine]
        },
        {
          caption: 'Back Plate (2-Line)',
          lines: [parsed.line1Standard, parsed.line2Standard]
        }
      ];

      if (parsed.line1Split !== parsed.line1Standard) {
        plates.push({
          caption: 'Back Plate (Alternative 2-Line)',
          lines: [parsed.line1Split, parsed.line2Split]
        });
      }

      plates.forEach(function (spec) {
        const item = document.createElement('div');
        item.className = 'plate-item';

        const plateEl = createPlateElement({
          caption: spec.caption,
          lines: spec.lines,
          themeKey: effectiveType
        });

        const caption = document.createElement('p');
        caption.className = 'image-caption';
        caption.textContent = spec.caption;

        item.appendChild(plateEl);
        item.appendChild(caption);
        galleryEl.appendChild(item);
      });
    }

    // 3. Populate Character Breakdown inside Details Panel
    const tokensContainer = document.getElementById('tokens-container');
    if (tokensContainer) {
      tokensContainer.replaceChildren();
      parsed.breakdownTokens.forEach(function (tok) {
        const card = document.createElement('div');
        card.className = 'token-card';

        const role = document.createElement('span');
        role.className = 'token-role';
        role.textContent = tok.role;

        const pair = document.createElement('div');
        pair.className = 'token-pair';

        const lat = document.createElement('span');
        lat.className = 'token-latin';
        lat.textContent = tok.latin;

        const arr = document.createElement('span');
        arr.className = 'token-arrow';
        arr.textContent = '→';

        const dev = document.createElement('span');
        dev.className = 'token-deva';
        dev.textContent = tok.deva;

        pair.appendChild(lat);
        pair.appendChild(arr);
        pair.appendChild(dev);

        const meaning = document.createElement('span');
        meaning.className = 'token-meaning';
        meaning.textContent = tok.meaning;

        card.appendChild(role);
        card.appendChild(pair);
        card.appendChild(meaning);
        tokensContainer.appendChild(card);
      });
    }
  }

  function populateReferenceTables() {
    const numeralsGrid = document.getElementById('ref-numerals-grid');
    if (numeralsGrid) {
      numeralsGrid.replaceChildren();
      Object.keys(DEVANAGARI_DIGITS).forEach(function (digit) {
        const item = document.createElement('div');
        item.className = 'num-item';

        const deva = document.createElement('span');
        deva.className = 'num-deva';
        deva.textContent = DEVANAGARI_DIGITS[digit];

        const lat = document.createElement('span');
        lat.className = 'num-latin';
        lat.textContent = digit;

        item.appendChild(deva);
        item.appendChild(lat);
        numeralsGrid.appendChild(item);
      });
    }

    const zonesGrid = document.getElementById('ref-zones-grid');
    if (zonesGrid) {
      zonesGrid.replaceChildren();
      Object.keys(ZONES).forEach(function (zKey) {
        const z = ZONES[zKey];
        const item = document.createElement('div');
        item.className = 'zone-item';

        const deva = document.createElement('span');
        deva.className = 'zone-deva';
        deva.textContent = z.deva;

        const text = document.createElement('span');
        text.textContent = z.code + ' (' + z.name + ')';

        item.appendChild(deva);
        item.appendChild(text);
        zonesGrid.appendChild(item);
      });
    }
  }

  function handleInputChange() {
    const inputEl = document.getElementById('plate-input');
    const errorEl = document.getElementById('input-error');
    if (!inputEl || !errorEl) return;

    if (inputEl.value.length > MAX_INPUT_LENGTH) {
      inputEl.value = inputEl.value.slice(0, MAX_INPUT_LENGTH);
    }

    if (!ALLOWED_INPUT_REGEX.test(inputEl.value)) {
      errorEl.textContent = 'Please enter letters and numbers only.';
      errorEl.classList.remove('hidden');
      state.rawInput = inputEl.value.replace(/[^A-Za-z0-9\s.\-\u0900-\u097FÑñ]/g, '');
    } else {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
      state.rawInput = inputEl.value;
    }

    renderApp();
  }

  function init() {
    populateReferenceTables();

    const inputEl = document.getElementById('plate-input');
    if (inputEl) {
      inputEl.addEventListener('input', handleInputChange);
    }

    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn && inputEl) {
      clearBtn.addEventListener('click', function () {
        inputEl.value = '';
        inputEl.focus();
        handleInputChange();
      });
    }

    const switchBtns = document.querySelectorAll('.switch-btn');
    switchBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.selectedType = btn.getAttribute('data-type') || 'auto';
        switchBtns.forEach(function (b) {
          const isMatch = b === btn;
          b.classList.toggle('active', isMatch);
          b.setAttribute('aria-checked', isMatch ? 'true' : 'false');
        });
        renderApp();
      });
    });

    const toggleDetailsBtn = document.getElementById('toggle-details-btn');
    const detailsPanel = document.getElementById('details-panel');
    if (toggleDetailsBtn && detailsPanel) {
      toggleDetailsBtn.addEventListener('click', function () {
        state.detailsOpen = !state.detailsOpen;
        detailsPanel.classList.toggle('hidden', !state.detailsOpen);
        toggleDetailsBtn.setAttribute('aria-expanded', state.detailsOpen ? 'true' : 'false');
        toggleDetailsBtn.textContent = state.detailsOpen ? 'Hide Details' : 'Show Details';
      });
    }

    renderApp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
