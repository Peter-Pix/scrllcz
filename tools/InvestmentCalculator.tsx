
import React, { useState, useMemo } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

type Frequency = 'daily' | 'weekly' | 'monthly';

interface Preset {
  id: string;
  label: string;
  amount: number;
  freq: Frequency;
  icon: string;
}

const HABIT_PRESETS: Preset[] = [
  { id: 'smoking', label: 'Krabička cigaret', amount: 160, freq: 'daily', icon: '🚬' },
  { id: 'beer', label: 'Jedno pivo', amount: 60, freq: 'daily', icon: '🍺' },
  { id: 'coffee', label: 'Káva s sebou', amount: 85, freq: 'daily', icon: '☕' },
  { id: 'netflix', label: 'Předplatné TV', amount: 350, freq: 'monthly', icon: '📺' },
  { id: 'fastfood', label: 'Jídlo venku', amount: 300, freq: 'weekly', icon: '🍔' },
];

export const InvestmentCalculatorTool = () => {
  const [initialAmount, setInitialAmount] = useState<number>(0);
  const [amount, setAmount] = useState<number>(100);
  const [frequency, setFrequency] = useState<Frequency>('weekly');
  const [annualReturn, setAnnualReturn] = useState<number>(10); // S&P 500 average is ~10%

  const calculateFutureValue = (years: number) => {
    // Normalize regular contribution to monthly
    let monthlyAmount = amount;
    if (frequency === 'daily') monthlyAmount = amount * 30.42;
    if (frequency === 'weekly') monthlyAmount = amount * 4.33;
    
    const r = annualReturn / 100 / 12; // Monthly rate
    const n = years * 12; // Total months
    
    // 1. Future value of initial lump sum: FV = P * (1 + r)^n
    const fvInitial = initialAmount * Math.pow(1 + r, n);
    
    // 2. Future value of regular contributions: FV = PMT * (((1 + r)^n - 1) / r) * (1 + r)
    // (Assuming contributions at the beginning of the month for motivation)
    const fvRegular = r === 0 ? (monthlyAmount * n) : (monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    
    const total = fvInitial + fvRegular;
    const invested = initialAmount + (monthlyAmount * n);
    const profit = total - invested;
    
    return { 
      total: Math.round(total), 
      invested: Math.round(invested), 
      profit: Math.round(profit) 
    };
  };

  const results = useMemo(() => [
    { label: '1 ROK', ...calculateFutureValue(1) },
    { label: '5 LET', ...calculateFutureValue(5) },
    { label: '10 LET', ...calculateFutureValue(10) },
    { label: '20 LET', ...calculateFutureValue(20) },
  ], [initialAmount, amount, frequency, annualReturn]);

  const applyPreset = (preset: Preset) => {
    setAmount(preset.amount);
    setFrequency(preset.freq);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Input Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-50" />
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form Side */}
          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Icons.Currency /> Nastavení investice
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Počáteční vklad</label>
                  <div className="relative group">
                     <input 
                       type="number"
                       value={initialAmount || ''}
                       onChange={e => setInitialAmount(Math.max(0, parseInt(e.target.value) || 0))}
                       placeholder="0"
                       className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-xl font-bold text-white focus:border-indigo-500 outline-none transition-all hover:border-slate-700"
                     />
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold">Kč</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Pravidelná úspora</label>
                  <div className="relative">
                     <input 
                       type="number"
                       value={amount || ''}
                       onChange={e => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                       className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-xl font-bold text-white focus:border-emerald-500 outline-none transition-all"
                     />
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold">Kč</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Jak často odkládáte?</label>
                <div className="flex bg-slate-950 border border-slate-800 rounded-2xl p-1 h-[60px]">
                   {(['daily', 'weekly', 'monthly'] as Frequency[]).map(f => (
                     <button
                       key={f}
                       onClick={() => setFrequency(f)}
                       className={`flex-1 rounded-xl text-xs font-bold uppercase transition-all ${frequency === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                     >
                       {f === 'daily' ? 'Denně' : f === 'weekly' ? 'Týdně' : 'Měsíčně'}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Roční zhodnocení (%)</label>
                <div className="relative">
                   <input 
                     type="number"
                     value={annualReturn}
                     onChange={e => setAnnualReturn(parseFloat(e.target.value) || 0)}
                     className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-xl font-bold text-emerald-400 focus:border-emerald-500 outline-none transition-all"
                   />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Presets Side */}
          <div className="lg:w-72 space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nápady co omezit</h4>
            <div className="grid grid-cols-1 gap-2">
               {HABIT_PRESETS.map(preset => (
                 <button
                   key={preset.id}
                   onClick={() => applyPreset(preset)}
                   className="bg-slate-950/50 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-slate-300 px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between group"
                 >
                   <div className="flex items-center gap-3">
                     <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{preset.icon}</span>
                     <span className="font-medium">{preset.label}</span>
                   </div>
                   <span className="text-xs font-mono text-slate-500">{preset.amount} Kč</span>
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4">
         {results.map((res, i) => (
           <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[180px]">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full group-hover:bg-emerald-500/10 transition-colors" />
              
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-slate-500 tracking-[0.2em]">{res.label}</span>
                <Icons.TrendingUp />
              </div>

              <div className="my-4">
                <div className="text-3xl font-black text-white tabular-nums leading-tight">
                  {res.total.toLocaleString('cs-CZ')} <span className="text-lg text-slate-500">Kč</span>
                </div>
              </div>
              
              <div className="space-y-1.5 pt-4 border-t border-slate-800/50">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-600 font-bold uppercase">Vložíte:</span>
                    <span className="text-xs text-slate-400 font-mono">{res.invested.toLocaleString('cs-CZ')} Kč</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] text-emerald-500/70 font-black uppercase">Zisk:</span>
                    <span className="text-sm text-emerald-400 font-bold font-mono">+{res.profit.toLocaleString('cs-CZ')} Kč</span>
                 </div>
              </div>
           </div>
         ))}
      </div>

      {/* Motivational Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-emerald-900/10 border border-emerald-500/10 p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-6">
           <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              📈
           </div>
           <div className="flex-1 text-center sm:text-left">
              <h4 className="text-lg font-bold text-white">Složené úročení je 8. div světa</h4>
              <p className="text-emerald-200/60 text-sm leading-relaxed mt-1">
                Když investujete pravidelně, vaše úroky začnou samy vydělávat další úroky. Po 20 letech tvoří u S&P 500 zisk <strong>více než polovinu</strong> celkové částky.
              </p>
           </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-center text-center sm:text-left">
           <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Důležité info</div>
           <p className="text-xs text-slate-400 leading-relaxed">
             Výpočet počítá s průměrným zhodnocením indexu S&P 500. Hodnota investice může v čase kolísat, ale historicky vždy rostla.
           </p>
        </div>
      </div>
      
      <div className="text-center text-slate-700 text-[9px] uppercase font-black tracking-widest px-4">
        Tento nástroj slouží pouze pro ilustrační účely. Minulé výnosy nezaručují výnosy budoucí.
      </div>
    </div>
  );
};
