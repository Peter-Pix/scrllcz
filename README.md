# Scrollo.cz 🛠️

Moderní, rychlá a modulární sada webových nástrojů postavená na Reactu a Tailwind CSS. Aplikace slouží jako "švýcarský nůž" pro každodenní digitální úkoly, od práce s grafikou po textové analýzy.

## ✨ Funkce

Aplikace obsahuje rozšiřitelnou sadu nástrojů (`tools/registry.tsx`):

### 🎨 Grafika
- **Generátor palety:** Extrakce barev z obrázků pomocí Canvas API a clusteringu.
- **Color Picker:** Pokročilý výběr barev, konverze (HEX/RGB/HSL), pipeta.
- **Image Resizer & Cropper:** Klientská úprava obrázků bez odesílání na server.
- **QR Generátor:** Tvorba kódů s nastavením barev.

### 📝 Text a Data
- **Text Analyzer:** Pokročilá statistika textu, frekvence slov, odhady časů.
- **Formátovač:** Čištění textu, odstranění diakritiky, Base64.
- **Číslo slovy:** Algoritmický převod čísel na text (čeština).
- **Vocative Declensor:** Skloňování jmen do 5. pádu (databáze + heuristika).

### ⚡ Produktivita
- **Stopky a Časovač:** Full-screen režim, Pomodoro presety, analogové zobrazení.
- **Měnová kalkulačka:** Napojení na XML API ČNB (přes proxy).
- **Generátor hesel:** Kryptograficky bezpečné generování.
- **AI Kompas:** Informační rozcestník pro AI modely.

### 🎈 Lifestyle
- **Počasí:** Open-Meteo API integrace.
- **Pizza Kalkulačka:** Matematické porovnání výhodnosti (cena/plocha).
- **Svátky & Losování:** Práce s daty a randomizace.

## 🛠️ Technologie

- **Frontend:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** Vlastní SVG set (`components/Icons.tsx`)
- **API:** Open-Meteo, ČNB, QR Server.
- **Build:** Vite / Vercel

## 🚀 Instalace a Spuštění

Projekt je připraven pro nasazení na Vercel, ale lze jej spustit lokálně.

1. **Klonování repozitáře:**
   ```bash
   git clone https://github.com/Peter-Pix/scrllcz.git
   cd scrllcz
   ```

2. **Instalace závislostí:**
   ```bash
   npm install
   ```

3. **Spuštění vývojového serveru:**
   ```bash
   npm run dev
   ```

## 📂 Struktura Projektu

- `/components` - Sdílené UI komponenty (Tlačítka, Ikony, Karty).
- `/tools` - Jednotlivé nástroje. Každý nástroj je samostatná komponenta.
  - `registry.tsx` - Centrální registr nástrojů (konfigurace, ikony, barvy).
- `index.tsx` - Hlavní vstupní bod, routing a layout aplikace.

## 🤝 Jak přidat nový nástroj

Architektura je navržena tak, aby přidání nástroje bylo triviální:

1. Vytvořte novou komponentu v složce `tools/` (např. `MyNewTool.tsx`).
2. Otevřete `tools/registry.tsx`.
3. Importujte komponentu.
4. Přidejte konfiguraci do pole `tools`:
   ```typescript
   {
     id: 'my-new-tool',
     title: 'Můj Nový Nástroj',
     description: 'Popis co to dělá.',
     icon: <Icons.MyIcon />,
     component: MyNewTool,
     color: 'from-blue-500 to-green-500' // Gradient pro dashboard
   }
   ```

## 📄 Licence

Tento projekt je licencován pod MIT licencí.
