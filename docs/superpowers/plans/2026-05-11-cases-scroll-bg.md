# Cases Scroll Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sekcia "Vybrané projekty" začína bielym pozadím a plynulo animuje na čierne keď používateľ zascrolluje tak, že predchádzajúce sekcie zmiznú z viewportu.

**Architecture:** CSS `transition` na `.cases` + child elementoch zabezpečuje animáciu. JS scroll handler detekuje moment keď `cases.getBoundingClientRect().top <= 0` a jednorazovo pridá triedu `.is-dark` (plus vymení `section-light` za `section-dark` pre nav). Zmena je jednosmerná — listener sa po spustení odpojí.

**Tech Stack:** Vanilla JS, CSS custom properties — žiadne externé závislosti.

---

## File Structure

- Modify: `index.html:1798` — HTML class zmena
- Modify: `index.html:700-770` — CSS blok CASES, doplniť transition + light/dark state štýly
- Modify: `index.html:2098-2111` — JS scroll blok, doplniť `checkCasesDark` handler

---

### Task 1: HTML — zmena class sekcie

**Files:**
- Modify: `index.html:1798`

- [ ] **Step 1: Zmeniť `section-dark` na `section-light` na cases sekcii**

Na riadku 1798 zmeniť:
```html
<section class="cases section-dark" id="projekty" aria-label="Projekty">
```
na:
```html
<section class="cases section-light" id="projekty" aria-label="Projekty">
```

- [ ] **Step 2: Manuálne overenie v prehliadači**

Otvoriť `index.html` v prehliadači. Sekcia "Vybrané projekty" musí mať biele pozadie keď nie je scrollnutá. Text musí byť čitateľný (tmavý). Nav nad sekciou musí prejsť do light modu (tmavý text) keď sa nad ňou nachádza.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: cases sekcia zacina so section-light (biele pozadie)"
```

---

### Task 2: CSS — transition + light a dark state štýly

**Files:**
- Modify: `index.html:700-770` (CSS blok CASES)

- [ ] **Step 1: Pridať comment header a transition na `.cases`**

Za riadok `/* =========== CASES (dark) =========== */` (riadok 701) a za `.cases { padding: 140px 0 140px; }` (riadok 704) pridať nový blok ihneď po existujúcej `.cases` deklarácii. Existujúcu `.cases { padding: ... }` rozšíriť o `transition`:

Nájsť v CSS (riadok 704):
```css
.cases { padding: 140px 0 140px; }
```
Zmeniť na:
```css
.cases {
  padding: 140px 0 140px;
  transition: background 0.7s ease, color 0.7s ease;
}
```

- [ ] **Step 2: Pridať transitions a light/dark state rules za `.cases` blok**

Transitions musia byť deklarované MIMO state scope (inak by pri prepnutí na `.is-dark` zanikli a animácia by nefungovala). Existujúce `.case-row { transition: transform ... }` treba rozšíriť, nie nahradiť.

Za `.cases { padding... transition... }` blok pridať (pred `.cases-head {`):

```css
/* Child element transitions — vždy aktívne */
.cases .case-num,
.cases .case-desc,
.cases .case-tags,
.cases .case-loc { transition: color 0.7s ease; }
.cases .case-list { transition: border-color 0.7s ease; }

/* Light state (pred scroll triggerom) */
.cases:not(.is-dark) { background: #ffffff; color: var(--text-dark); }
.cases:not(.is-dark) .case-num,
.cases:not(.is-dark) .case-desc,
.cases:not(.is-dark) .case-tags,
.cases:not(.is-dark) .case-loc { color: var(--text-muted-light); }
.cases:not(.is-dark) .case-list { border-color: var(--border-light); }
.cases:not(.is-dark) .case-row  { border-color: var(--border-light); }

/* Dark state (po scroll triggeri) */
.cases.is-dark { background: var(--bg-dark); color: var(--text-light); }
```

Existujúce `.case-row` má `transition: transform 0.4s cubic-bezier(.2,.8,.2,1)`. Nájsť toto pravidlo (riadok ~731) a rozšíriť ho o `border-color`:

```css
.case-row {
  display: grid;
  grid-template-columns: 60px 1.2fr 2fr 1fr 0.8fr;
  gap: 32px;
  align-items: center;
  border-top: 1px solid var(--border-dark);
  padding: 28px 0;
  transition: transform 0.4s cubic-bezier(.2,.8,.2,1), border-color 0.7s ease;
  position: relative;
}
```

- [ ] **Step 3: Manuálne overenie**

V prehliadači:
- Sekcia bez scrollu: biela, texty v `.case-num`/`.case-desc`/`.case-tags`/`.case-loc` sú svetlé (muted light), linky medzi riadkami sú svetlé.
- Sekcia musí vyzerať čisto — nie tmavý text na bielom pozadí pre muted elementy.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: CSS light/dark state + transition pre cases sekciu"
```

---

### Task 3: JavaScript — scroll handler `checkCasesDark`

**Files:**
- Modify: `index.html:2098-2111` (JS blok — Nav theme switcher)

- [ ] **Step 1: Pridať `checkCasesDark` handler do JS scroll bloku**

Nájsť blok (riadok 2098–2111):
```js
  /* Nav theme switcher */
  const nav = document.getElementById('nav');
  const lightSections = Array.from(document.querySelectorAll('.section-light'));
  function updateNav() {
    const navMid = 36;
    let inLight = false;
    for (const s of lightSections) {
      const r = s.getBoundingClientRect();
      if (r.top <= navMid && r.bottom >= navMid) { inLight = true; break; }
    }
    nav.classList.toggle('is-light', inLight);
  }
  document.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
```

Zmeniť na (doplniť za `updateNav();`):
```js
  /* Nav theme switcher */
  const nav = document.getElementById('nav');
  const lightSections = Array.from(document.querySelectorAll('.section-light'));
  function updateNav() {
    const navMid = 36;
    let inLight = false;
    for (const s of lightSections) {
      const r = s.getBoundingClientRect();
      if (r.top <= navMid && r.bottom >= navMid) { inLight = true; break; }
    }
    nav.classList.toggle('is-light', inLight);
  }
  document.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* Cases scroll-to-dark */
  const casesSection = document.getElementById('projekty');
  function checkCasesDark() {
    if (casesSection.getBoundingClientRect().top <= 0) {
      casesSection.classList.add('is-dark');
      casesSection.classList.remove('section-light');
      casesSection.classList.add('section-dark');
      document.removeEventListener('scroll', checkCasesDark);
      updateNav();
    }
  }
  document.addEventListener('scroll', checkCasesDark, { passive: true });
  checkCasesDark();
```

- [ ] **Step 2: Manuálne overenie animácie**

V prehliadači scrollovať pomaly na sekciu "Vybrané projekty":
- Kým predchádzajúca sekcia (marquee/services) je stále viditeľná: pozadie zostáva biele.
- V momente keď sa top sekcie dotkne vrcholu viewportu: pozadie plynulo animuje z bielej na čiernu (~0.7s).
- Scrollovanie späť nahor: pozadie zostáva čierne.
- Nav správne prepne z light modu (tmavý text) na dark mode (biely text) keď sekcia stmavne.

- [ ] **Step 3: Overiť `prefers-reduced-motion`**

V DevTools → Rendering → Emulate CSS media feature → `prefers-reduced-motion: reduce`.
Existujúce CSS `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; } }` vypne transition — zmena bude okamžitá, čo je správne správanie.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: scroll-triggered bg animacia pre cases sekciu (biela -> cierna)"
```
