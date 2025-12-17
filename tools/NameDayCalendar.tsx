import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

interface NameDayResult {
  date: string;
  name: string;
}

const getMonthName = (month: string) => {
  const months: Record<string, string> = {
    '01': 'ledna', '02': 'února', '03': 'března', '04': 'dubna',
    '05': 'května', '06': 'června', '07': 'července', '08': 'srpna',
    '09': 'září', '10': 'října', '11': 'listopadu', '12': 'prosince'
  };
  return months[month] || '';
};

const formatDate = (dateStr: string) => {
  const day = dateStr.substring(0, 2);
  const month = dateStr.substring(2, 4);
  return `${parseInt(day)}. ${getMonthName(month)}`;
};

export const NameDayCalendarTool = () => {
  const [currentLang, setCurrentLang] = useState<'cs' | 'sk'>('cs');
  const [todayName, setTodayName] = useState<string>('...');
  const [todayDate, setTodayDate] = useState<string>('...');
  
  const [searchType, setSearchType] = useState<'name' | 'date'>('name');
  const [nameInput, setNameInput] = useState('');
  const [dayInput, setDayInput] = useState('');
  const [monthInput, setMonthInput] = useState('');
  
  const [results, setResults] = useState<NameDayResult[]>([]);
  const [resultsTitle, setResultsTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToday = async () => {
    try {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const date = day + month;

      const response = await fetch(`https://svatky.adresa.info/json?date=${date}&lang=${currentLang}`);
      const data = await response.json();

      if (data && data.length > 0) {
        setTodayName(data.map((item: any) => item.name).join(', '));
        setTodayDate(formatDate(data[0].date));
      }
    } catch (err) {
      console.error(err);
      setTodayName('Chyba načítání');
    }
  };

  useEffect(() => {
    fetchToday();
  }, [currentLang]);

  const searchByName = async () => {
    if (!nameInput.trim()) {
      setError('Zadejte prosím jméno');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://svatky.adresa.info/json?name=${encodeURIComponent(nameInput)}&lang=${currentLang}`);
      const data = await response.json();
      setResults(data);
      setResultsTitle(`Výsledky pro: "${nameInput}"`);
    } catch (err) {
      setError('Chyba při vyhledávání.');
    } finally {
      setLoading(false);
    }
  };

  const searchByDate = async () => {
    if (!dayInput || !monthInput) {
      setError('Vyberte den i měsíc');
      return;
    }
    const day = parseInt(dayInput);
    if (day < 1 || day > 31) {
      setError('Neplatný den');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const dateCode = String(dayInput).padStart(2, '0') + monthInput;
      const response = await fetch(`https://svatky.adresa.info/json?date=${dateCode}&lang=${currentLang}`);
      const data = await response.json();
      setResults(data);
      setResultsTitle(`Svátek ${dayInput}. ${getMonthName(monthInput)}`);
    } catch (err) {
      setError('Chyba při vyhledávání.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Today & Settings */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Today Card */}
        <div className="bg-gradient-to-br from-pink-600 to-rose-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
           <div className="relative z-10 text-center">
             <h2 className="text-xl font-bold mb-2 opacity-90">Dnes slaví</h2>
             <div className="text-4xl font-extrabold mb-3 tracking-tight">{todayName}</div>
             <div className="text-pink-100 font-medium">{todayDate}</div>
           </div>
        </div>

        {/* Language Switch */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
           <label className="block text-slate-400 text-xs font-bold uppercase mb-3">Kalendář</label>
           <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
              <button 
                onClick={() => setCurrentLang('cs')}
                className={`flex-1 py-2 rounded text-sm font-medium transition-all ${currentLang === 'cs' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-white'}`}
              >
                🇨🇿 Čeština
              </button>
              <button 
                onClick={() => setCurrentLang('sk')}
                className={`flex-1 py-2 rounded text-sm font-medium transition-all ${currentLang === 'sk' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-white'}`}
              >
                🇸🇰 Slovenština
              </button>
           </div>
        </div>

      </div>

      {/* Right Column: Search */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Search Tabs & Form */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
           <div className="flex gap-4 border-b border-slate-800 mb-6">
              <button 
                onClick={() => { setSearchType('name'); setError(null); setResults([]); setResultsTitle(''); }}
                className={`pb-3 px-1 text-sm font-bold transition-colors relative ${searchType === 'name' ? 'text-pink-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Hledat podle jména
                {searchType === 'name' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-400 rounded-full"></span>}
              </button>
              <button 
                onClick={() => { setSearchType('date'); setError(null); setResults([]); setResultsTitle(''); }}
                className={`pb-3 px-1 text-sm font-bold transition-colors relative ${searchType === 'date' ? 'text-pink-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Hledat podle data
                {searchType === 'date' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-400 rounded-full"></span>}
              </button>
           </div>

           {searchType === 'name' ? (
             <div className="flex gap-2">
               <input 
                 type="text" 
                 value={nameInput}
                 onChange={(e) => setNameInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && searchByName()}
                 placeholder="Zadejte jméno (např. Petr)..."
                 className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:outline-none"
               />
               <Button onClick={searchByName} className="bg-pink-600 hover:bg-pink-500 shadow-pink-900/50">Hledat</Button>
             </div>
           ) : (
             <div className="flex gap-2">
                <input 
                  type="number" 
                  min="1" max="31"
                  value={dayInput}
                  onChange={(e) => setDayInput(e.target.value)}
                  placeholder="Den"
                  className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:outline-none"
                />
                <select 
                  value={monthInput}
                  onChange={(e) => setMonthInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:outline-none appearance-none"
                >
                  <option value="">Vyberte měsíc</option>
                  <option value="01">Leden</option>
                  <option value="02">Únor</option>
                  <option value="03">Březen</option>
                  <option value="04">Duben</option>
                  <option value="05">Květen</option>
                  <option value="06">Červen</option>
                  <option value="07">Červenec</option>
                  <option value="08">Srpen</option>
                  <option value="09">Září</option>
                  <option value="10">Říjen</option>
                  <option value="11">Listopad</option>
                  <option value="12">Prosinec</option>
                </select>
                <Button onClick={searchByDate} className="bg-pink-600 hover:bg-pink-500 shadow-pink-900/50">Hledat</Button>
             </div>
           )}

           {error && <div className="mt-4 text-red-400 text-sm bg-red-900/10 p-3 rounded-lg border border-red-500/20">{error}</div>}
        </div>

        {/* Results */}
        {loading && <div className="text-center py-12 text-slate-500">Vyhledávám...</div>}

        {!loading && results.length > 0 && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-bold text-white text-lg">{resultsTitle}</h3>
                <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">{results.length} výsledků</span>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {results.map((item, idx) => (
                 <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center hover:border-pink-500/30 transition-colors">
                    <span className="font-bold text-white text-lg">{item.name}</span>
                    <span className="text-pink-400 font-mono bg-pink-900/10 px-2 py-1 rounded text-sm border border-pink-500/20">
                      {formatDate(item.date)}
                    </span>
                 </div>
               ))}
             </div>
          </div>
        )}

        {!loading && results.length === 0 && resultsTitle && (
          <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
             Nebyly nalezeny žádné výsledky.
          </div>
        )}
      </div>
    </div>
  );
};