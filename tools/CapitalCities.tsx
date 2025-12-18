
import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

interface Country {
  name: string;
  capital: string;
  continent: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  // Evropa
  { name: 'Albánie', capital: 'Tirana', continent: 'Evropa', flag: '🇦🇱' },
  { name: 'Andorra', capital: 'Andorra la Vella', continent: 'Evropa', flag: '🇦🇩' },
  { name: 'Belgie', capital: 'Brusel', continent: 'Evropa', flag: '🇧🇪' },
  { name: 'Bělorusko', capital: 'Minsk', continent: 'Evropa', flag: '🇧🇾' },
  { name: 'Bosna a Hercegovina', capital: 'Sarajevo', continent: 'Evropa', flag: '🇧🇦' },
  { name: 'Bulharsko', capital: 'Sofie', continent: 'Evropa', flag: '🇧🇬' },
  { name: 'Černá Hora', capital: 'Podgorica', continent: 'Evropa', flag: '🇲🇪' },
  { name: 'Česko', capital: 'Praha', continent: 'Evropa', flag: '🇨🇿' },
  { name: 'Dánsko', capital: 'Kodaň', continent: 'Evropa', flag: '🇩🇰' },
  { name: 'Estonsko', capital: 'Tallinn', continent: 'Evropa', flag: '🇪🇪' },
  { name: 'Finsko', capital: 'Helsinky', continent: 'Evropa', flag: '🇫🇮' },
  { name: 'Francie', capital: 'Paříž', continent: 'Evropa', flag: '🇫🇷' },
  { name: 'Chorvatsko', capital: 'Záhřeb', continent: 'Evropa', flag: '🇭🇷' },
  { name: 'Irsko', capital: 'Dublin', continent: 'Evropa', flag: '🇮🇪' },
  { name: 'Island', capital: 'Reykjavík', continent: 'Evropa', flag: '🇮🇸' },
  { name: 'Itálie', capital: 'Řím', continent: 'Evropa', flag: '🇮🇹' },
  { name: 'Kosovo', capital: 'Priština', continent: 'Evropa', flag: '🇽🇰' },
  { name: 'Lichtenštejnsko', capital: 'Vaduz', continent: 'Evropa', flag: '🇱🇮' },
  { name: 'Litva', capital: 'Vilnius', continent: 'Evropa', flag: '🇱🇹' },
  { name: 'Lotyšsko', capital: 'Riga', continent: 'Evropa', flag: '🇱🇻' },
  { name: 'Lucembursko', capital: 'Lucemburk', continent: 'Evropa', flag: '🇱🇺' },
  { name: 'Maďarsko', capital: 'Budapešť', continent: 'Evropa', flag: '🇭🇺' },
  { name: 'Malta', capital: 'Valletta', continent: 'Evropa', flag: '🇲🇹' },
  { name: 'Moldavsko', capital: 'Kišiněv', continent: 'Evropa', flag: '🇲🇩' },
  { name: 'Monako', capital: 'Monako', continent: 'Evropa', flag: '🇲🇨' },
  { name: 'Německo', capital: 'Berlín', continent: 'Evropa', flag: '🇩🇪' },
  { name: 'Nizozemsko', capital: 'Amsterdam', continent: 'Evropa', flag: '🇳🇱' },
  { name: 'Norsko', capital: 'Oslo', continent: 'Evropa', flag: '🇳🇴' },
  { name: 'Polsko', capital: 'Varšava', continent: 'Evropa', flag: '🇵🇱' },
  { name: 'Portugalsko', capital: 'Lisabon', continent: 'Evropa', flag: '🇵🇹' },
  { name: 'Rakousko', capital: 'Vídeň', continent: 'Evropa', flag: '🇦🇹' },
  { name: 'Rumunsko', capital: 'Bukurešť', continent: 'Evropa', flag: '🇷🇴' },
  { name: 'Rusko', capital: 'Moskva', continent: 'Evropa', flag: '🇷🇺' },
  { name: 'Řecko', capital: 'Atény', continent: 'Evropa', flag: '🇬🇷' },
  { name: 'San Marino', capital: 'San Marino', continent: 'Evropa', flag: '🇸🇲' },
  { name: 'Severní Makedonie', capital: 'Skopje', continent: 'Evropa', flag: '🇲🇰' },
  { name: 'Slovensko', capital: 'Bratislava', continent: 'Evropa', flag: '🇸🇰' },
  { name: 'Slovinsko', capital: 'Lublaň', continent: 'Evropa', flag: '🇸🇮' },
  { name: 'Spojené království', capital: 'Londýn', continent: 'Evropa', flag: '🇬🇧' },
  { name: 'Srbsko', capital: 'Bělehrad', continent: 'Evropa', flag: '🇷🇸' },
  { name: 'Španělsko', capital: 'Madrid', continent: 'Evropa', flag: '🇪🇸' },
  { name: 'Švédsko', capital: 'Stockholm', continent: 'Evropa', flag: '🇸🇪' },
  { name: 'Švýcarsko', capital: 'Bern', continent: 'Evropa', flag: '🇨🇭' },
  { name: 'Ukrajina', capital: 'Kyjev', continent: 'Evropa', flag: '🇺🇦' },
  { name: 'Vatikán', capital: 'Vatikán', continent: 'Evropa', flag: '🇻🇦' },

  // Amerika
  { name: 'Argentina', capital: 'Buenos Aires', continent: 'Amerika', flag: '🇦🇷' },
  { name: 'Brazílie', capital: 'Brasília', continent: 'Amerika', flag: '🇧🇷' },
  { name: 'Kanada', capital: 'Ottawa', continent: 'Amerika', flag: '🇨🇦' },
  { name: 'Chile', capital: 'Santiago de Chile', continent: 'Amerika', flag: '🇨🇱' },
  { name: 'Kolumbie', capital: 'Bogotá', continent: 'Amerika', flag: '🇨🇴' },
  { name: 'Kuba', capital: 'Havana', continent: 'Amerika', flag: '🇨🇺' },
  { name: 'Mexiko', capital: 'Mexiko', continent: 'Amerika', flag: '🇲🇽' },
  { name: 'Peru', capital: 'Lima', continent: 'Amerika', flag: '🇵🇪' },
  { name: 'USA', capital: 'Washington, D.C.', continent: 'Amerika', flag: '🇺🇸' },
  { name: 'Uruguay', capital: 'Montevideo', continent: 'Amerika', flag: '🇺🇾' },
  { name: 'Venezuela', capital: 'Caracas', continent: 'Amerika', flag: '🇻🇪' },

  // Asie
  { name: 'Afghánistán', capital: 'Kábul', continent: 'Asie', flag: '🇦🇫' },
  { name: 'Arménie', capital: 'Jerevan', continent: 'Asie', flag: '🇦🇲' },
  { name: 'Ázerbájdžán', capital: 'Baku', continent: 'Asie', flag: '🇦🇿' },
  { name: 'Čína', capital: 'Peking', continent: 'Asie', flag: '🇨🇳' },
  { name: 'Gruzie', capital: 'Tbilisi', continent: 'Asie', flag: '🇬🇪' },
  { name: 'Indie', capital: 'Nové Dillí', continent: 'Asie', flag: '🇮🇳' },
  { name: 'Indonésie', capital: 'Jakarta', continent: 'Asie', flag: '🇮🇩' },
  { name: 'Irák', capital: 'Bagdád', continent: 'Asie', flag: '🇮🇶' },
  { name: 'Írán', capital: 'Teherán', continent: 'Asie', flag: '🇮🇷' },
  { name: 'Izrael', capital: 'Jeruzalém', continent: 'Asie', flag: '🇮🇱' },
  { name: 'Japonsko', capital: 'Tokio', continent: 'Asie', flag: '🇯🇵' },
  { name: 'Jižní Korea', capital: 'Soul', continent: 'Asie', flag: '🇰🇷' },
  { name: 'Kazachstán', capital: 'Astana', continent: 'Asie', flag: '🇰🇿' },
  { name: 'Libanon', capital: 'Bejrút', continent: 'Asie', flag: '🇱🇧' },
  { name: 'Malajsie', capital: 'Kuala Lumpur', continent: 'Asie', flag: '🇲🇾' },
  { name: 'Mongolsko', capital: 'Ulánbátar', continent: 'Asie', flag: '🇲🇳' },
  { name: 'Pákistán', capital: 'Islámábád', continent: 'Asie', flag: '🇵🇰' },
  { name: 'Saúdská Arábie', capital: 'Rijád', continent: 'Asie', flag: '🇸🇦' },
  { name: 'Severní Korea', capital: 'Pchjongjang', continent: 'Asie', flag: '🇰🇵' },
  { name: 'Singapur', capital: 'Singapur', continent: 'Asie', flag: '🇸🇬' },
  { name: 'Sýrie', capital: 'Damašek', continent: 'Asie', flag: '🇸🇾' },
  { name: 'Thajsko', capital: 'Bangkok', continent: 'Asie', flag: '🇹🇭' },
  { name: 'Turecko', capital: 'Ankara', continent: 'Asie', flag: '🇹🇷' },
  { name: 'Vietnam', capital: 'Hanoj', continent: 'Asie', flag: '🇻🇳' },

  // Afrika
  { name: 'Alžírsko', capital: 'Alžír', continent: 'Afrika', flag: '🇩🇿' },
  { name: 'Egypt', capital: 'Káhira', continent: 'Afrika', flag: '🇪🇬' },
  { name: 'Etiopie', capital: 'Addis Abeba', continent: 'Afrika', flag: '🇪🇹' },
  { name: 'JAR', capital: 'Pretoria', continent: 'Afrika', flag: '🇿🇦' },
  { name: 'Keňa', capital: 'Nairobi', continent: 'Afrika', flag: '🇰🇪' },
  { name: 'Libye', capital: 'Tripolis', continent: 'Afrika', flag: '🇱🇾' },
  { name: 'Maroko', capital: 'Rabat', continent: 'Afrika', flag: '🇲🇦' },
  { name: 'Nigérie', capital: 'Abuja', continent: 'Afrika', flag: '🇳🇬' },
  { name: 'Senegal', capital: 'Dakar', continent: 'Afrika', flag: '🇸🇳' },
  { name: 'Tunisko', capital: 'Tunis', continent: 'Afrika', flag: '🇹🇳' },

  // Oceánie
  { name: 'Austrálie', capital: 'Canberra', continent: 'Oceánie', flag: '🇦🇺' },
  { name: 'Nový Zéland', capital: 'Wellington', continent: 'Oceánie', flag: '🇳🇿' },
  { name: 'Fidži', capital: 'Suva', continent: 'Oceánie', flag: '🇫🇯' },
];

export const CapitalCitiesTool = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'quiz'>('list');
  const [search, setSearch] = useState('');
  const [continentFilter, setContinentFilter] = useState('Vše');
  
  // Quiz State
  const [quizState, setQuizState] = useState<{
    currentQuestion: Country | null;
    options: string[];
    score: number;
    total: number;
    streak: number;
    lastAnswer: { correct: boolean; capital: string } | null;
    topScores: (number | null)[];
  }>({
    currentQuestion: null,
    options: [],
    score: 0,
    total: 0,
    streak: 0,
    lastAnswer: null,
    topScores: JSON.parse(localStorage.getItem('scrollo_capitals_top_scores') || '[null, null, null]'),
  });

  const continents = ['Vše', 'Evropa', 'Amerika', 'Asie', 'Afrika', 'Oceánie'];

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.capital.toLowerCase().includes(search.toLowerCase());
      const matchContinent = continentFilter === 'Vše' || c.continent === continentFilter;
      return matchSearch && matchContinent;
    }).sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  }, [search, continentFilter]);

  const generateQuestion = () => {
    const randomCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    const otherCapitals = COUNTRIES
      .filter(c => c.capital !== randomCountry.capital)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(c => c.capital);
    
    const options = [...otherCapitals, randomCountry.capital].sort(() => 0.5 - Math.random());
    
    setQuizState(prev => ({
      ...prev,
      currentQuestion: randomCountry,
      options,
    }));
  };

  useEffect(() => {
    if (activeTab === 'quiz' && !quizState.currentQuestion) {
      generateQuestion();
    }
  }, [activeTab]);

  // Finální zápis do žebříčku - volá se jen při konci série (chyba nebo reset)
  const recordFinalStreak = (finalStreak: number) => {
    if (finalStreak <= 0) return;

    setQuizState(prev => {
      const currentScores = prev.topScores.filter((s): s is number => s !== null);
      
      // Přidáme výsledek z PRÁVĚ UKONČENÉHO běhu
      const newScores = [...currentScores, finalStreak].sort((a, b) => b - a).slice(0, 3);
      
      // Doplnění prázdných slotů
      const paddedScores = [...newScores];
      while (paddedScores.length < 3) paddedScores.push(null);
      
      localStorage.setItem('scrollo_capitals_top_scores', JSON.stringify(paddedScores));
      return { ...prev, topScores: paddedScores };
    });
  };

  const handleAnswer = (selectedCapital: string) => {
    if (!quizState.currentQuestion) return;
    
    const isCorrect = selectedCapital === quizState.currentQuestion.capital;
    
    if (isCorrect) {
      // Pokračujeme v sérii
      setQuizState(prev => ({
        ...prev,
        score: prev.score + 1,
        total: prev.total + 1,
        streak: prev.streak + 1,
        lastAnswer: { correct: true, capital: prev.currentQuestion!.capital }
      }));
    } else {
      // CHYBA - Konec závodu. Zapíšeme dosažený streak do žebříčku.
      recordFinalStreak(quizState.streak);
      
      setQuizState(prev => ({
        ...prev,
        total: prev.total + 1,
        streak: 0, // Reset streaku po chybě
        lastAnswer: { correct: false, capital: prev.currentQuestion!.capital }
      }));
    }

    setTimeout(() => {
      setQuizState(prev => ({ ...prev, lastAnswer: null }));
      generateQuestion();
    }, 1200);
  };

  const resetQuiz = () => {
    // Při ručním resetu také zapíšeme aktuální streak, pokud nějaký je
    recordFinalStreak(quizState.streak);
    
    setQuizState(prev => ({
      ...prev,
      score: 0,
      total: 0,
      streak: 0,
      lastAnswer: null,
    }));
    generateQuestion();
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex justify-center gap-2 p-1 bg-slate-950/50 rounded-xl w-fit mx-auto border border-slate-800">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          <Icons.Map /> Průvodce
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'quiz' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          <Icons.Brain /> Kvíz
        </button>
      </div>

      {activeTab === 'list' && (
        <div className="animate-fade-in space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <input 
                type="text"
                placeholder="Hledat stát nebo město..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <select
              value={continentFilter}
              onChange={e => setContinentFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
            >
              {continents.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-950/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-800">
                     <th className="px-2 sm:px-6 py-4">Vlajka</th>
                     <th className="px-2 sm:px-6 py-4">Stát</th>
                     <th className="px-2 sm:px-6 py-4">Hlavní město</th>
                     <th className="px-2 sm:px-6 py-4 hidden sm:table-cell">Kontinent</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800">
                   {filteredCountries.map((c, i) => (
                     <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                       <td className="px-2 sm:px-6 py-3 sm:py-4 text-xl sm:text-2xl">{c.flag}</td>
                       <td className="px-2 sm:px-6 py-3 sm:py-4 font-bold text-white group-hover:text-indigo-400 text-[11px] sm:text-sm">{c.name}</td>
                       <td className="px-2 sm:px-6 py-3 sm:py-4 text-slate-300 text-[11px] sm:text-sm">{c.capital}</td>
                       <td className="px-2 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                         <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                           c.continent === 'Evropa' ? 'bg-blue-900/30 text-blue-400' :
                           c.continent === 'Asie' ? 'bg-yellow-900/30 text-yellow-400' :
                           c.continent === 'Amerika' ? 'bg-red-900/30 text-red-400' :
                           c.continent === 'Afrika' ? 'bg-emerald-900/30 text-emerald-400' :
                           'bg-purple-900/30 text-purple-400'
                         }`}>
                           {c.continent}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             {filteredCountries.length === 0 && (
               <div className="text-center py-12 text-slate-500">
                 Nebyly nalezeny žádné státy odpovídající hledání.
               </div>
             )}
          </div>
        </div>
      )}

      {activeTab === 'quiz' && quizState.currentQuestion && (
        <div className="animate-fade-in max-w-2xl mx-auto space-y-8">
           
           {/* Records and Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Actual Score & Streak */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Celkem správně</div>
                  <div className="text-2xl font-black text-white">{quizState.score} <span className="text-xs text-slate-600 font-normal">z {quizState.total}</span></div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Aktuální série</div>
                  <div className="flex items-center gap-1">
                    <span className={`text-2xl font-black transition-colors ${quizState.streak > 0 ? 'text-orange-500' : 'text-slate-800'}`}>{quizState.streak}</span>
                    <span className={quizState.streak > 0 ? 'text-orange-500 animate-pulse' : 'text-slate-800'}>🔥</span>
                  </div>
                </div>
              </div>

              {/* Personal Leaderboard */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                 <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                    <Icons.Star /> Tvoje rekordy (nej delší série)
                 </div>
                 <div className="flex gap-2">
                    {quizState.topScores.map((s, i) => (
                      <div key={i} className={`flex-1 text-center py-1.5 rounded-lg border flex flex-col items-center justify-center transition-all ${
                        s === null ? 'bg-slate-950/20 border-slate-900 text-slate-800' :
                        i === 0 ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 ring-1 ring-indigo-500/20' : 
                        i === 1 ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 
                        'bg-slate-900 border-slate-800 text-slate-500'
                      }`}>
                        <span className="text-[7px] font-black opacity-50">{i + 1}. MÍSTO</span>
                        <span className={`text-sm font-black ${i === 0 && s !== null ? 'scale-110' : ''}`}>
                          {s !== null ? s : '---'}
                        </span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Question Card */}
           <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 space-y-6">
                 <div className="text-7xl sm:text-9xl mb-4 drop-shadow-xl animate-bounce">
                   {quizState.currentQuestion.flag}
                 </div>
                 <div>
                    <h3 className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em] mb-2">Jaké je hlavní město státu</h3>
                    <div className="text-2xl sm:text-5xl font-black text-white px-2 leading-tight">{quizState.currentQuestion.name}?</div>
                 </div>
              </div>
           </div>

           {/* Options */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quizState.options.map((option, i) => {
                const isCorrectAnswer = option === quizState.currentQuestion?.capital;
                const showFeedback = quizState.lastAnswer !== null;
                
                return (
                  <button
                    key={i}
                    disabled={showFeedback}
                    onClick={() => handleAnswer(option)}
                    className={`p-4 sm:p-5 rounded-2xl border-2 font-bold text-base sm:text-lg transition-all duration-200 transform hover:-translate-y-1 ${
                      !showFeedback 
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-indigo-500 hover:text-white hover:shadow-lg hover:shadow-indigo-500/20' 
                        : isCorrectAnswer 
                          ? 'bg-green-500/20 border-green-500 text-green-400 scale-105 shadow-lg shadow-green-500/20'
                          : quizState.lastAnswer?.capital === option 
                            ? 'bg-red-500/20 border-red-500 text-red-400 opacity-50'
                            : 'bg-slate-900 border-slate-800 text-slate-600 opacity-50'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
           </div>

           <div className="flex justify-center pt-4">
              <Button onClick={resetQuiz} variant="ghost" className="text-slate-500 hover:text-red-400 text-xs sm:text-sm">
                <Icons.RotateCcw /> Resetovat session
              </Button>
           </div>
        </div>
      )}

      <div className="bg-slate-900/30 border border-slate-800 p-4 sm:p-6 rounded-2xl text-slate-500 text-[11px] sm:text-sm leading-relaxed text-center">
         💡 Tip: Tvůj výsledek se do žebříčku zapíše až v momentě, kdy uděláš chybu. Snaž se udržet oheň co nejdéle!
      </div>
    </div>
  );
};
