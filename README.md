
# Scrollo.cz 🛠️ 

**Moderní digitální švýcarský nůž postavený na Reactu 19.**
Všechny potřebné nástroje pro práci s textem, grafikou, zvukem a produktivitou na jednom místě, přímo ve vašem prohlížeči.

## ✨ Proč Scrollo?

- **Absolutní soukromí**: 99 % výpočtů probíhá lokálně na vašem zařízení (Client-side). Vaše data, fotky a poznámky nikdy neopouštějí váš počítač.
- **Blesková rychlost**: Minimalistický kód bez zbytečných knihoven třetích stran. Žádné cookies, žádné reklamy, žádné čekání.
- **Design na prvním místě**: "Liquid" UI systém se zaměřením na detaily, plynulé animace a responzivitu.

## 🚀 Hlavní nástroje

### 🎨 Grafika
- **Generátor palety**: Extrakce barev z obrázků pomocí Canvas API.
- **Ořezávač & Resizer**: Profesionální úprava fotek pro sociální sítě.
- **Color Picker**: Převody HEX/RGB/HSL a vizuální pipeta.

### 📝 Text & Programování
- **LCS Porovnávač**: Inteligentní diff nástroj pro revizi textů a kódu bez falešných posunů.
- **Markdown / HTML**: Real-time konvertor syntaxe.
- **Text Analyzer**: Hloubková statistika, odhady čtení a frekvence slov.
- **Skloňování jmen**: Unikátní český algoritmus pro oslovování.

### 🎧 Hudba & Zvuk
- **Audio Trimmer**: Vizuální ořezávání s efekty Fade In/Out.
- **Ladička & Metronom**: Hardware akcelerované nástroje pro hudebníky.
- **BPM Tapper**: Měření tempa s filtrací lidské chyby.

### 📊 Finance & Produktivita
- **Měnový konvertor**: Živá data z ČNB (přes CORS proxy).
- **Investiční kalkulačka**: Vizuální motivace k šetření a složené úročení.
- **Převodník jednotek**: Univerzální a přesný přepočet fyzikálních veličin.

---

## 🛠️ Pro vývojáře (Architecture)

Aplikace je navržena jako **modulární registry-based systém**. Přidání nového nástroje trvá minuty.

### Struktura
- `/tools`: Každý nástroj je samostatná, izolovaná React komponenta.
- `tools/registry.tsx`: Centrální konfigurace (ID, kategorie, ikona, barvy).
- `/components`: Sdílené atomické UI komponenty (Shared.tsx, Icons.tsx).

### Jak přidat nový nástroj?
1. Vytvořte soubor `tools/MujNovyNastroj.tsx`.
2. V `tools/registry.tsx` přidejte nový záznam do pole `tools`.
3. Hotovo! Nástroj se automaticky objeví v menu i ve vyhledávání.

### Technologie
- **Core**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Optimized for Vercel / GitHub Actions
- **Icons**: Custom optimized SVG set

---

## 📜 Licence
MIT &copy; {new Date().getFullYear()} Scrollo.cz.
Vyvinuto s láskou k čistému kódu a efektivitě.
