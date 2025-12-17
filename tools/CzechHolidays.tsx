
import React, { useState, useMemo } from 'react';
import { Icons } from '../components/Icons';

interface Holiday {
  date: Date;
  name: string;
  id: string;
}

const getEaster = (year: number) => {
  const f = Math.floor,
    G = year % 19,
    C = f(year / 100),
    H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
    I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
    J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
    L = I - J,
    month = 3 + f((L + 40) / 44),
    day = L + 28 - 31 * f(month / 4);

  return new Date(year, month - 1, day);
};

const getHolidays = (year: number): Holiday[] => {
  const easterMonday = getEaster(year);
  easterMonday.setDate(easterMonday.getDate() + 1);
  
  const goodFriday = getEaster(year);
  goodFriday.setDate(goodFriday.getDate() - 2);

  const holidays = [
    { date: new Date(year, 0, 1), name: 'Nový rok; Den obnovy samostatného českého státu', id: 'new-year' },
    { date: goodFriday, name: 'Velký pátek', id: 'good-friday' },
    { date: easterMonday, name: 'Velikonoční pondělí', id: 'easter-monday' },
    { date: new Date(year, 4, 1), name: 'Svátek práce', id: 'labor-day' },
    { date: new Date(year, 4, 8), name: 'Den vítězství', id: 'victory-day' },
    { date: new Date(year, 6, 5), name: 'Den slovanských věrozvěstů Cyrila a Metoděje', id: 'cyril-methodius' },
    { date: new Date(year, 6, 6), name: 'Den upálení mistra Jana Husa', id: 'jan-hus' },
    { date: new Date(year, 8, 28), name: 'Den české státnosti', id: 'statehood' },
    { date: new Date(year, 9, 28), name: 'Den vzniku samostatného československého státu', id: 'independence' },
    { date: new Date(year, 10, 17), name: 'Den boje za svobodu a demokracii', id: 'democracy' },
    { date: new Date(year, 11, 24), name: 'Štědrý den', id: 'christmas-eve' },
    { date: new Date(year, 11, 25), name: '1. svátek vánoční', id: 'christmas-1' },
    { date: new Date(year, 11, 26), name: '2. svátek vánoční', id: 'christmas-2' },
  ];

  return holidays.sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const CzechHolidaysTool = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const holidays = useMemo(() => getHolidays(year), [year]);
  const now = new Date();

  const stats = useMemo(() => {
    const weekendHolidays = holidays.filter(h => h.date.getDay() === 0 || h.date.getDay() === 6).length;
    const weekdayHolidays = holidays.length - weekendHolidays;
    
    // Find next holiday that is a weekday
    const futureHolidays = holidays
      .filter(h => h.date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
      .filter(h => h.date.getDay() !== 0 && h.date.getDay() !== 6);
    
    const nextHoliday = futureHolidays.length > 0 ? futureHolidays[0] : null;
    let daysToNext = null;
    if (nextHoliday) {
      const diffTime = nextHoliday.date.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      daysToNext = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return { weekendHolidays, weekdayHolidays, nextHoliday, daysToNext };
  }, [holidays]);

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('cs-CZ', { weekday: 'long' });
  };

  return (
    <div className="space-y-8">
      {/* Year Selector */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Icons.Calendar /> Kalendář svátků
        </h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setYear(year - 1)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <Icons.ArrowLeft />
          </button>
          <span className="text-xl font-black text-indigo-400 w-16 text-center">{year}</span>
          <button 
            onClick={() => setYear(year + 1)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <div className="rotate-180"><Icons.ArrowLeft /></div>
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-indigo-100 text-xs font-bold uppercase mb-1 opacity-80">Další volno za</div>
            <div className="text-4xl font-black mb-1">
              {stats.daysToNext !== null ? `${stats.daysToNext} dní` : 'Letos už nic'}
            </div>
            <div className="text-sm text-indigo-100/70 truncate">
              {stats.nextHoliday ? stats.nextHoliday.name : 'Všechny pracovní svátky vyčerpány'}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1">Pracovní volno</div>
          <div className="text-3xl font-black text-white">{stats.weekdayHolidays} dní</div>
          <div className="text-xs text-slate-500 mt-1">Celkem {holidays.length} svátků v roce</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1">Víkendové (ztracené)</div>
          <div className="text-3xl font-black text-rose-400">{stats.weekendHolidays} dny</div>
          <div className="text-xs text-slate-500 mt-1">Tyto svátky připadají na So/Ne</div>
        </div>
      </div>

      {/* Holidays List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {holidays.map((h) => {
          const isWeekend = h.date.getDay() === 0 || h.date.getDay() === 6;
          const isPast = h.date < new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          return (
            <div 
              key={h.id} 
              className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-full ${
                isPast ? 'bg-slate-900/40 border-slate-800 opacity-60 grayscale' : 
                isWeekend ? 'bg-slate-900 border-rose-900/30 ring-1 ring-rose-500/10' : 
                'bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:-translate-y-1 shadow-lg'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <span className={`text-2xl font-black ${isWeekend ? 'text-rose-400' : 'text-white'}`}>
                      {h.date.getDate()}. {h.date.getMonth() + 1}.
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      {getDayName(h.date)}
                    </span>
                  </div>
                  {isWeekend ? (
                    <span className="bg-rose-900/20 text-rose-400 text-[10px] font-bold px-2 py-1 rounded-full border border-rose-500/20">VÍKEND</span>
                  ) : (
                    <span className="bg-emerald-900/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-500/20">VOLNO</span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-200 leading-snug line-clamp-2">{h.name}</h4>
              </div>
              
              {!isPast && !isWeekend && (
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Stav</span>
                  <span className="text-xs text-indigo-400 font-bold">Nadcházející</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-blue-900/10 border border-blue-500/10 p-4 rounded-xl text-blue-300 text-xs text-center">
        💡 Tip: Nejvíce pracovního volna získáte v roce, kdy svátky vychází na úterý nebo čtvrtek – ideální čas na prodloužené víkendy!
      </div>
    </div>
  );
};
