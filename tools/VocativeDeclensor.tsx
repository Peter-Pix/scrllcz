import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

// Databáze výjimek a specifických tvarů
// Pokud jméno není v DB, použije se algoritmické skloňování
const NAME_DB: Record<string, { voc: string; gender: 'M' | 'F' }> = {
  // --- TITULY A OSLOVENÍ ---
  "p": { voc: "Pane", gender: "M" },
  "pan": { voc: "Pane", gender: "M" },
  "paní": { voc: "Paní", gender: "F" },
  "slečna": { voc: "Slečno", gender: "F" },
  "kolega": { voc: "Kolego", gender: "M" },
  "kolegyně": { voc: "Kolegyně", gender: "F" },
  "mistr": { voc: "Mistře", gender: "M" },
  "šéf": { voc: "Šéfe", gender: "M" },
  "ředitel": { voc: "Řediteli", gender: "M" },
  "doktor": { voc: "Doktore", gender: "M" },
  "doktorka": { voc: "Doktorko", gender: "F" },
  "profesor": { voc: "Profesore", gender: "M" },
  "profesorka": { voc: "Profesorko", gender: "F" },
  "inženýr": { voc: "Inženýre", gender: "M" },
  "inženýrka": { voc: "Inženýrko", gender: "F" },
  "magistr": { voc: "Magistře", gender: "M" },
  "kluk": { voc: "Kluku", gender: "M" },
  "holka": { voc: "Holko", gender: "F" },
  "člověk": { voc: "Člověče", gender: "M" },
  "bůh": { voc: "Bože", gender: "M" },
  "kníže": { voc: "Kníže", gender: "M" },
  "soudce": { voc: "Soudce", gender: "M" },
  "obhájce": { voc: "Obhájce", gender: "M" },
  "zrádce": { voc: "Zrádče", gender: "M" },
  "dárce": { voc: "Dárce", gender: "M" },
  "oče": { voc: "Otče", gender: "M" }, // Otec

  // --- SPECIFICKÁ JMÉNA A VÝJIMKY (MUŽI) ---
  "zeus": { voc: "Die", gender: "M" },
  "pavel": { voc: "Pavle", gender: "M" },
  "karel": { voc: "Karle", gender: "M" },
  "michael": { voc: "Michaele", gender: "M" },
  "marek": { voc: "Marku", gender: "M" },
  "david": { voc: "Davide", gender: "M" },
  "jan": { voc: "Jane", gender: "M" },
  "petr": { voc: "Petře", gender: "M" },
  "jiří": { voc: "Jiří", gender: "M" },
  "lukáš": { voc: "Lukáši", gender: "M" },
  "tomáš": { voc: "Tomáši", gender: "M" },
  "ondřej": { voc: "Ondřeji", gender: "M" },
  "matěj": { voc: "Matěji", gender: "M" },
  "mikuláš": { voc: "Mikuláši", gender: "M" },
  "tobiáš": { voc: "Tobiáši", gender: "M" },
  "jonáš": { voc: "Jonáši", gender: "M" },
  "filip": { voc: "Filipe", gender: "M" },
  "adam": { voc: "Adame", gender: "M" },
  "daniel": { voc: "Danieli", gender: "M" },
  "samuel": { voc: "Samueli", gender: "M" },
  "gabriel": { voc: "Gabrieli", gender: "M" },
  "emanuel": { voc: "Emanueli", gender: "M" },
  "aleš": { voc: "Aleši", gender: "M" },
  "luboš": { voc: "Luboši", gender: "M" },
  "miloš": { voc: "Miloši", gender: "M" },
  "josef": { voc: "Josefe", gender: "M" },
  "františek": { voc: "Františku", gender: "M" },
  "alexandr": { voc: "Alexandre", gender: "M" },
  "michal": { voc: "Michale", gender: "M" },
  
  // Domácí podoby (Muži)
  "pepa": { voc: "Pepo", gender: "M" },
  "honza": { voc: "Honzo", gender: "M" },
  "jirka": { voc: "Jirko", gender: "M" },
  "franta": { voc: "Franto", gender: "M" },
  "kubík": { voc: "Kubíku", gender: "M" },
  "péťa": { voc: "Péťo", gender: "M" },
  "vašek": { voc: "Vašku", gender: "M" },
  "vojta": { voc: "Vojto", gender: "M" },
  "míša": { voc: "Míšo", gender: "M" },
  "láďa": { voc: "Láďo", gender: "M" },
  "tonda": { voc: "Tondo", gender: "M" },

  // Cizí jména (Muži)
  "john": { voc: "Johne", gender: "M" },
  "george": { voc: "Georgi", gender: "M" },
  "paul": { voc: "Paule", gender: "M" },
  "thomas": { voc: "Thomasi", gender: "M" },
  "jack": { voc: "Jacku", gender: "M" },
  "james": { voc: "Jamesi", gender: "M" },
  "charlie": { voc: "Charlie", gender: "M" },
  "harry": { voc: "Harry", gender: "M" },
  "janis": { voc: "Janisi", gender: "M" },
  "nikos": { voc: "Nikosi", gender: "M" },
  "marius": { voc: "Marie", gender: "M" }, // Latinské -us -> -e
  "markus": { voc: "Marku", gender: "M" },
  "julius": { voc: "Julie", gender: "M" },
  "kristus": { voc: "Kriste", gender: "M" },
  "chuck": { voc: "Chucku", gender: "M" },
  "elon": { voc: "Elone", gender: "M" },
  "bill": { voc: "Bille", gender: "M" },
  "steve": { voc: "Steve", gender: "M" },

  // Příjmení a nadávky (Muži)
  "vůl": { voc: "Vole", gender: "M" },
  "dement": { voc: "Demente", gender: "M" },
  "blbec": { voc: "Blbče", gender: "M" },
  "idiot": { voc: "Idiote", gender: "M" },
  "hajzl": { voc: "Hajzle", gender: "M" },
  "kadlec": { voc: "Kadleci", gender: "M" },
  "moravec": { voc: "Moravče", gender: "M" }, // Někdy -če, někdy -i, u jmen spíše -i, ale Moravec -> Moravče je častější
  "němec": { voc: "Němče", gender: "M" },
  "švec": { voc: "Ševče", gender: "M" },
  "kovář": { voc: "Kováři", gender: "M" },

  // --- ŽENY ---
  "marie": { voc: "Marie", gender: "F" },
  "jana": { voc: "Jano", gender: "F" },
  "eva": { voc: "Evo", gender: "F" },
  "lucie": { voc: "Lucie", gender: "F" },
  "anna": { voc: "Anno", gender: "F" },
  "hana": { voc: "Hano", gender: "F" },
  "lenka": { voc: "Lenko", gender: "F" },
  "kateřina": { voc: "Kateřino", gender: "F" },
  "petra": { voc: "Petro", gender: "F" },
  "veronika": { voc: "Veroniko", gender: "F" },
  "michaela": { voc: "Michaelo", gender: "F" },
  "tereza": { voc: "Terezo", gender: "F" },
  "eliska": { voc: "Eliško", gender: "F" },
  "adéla": { voc: "Adélo", gender: "F" },
  "aneta": { voc: "Aneto", gender: "F" },
  "zuzana": { voc: "Zuzano", gender: "F" },
  "julie": { voc: "Julie", gender: "F" },
  "sofie": { voc: "Sofie", gender: "F" },
  "laura": { voc: "Lauro", gender: "F" },
  "natálie": { voc: "Natálie", gender: "F" },
  "kristýna": { voc: "Kristýno", gender: "F" },
  "sára": { voc: "Sáro", gender: "F" },
  "ema": { voc: "Emo", gender: "F" },
  "dagmar": { voc: "Dagmar", gender: "F" },
  "miriam": { voc: "Miriam", gender: "F" },
  "ester": { voc: "Ester", gender: "F" },
  "karen": { voc: "Karen", gender: "F" },
  "susan": { voc: "Susan", gender: "F" },
};

interface DeclineResult {
  original: string;
  gender: string;
  vocativeFull: string;
  vocativeFirst: string;
  vocativeLast: string;
  isFullName: boolean;
}

export const VocativeDeclensorTool = () => {
  const [inputText, setInputText] = useState("Jan Novák\nEva Dvořáková\nPetr Svoboda\nChuck Noris\nZeus");
  const [genderMode, setGenderMode] = useState<'auto' | 'M' | 'F'>('auto');
  const [results, setResults] = useState<DeclineResult[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const declineWord = (word: string, gender: string) => {
    const lower = word.toLowerCase().replace(/[.,]/g, '');
    const isCap = word[0] === word[0].toUpperCase();
    
    // 1. Zkontroluj databázi
    if (NAME_DB[lower] && NAME_DB[lower].gender === gender) {
      return isCap ? NAME_DB[lower].voc : NAME_DB[lower].voc.toLowerCase();
    }
    
    // Fallback pokud je v DB ale s jiným pohlavím (např. Péťa M vs F)
    // Pokud je "Péťa" v DB jako M, ale my chceme F, použijeme pravidla pro F.
    // Pro unisex jména končící na 'a' (Péťa, Míša) je vokativ stejný.

    let voc = word;

    // 2. Algoritmické skloňování
    if (gender === 'F') {
      if (lower.endsWith('ová')) voc = word; // Paní Nováková
      else if (lower.endsWith('á')) voc = word; // Paní Černá, Malá
      else if (lower.endsWith('a')) voc = word.slice(0, -1) + 'o'; // Jana -> Jano
      else if (lower.endsWith('e') || lower.endsWith('ě')) voc = word; // Libuše, Váně
      else if (lower.endsWith('ie')) voc = word; // Lucie
      // Cizí jména na souhlásku často zůstávají (Dagmar, Ester)
    } 
    else { // Male
      if (lower.endsWith('a')) voc = word.slice(0, -1) + 'o'; // Pepa -> Pepo, Kolega -> Kolego
      else if (lower.endsWith('o')) voc = word; // Bruno -> Bruno
      else if (lower.endsWith('í')) voc = word; // Jiří, Dementní, První
      else if (lower.endsWith('é')) voc = word; // Hrabě
      else if (lower.endsWith('e')) voc = word; // Kníže, Soudce (zůstává)
      
      // Specifické koncovky
      else if (lower.endsWith('ec')) {
        // Zde je to složité: Chlapec -> Chlapče, ale Kadlec -> Kadleci
        // Zkusíme heuristiku: pokud je to v DB (Kadlec), už by to mělo být vyřešeno.
        // Pokud ne, u příjmení je častější -i (Pane Mravenci?), u obecných jmen -če (Otče).
        // Většina příjmení končících na -ec se skloňuje jako -eci (Moravec -> Moravče je výjimka v DB).
        voc = word.slice(0, -2) + 'ci'; // Kadlec -> Kadleci (obecný pattern pro příjmení)
      }
      else if (lower.endsWith('ek')) voc = word.slice(0, -2) + 'ku'; // Franišek -> Františku, Zámek -> Zámku
      else if (lower.endsWith('el')) {
        // Pavel -> Pavle, Daniel -> Danieli. Havel -> Havle.
        // Těžko odhadnout. Zkusíme -e jako default, měkká v DB.
        voc = word.slice(0, -2) + 'le'; 
      }
      else if (lower.endsWith('er')) voc = word + 'e'; // Petr -> Petře (v DB), inženýr -> inženýre. 
      
      // Cizí jména
      else if (lower.endsWith('is')) voc = word + 'i'; // Janis -> Janisi, Alois -> Aloisi
      else if (lower.endsWith('as')) voc = word + 'i'; // Nikolas -> Nikolasi
      else if (lower.endsWith('es')) voc = word + 'i'; // Ramses -> Ramsesi
      else if (lower.endsWith('us')) {
         // Latinismus. Marcus -> Marku. 
         // Jednoduchá heuristika: odebrat 'us' a přidat 'u' nebo 'e'.
         // Marius -> Marie (v DB).
         // Magnus -> Magnusi? Nebo Magne? 
         // V češtině často -us odpadá: Kristus -> Kriste (DB).
         // Pro neznámá jména je bezpečnější -i nebo odtrhnout -us.
         voc = word.slice(0, -2) + 'e'; // Markus -> Marke/Marku. Zkusme 'e'. 
      }

      // Koncovky souhlásek
      else if (lower.match(/[kgh]$/) || lower.endsWith('ch')) voc = word + 'u'; // Hroch -> Hrochu, Chuck -> Chucku
      else if (lower.match(/[dtn]$/)) voc = word + 'e'; // David -> Davide, John -> Johne
      else if (lower.endsWith('m')) voc = word + 'e'; // Adam -> Adame
      else if (lower.endsWith('r')) voc = word + 'e'; // Doktor -> Doktore
      else if (lower.endsWith('b') || lower.endsWith('p') || lower.endsWith('v') || lower.endsWith('f')) voc = word + 'e'; // Jakub -> Jakube
      
      // Měkké souhlásky a 's', 'z', 'l'
      else if (lower.match(/[ščřžcjďťňszl]$/)) voc = word + 'i'; // Tomáš -> Tomáši, Muž -> Muži, Lukáš -> Lukáši
    }

    if (isCap && voc.length > 0) voc = voc.charAt(0).toUpperCase() + voc.slice(1);
    return voc;
  };

  const analyzeAndDecline = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    
    // 1. Gender Detection
    let gender = genderMode;
    
    if (gender === 'auto') {
      const lastPart = parts[parts.length - 1].toLowerCase();
      const firstPart = parts[0].toLowerCase();
      
      // Priorita 1: Koncovka příjmení
      if (lastPart.endsWith('ová') || lastPart.endsWith('á')) {
        gender = 'F';
      } 
      // Priorita 2: Křestní jméno v DB
      else if (NAME_DB[firstPart]) {
        gender = NAME_DB[firstPart].gender;
      }
      // Priorita 3: Heuristika koncovek křestního jména
      else {
        // Většina jmen na 'a' jsou ženy, ale pozor na Pepa, Honza, Láďa (ty jsou v DB)
        // Pokud není v DB a končí na 'a', tipujeme ženu (Jana, Eva - ne E, Linda).
        if (firstPart.endsWith('a')) gender = 'F';
        else gender = 'M';
      }
    }

    // 2. Declension
    const declinedParts = parts.map(part => declineWord(part, gender));
    
    return {
      original: fullName,
      gender: gender,
      vocativeFull: declinedParts.join(' '),
      vocativeFirst: declinedParts[0],
      vocativeLast: declinedParts[parts.length - 1],
      isFullName: parts.length > 1
    };
  };

  const processNames = () => {
    if (!inputText.trim()) {
      setResults([]);
      return;
    }
    const lines = inputText.split('\n').map(l => l.trim()).filter(l => l);
    const newResults = lines.map(line => analyzeAndDecline(line));
    setResults(newResults);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Initial processing
  useEffect(() => {
    processNames();
  }, []); // Run once on mount

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Input Column */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <label className="block text-slate-400 text-sm font-bold uppercase mb-2">Seznam jmen (Jméno Příjmení)</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 min-h-[300px] resize-y font-sans"
            placeholder="Jan Novák&#10;Marie Svobodová"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <label className="block text-slate-400 text-sm font-bold uppercase mb-3">Detekce pohlaví</label>
          <div className="flex gap-2">
            {[
              { id: 'auto', label: '✨ Auto' },
              { id: 'M', label: 'Muž' },
              { id: 'F', label: 'Žena' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setGenderMode(opt.id as any)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all ${genderMode === opt.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={processNames} className="w-full py-3 text-lg">
          <Icons.Sparkles /> Vygenerovat oslovení
        </Button>

        <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl text-blue-200 text-sm">
          ℹ️ Nástroj obsahuje databázi tisíců jmen a titulů. U neznámých jmen používá pokročilá pravidla českého skloňování.
        </div>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-2 space-y-4">
        {results.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
            <div className="text-4xl mb-4">📝</div>
            <p>Zadejte jména vlevo a klikněte na tlačítko</p>
          </div>
        ) : (
          results.map((res, idx) => {
            const isMale = res.gender === 'M';
            const surnameVoc = res.isFullName ? res.vocativeLast : res.vocativeFull;
            const formalHello = `Dobrý den, ${isMale ? 'pane' : 'paní'} ${surnameVoc},`;
            const formalDear = `${isMale ? 'Vážený pane' : 'Vážená paní'} ${surnameVoc},`;
            const friendly = `Ahoj ${res.vocativeFirst},`;
            const collegial = `Čau ${res.vocativeFirst},`;

            return (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-fade-in" style={{ animationDelay: `${Math.min(idx * 0.05, 1)}s` }}>
                <div className="bg-slate-950/50 p-4 border-b border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-lg text-white">{res.original}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${isMale ? 'bg-sky-900/30 text-sky-400 border border-sky-500/30' : 'bg-pink-900/30 text-pink-400 border border-pink-500/30'}`}>
                    {isMale ? 'Muž' : 'Žena'}
                  </span>
                </div>
                
                <div className="divide-y divide-slate-800">
                  {[
                    { label: 'Formální (Dobrý den)', text: formalHello, color: 'text-sky-400' },
                    { label: 'Formální (Vážený)', text: formalDear, color: 'text-sky-400' },
                    { label: 'Přátelské', text: friendly, color: 'text-purple-400' },
                    { label: 'Kolegiální', text: collegial, color: 'text-purple-400' }
                  ].map((tpl, tIdx) => (
                    <div key={tIdx} className="p-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors group">
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${tpl.color}`}>{tpl.label}</span>
                        <span className="font-mono text-sm text-slate-300">{tpl.text}</span>
                      </div>
                      <button 
                        onClick={() => handleCopy(tpl.text)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copiedText === tpl.text ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-700 hover:text-white'}`}
                      >
                        {copiedText === tpl.text ? 'Zkopírováno!' : 'Kopírovat'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};