import React, { useState } from 'react';
import { Button } from '../components/Shared';

const difficultyMap: Record<string, { label: string; color: string; text: string; bg: string; border: string; time: string }> = {
  easy: { label: 'Snadné', color: '#4ade80', text: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20', time: '600 hodin' },
  medium: { label: 'Střední', color: '#facc15', text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', time: '1100 hodin' },
  hard: { label: 'Těžké', color: '#f87171', text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', time: '2200 hodin' },
  "very-hard": { label: 'Velmi těžké', color: '#c084fc', text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', time: '2200+ hodin' }
};

const languageData: any = {
  'Indoevropské': {
    languages: [
      { name: 'Španělština', speakers: '540 mil.', difficulty: 'easy', learningTime: '600', script: 'Latinka' },
      { name: 'Angličtina', speakers: '1.5 mld.', difficulty: 'easy', learningTime: '600', script: 'Latinka' },
      { name: 'Francouzština', speakers: '300 mil.', difficulty: 'medium', learningTime: '750', script: 'Latinka' },
      { name: 'Němčina', speakers: '130 mil.', difficulty: 'medium', learningTime: '900', script: 'Latinka' },
      { name: 'Ruština', speakers: '260 mil.', difficulty: 'medium', learningTime: '1100', script: 'Cyrilice' },
      { name: 'Portugalština', speakers: '250 mil.', difficulty: 'easy', learningTime: '600', script: 'Latinka' },
      { name: 'Italština', speakers: '85 mil.', difficulty: 'easy', learningTime: '600', script: 'Latinka' }
    ],
    easiest: ['Španělština', 'Angličtina'],
    hardest: ['Ruština']
  },
  'Slovanské': {
    languages: [
        { name: 'Čeština', speakers: '10 mil.', difficulty: 'medium', learningTime: '1100', script: 'Latinka' },
        { name: 'Slovenština', speakers: '5 mil.', difficulty: 'medium', learningTime: '1100', script: 'Latinka' },
        { name: 'Polština', speakers: '40 mil.', difficulty: 'hard', learningTime: '1100', script: 'Latinka' },
        { name: 'Chorvatština', speakers: '6 mil.', difficulty: 'medium', learningTime: '1100', script: 'Latinka' },
        { name: 'Ukrajinština', speakers: '40 mil.', difficulty: 'medium', learningTime: '1100', script: 'Cyrilice' }
    ],
    easiest: ['Slovenština'],
    hardest: ['Polština']
  },
  'Sinotibetské': {
    languages: [
      { name: 'Mandarinština', speakers: '1.1 mld.', difficulty: 'very-hard', learningTime: '2200', script: 'Znaky' },
      { name: 'Kantonština', speakers: '85 mil.', difficulty: 'very-hard', learningTime: '2200', script: 'Znaky' }
    ],
    easiest: [],
    hardest: ['Mandarinština']
  },
  'Japonské': {
    languages: [
      { name: 'Japonština', speakers: '125 mil.', difficulty: 'very-hard', learningTime: '2200', script: 'Kana/Kanji' }
    ],
    easiest: [],
    hardest: ['Japonština']
  },
  'Afroasijské': {
    languages: [
      { name: 'Arabština', speakers: '310 mil.', difficulty: 'very-hard', learningTime: '2200', script: 'Arabské' },
      { name: 'Hebrejština', speakers: '9 mil.', difficulty: 'hard', learningTime: '1100', script: 'Hebrejské' }
    ],
    easiest: ['Hebrejština'],
    hardest: ['Arabština']
  }
};

const languageSimilarity: any = {
  'čeština': { group: 'Slovanské', similar: ['Slovenština', 'Polština', 'Chorvatština'] },
  'slovenština': { group: 'Slovanské', similar: ['Čeština', 'Polština', 'Ukrajinština'] },
  'polština': { group: 'Slovanské', similar: ['Čeština', 'Slovenština', 'Ukrajinština'] },
  'angličtina': { group: 'Germánské', similar: ['Němčina', 'Holandština', 'Švédština'] },
  'němčina': { group: 'Germánské', similar: ['Holandština', 'Angličtina', 'Dánština'] },
  'španělština': { group: 'Románské', similar: ['Portugalština', 'Italština', 'Francouzština'] },
  'francouzština': { group: 'Románské', similar: ['Italština', 'Španělština', 'Portugalština'] },
  'italština': { group: 'Románské', similar: ['Španělština', 'Francouzština', 'Portugalština'] },
  'japonština': { group: 'Japonské', similar: ['Korejština', 'Mandarinština'] },
  'mandarinština': { group: 'Sinotibetské', similar: ['Kantonština', 'Japonština', 'Korejština'] }
};

export const LanguageGuideTool = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'recommender'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('Indoevropské');
  const [inputLang, setInputLang] = useState('');
  const [recommendationResult, setRecommendationResult] = useState<any>(null);

  const handleRecommend = () => {
    const term = inputLang.toLowerCase().trim();
    if (!term) return;

    if (languageSimilarity[term]) {
      setRecommendationResult({ found: true, ...languageSimilarity[term], term });
    } else {
      setRecommendationResult({ found: false, term });
    }
  };

  const getLanguageDifficulty = (langName: string) => {
    for (let cat in languageData) {
      const found = languageData[cat].languages.find((l: any) => l.name.toLowerCase() === langName.toLowerCase());
      if (found) return found.difficulty;
    }
    return "medium";
  };

  const renderDifficultyChart = (languages: any[]) => {
    const counts: any = { easy: 0, medium: 0, hard: 0, "very-hard": 0 };
    languages.forEach(l => counts[l.difficulty]++);
    const max = Math.max(...Object.values(counts) as number[]);

    return (
      <div className="space-y-3 mt-4">
        {Object.keys(counts).map(diff => {
          const count = counts[diff];
          if (count === 0) return null;
          const styles = difficultyMap[diff];
          return (
            <div key={diff} className="flex items-center gap-3">
              <div className={`w-24 text-xs font-bold uppercase ${styles.text} flex-shrink-0`}>{styles.label}</div>
              <div className="flex-1 h-6 bg-slate-800 rounded-full overflow-hidden relative">
                <div 
                  className="h-full transition-all duration-500" 
                  style={{ width: `${(count / max) * 100}%`, backgroundColor: styles.color }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white drop-shadow-md">
                   {count} {count === 1 ? 'jazyk' : (count > 1 && count < 5 ? 'jazyky' : 'jazyků')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-center gap-2 p-1 bg-slate-950/50 rounded-xl w-full sm:w-fit mx-auto border border-slate-800">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 sm:py-2 rounded-lg font-medium transition-all w-full sm:w-auto flex items-center justify-center gap-2 ${activeTab === 'categories' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          <span>📊</span> Kategorie & Grafy
        </button>
        <button
          onClick={() => setActiveTab('recommender')}
          className={`px-6 py-3 sm:py-2 rounded-lg font-medium transition-all w-full sm:w-auto flex items-center justify-center gap-2 ${activeTab === 'recommender' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          <span>🎯</span> Doporučovač
        </button>
      </div>

      {activeTab === 'categories' && (
        <div className="animate-fade-in space-y-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.keys(languageData).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 sm:py-1.5 rounded-lg text-sm font-medium transition-all border ${selectedCategory === cat ? 'bg-slate-800 text-white border-indigo-500 shadow-indigo-500/20 shadow-lg' : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="bg-slate-950/30 rounded-xl border border-slate-800/50 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
              {selectedCategory}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-slate-400 font-bold text-sm uppercase mb-4">Statistiky obtížnosti</h3>
                {renderDifficultyChart(languageData[selectedCategory].languages)}
              </div>
              <div>
                <h3 className="text-slate-400 font-bold text-sm uppercase mb-4">Nejpoužívanější</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                   {languageData[selectedCategory].languages.slice(0, 3).map((l: any, i: number) => {
                     const styles = difficultyMap[l.difficulty];
                     return (
                       <span key={i} className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${styles.border} ${styles.bg} ${styles.text}`}>
                         {l.name} <span className="text-white/60 text-xs ml-1">({l.speakers})</span>
                       </span>
                     );
                   })}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-green-900/10 border border-green-500/20">
                     <div className="text-green-400 text-xs font-bold uppercase mb-2">Nejsnadnější</div>
                     <div className="flex flex-wrap gap-1">
                       {languageData[selectedCategory].easiest.map((l: string) => <span key={l} className="text-slate-300 text-sm">{l}</span>)}
                     </div>
                  </div>
                  <div className="p-3 rounded-lg bg-red-900/10 border border-red-500/20">
                     <div className="text-red-400 text-xs font-bold uppercase mb-2">Nejtěžší</div>
                     <div className="flex flex-wrap gap-1">
                       {languageData[selectedCategory].hardest.map((l: string) => <span key={l} className="text-slate-300 text-sm">{l}</span>)}
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="text-slate-500 text-xs uppercase border-b border-slate-800">
                    <th className="py-3 px-2 font-semibold">Jazyk</th>
                    <th className="py-3 px-2 font-semibold">Mluvčí</th>
                    <th className="py-3 px-2 font-semibold">Obtížnost</th>
                    <th className="py-3 px-2 font-semibold">Čas (h)</th>
                    <th className="py-3 px-2 font-semibold">Písmo</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {languageData[selectedCategory].languages.map((l: any) => {
                    const styles = difficultyMap[l.difficulty];
                    return (
                      <tr key={l.name} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-2 text-white font-medium">{l.name}</td>
                        <td className="py-3 px-2 text-slate-400 whitespace-nowrap">{l.speakers}</td>
                        <td className="py-3 px-2">
                          <span className={`text-xs px-2 py-0.5 rounded border whitespace-nowrap ${styles.border} ${styles.bg} ${styles.text}`}>
                            {styles.label}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-400 whitespace-nowrap">{l.learningTime}</td>
                        <td className="py-3 px-2 text-slate-400 whitespace-nowrap">{l.script}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recommender' && (
        <div className="animate-fade-in max-w-2xl mx-auto space-y-8">
           <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-center">
             <h2 className="text-xl font-bold text-white mb-2">Jakým jazykem hovoříte?</h2>
             <p className="text-slate-400 mb-6 text-sm">Zadejte váš rodný nebo silný druhý jazyk pro nalezení nejvhodnějšího dalšího jazyka.</p>
             
             <div className="flex flex-col sm:flex-row gap-2">
               <input 
                 type="text" 
                 value={inputLang}
                 onChange={(e) => setInputLang(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleRecommend()}
                 placeholder="Např. čeština, angličtina..." 
                 className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
               />
               <Button onClick={handleRecommend} className="w-full sm:w-auto py-3">Najít</Button>
             </div>
           </div>

           {recommendationResult && (
             <div className="space-y-4">
                {!recommendationResult.found ? (
                   <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-xl text-red-300 text-center">
                      Jazyk "{recommendationResult.term}" nebyl nalezen v databázi. Zkuste prosím jiný (např. čeština, angličtina).
                   </div>
                ) : (
                   <>
                     <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl">
                        <h3 className="text-blue-300 font-bold mb-1">Skupina: {recommendationResult.group}</h3>
                        <p className="text-blue-400/80 text-sm">Na základě podobnosti s jazykem "{recommendationResult.term}" doporučujeme:</p>
                     </div>

                     <div className="space-y-3">
                        {recommendationResult.similar.map((lang: string, idx: number) => {
                           const diffKey = getLanguageDifficulty(lang);
                           const styles = difficultyMap[diffKey];
                           const score = 100 - (idx * 15);
                           
                           return (
                             <div key={lang} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 hover:border-slate-700 transition-colors">
                                <div>
                                   <div className="flex flex-wrap items-center gap-3 mb-1">
                                      <span className="text-lg font-bold text-white">{lang}</span>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap ${styles.border} ${styles.bg} ${styles.text}`}>
                                         {styles.label}
                                      </span>
                                   </div>
                                   <div className="text-xs text-slate-500">Odhadovaný čas: {styles.time}</div>
                                </div>
                                <div className="w-full sm:w-auto flex sm:block items-center justify-between sm:text-right border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                                   <div className="text-sm sm:hidden text-slate-400">Kompatibilita</div>
                                   <div>
                                     <div className="text-xl font-bold text-green-400">{score}%</div>
                                     <div className="text-[10px] text-slate-600 uppercase tracking-wider hidden sm:block">Kompatibilita</div>
                                   </div>
                                </div>
                             </div>
                           );
                        })}
                     </div>
                   </>
                )}
             </div>
           )}
           
           <div className="mt-8">
             <h3 className="text-slate-500 font-bold text-sm uppercase mb-4 text-center">Přehled obtížnosti</h3>
             <div className="grid grid-cols-2 gap-4">
                {Object.keys(difficultyMap).map(d => (
                   <div key={d} className={`p-3 rounded-lg border ${difficultyMap[d].border} ${difficultyMap[d].bg}`}>
                      <div className={`text-xs font-bold uppercase mb-1 ${difficultyMap[d].text}`}>{difficultyMap[d].label}</div>
                      <div className="text-xs text-slate-400">{difficultyMap[d].time}</div>
                   </div>
                ))}
             </div>
           </div>
        </div>
      )}
    </div>
  );
};