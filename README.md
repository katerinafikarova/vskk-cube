# VŠKK 10 let – testování konceptů

Interaktivní nástroj pro porovnání konceptů loga k 10. výročí VŠKK. Obsahuje 11 konceptů: siluetu kvádru, posunutý obrys, kostku s ručním písmem, 3D papírovou kostku, „10 ■ let“, shadow casting, oříznuté číslo, průhledné typo, „let“ v nule, číslo s letopočty a svíčku.

**Živá stránka:** https://katerinafikarova.github.io/vskk-cube/

## Ovládání

- Vyber koncept vpravo, nebo otevři **Přehled všech vedle sebe** a klikni na jeden z nich.
- Táhnutím posuneš kompozici, kolečkem myši přiblížíš, dvojklikem vycentruješ. U 3D kostky tažení otáčí.
- Barevnost je omezená na žlutou, bílou a černou. Jsou připravené čtyři předvolby a role se dají přepínat jednotlivě.
- **Galano Grotesque** je licencované písmo, takže ho do stránky nahraj ze svého počítače (Light, Regular, Bold). Ukládá se jen v prohlížeči a do repozitáře se nedostane. Bez něj se použije Outfit.
- Originální logo VŠKK (SVG nebo PNG) a fotku pozadí můžeš nahrát stejně.
- **Export** uloží PNG jednoho konceptu nebo celého přehledu, volitelně s průhledným pozadím.

## Lokálně

```bash
npm run dev
```

Pak otevři http://localhost:5173.

## Nasazení

Každý push do větve `main` stránku automaticky znovu nasadí přes workflow `.github/workflows/pages.yml`.

Původní papírová kostka s posuvným textem a exportem SVG zůstává na adrese https://katerinafikarova.github.io/vskk-cube/kostka.html.

Všechno běží v prohlížeči. Nahraná písma, loga a fotky nikam neodcházejí. three.js © autoři three.js, licence MIT.
