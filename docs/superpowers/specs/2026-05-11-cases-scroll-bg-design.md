# Design: Scroll-triggered background — sekcia "Vybrané projekty"

**Dátum:** 2026-05-11  
**Status:** Schválený

---

## Cieľ

Sekcia `#projekty` (`.cases`) začína s bielym pozadím. Keď používateľ zascrolluje tak, že predchádzajúce sekcie sú úplne preč z viewportu (top sekcie dosiahne vrchol viewportu), pozadie plynulo animuje na čiernu. Zmena je jednosmerná — pozadie zostane čierne aj pri scrollovaní späť.

---

## HTML

Zmena class sekcie:

```html
<!-- Pred -->
<section class="cases section-dark" id="projekty" …>

<!-- Po -->
<section class="cases section-light" id="projekty" …>
```

---

## CSS

### Sekcia

```css
.cases {
  transition: background 0.7s ease, color 0.7s ease;
}
.cases.is-dark {
  background: var(--bg-dark);
  color: var(--text-light);
}
```

### Vnútorné elementy pre biely stav

Nasledujúce elementy v `.cases` (bez `.is-dark`) potrebujú farby pre svetlé pozadie:

- `.cases .eyebrow` — `color: var(--text-muted-light)`
- `.cases .cases-title` — `color: var(--text-dark)`
- `.cases .case-row` — border color `var(--border-light)`
- `.cases .case-num`, `.case-tags`, `.case-loc` — `color: var(--text-muted-light)`
- `.cases .case-name` — `color: var(--text-dark)`

Po pridaní `.is-dark` na sekciu sa všetky tieto elementy vrátia na existujúce tmavé štýly (cez `.section-dark` alebo `.is-dark` selector overrides).

### Nav theme

Keď sekcia má `section-light` class, existujúci nav theme switcher automaticky prepne nav do light modu nad touto sekciou. Pri pridaní `is-dark` JS zároveň vymení `section-light` za `section-dark`, čím nav prejde späť do dark modu.

---

## JavaScript

Pridané do existujúceho `scroll` bloku (vedľa `updateNav`):

```js
const casesSection = document.getElementById('projekty');

function checkCasesDark() {
  if (casesSection.getBoundingClientRect().top <= 0) {
    casesSection.classList.remove('section-light');
    casesSection.classList.add('section-dark', 'is-dark');
    document.removeEventListener('scroll', checkCasesDark);
    updateNav(); // sync nav immediately
  }
}

document.addEventListener('scroll', checkCasesDark, { passive: true });
checkCasesDark(); // initial check (pri stránke otvorenej scrollnutej dole)
```

---

## Dotknuté súbory

- `index.html` — HTML class zmena, CSS doplnky, JS handler

---

## Rozhodnutia

| Rozhodnutie | Dôvod |
|---|---|
| Jednosmerné (zostane čierne) | Explicitne požiadavka užívateľa |
| `getBoundingClientRect().top <= 0` | Presná detekcia momentu keď sekcia pokryje celý viewport zhora |
| `removeEventListener` po spustení | Výkonnostná optimalizácia — listener nie je potrebný po zmene |
| Nav sync cez `updateNav()` | Zabráni blikaniu nav pri rýchlom scrolle |
