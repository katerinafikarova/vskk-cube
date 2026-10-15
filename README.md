# VŠKK 10 let – testování konceptů

Interaktivní nástroj pro porovnání konceptů loga k 10. výročí VŠKK. Obsahuje 6 konceptů: siluetu kvádru, posunutý obrys, původní izometrickou kostku (dá se otáčet), „10 + logo + let“, oříznuté číslo a „let“ v nule. U každého jde nastavit velikost celku, vlastní číslo a slovo, velikosti a barvy textů.

**Živá stránka:** https://katerinafikarova.github.io/vskk-cube/

## Ovládání

- Vyber koncept vpravo, nebo otevři **Přehled všech vedle sebe** a klikni na jeden z nich.
- Táhnutím posuneš kompozici, kolečkem myši přiblížíš, dvojklikem vycentruješ.
- Barevnost je omezená na žlutou, bílou a černou. Jsou připravené čtyři předvolby a role se dají přepínat jednotlivě.
- **Galano Grotesque** je v nástroji vestavěné pro číslice 0–9 a slovo let / LET (Regular, Medium, SemiBold), a to jako křivky, ne jako soubor písma. Pro jiné texty můžeš nahrát celé písmo ze svého počítače, jinak se použije Montserrat.
- Originální logo VŠKK (SVG nebo PNG) a fotku pozadí můžeš nahrát stejně.
- **Export** uloží SVG nebo PNG jednoho konceptu i celého přehledu, volitelně s průhledným pozadím. V SVG je logo vektorové a všechen text převedený na křivky (číslo a let / LET vždy v Galanu). Fotky zůstávají jako vložené obrázky.

## Lokálně

```bash
npm run dev
```

Pak otevři http://localhost:5173.

## Nasazení

Každý push do větve `main` stránku automaticky znovu nasadí přes workflow `.github/workflows/pages.yml`.

Původní papírová kostka s posuvným textem a exportem SVG zůstává na adrese https://katerinafikarova.github.io/vskk-cube/kostka.html.

Všechno běží v prohlížeči. Nahraná písma, loga a fotky nikam neodcházejí. three.js © autoři three.js, licence MIT.
