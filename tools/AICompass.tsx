import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { Button, useCopyFeedback } from '../components/Shared';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  url: string;
  description: string;
  bestFor: string[];
  contextLength: string;
  pros: string[];
  cons: string[];
  promptTips: string[];
  color: string;
}

const aiModels: AIModel[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    provider: 'OpenAI',
    url: 'https://chatgpt.com/',
    description: 'Nejznámější a nejuniverzálnější AI chatbot. Nabízí skvělé schopnosti v psaní, uvažování (modely o1) a generování obrázků (DALL-E 3).',
    bestFor: ['Univerzální pomocník', 'Kreativní psaní', 'Uvažování a logika (o1)', 'Analýza dat'],
    contextLength: '128k tokenů',
    pros: ['Všestrannost', 'Obrovská znalostní báze', 'Hlasový režim', 'Custom GPTs'],
    cons: ['Občasné "halucinace"', 'Limity ve free verzi', 'Může být "ukecaný"'],
    promptTips: [
      'Používejte "Act as..." (Chovej se jako expert na...)',
      'Pro složité úkoly použijte model o1 nebo o3-mini',
      'Požádejte o kritiku vlastní odpovědi ("Critique yourself")',
      'Specifikujte formát výstupu (tabulka, kód, odrážky)'
    ],
    color: 'bg-emerald-500'
  },
  {
    id: 'claude',
    name: 'Claude',
    provider: 'Anthropic',
    url: 'https://claude.ai/',
    description: 'Vyniká v přirozenosti jazyka, psaní kódu a práci s velkými dokumenty. Působí více "lidsky" a méně roboticky než konkurence.',
    bestFor: ['Programování (Artifacts)', 'Psaní dlouhých textů', 'Analýza velkých souborů', 'Nuance v jazyce'],
    contextLength: '200k tokenů',
    pros: ['Velmi přirozený projev', 'Skvělý na kódování', 'Méně odmítá odpovídat na bezpečné dotazy', 'Artifacts UI'],
    cons: ['Menší ekosystém než OpenAI', 'Limity zpráv mohou být přísné'],
    promptTips: [
      'Používejte XML tagy pro strukturování vstupu (např. <context>...</context>)',
      'Požádejte ho, ať "přemýšlí nahlas" před odpovědí',
      'Nahrávejte celé dokumentace nebo knihy pro kontext',
      'Buďte velmi specifičtí v tónu hlasu'
    ],
    color: 'bg-orange-500'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    provider: 'Google',
    url: 'https://gemini.google.com/app',
    description: 'Hluboce integrovaný do Google ekosystému. Multimodální model schopný pracovat s textem, videem i zvukem v reálném čase.',
    bestFor: ['Práce s Google Workspace (Docs, Drive)', 'Aktuální informace z vyhledávání', 'Analýza videa'],
    contextLength: '1M - 2M tokenů (Pro verze)',
    pros: ['Obrovské kontextové okno', 'Integrace s Google službami', 'Rychlost (Flash modely)'],
    cons: ['Občasné problémy s logikou u složitých úloh', 'Filtry obsahu mohou být přecitlivělé'],
    promptTips: [
      'Využijte integraci s @Google Drive nebo @YouTube',
      'Ptejte se na aktuální události (využívá Google Search)',
      'Nahrajte dlouhé video a ptejte se na detaily',
      'Ověřujte fakta tlačítkem "G" (double-check)'
    ],
    color: 'bg-blue-500'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    provider: 'DeepSeek',
    url: 'https://chat.deepseek.com/',
    description: 'Čínský open-weights model, který šokoval svět svou efektivitou a schopnostmi v programování a matematice (model R1).',
    bestFor: ['Programování', 'Matematika', 'Logické uvažování', 'Ekonomická efektivita'],
    contextLength: '64k - 128k tokenů',
    pros: ['Špičkový výkon v kódu a logice', 'Otevřenost', 'Zdarma nebo velmi levné API'],
    cons: ['Cenzura u politických témat', 'Servery bývají přetížené'],
    promptTips: [
      'Pro model R1: Nepoužívejte složité systémové prompty, nechte ho "přemýšlet" (Chain of Thought)',
      'Zadávejte technické a přesné zadání',
      'Ideální pro refaktoring kódu a matematické důkazy'
    ],
    color: 'bg-indigo-500'
  },
  {
    id: 'grok',
    name: 'Grok',
    provider: 'xAI',
    url: 'https://grok.com/chat/',
    description: 'AI integrovaná do sítě X (Twitter). Má přístup k reálným datům z platformy a nabízí "fun mode" s menšími zábranami.',
    bestFor: ['Aktuální trendy na X', 'Humor a sarkasmus', 'Méně filtrované odpovědi', 'Analýza sentimentu'],
    contextLength: '128k tokenů',
    pros: ['Real-time přístup k X', 'Unikátní osobnost', 'Rychlý vývoj'],
    cons: ['Dostupný primárně pro platící uživatele X (Premium+)', 'Může být zaujatý obsahem z X'],
    promptTips: [
      'Ptejte se: "Co se právě děje ohledně [téma] na X?"',
      'Přepněte do "Fun mode" pro zábavnější odpovědi',
      'Použijte pro rychlý přehled novinek'
    ],
    color: 'bg-gray-200 text-black'
  },
  {
    id: 'llmarena',
    name: 'LLM Arena',
    provider: 'LMSYS',
    url: 'https://llmarena.ai/',
    description: 'Není to jeden model, ale platforma pro porovnávání ("battle") různých modelů naslepo. Skvělé pro zjištění, kdo je aktuálně králem.',
    bestFor: ['Porovnání modelů', 'Testování promptů', 'Nalezení nejlepší AI pro specifický úkol'],
    contextLength: 'Různé',
    pros: ['Objektivní srovnání', 'Přístup k mnoha modelům zdarma', 'Komunitní žebříček'],
    cons: ['Není určeno pro produkční práci', 'Chaty nejsou trvalé'],
    promptTips: [
      'Zadejte stejný prompt dvěma modelům a vyberte vítěze',
      'Použijte "Direct Chat" pro konkrétní model',
      'Sledujte žebříček (Leaderboard) pro aktuální stav trhu'
    ],
    color: 'bg-purple-500'
  }
];

const promptTemplates = [
  {
    title: 'Univerzální expert',
    text: 'Jsi světový expert na [TÉMA]. Tvým úkolem je [CÍL]. Odpovídej stručně, jasně a v bodech. Používej profesionální, ale srozumitelný tón. Pokud potřebuješ více informací, ptej se.',
    tags: ['Role-play', 'Univerzální']
  },
  {
    title: 'Vylepšení textu',
    text: 'Zde je můj text: "[VLOŽIT TEXT]". Prosím o: 1. Opravu gramatiky. 2. Zlepšení čitelnosti a plynulosti. 3. Návrh 3 alternativních nadpisů. Neměň význam textu, jen formu.',
    tags: ['Psaní', 'Korektura']
  },
  {
    title: 'Vysvětlení pro začátečníka',
    text: 'Vysvětli mi koncept [TÉMA] jako bych byl naprostý začátečník (nebo 10leté dítě). Použij analogie z reálného života a vyhni se odbornému žargonu.',
    tags: ['Vzdělávání', 'Zjednodušení']
  },
  {
    title: 'Sokratovský učitel',
    text: 'Chci se naučit o [TÉMA]. Neodpovídej mi přímo výkladem, ale veď mě pomocí otázek, abych na to přišel sám. Buď trpělivý učitel.',
    tags: ['Vzdělávání', 'Interaktivní']
  },
  {
    title: 'Analýza dat/textu',
    text: 'Analyzuj následující data/text: "[VLOŽIT DATA]". Vytáhni 5 nejdůležitějších bodů, identifikuj případné trendy nebo anomálie a navrhni další kroky.',
    tags: ['Analýza', 'Business']
  },
  {
    title: 'Generátor nápadů',
    text: 'Potřebuji 10 kreativních nápadů na [CÍL/PROJEKT]. Nápady by měly být [OMEZENÍ: levné, rychlé, netradiční...]. Pro každý nápad napiš jednu větu popisu.',
    tags: ['Kreativita', 'Brainstorming']
  }
];

export const AICompassTool = () => {
  const [activeTab, setActiveTab] = useState<'models' | 'templates'>('models');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const { copied, copy } = useCopyFeedback();

  const activeModelData = aiModels.find(m => m.id === selectedModel);

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex justify-center gap-2 p-1 bg-slate-950/50 rounded-xl w-fit mx-auto border border-slate-800">
        <button
          onClick={() => { setActiveTab('models'); setSelectedModel(null); }}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'models' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          <Icons.Layers /> Modely
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'templates' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          <Icons.Target /> Šablony
        </button>
      </div>

      {activeTab === 'models' && !selectedModel && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {aiModels.map((model) => (
            <div 
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-teal-500/50 cursor-pointer transition-all hover:-translate-y-1 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${model.color}`}>
                  {model.name[0]}
                </div>
                <div className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-full border border-slate-700">
                  {model.provider}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">{model.name}</h3>
              <p className="text-slate-400 text-sm line-clamp-3 mb-4">{model.description}</p>
              <div className="flex flex-wrap gap-2">
                {model.bestFor.slice(0, 2).map((tag, i) => (
                  <span key={i} className="text-[10px] bg-slate-950 text-slate-400 px-2 py-1 rounded border border-slate-800">
                    {tag}
                  </span>
                ))}
                {model.bestFor.length > 2 && <span className="text-[10px] text-slate-500 px-1 py-1">+{model.bestFor.length - 2}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'models' && activeModelData && (
        <div className="animate-fade-in space-y-6">
          <Button onClick={() => setSelectedModel(null)} variant="ghost" className="pl-0">
            <Icons.ArrowLeft /> Zpět na přehled
          </Button>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-lg ${activeModelData.color}`}>
                  {activeModelData.name[0]}
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">{activeModelData.name}</h2>
                  <p className="text-slate-400 text-sm sm:text-base">{activeModelData.provider} &bull; {activeModelData.contextLength}</p>
                </div>
              </div>
              <a 
                href={activeModelData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-teal-900/20"
              >
                Otevřít chat <Icons.ExternalLink />
              </a>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><Icons.Target /> Nejlepší pro</h3>
                  <div className="flex flex-wrap gap-2">
                    {activeModelData.bestFor.map(tag => (
                      <span key={tag} className="bg-teal-900/20 text-teal-300 border border-teal-500/20 px-3 py-1 rounded-lg text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Silné stránky</h3>
                  <ul className="space-y-2">
                    {activeModelData.pros.map(pro => (
                      <li key={pro} className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="text-green-400 mt-0.5"><Icons.Check /></span> {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Slabé stránky</h3>
                  <ul className="space-y-2">
                    {activeModelData.cons.map(con => (
                      <li key={con} className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="text-red-400 mt-0.5">×</span> {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                  <Icons.Zap /> Tipy pro promptování
                </h3>
                <ul className="space-y-4">
                  {activeModelData.promptTips.map((tip, idx) => (
                    <li key={idx} className="flex gap-3 text-slate-200 text-sm leading-relaxed">
                      <span className="font-bold text-teal-500">{idx + 1}.</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {promptTemplates.map((template, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-teal-500/30 transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-white text-lg">{template.title}</h3>
                <div className="flex gap-1">
                  {template.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-slate-950 text-slate-500 px-1.5 py-0.5 rounded uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50 text-slate-300 font-mono text-xs mb-4 flex-1 whitespace-pre-wrap">
                {template.text}
              </div>
              <Button 
                onClick={() => copy(template.text)}
                variant="secondary"
                className="w-full text-sm"
              >
                {copied ? <><Icons.Check /> Zkopírováno</> : <><Icons.Copy /> Zkopírovat prompt</>}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};