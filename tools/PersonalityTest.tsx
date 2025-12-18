
import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '../components/Icons';
import { Button, Card } from '../components/Shared';

type Dimension = 'EI' | 'SN' | 'TF' | 'JP'; // E/I, S/N, T/F, J/P

interface Question {
  id: string;
  text: string;
  dimension: Dimension;
  direction: 1 | -1; // 1 = Positive (E, S, T, J), -1 = Negative (I, N, F, P)
  isDecisive?: boolean;
}

interface PersonalityTypeInfo {
  code: string;
  name: string;
  group: 'Analytici' | 'Diplomati' | 'Strážci' | 'Průzkumníci';
  description: string;
  strengths: string[];
  weaknesses: string[];
  advice: string;
  color: string;
}

// Rozsáhlý pool otázek (60 celkem)
const QUESTION_POOL: Question[] = [
  // E vs I
  { id: 'ei1', text: 'Po náročném týdnu mě nejvíce nabije čas strávený o samotě v klidu.', dimension: 'EI', direction: -1 },
  { id: 'ei2', text: 'Na večírcích jsem často ten, kdo začíná rozhovory i s cizími lidmi.', dimension: 'EI', direction: 1 },
  { id: 'ei3', text: 'Raději trávím čas s pár blízkými přáteli než ve velké skupině.', dimension: 'EI', direction: -1 },
  { id: 'ei4', text: 'Cítím se vyčerpaný, pokud musím dlouho mluvit s mnoha lidmi najednou.', dimension: 'EI', direction: -1 },
  { id: 'ei5', text: 'Nové nápady nejlépe zpracuji tak, že o nich nahlas mluvím s ostatními.', dimension: 'EI', direction: 1 },
  { id: 'ei6', text: 'V neznámém prostředí se držím spíše v pozadí a pozoruji.', dimension: 'EI', direction: -1 },
  { id: 'ei7', text: 'Když zazvoní telefon, obvykle pociťuji mírný odpor k jeho zvednutí.', dimension: 'EI', direction: -1, isDecisive: true },
  { id: 'ei8', text: 'Při práci ve skupině mě energie ostatních motivuje k lepším výkonům.', dimension: 'EI', direction: 1 },
  
  // S vs N
  { id: 'sn1', text: 'Často se přistihnu, že přemýšlím o daleké budoucnosti místo přítomnosti.', dimension: 'SN', direction: -1 },
  { id: 'sn2', text: 'Mám rád jasná fakta a konkrétní detaily více než abstraktní teorie.', dimension: 'SN', direction: 1 },
  { id: 'sn3', text: 'Při řešení problémů se spoléhám na své minulé zkušenosti.', dimension: 'SN', direction: 1 },
  { id: 'sn4', text: 'Láká mě zkoušet věci úplně jinak, i když starý způsob funguje.', dimension: 'SN', direction: -1 },
  { id: 'sn5', text: 'Často si všimnu drobných změn v mém okolí (nový účes, přesunutá váza).', dimension: 'SN', direction: 1 },
  { id: 'sn6', text: 'Mám tendenci mluvit v metaforách a symbolech místo doslovného popisu.', dimension: 'SN', direction: -1 },
  { id: 'sn7', text: 'Praktičnost je pro mě důležitější než kreativita bez jasného využití.', dimension: 'SN', direction: 1, isDecisive: true },
  { id: 'sn8', text: 'Často "čtu mezi řádky" a hledám skrytý význam v tom, co lidé říkají.', dimension: 'SN', direction: -1 },

  // T vs F
  { id: 'tf1', text: 'Logika a objektivita jsou pro mě důležitější než pocity druhých.', dimension: 'TF', direction: 1 },
  { id: 'tf2', text: 'Při rozhodování se snažím brát ohled na to, jak to ovlivní harmonii v týmu.', dimension: 'TF', direction: -1 },
  { id: 'tf3', text: 'V diskusích je pro mě pravda důležitější než to, jestli někoho urazím.', dimension: 'TF', direction: 1 },
  { id: 'tf4', text: 'Snadno se dokážu vcítit do emocí filmových postav nebo cizích lidí.', dimension: 'TF', direction: -1 },
  { id: 'tf5', text: 'Ostatní by mě popsali spíše jako racionálního než emocionálního člověka.', dimension: 'TF', direction: 1 },
  { id: 'tf6', text: 'Rád dělám lidem radost, i když mě to stojí nějaké nepohodlí.', dimension: 'TF', direction: -1 },
  { id: 'tf7', text: 'Pokud musím někoho kritizovat, dělám to přímo a bez obalu.', dimension: 'TF', direction: 1, isDecisive: true },
  { id: 'tf8', text: 'Hlava by měla mít vždy přednost před srdcem.', dimension: 'TF', direction: 1 },

  // J vs P
  { id: 'jp1', text: 'Mám rád, když je můj den jasně naplánovaný a strukturovaný.', dimension: 'JP', direction: 1 },
  { id: 'jp2', text: 'Ponechávám si možnosti otevřené až do poslední chvíle.', dimension: 'JP', direction: -1 },
  { id: 'jp3', text: 'Nesnáším nepořádek a chaos v mém pracovním prostoru.', dimension: 'JP', direction: 1 },
  { id: 'jp4', text: 'Pracuji lépe pod tlakem termínu než s velkým předstihem.', dimension: 'JP', direction: -1 },
  { id: 'jp5', text: 'Dodržování pravidel a termínů je pro mě naprosto zásadní.', dimension: 'JP', direction: 1 },
  { id: 'jp6', text: 'Často začínám nové věci, aniž bych dokončil ty předchozí.', dimension: 'JP', direction: -1 },
  { id: 'jp7', text: 'Nečekané změny plánu mě spíše stresují než vzrušují.', dimension: 'JP', direction: 1, isDecisive: true },
  { id: 'jp8', text: 'Můj domov a práce jsou vysoce organizované.', dimension: 'JP', direction: 1 }
];

const PERSONALITY_TYPES: Record<string, PersonalityTypeInfo> = {
  'INTJ': {
    code: 'INTJ', name: 'Architekt', group: 'Analytici', color: 'from-purple-600 to-indigo-700',
    description: 'Strategičtí myslitelé s plánem pro všechno. Jsou nezávislí, odhodlaní a hluboce analytičtí.',
    strengths: ['Strategické plánování', 'Logické uvažování', 'Vysoké standardy', 'Nezávislost'],
    weaknesses: ['Přílišná kritičnost', 'Ignorování emocí', 'Arogance', 'Složitost v týmu'],
    advice: 'Zkuste občas naslouchat pocitům druhých – ne vše lze vyřešit čistou logikou.'
  },
  'INTP': {
    code: 'INTP', name: 'Logik', group: 'Analytici', color: 'from-purple-500 to-blue-600',
    description: 'Inovativní vynálezci s neutuchající touhou po vědění a pochopení systémů.',
    strengths: ['Objektivní analýza', 'Originalita', 'Otevřenost', 'Nadšení pro nápady'],
    weaknesses: ['Odtažitost', 'Netolerance k chaosu', 'Perfekcionismus v teorii', 'Prokrastinace'],
    advice: 'Dávejte pozor, abyste se neztratili v teoriích a nezapomněli na praktickou realizaci.'
  },
  'ENTJ': {
    code: 'ENTJ', name: 'Velitel', group: 'Analytici', color: 'from-indigo-600 to-purple-800',
    description: 'Odvážní a energičtí lídři, kteří vždy najdou cestu – nebo si ji vytvoří.',
    strengths: ['Efektivita', 'Sebevědomí', 'Silná vůle', 'Charisma'],
    weaknesses: ['Netrpělivost', 'Chladnost', 'Dominance', 'Netolerance k chybám'],
    advice: 'Uvědomte si, že emoce jsou také data. Empatie může zvýšit efektivitu vašeho týmu.'
  },
  'ENTP': {
    code: 'ENTP', name: 'Debatér', group: 'Analytici', color: 'from-blue-600 to-purple-600',
    description: 'Chytří a zvídaví myslitelé, kteří neodolají žádné intelektuální výzvě.',
    strengths: ['Rychlé myšlení', 'Vynalézavost', 'Charisma', 'Energičnost'],
    weaknesses: ['Hádavost', 'Nespolehlivost', 'Necitlivost', 'Problémy se soustředěním'],
    advice: 'Naučte se dotahovat nápady do konce a neberte každou diskusi jako boj o vítězství.'
  },
  'INFJ': {
    code: 'INFJ', name: 'Ochránce', group: 'Diplomati', color: 'from-emerald-500 to-teal-700',
    description: 'Tiší a mystičtí, přesto velmi inspirativní a neúnavní idealisté.',
    strengths: ['Kreativita', 'Vhled do lidí', 'Zásadovost', 'Vášnivost'],
    weaknesses: ['Citlivost na kritiku', 'Uzavřenost', 'Sklon k vyhoření', 'Perfekcionismus'],
    advice: 'Nezapomínejte pečovat o sebe stejně, jako pečujete o zbytek světa.'
  },
  'INFP': {
    code: 'INFP', name: 'Mediátor', group: 'Diplomati', color: 'from-teal-400 to-emerald-600',
    description: 'Poetičtí, laskaví a altruističtí lidé, vždy připraveni pomoci dobré věci.',
    strengths: ['Empatie', 'Velkorysost', 'Ideály', 'Kreativita'],
    weaknesses: ['Přílišný idealismus', 'Nepraktičnost', 'Sebeobviňování', 'Vulnerabilita'],
    advice: 'Svět není dokonalý a to je v pořádku. Naučte se přijímat realitu bez zbytečného smutku.'
  },
  'ENFJ': {
    code: 'ENFJ', name: 'Protagonista', group: 'Diplomati', color: 'from-emerald-600 to-green-800',
    description: 'Charismatičtí a inspirativní lídři, schopní strhnout a okouzlit své posluchače.',
    strengths: ['Vstřícnost', 'Spolehlivost', 'Přirozený lídr', 'Altruismus'],
    weaknesses: ['Přílišná obětavost', 'Kolísavé sebevědomí', 'Naivita', 'Sklon k dramatům'],
    advice: 'Nemusíte zachránit každého. Nastavte si hranice, abyste nevyčerpali vlastní zdroje.'
  },
  'ENFP': {
    code: 'ENFP', name: 'Bojovník', group: 'Diplomati', color: 'from-green-500 to-teal-500',
    description: 'Nadšení, kreativní a svobodní lidé, kteří vždy najdou důvod k úsměvu.',
    strengths: ['Zvědavost', 'Pozitivita', 'Komunikativnost', 'Nadšení'],
    weaknesses: ['Dezorganizace', 'Potřeba uznání', 'Přemýšlení nad detaily', 'Stres z rutiny'],
    advice: 'Zkuste do svého života vnést trochu řádu. Pomůže vám to realizovat vaše skvělé vize.'
  },
  'ISTJ': {
    code: 'ISTJ', name: 'Logistik', group: 'Strážci', color: 'from-sky-600 to-blue-800',
    description: 'Praktičtí lidé zaměření na fakta, o jejichž spolehlivosti nelze pochybovat.',
    strengths: ['Poctivost', 'Zodpovědnost', 'Klid', 'Praktičnost'],
    weaknesses: ['Tvrdohlavost', 'Necitlivost', 'Sklon k obviňování', 'Odpor ke změnám'],
    advice: 'Svět se mění. Zkuste být otevřenější novým nápadům, i když nejsou podloženy desetiletou praxí.'
  },
  'ISFJ': {
    code: 'ISFJ', name: 'Obránce', group: 'Strážci', color: 'from-blue-500 to-cyan-700',
    description: 'Velmi oddaní a vřelí ochránci, vždy připraveni bránit své blízké.',
    strengths: ['Podpora', 'Trpělivost', 'Loajalita', 'Smysl pro detail'],
    weaknesses: ['Plachost', 'Potlačování citů', 'Přílišná skromnost', 'Sklon k přetížení'],
    advice: 'Naučte se říkat "ne". Vaše hodnota nezávisí jen na tom, kolik toho uděláte pro ostatní.'
  },
  'ESTJ': {
    code: 'ESTJ', name: 'Vedoucí', group: 'Strážci', color: 'from-blue-700 to-sky-900',
    description: 'Vynikající administrátoři, bezkonkurenční v řízení věcí i lidí.',
    strengths: ['Organizovanost', 'Přímost', 'Věrnost', 'Odhodlání'],
    weaknesses: ['Nepružnost', 'Předpojatost', 'Obtížné relaxování', 'Kritičnost'],
    advice: 'Uvolněte se. Ne všechno musí být podle vašich pravidel, aby to fungovalo.'
  },
  'ESFJ': {
    code: 'ESFJ', name: 'Konzul', group: 'Strážci', color: 'from-cyan-600 to-blue-600',
    description: 'Mimořádně starostliví, společenští a populární lidé, vždy ochotní pomoci.',
    strengths: ['Povinnost', 'Spojování lidí', 'Praktické dovednosti', 'Laskavost'],
    weaknesses: ['Závislost na statusu', 'Nepružnost', 'Citlivost na odmítnutí', 'Potřeba uznání'],
    advice: 'Hledejte uznání v sobě, ne v tom, co si o vás myslí sousedé.'
  },
  'ISTP': {
    code: 'ISTP', name: 'Virtuos', group: 'Průzkumníci', color: 'from-amber-500 to-orange-700',
    description: 'Odvážní a praktičtí experimentátoři, mistři všech druhů nástrojů.',
    strengths: ['Optimismus', 'Kreativita', 'Klid v krizi', 'Praktičnost'],
    weaknesses: ['Nepředvídatelnost', 'Rychlá nuditelnost', 'Riskování', 'Uzavřenost'],
    advice: 'Nezapomínejte na dlouhodobé závazky. Krátkodobé vzrušení není všechno.'
  },
  'ISFP': {
    code: 'ISFP', name: 'Dobrodruh', group: 'Průzkumníci', color: 'from-yellow-500 to-orange-600',
    description: 'Flexibilní a okouzlující umělci, vždy připraveni prozkoumat něco nového.',
    strengths: ['Charm', 'Senzitivita', 'Představivost', 'Vášeň'],
    weaknesses: ['Nezávislost až přílišná', 'Nepředvídatelnost', 'Sklon ke stresu', 'Soutěživost'],
    advice: 'Zkuste si občas naplánovat i příští týden. Trocha stability vám neuškodí.'
  },
  'ESTP': {
    code: 'ESTP', name: 'Podnikatel', group: 'Průzkumníci', color: 'from-orange-600 to-amber-800',
    description: 'Chytří, energičtí a velmi vnímaví lidé, kteří si skutečně užívají život na hraně.',
    strengths: ['Odvaha', 'Racionalita', 'Vnímavost', 'Spolehlivost v akci'],
    weaknesses: ['Netrpělivost', 'Riskování', 'Ignorování pravidel', 'Necitlivost'],
    advice: 'Zpomalte. Někdy je lepší o věcech přemýšlet, než do nich bezhlavě skočit.'
  },
  'ESFP': {
    code: 'ESFP', name: 'Bavič', group: 'Průzkumníci', color: 'from-orange-400 to-yellow-500',
    description: 'Spontánní, energičtí a nadšení lidé – život kolem nich nikdy není nudný.',
    strengths: ['Odvaha', 'Originalita', 'Showmanství', 'Praktičnost'],
    weaknesses: ['Neschopnost plánovat', 'Slabé soustředění', 'Vyhýbání se konfliktům', 'Senzitivita'],
    advice: 'Naučte se pracovat i s nudnými povinnostmi. Jsou nezbytné pro vaše budoucí úspěchy.'
  }
};

const COMPATIBILITY_GUIDE: Record<string, { easy: string[], hard: string[], tips: string }> = {
  'INTJ': { easy: ['ENTP', 'ENFP'], hard: ['ESFJ', 'ISFJ'], tips: 'Komunikujte jasně a věcně. Oceňte jejich vizi, ale ukažte praktické dopady.' },
  'INTP': { easy: ['ENTJ', 'ENFP'], hard: ['ESFJ', 'ESTJ'], tips: 'Dejte jim prostor pro přemýšlení. Nenutťte je k okamžitým emocím.' },
  'INFJ': { easy: ['ENFP', 'ENTP'], hard: ['ESTP', 'ESTJ'], tips: 'Mluvte o hlubších významech. Buďte autentičtí a laskaví.' },
  'ENFP': { easy: ['INTJ', 'INFJ'], hard: ['ISTJ', 'ESTJ'], tips: 'Podporujte jejich nadšení, ale jemně je vracejte k zemi.' },
  'ISTJ': { easy: ['ESFJ', 'ISFJ'], hard: ['ENFP', 'ENTP'], tips: 'Dodržujte termíny a buďte dochvilní. Cení si faktů nad pocity.' }
  // Ostatní typy by byly v plné verzi podobně definovány
};

export const PersonalityTestTool = () => {
  const [testState, setTestState] = useState<'intro' | 'testing' | 'result'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ type: string; scores: Record<Dimension, number> } | null>(() => {
    const saved = localStorage.getItem('scrollo_personality_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeCompareType, setActiveCompareType] = useState<string | null>(null);

  // Výběr 30 otázek z poolu (shuffled + decisive mix)
  const activeQuestions = useMemo(() => {
    const basic = QUESTION_POOL.filter(q => !q.isDecisive).sort(() => 0.5 - Math.random()).slice(0, 22);
    const decisive = QUESTION_POOL.filter(q => q.isDecisive).sort(() => 0.5 - Math.random()).slice(0, 8);
    return [...basic, ...decisive].sort(() => 0.5 - Math.random());
  }, [testState === 'testing']);

  const handleAnswer = (value: number) => {
    const q = activeQuestions[currentQuestionIndex];
    setAnswers(prev => ({ ...prev, [q.id]: value }));

    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    const scores: Record<Dimension, number[]> = { EI: [], SN: [], TF: [], JP: [] };
    
    activeQuestions.forEach(q => {
      const val = answers[q.id] || 0;
      // Normalizace na 0-100. Val je -3 až 3.
      // Direction 1: 3 (Agree) -> 100%, -3 (Disagree) -> 0%
      // Direction -1: 3 (Agree) -> 0%, -3 (Disagree) -> 100%
      let normalized = ((val * q.direction) + 3) / 6 * 100;
      scores[q.dimension].push(normalized);
    });

    const finalScores: Record<Dimension, number> = {
      EI: Math.round(scores.EI.reduce((a, b) => a + b, 0) / scores.EI.length),
      SN: Math.round(scores.SN.reduce((a, b) => a + b, 0) / scores.SN.length),
      TF: Math.round(scores.TF.reduce((a, b) => a + b, 0) / scores.TF.length),
      JP: Math.round(scores.JP.reduce((a, b) => a + b, 0) / scores.JP.length),
    };

    const type = [
      finalScores.EI > 50 ? 'E' : 'I',
      finalScores.SN > 50 ? 'S' : 'N',
      finalScores.TF > 50 ? 'T' : 'F',
      finalScores.JP > 50 ? 'J' : 'P'
    ].join('');

    const newResult = { type, scores: finalScores };
    setResult(newResult);
    localStorage.setItem('scrollo_personality_result', JSON.stringify(newResult));
    setTestState('result');
  };

  const resetTest = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTestState('testing');
    setActiveCompareType(null);
  };

  const getSpectrumLabel = (score: number) => {
    if (score > 85 || score < 15) return 'Extrémní';
    if (score > 65 || score < 35) return 'Jasný projev';
    return 'Na pomezí';
  };

  if (testState === 'intro' && !result) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in py-12">
        <div className="w-24 h-24 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto text-indigo-500 animate-pulse">
           <Icons.Brain />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-white">Poznejte své pravé já</h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Tento test vám pomůže odhalit vaše přirozené preference, silné stránky a oblasti, ve kterých budete excelovat. Trvá cca 5-8 minut.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
           {[
             { t: 'Upřímnost', d: 'Odpovídejte podle toho, co skutečně děláte, ne co byste chtěli dělat.' },
             { t: 'Intuitivnost', d: 'Nezastavujte se příliš dlouho u otázek. První pocit bývá nejsprávnější.' },
             { t: 'Nuance', d: 'Vyhýbejte se neutrální odpovědi, pokud je to aspoň trochu možné.' }
           ].map((item, i) => (
             <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
               <div className="text-indigo-400 font-bold mb-1">{item.t}</div>
               <div className="text-xs text-slate-500 leading-tight">{item.d}</div>
             </div>
           ))}
        </div>
        <Button onClick={() => setTestState('testing')} className="px-12 py-4 text-xl shadow-indigo-500/20">
          Spustit test osobnosti
        </Button>
      </div>
    );
  }

  if (testState === 'testing') {
    const q = activeQuestions[currentQuestionIndex];
    const progress = Math.round((currentQuestionIndex / activeQuestions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto space-y-12 animate-fade-in py-8">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span>Postup testem</span>
            <span>{currentQuestionIndex + 1} / {activeQuestions.length}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="text-center space-y-12 min-h-[250px] flex flex-col justify-center">
           <h3 className="text-2xl sm:text-3xl font-bold text-white leading-snug px-4 italic">
             "{q.text}"
           </h3>

           <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 max-w-2xl mx-auto w-full px-4">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-widest sm:-ml-8">Nesouhlasím</span>
              <div className="flex items-center gap-2 sm:gap-4">
                 {[-3, -2, -1, 0, 1, 2, 3].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleAnswer(val)}
                      className={`
                        rounded-full transition-all duration-200 border-2
                        ${val === 0 ? 'w-8 h-8 border-slate-700 bg-slate-800' : ''}
                        ${val < 0 ? `border-rose-500/50 hover:bg-rose-500 hover:scale-110 ${Math.abs(val) === 3 ? 'w-14 h-14' : Math.abs(val) === 2 ? 'w-11 h-11' : 'w-9 h-9'}` : ''}
                        ${val > 0 ? `border-emerald-500/50 hover:bg-emerald-500 hover:scale-110 ${val === 3 ? 'w-14 h-14' : val === 2 ? 'w-11 h-11' : 'w-9 h-9'}` : ''}
                      `}
                      title={val === 0 ? "Neutrální" : val > 0 ? "Souhlas" : "Nesouhlas"}
                    />
                 ))}
              </div>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest sm:-mr-8">Souhlasím</span>
           </div>
        </div>
        
        <div className="text-center text-slate-600 text-xs uppercase tracking-widest">
           Pravdivá odpověď je lepší než "správná" odpověď.
        </div>
      </div>
    );
  }

  if (result) {
    const typeInfo = PERSONALITY_TYPES[result.type];
    const compInfo = COMPATIBILITY_GUIDE[result.type];

    return (
      <div className="space-y-12 animate-fade-in pb-12">
        {/* Result Hero */}
        <div className={`bg-gradient-to-br ${typeInfo.color} rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden`}>
           <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3" />
           
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="text-center md:text-left space-y-4">
                 <div className="text-sm font-black uppercase tracking-[0.3em] opacity-80">Váš typ osobnosti je</div>
                 <h2 className="text-6xl sm:text-8xl font-black tracking-tighter">{typeInfo.code}</h2>
                 <h3 className="text-2xl sm:text-4xl font-bold opacity-90">{typeInfo.name}</h3>
                 <div className="inline-block px-4 py-1.5 bg-black/20 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm border border-white/10">
                    {typeInfo.group}
                 </div>
              </div>
              <div className="flex-1 text-lg leading-relaxed opacity-90 font-medium">
                 {typeInfo.description}
              </div>
           </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Strengths & Weaknesses */}
           <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h4 className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                       <Icons.Check /> Silné stránky
                    </h4>
                    <ul className="space-y-3">
                       {typeInfo.strengths.map((s, i) => (
                         <li key={i} className="flex items-center gap-3 text-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {s}
                         </li>
                       ))}
                    </ul>
                 </div>
                 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h4 className="text-rose-400 font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                       <span className="text-lg">×</span> Slabé stránky
                    </h4>
                    <ul className="space-y-3">
                       {typeInfo.weaknesses.map((s, i) => (
                         <li key={i} className="flex items-center gap-3 text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {s}
                         </li>
                       ))}
                    </ul>
                 </div>
              </div>

              <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-8 flex gap-6 items-start">
                 <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-lg">
                    <Icons.Zap />
                 </div>
                 <div>
                    <h4 className="text-indigo-300 font-bold text-lg mb-2">Rada pro rozvoj</h4>
                    <p className="text-slate-300 leading-relaxed italic">"{typeInfo.advice}"</p>
                 </div>
              </div>

              {/* Interaction Matrix */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                   <h4 className="text-white font-bold text-xl flex items-center gap-2">
                      🤝 Jak vyjít s ostatními?
                   </h4>
                   <select 
                      onChange={(e) => setActiveCompareType(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-indigo-500"
                   >
                      <option value="">Vyberte typ partnera/kolegy</option>
                      {Object.values(PERSONALITY_TYPES).map(t => (
                        <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
                      ))}
                   </select>
                 </div>

                 {activeCompareType ? (
                   <div className="animate-fade-in space-y-6">
                      <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
                         <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Manuál pro {activeCompareType}</div>
                         <p className="text-slate-200 text-lg leading-relaxed">
                            {COMPATIBILITY_GUIDE[activeCompareType]?.tips || 'Pro tento typ se připravuje detailní analýza. Obecně se doporučuje vzájemný respekt k odlišným pohledům na řešení problémů.'}
                         </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs text-center font-bold uppercase">Skvělý doplňující partner</div>
                         <div className="p-4 bg-rose-900/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center font-bold uppercase">Vyžaduje trpělivost v komunikaci</div>
                      </div>
                   </div>
                 ) : (
                   <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
                      Zvolte typ vpravo nahoře a zjistěte, jak spolu efektivně fungovat.
                   </div>
                 )}
              </div>
           </div>

           {/* Spectrums Sidebar */}
           <div className="space-y-6">
              <h4 className="text-white font-bold uppercase tracking-widest text-xs px-2 mb-4">Váš unikátní profil</h4>
              
              {(Object.entries(result.scores) as [Dimension, number][]).map(([dim, score]) => {
                const labels: Record<Dimension, [string, string]> = {
                  EI: ['Introvert', 'Extrovert'],
                  SN: ['Intuitivní', 'Senzorický'],
                  TF: ['Emocionální', 'Logický'],
                  JP: ['Flexibilní', 'Plánovací']
                };
                const [left, right] = labels[dim];
                const isExtreme = score > 85 || score < 15;
                const isBorderline = score >= 45 && score <= 55;

                return (
                  <div key={dim} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                       <span>{left}</span>
                       <span className={isExtreme ? 'text-rose-400' : isBorderline ? 'text-indigo-400' : ''}>{getSpectrumLabel(score)}</span>
                       <span>{right}</span>
                    </div>
                    <div className="relative h-3 bg-slate-950 rounded-full overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-indigo-600 to-emerald-500 opacity-20" />
                       <div 
                         className={`absolute top-0 bottom-0 transition-all duration-1000 ${score > 50 ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-indigo-600'}`} 
                         style={{ 
                            left: score > 50 ? '50%' : `${score}%`, 
                            right: score > 50 ? `${100 - score}%` : '50%' 
                         }} 
                       />
                       <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
                    </div>
                    <div className="flex justify-between items-center px-1">
                       <span className={`text-xl font-black ${score <= 50 ? 'text-white' : 'text-slate-700'}`}>{100 - score}%</span>
                       <span className={`text-xl font-black ${score > 50 ? 'text-white' : 'text-slate-700'}`}>{score}%</span>
                    </div>
                  </div>
                );
              })}

              <Button onClick={resetTest} variant="secondary" className="w-full py-4 text-xs font-black tracking-widest uppercase opacity-60 hover:opacity-100">
                Opakovat test (Nové otázky)
              </Button>
           </div>
        </div>
      </div>
    );
  }

  return null;
};
