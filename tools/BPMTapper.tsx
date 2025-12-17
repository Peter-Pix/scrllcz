
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

export const BPMTapperTool = () => {
  const [bpm, setBpm] = useState<number | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  
  const tapsRef = useRef<number[]>([]);
  const timeoutRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    tapsRef.current = [];
    setTapCount(0);
    setBpm(null);
    setHistory([]);
  }, []);

  const handleTap = useCallback(() => {
    const now = performance.now();
    
    // Auto-reset po 3 sekundách nečinnosti
    if (tapsRef.current.length > 0 && now - tapsRef.current[tapsRef.current.length - 1] > 3000) {
      tapsRef.current = [now];
      setTapCount(1);
      setBpm(null);
      setHistory([]);
    } else {
      tapsRef.current = [...tapsRef.current, now].slice(-13); // Udržujeme max 13 tapů (12 intervalů)
      const currentTaps = tapsRef.current;
      setTapCount(currentTaps.length);

      if (currentTaps.length > 1) {
        const intervals: number[] = [];
        for (let i = 1; i < currentTaps.length; i++) {
          intervals.push(currentTaps[i] - currentTaps[i - 1]);
        }

        // Chytrý výpočet BPM
        // 1. Spočítáme průměrné BPM ze všech intervalů
        let avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
        
        // 2. Filtrace outlierů: Odstraníme intervaly, které se liší o více než 20% od průměru
        const filteredIntervals = intervals.filter(interval => {
          const diff = Math.abs(interval - avgInterval);
          return diff < avgInterval * 0.2;
        });

        // Pokud máme dostatek stabilních dat, použijeme filtrovaná
        const finalInterval = filteredIntervals.length > 0 
          ? filteredIntervals.reduce((a, b) => a + b) / filteredIntervals.length 
          : avgInterval;

        const calculatedBpm = 60000 / finalInterval;
        
        // Zaokrouhlení na celé číslo
        setBpm(Math.round(calculatedBpm));
        setHistory(prev => [Math.round(calculatedBpm), ...prev].slice(0, 5));
      }
    }

    // Vizuální a haptická odezva
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 50);
    
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  }, []);

  // Klávesové ovládání (Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTap]);

  return (
    <div className="max-w-2xl mx-auto space-y-8 select-none">
      <div 
        onClick={handleTap}
        className={`relative h-[400px] rounded-3xl border-4 transition-all duration-75 flex flex-col items-center justify-center cursor-pointer overflow-hidden group ${isFlashing ? 'bg-indigo-500/20 border-indigo-400 scale-[0.98]' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
      >
        {/* Background animation elements */}
        <div className={`absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent transition-opacity duration-300 ${tapCount > 0 ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* BPM Display */}
        <div className="relative z-10 text-center space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">
            {tapCount < 2 ? 'Začněte klepat' : `Změřeno z ${tapCount} úderů`}
          </div>
          
          <div className={`text-[120px] font-black leading-none transition-all duration-200 ${bpm ? 'text-white' : 'text-slate-800'}`}>
            {bpm || '??'}
          </div>
          
          <div className="text-xl font-bold text-indigo-400 tracking-widest uppercase">
            BPM
          </div>
        </div>

        {/* Pulsing prompt */}
        {tapCount === 0 && (
          <div className="absolute bottom-12 flex flex-col items-center gap-2 animate-bounce opacity-50">
            <Icons.Hand />
            <span className="text-xs font-bold uppercase text-slate-400">Klikni nebo stiskni Mezerník</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reset Button */}
        <div className="md:col-span-1">
          <Button 
            onClick={reset} 
            variant="secondary" 
            className="w-full py-6 flex-col gap-2 group"
          >
            <div className="group-hover:rotate-180 transition-transform duration-500">
               <Icons.RotateCcw />
            </div>
            <span>Vynulovat</span>
          </Button>
        </div>

        {/* History / Consistency */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
           <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Poslední hodnoty</span>
              {history.length > 1 && (
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">STABILNÍ</span>
              )}
           </div>
           <div className="flex gap-3">
              {history.length > 0 ? (
                history.map((h, i) => (
                  <div key={i} className={`flex-1 text-center py-2 rounded-lg border font-mono font-bold transition-all ${i === 0 ? 'bg-indigo-600 border-indigo-400 text-white scale-110' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                    {h}
                  </div>
                ))
              ) : (
                <div className="w-full text-center text-slate-600 text-sm italic">
                  Historie měření se zobrazí zde...
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="bg-indigo-900/10 border border-indigo-500/10 p-6 rounded-3xl text-center">
         <p className="text-indigo-200 text-sm leading-relaxed">
           💡 <strong>Pro profesionály:</strong> Nástroj filtruje lidskou chybu. Pokud klepete střídavě např. 119 a 121, algoritmus rozpozná stabilní tempo 120 BPM.
         </p>
      </div>
    </div>
  );
};
