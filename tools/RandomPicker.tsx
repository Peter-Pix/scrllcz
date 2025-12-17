import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { Button, useCopyFeedback } from '../components/Shared';

type Mode = 'list' | 'numbers';

export const RandomPickerTool = () => {
  const [mode, setMode] = useState<Mode>('list');
  
  // List Mode State
  const [listInput, setListInput] = useState('Petr\nJana\nPavel\nLucie\nMartin');
  const [listCount, setListCount] = useState(1);
  const [listUnique, setListUnique] = useState(true);
  
  // Number Mode State
  const [numMin, setNumMin] = useState(1);
  const [numMax, setNumMax] = useState(100);
  const [numCount, setNumCount] = useState(1);
  const [numType, setNumType] = useState<'integer' | 'decimal'>('integer');
  const [numUnique, setNumUnique] = useState(false);

  // Result State
  const [result, setResult] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationValue, setAnimationValue] = useState<string>('?');
  
  const { copied, copy } = useCopyFeedback();

  const handleDrawList = () => {
    const items = listInput.split(/[\n,]+/).map(s => s.trim()).filter(s => s !== '');
    if (items.length === 0) return;

    setIsAnimating(true);
    setResult([]);

    let iterations = 0;
    const interval = setInterval(() => {
      setAnimationValue(items[Math.floor(Math.random() * items.length)]);
      iterations++;
      if (iterations > 15) {
        clearInterval(interval);
        finalizeListDraw(items);
      }
    }, 100);
  };

  const finalizeListDraw = (items: string[]) => {
    let finalSelection: string[] = [];
    if (listUnique) {
      const shuffled = [...items].sort(() => 0.5 - Math.random());
      finalSelection = shuffled.slice(0, Math.min(listCount, items.length));
    } else {
      for (let i = 0; i < listCount; i++) {
        finalSelection.push(items[Math.floor(Math.random() * items.length)]);
      }
    }
    setResult(finalSelection);
    setIsAnimating(false);
  };

  const handleDrawNumbers = () => {
    setIsAnimating(true);
    setResult([]);

    let iterations = 0;
    const interval = setInterval(() => {
      setAnimationValue(getRandomNumber().toString());
      iterations++;
      if (iterations > 15) {
        clearInterval(interval);
        finalizeNumberDraw();
      }
    }, 100);
  };

  const getRandomNumber = () => {
    if (numType === 'integer') {
      return Math.floor(Math.random() * (numMax - numMin + 1)) + numMin;
    } else {
      return (Math.random() * (numMax - numMin) + numMin).toFixed(2);
    }
  };

  const finalizeNumberDraw = () => {
    const finalSelection: string[] = [];
    
    if (numUnique && numType === 'integer') {
      const possibleValues = [];
      for (let i = numMin; i <= numMax; i++) possibleValues.push(i);
      
      if (possibleValues.length <= numCount) {
        // Just return everything if request > range
        setResult(possibleValues.map(String));
        setIsAnimating(false);
        return;
      }

      const shuffled = possibleValues.sort(() => 0.5 - Math.random());
      setResult(shuffled.slice(0, numCount).map(String));
    } else {
      // Duplicates allowed or Decimals (uniqueness hard to guarantee/irrelevant for floats)
      for (let i = 0; i < numCount; i++) {
        finalSelection.push(getRandomNumber().toString());
      }
      setResult(finalSelection);
    }
    
    setIsAnimating(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Configuration Column */}
      <div className="lg:col-span-1 space-y-6">
        {/* Mode Switch */}
        <div className="bg-slate-950/50 p-1 rounded-xl border border-slate-800 flex">
          <button 
            onClick={() => { setMode('list'); setResult([]); }}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'list' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Seznam
          </button>
          <button 
            onClick={() => { setMode('numbers'); setResult([]); }}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'numbers' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Čísla
          </button>
        </div>

        {mode === 'list' ? (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4 animate-fade-in">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Položky (na řádek nebo oddělené čárkou)</label>
              <textarea 
                value={listInput}
                onChange={(e) => setListInput(e.target.value)}
                className="w-full h-40 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 text-sm"
                placeholder="Jana, Petr, Pavel..."
              />
              <div className="text-right text-xs text-slate-500 mt-1">
                {listInput.split(/[\n,]+/).filter(s => s.trim()).length} položek
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Počet výherců</label>
                <input 
                  type="number" 
                  min="1"
                  value={listCount}
                  onChange={(e) => setListCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer mt-4">
                  <input 
                    type="checkbox" 
                    checked={listUnique} 
                    onChange={(e) => setListUnique(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 accent-indigo-500"
                  />
                  <span className="text-sm text-slate-300">Bez opakování</span>
                </label>
              </div>
            </div>

            <Button onClick={handleDrawList} disabled={isAnimating} className="w-full py-3 mt-2">
              <Icons.Dice /> {isAnimating ? 'Losuji...' : 'Losovat'}
            </Button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Min</label>
                <input 
                  type="number" 
                  value={numMin}
                  onChange={(e) => setNumMin(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Max</label>
                <input 
                  type="number" 
                  value={numMax}
                  onChange={(e) => setNumMax(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
               <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Typ čísel</label>
               <select 
                 value={numType} 
                 onChange={(e) => setNumType(e.target.value as any)}
                 className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
               >
                 <option value="integer">Celá čísla (1, 5, 10)</option>
                 <option value="decimal">Desetinná (1.50, 3.14)</option>
               </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Počet čísel</label>
                <input 
                  type="number" 
                  min="1"
                  value={numCount}
                  onChange={(e) => setNumCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              {numType === 'integer' && (
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input 
                      type="checkbox" 
                      checked={numUnique} 
                      onChange={(e) => setNumUnique(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 accent-indigo-500"
                    />
                    <span className="text-sm text-slate-300">Unikátní</span>
                  </label>
                </div>
              )}
            </div>

            <Button onClick={handleDrawNumbers} disabled={isAnimating} className="w-full py-3 mt-2">
              <Icons.Dice /> {isAnimating ? 'Generuji...' : 'Generovat'}
            </Button>
          </div>
        )}
      </div>

      {/* Results Column */}
      <div className="lg:col-span-2 flex flex-col items-center justify-center min-h-[300px] bg-slate-950/30 border border-slate-800/50 rounded-xl p-8 relative overflow-hidden">
        
        {isAnimating ? (
          <div className="text-6xl sm:text-8xl font-black text-indigo-500 animate-pulse">
            {animationValue}
          </div>
        ) : result.length > 0 ? (
          <div className="w-full text-center space-y-6 animate-fade-in">
            <h3 className="text-slate-400 uppercase tracking-widest font-bold mb-4">Výsledek losování</h3>
            
            {result.length === 1 ? (
               <div className="text-5xl sm:text-7xl font-black text-white drop-shadow-2xl">
                 {result[0]}
               </div>
            ) : (
               <div className="flex flex-wrap justify-center gap-3">
                 {result.map((item, idx) => (
                   <div key={idx} className="bg-slate-900 border-2 border-indigo-500/50 text-white px-6 py-4 rounded-xl text-2xl font-bold shadow-lg shadow-indigo-900/20">
                     {item}
                   </div>
                 ))}
               </div>
            )}

            <div className="pt-8">
               <Button onClick={() => copy(result.join(', '))} variant="secondary" className="mx-auto">
                 {copied ? <><Icons.Check /> Zkopírováno</> : <><Icons.Copy /> Zkopírovat výsledek</>}
               </Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-500">
            <div className="text-6xl mb-4 opacity-20"><Icons.Dice /></div>
            <p>Nastavte parametry vlevo a spusťte losování</p>
          </div>
        )}
      </div>
    </div>
  );
};