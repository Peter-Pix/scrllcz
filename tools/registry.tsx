
import React from 'react';
import { Icons } from '../components/Icons';
import { QRCodeGeneratorTool } from './QRCodeGenerator';
import { PasswordGeneratorTool } from './PasswordGenerator';
import { TextFormatterTool } from './TextFormatter';
import { ImageResizerTool } from './ImageResizer';
import { LanguageGuideTool } from './LanguageGuide';
import { ColorPickerTool } from './ColorPicker';
import { CurrencyConverterTool } from './CurrencyConverter';
import { AICompassTool } from './AICompass';
import { WeatherForecastTool } from './WeatherForecast';
import { VocativeDeclensorTool } from './VocativeDeclensor';
import { ImageCropperTool } from './ImageCropper';
import { PizzaCalculatorTool } from './PizzaCalculator';
import { NameDayCalendarTool } from './NameDayCalendar';
import { RandomPickerTool } from './RandomPicker';
import { TextAnalyzerTool } from './TextAnalyzer';
import { NumberToWordsTool } from './NumberToWords';
import { StopwatchTool } from './Stopwatch';
import { ImagePaletteGeneratorTool } from './ImagePaletteGenerator';
import { ChordGeneratorTool } from './ChordGenerator';
import { MyHistoryTool } from './MyHistory';
import { CapitalCitiesTool } from './CapitalCities';
import { CzechHolidaysTool } from './CzechHolidays';
import { DebtListTool } from './DebtList';
import { ShoppingListTool } from './ShoppingList';
import { QuickNotesTool } from './QuickNotes';
import { TodoListTool } from './TodoList';
import { ChromaticTunerTool } from './ChromaticTuner';
import { AudioTrimmerTool } from './AudioTrimmer';
import { AudioConverterTool } from './AudioConverter';
import { BPMTapperTool } from './BPMTapper';

export type ToolId = 'dashboard' | 'qr-code' | 'password-gen' | 'text-formatter' | 'image-resizer' | 'language-guide' | 'color-picker' | 'currency-converter' | 'ai-compass' | 'weather-forecast' | 'vocative-declensor' | 'image-cropper' | 'pizza-calculator' | 'name-day-calendar' | 'random-picker' | 'text-analyzer' | 'number-to-words' | 'stopwatch' | 'image-palette' | 'chord-generator' | 'my-history' | 'capital-cities' | 'czech-holidays' | 'debt-list' | 'shopping-list' | 'quick-notes' | 'todo-list' | 'chromatic-tuner' | 'audio-trimmer' | 'audio-converter' | 'bpm-tapper';

export interface ToolConfig {
  id: ToolId;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.FC<any>;
  color: string;
}

export const tools: ToolConfig[] = [
  {
    id: 'bpm-tapper',
    title: 'BPM Tapper',
    description: 'Rychlé a přesné měření tempa hudby klepáním na obrazovku s inteligentním průměrováním.',
    icon: <Icons.Hand />,
    component: BPMTapperTool,
    color: 'from-indigo-500 via-purple-500 to-pink-600'
  },
  {
    id: 'audio-converter',
    title: 'Převod formátu zvuku',
    description: 'Hromadný převod audio souborů mezi formáty WAV, MP3, AAC a dalšími přímo v prohlížeči.',
    icon: <Icons.ArrowsRightLeft />,
    component: AudioConverterTool,
    color: 'from-blue-600 via-indigo-600 to-violet-700'
  },
  {
    id: 'audio-trimmer',
    title: 'Zkrátit audio',
    description: 'Jednoduchý a vizuální nástroj pro ořezávání zvukových souborů s funkcí Fade In/Out.',
    icon: <Icons.Scissors />,
    component: AudioTrimmerTool,
    color: 'from-emerald-500 via-teal-600 to-green-700'
  },
  {
    id: 'chromatic-tuner',
    title: 'Chromatická ladička',
    description: 'Přesné ladění hudebních nástrojů nebo zpěvu přímo přes mikrofon v prohlížeči.',
    icon: <Icons.Music />,
    component: ChromaticTunerTool,
    color: 'from-indigo-600 via-blue-700 to-indigo-900'
  },
  {
    id: 'todo-list',
    title: 'Seznam úkolů',
    description: 'Rychlá a přehledná správa vašich denních povinností. Ukládání přímo v prohlížeči.',
    icon: <Icons.ClipboardList />,
    component: TodoListTool,
    color: 'from-emerald-500 via-teal-600 to-indigo-600'
  },
  {
    id: 'quick-notes',
    title: 'Rychlé poznámky',
    description: 'Bleskové zaznamenávání myšlenek s historií změn a možností exportu do textu.',
    icon: <Icons.Note />,
    component: QuickNotesTool,
    color: 'from-amber-400 via-orange-500 to-yellow-600'
  },
  {
    id: 'shopping-list',
    title: 'Nákupní seznam',
    description: 'Váš digitální lístek do obchodu. Přidávejte položky, odškrtávejte hotové a mějte přehled o postupu.',
    icon: <Icons.ShoppingCart />,
    component: ShoppingListTool,
    color: 'from-indigo-600 via-blue-600 to-emerald-600'
  },
  {
    id: 'debt-list',
    title: 'Seznam dluhů',
    description: 'Mějte přehled o svých financích. Jednoduchá správa toho, co dlužíte a co ostatní dluží vám.',
    icon: <Icons.Receipt />,
    component: DebtListTool,
    color: 'from-rose-500 via-slate-700 to-emerald-500'
  },
  {
    id: 'czech-holidays',
    title: 'České Svátky',
    description: 'Přehled státních svátků, analýza pracovního volna a odpočet k nejbližšímu dni volna.',
    icon: <Icons.Calendar />,
    component: CzechHolidaysTool,
    color: 'from-blue-600 to-indigo-700'
  },
  {
    id: 'capital-cities',
    title: 'Hlavní města',
    description: 'Procvičte si své znalosti geografie v interaktivním kvízu nebo prozkoumejte státy světa.',
    icon: <Icons.Map />,
    component: CapitalCitiesTool,
    color: 'from-blue-500 via-indigo-600 to-purple-600'
  },
  {
    id: 'my-history',
    title: 'Moje Historie',
    description: 'Osobní časová osa vašeho života. Zaznamenejte milníky, vzpomínky a budoucí cíle.',
    icon: <Icons.History />,
    component: MyHistoryTool,
    color: 'from-indigo-600 via-purple-600 to-teal-600'
  },
  {
    id: 'chord-generator',
    title: 'Generátor akordů',
    description: 'Inspirace pro hudebníky. Generuje harmonické progrese podle tóniny a stylu.',
    icon: <Icons.Music />,
    component: ChordGeneratorTool,
    color: 'from-indigo-600 to-blue-700'
  },
  {
    id: 'image-palette',
    title: 'Generátor palety z obrázku',
    description: 'Automatická extrakce dominantních barev z jakékoliv fotky.',
    icon: <Icons.Palette />,
    component: ImagePaletteGeneratorTool,
    color: 'from-fuchsia-600 to-pink-600'
  },
  {
    id: 'stopwatch',
    title: 'Časovač a Stopky',
    description: 'Produktivní časovač (Pomodoro, pauzy) a přesné stopky s analogovým zobrazením.',
    icon: <Icons.Clock />,
    component: StopwatchTool,
    color: 'from-rose-500 to-red-600'
  },
  {
    id: 'number-to-words',
    title: 'Číslo slovy',
    description: 'Převod čísel na slovní vyjádření s podporou měny.',
    icon: <Icons.Numbers />,
    component: NumberToWordsTool,
    color: 'from-orange-400 to-pink-500'
  },
  {
    id: 'text-analyzer',
    title: 'Počítadlo textu',
    description: 'Detailní analýza textu, počítání slov, znaků a odhad doby čtení.',
    icon: <Icons.ChartBar />,
    component: TextAnalyzerTool,
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'random-picker',
    title: 'Náhodné losování',
    description: 'Losování výherců ze seznamu nebo generátor náhodných čísel.',
    icon: <Icons.Dice />,
    component: RandomPickerTool,
    color: 'from-violet-500 to-fuchsia-500'
  },
  {
    id: 'name-day-calendar',
    title: 'Kalendář svátků',
    description: 'Kdo má dnes svátek? Vyhledávání podle jména i data.',
    icon: <Icons.Calendar />,
    component: NameDayCalendarTool,
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'pizza-calculator',
    title: 'Pizza kalkulačka',
    description: 'Porovnání výhodnosti pizz. Zjistěte, která se vyplatí nejvíc.',
    icon: <Icons.Pizza />,
    component: PizzaCalculatorTool,
    color: 'from-orange-500 to-yellow-500'
  },
  {
    id: 'image-cropper',
    title: 'Ořezávač obrázků',
    description: 'Přesný ořez fotek na formáty sociálních seizí (IG, FB, YT...).',
    icon: <Icons.Crop />,
    component: ImageCropperTool,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'weather-forecast',
    title: 'Předpověď počasí',
    description: 'Aktuální počasí a předpověď pro jakékoliv město.',
    icon: <Icons.CloudSun />,
    component: WeatherForecastTool,
    color: 'from-sky-500 to-indigo-500'
  },
  {
    id: 'vocative-declensor',
    title: 'Skloňování jmen (5. pád)',
    description: 'Generátor správného oslovení pro e-maily.',
    icon: <Icons.Signature />,
    component: VocativeDeclensorTool,
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'qr-code',
    title: 'Generátor QR kódů',
    description: 'Rychlé vytvoření QR kódu pro URL, text nebo wifi.',
    icon: <Icons.QrCode />,
    component: QRCodeGeneratorTool,
    color: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'password-gen',
    title: 'Generátor Hesel',
    description: 'Vytvořte si neprůstřelné a bezpečné heslo.',
    icon: <Icons.Key />,
    component: PasswordGeneratorTool,
    color: 'from-emerald-600 to-teal-600'
  },
  {
    id: 'text-formatter',
    title: 'Formátovač Textu',
    description: 'Čištění, formátování a konverze textů.',
    icon: <Icons.Text />,
    component: TextFormatterTool,
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 'image-resizer',
    title: 'Změna velikosti obrázku',
    description: 'Jednoduchá úprava rozměrů a komprese obrázků.',
    icon: <Icons.Photo />,
    component: ImageResizerTool,
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'language-guide',
    title: 'Jazykový Průvodce',
    description: 'Interaktivní přehled jazyků a doporučení pro studium.',
    icon: <Icons.Globe />,
    component: LanguageGuideTool,
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'color-picker',
    title: 'Color Picker',
    description: 'Pokročilý výběr barev, pipeta a palety.',
    icon: <Icons.Palette />,
    component: ColorPickerTool,
    color: 'from-fuchsia-500 to-purple-500'
  },
  {
    id: 'currency-converter',
    title: 'Měnová kalkulačka',
    description: 'Převod měn s aktuálními kurzy ČNB.',
    icon: <Icons.Currency />,
    component: CurrencyConverterTool,
    color: 'from-sky-500 to-blue-500'
  },
  {
    id: 'ai-compass',
    title: 'AI Kompas',
    description: 'Porovnání a tipy pro ChatGPT, Claude, Gemini a další.',
    icon: <Icons.Compass />,
    component: AICompassTool,
    color: 'from-teal-500 to-emerald-500'
  }
];
