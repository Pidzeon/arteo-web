# Arteo.sk – dizajnový systém

Kreatívne štúdio z Nitry. Web je portfólio a vstupná brána pre klientov, ktorým záleží na dizajne. Obsah (práce, služby, referencia) pochádza zo starého webu, repo Pidzeon/arteo-web.

**Koncept: risografická tlač.** Dve tlačové farby (modrá a fluo ružová) sa prekrývajú cez `mix-blend-mode: multiply` a vytvárajú tretiu (fialový sútlač). Hlavný pohybový motív je **misregistrácia**: vrstvy farieb sa pri pohybe kurzora a scrollovaní posunú a potom sa vrátia na registračnú značku.

Referencia: **Framer** (poster typografia s tesným negatívnym prekrytím, pill tlačidlá, rytmus sekcií ako strihy vo filme). Farby a motív sú vlastné.

## Farby

| Token | Svetlá (papier) | Tmavá (noc) | Použitie |
|---|---|---|---|
| `--paper` | `#EEEEE9` | `#141417` | pozadie stránky |
| `--paper-2` | `#E3E3DD` | `#1D1D21` | zdvihnuté plochy, inputy |
| `--ink` | `#18181C` | `#ECECE6` | text, primárne tlačidlo |
| `--ink-soft` | `#55555E` | `#A3A3AB` | sekundárny text (AA kontrast) |
| `--blue` | `#2A4BD7` | `#5672FF` | tlačová farba 1 |
| `--pink` | `#FF4AA5` | `#FF5DB1` | tlačová farba 2 |
| `--blend` | `multiply` | `screen` | sútlač farieb |

Pravidlo: modrá a ružová sú **tlačové farby**, nie akcenty UI. Objavujú sa ako plochy a tvary, ktoré sa prekrývajú. Tlačidlá sú atramentovo čierne (v tmavom režime svetlé).

## Typografia

- **Mona Sans** (variabilná, os šírky `wdth` 75–125, `wght` 200–900) – jediná rodina pre nadpisy, značku aj text. Šírka písma sa animuje, písmená „dýchajú“.
- Pozor: písmo **Anybody** bolo zamietnuté, kreslí malé ľ s háčikom navrchu (typografická chyba v slovenčine). Pri každom novom písme over ľ ť ď Ľ.
- Jednopísmenové predložky a spojky (a, i, k, o, s, u, v, z) sa automaticky viažu k ďalšiemu slovu (JS, nezlomiteľná medzera).
- Nadpisy: tesné prekrytie (−0.04em), riadkovanie 0.9–1.0. Text: 16–18 px, riadkovanie 1.5, max 62 znakov.
- Bez kapitálok v štítkoch, bez monospace štítkov, bez šípok v tlačidlách.

## Tvar

- Tlačidlá: pill (`999px`). Obrázky a panely: `6px`. Nič iné.
- Bez tieňov. Hĺbku robí prekrývanie farieb.

## Pohyb

| Moment | Čo robí | Prečo |
|---|---|---|
| Načítanie | farebné vrstvy logotypu prídu rozhodené a sadnú do registra | jediná orchestrovaná scéna, predstavuje koncept |
| Kurzor nad logotypom | písmená blízko kurzora sa rozširujú, ružová vrstva sa posúva | interaktívna typografia = remeslo štúdia |
| Práce | vodorovný posun pri scrolle (GSAP pin) | projekty ako výstava v rade |
| Manifest | slová sa postupne „dotlačia“ pri scrolle | čítanie v tempe používateľa |
| Služby | vodorovný akordeón | odhaľuje detail na požiadanie |
| Tlačidlá | magnetické, stlačenie `scale(.97)` | spätná väzba |

Easing: `cubic-bezier(0.16, 1, 0.3, 1)`. Všetko sa vypína pri `prefers-reduced-motion`.

## Rozloženie sekcií

1. Navigácia – logo vľavo, odkazy, „Napíšte nám“ + prepínač režimu vpravo
2. Hero – nadpis a CTA hore, obrovský risografický logotyp ARTEO cez celú šírku dole
3. Vybrané práce – vodorovný pinned pás
4. Manifest – text so scrubom a obrázkami v riadku
5. Služby – vodorovný akordeón
6. Klienti – jediný marquee na stránke
7. Referencia – citát klienta, obrázok sa odkryje spod ružovej vrstvy
8. Kontakt – veľká výzva a formulár, pätička

Jedna výzva na kontakt: **„Napíšte nám“** všade.
