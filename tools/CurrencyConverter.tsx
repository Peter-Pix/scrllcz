import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';

interface ExchangeRate {
  code: string;
  name: string;
  rate: number;
  amount: number;
}

export const CurrencyConverterTool = () => {
  const [rates, setRates] = useState<Record<string, ExchangeRate>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [amount1, setAmount1] = useState<number>(100);
  const [currency1, setCurrency1] = useState('CZK');
  const [amount2, setAmount2] = useState<number>(0);
  const [currency2, setCurrency2] = useState('EUR');
  
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');

  useEffect(() => {
    const savedFavs = localStorage.getItem('scrollo_currency_favorites');
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.allorigins.win/raw?url=https://www.cnb.cz/cs/financni_trhy/devizovy_trh/kurzy_devizoveho_trhu/denni_kurz.xml');
      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      
      const newRates: Record<string, ExchangeRate> = {
        CZK: { code: 'CZK', name: 'Česká koruna', rate: 1, amount: 1 }
      };
      
      const rows = xml.querySelectorAll('radek');
      rows.forEach(row => {
        const code = row.getAttribute('kod') || '';
        const name = (row.getAttribute('zeme') || '') + ' - ' + (row.getAttribute('mena') || '');
        const amount = parseFloat(row.getAttribute('mnozstvi') || '1');
        const rateStr = row.getAttribute('kurz') || '0';
        const rate = parseFloat(rateStr.replace(',', '.'));
        
        if (code) {
          newRates[code] = { code, name, rate, amount };
        }
      });
      
      setRates(newRates);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Nepodařilo se načíst kurzy. Zkuste to prosím později.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(rates).length > 0) {
      convert(amount1, currency1, currency2, true);
    }
  }, [rates, currency1, currency2]); 

  const convert = (val: number, from: string, to: string, isForward: boolean) => {
    if (!rates[from] || !rates[to]) return;
    
    const rateFrom = rates[from].rate / rates[from].amount;
    const rateTo = rates[to].rate / rates[to].amount;
    
    const valInCZK = val * rateFrom;
    const result = valInCZK / rateTo;
    
    if (isForward) {
      setAmount2(parseFloat(result.toFixed(2)));
    } else {
      setAmount1(parseFloat(result.toFixed(2)));
    }
  };

  const handleAmount1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    setAmount1(val);
    convert(val, currency1, currency2, true);
  };

  const handleAmount2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    setAmount2(val);
    convert(val, currency2, currency1, false);
  };

  const swap = () => {
    const tempCurr = currency1;
    setCurrency1(currency2);
    setCurrency2(tempCurr);
  };

  const toggleFavorite = (code: string) => {
    let newFavs;
    if (favorites.includes(code)) {
      newFavs = favorites.filter(f => f !== code);
    } else {
      newFavs = [...favorites, code];
    }
    setFavorites(newFavs);
    localStorage.setItem('scrollo_currency_favorites', JSON.stringify(newFavs));
  };

  if (loading) return <div className="text-center p-8 text-slate-400">Načítám kurzy z ČNB...</div>;
  if (error) return <div className="text-center p-8 text-red-400">{error}</div>;

  const displayedCurrencies = (Object.values(rates) as ExchangeRate[])
    .filter(r => filter === 'all' || favorites.includes(r.code))
    .sort((a, b) => a.code.localeCompare(b.code));

  return (
    <div className="space-y-8">
      {/* Calculator Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-500/10 to-fuchsia-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-4 items-center relative z-10">
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Částka</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={amount1} 
                onChange={handleAmount1Change}
                className="flex-1 w-full min-w-0 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-lg focus:border-sky-500 focus:outline-none"
              />
              <select 
                value={currency1} 
                onChange={(e) => setCurrency1(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-bold w-24 focus:border-sky-500 focus:outline-none flex-shrink-0"
              >
                {Object.keys(rates).sort().map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <button onClick={swap} className="p-3 bg-slate-800 rounded-full text-sky-400 hover:bg-slate-700 hover:scale-110 transition-all shadow-lg border border-slate-700 md:mt-6 rotate-90 md:rotate-0">
            <Icons.Currency />
          </button>

          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Výsledek</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={amount2} 
                onChange={handleAmount2Change}
                className="flex-1 w-full min-w-0 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-lg focus:border-fuchsia-500 focus:outline-none"
              />
              <select 
                value={currency2} 
                onChange={(e) => setCurrency2(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-bold w-24 focus:border-fuchsia-500 focus:outline-none flex-shrink-0"
              >
                {Object.keys(rates).sort().map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-6 text-center">
           <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-sky-500/20 to-fuchsia-500/20 border border-white/10 max-w-full break-all">
             <span className="text-sky-300 font-bold">{amount1} {currency1}</span>
             <span className="text-slate-400 mx-2">=</span>
             <span className="text-fuchsia-300 font-bold">{amount2} {currency2}</span>
           </div>
        </div>
      </div>

      {/* Rates List */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="text-xl font-bold text-white">Dostupné měny</h3>
          <div className="flex bg-slate-800 rounded-lg p-1 w-full sm:w-auto">
            <button 
              onClick={() => setFilter('all')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Všechny
            </button>
            <button 
              onClick={() => setFilter('favorites')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'favorites' ? 'bg-gradient-to-r from-sky-600 to-fuchsia-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Oblíbené
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedCurrencies.map(currency => {
            const isFav = favorites.includes(currency.code);
            const ratePerUnit = (currency.rate / currency.amount).toFixed(3);
            
            return (
              <div key={currency.code} className={`p-4 rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg ${isFav ? 'bg-slate-800/80 border-fuchsia-500/30' : 'bg-slate-900 border-slate-800 hover:border-sky-500/30'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-2xl font-bold text-white">{currency.code}</span>
                  <button onClick={() => toggleFavorite(currency.code)} className={`${isFav ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-400'} transition-colors`}>
                    {isFav ? <Icons.Star /> : <Icons.StarOutline />}
                  </button>
                </div>
                <div className="text-xs text-slate-400 mb-3 line-clamp-1" title={currency.name}>{currency.name}</div>
                <div className="text-right">
                  <span className="text-lg font-mono font-medium text-sky-400">{ratePerUnit}</span>
                  <span className="text-xs text-slate-500 ml-1">CZK</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {displayedCurrencies.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            {filter === 'favorites' ? 'Nemáte žádné oblíbené měny.' : 'Žádné měny k zobrazení.'}
          </div>
        )}
      </div>
    </div>
  );
};