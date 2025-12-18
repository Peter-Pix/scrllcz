
import React, { useState, useMemo, useRef } from 'react';
import { Icons } from '../components/Icons';

interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export const TextDiffTool = () => {
  const [text1, setText1] = useState('Byl jednou jeden král a ten měl tři dcery.\nNejstarší se jmenovala Anna.');
  const [text2, setText2] = useState('Byl jednou jeden mocný král a ten měl tři dcery.\nNejstarší se jmenovala Marie.');
  const [activeView, setActiveView] = useState<'side-by-side' | 'inline'>('inline');

  const scrollRef1 = useRef<HTMLTextAreaElement>(null);
  const scrollRef2 = useRef<HTMLTextAreaElement>(null);

  // Robustní LCS (Longest Common Subsequence) algoritmus
  const diffResult = useMemo(() => {
    // Tokenizace na slova a bílé znaky (zachování formátování)
    const tokenize = (str: string) => str.split(/(\s+)/).filter(t => t.length > 0);
    const one = tokenize(text1);
    const mystery = tokenize(text2);

    const n = one.length;
    const m = mystery.length;

    // Matice pro dynamické programování
    const matrix = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (one[i - 1] === mystery[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1] + 1;
        } else {
          matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
        }
      }
    }

    // Rekonstrukce cesty (backtracking)
    const result: DiffPart[] = [];
    let i = n;
    let j = m;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && one[i - 1] === mystery[j - 1]) {
        result.unshift({ value: one[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
        result.unshift({ value: mystery[j - 1], added: true });
        j--;
      } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
        result.unshift({ value: one[i - 1], removed: true });
        i--;
      }
    }

    // Seskupení po sobě jdoucích stejných typů pro čistší render
    const optimized: DiffPart[] = [];
    result.forEach(part => {
      const last = optimized[optimized.length - 1];
      if (last && last.added === part.added && last.removed === part.removed) {
        last.value += part.value;
      } else {
        optimized.push({ ...part });
      }
    });

    return optimized;
  }, [text1, text2]);

  const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>, otherRef: React.RefObject<HTMLTextAreaElement>) => {
    if (otherRef.current) {
      otherRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const stats = useMemo(() => {
    const added = diffResult.filter(p => p.added).length;
    const removed = diffResult.filter(p => p.removed).length;
    return { added, removed };
  }, [diffResult]);

  return (
    <div className="space-y-6">
      {/* Settings & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <div className="flex gap-6">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Změny</span>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                  <span className="text-sm font-bold text-emerald-400">{stats.added} přidání</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
                  <span className="text-sm font-bold text-rose-400">{stats.removed} smazání</span>
                </div>
              </div>
           </div>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
           <button 
             onClick={() => setActiveView('side-by-side')}
             className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeView === 'side-by-side' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
           >
             Editace
           </button>
           <button 
             onClick={() => setActiveView('inline')}
             className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeView === 'inline' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
           >
             Porovnání
           </button>
        </div>
      </div>

      {activeView === 'side-by-side' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
           <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Původní verze</label>
                <span className="text-[10px] font-mono text-slate-700">{text1.length} znaků</span>
              </div>
              <textarea
                ref={scrollRef1}
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                onScroll={(e) => syncScroll(e, scrollRef2)}
                className="w-full h-80 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-slate-300 font-mono text-sm focus:border-indigo-500 outline-none resize-none transition-all shadow-inner leading-relaxed"
                placeholder="Vložte původní text..."
              />
           </div>
           <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nová verze</label>
                <span className="text-[10px] font-mono text-slate-700">{text2.length} znaků</span>
              </div>
              <textarea
                ref={scrollRef2}
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                onScroll={(e) => syncScroll(e, scrollRef1)}
                className="w-full h-80 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-slate-300 font-mono text-sm focus:border-indigo-500 outline-none resize-none transition-all shadow-inner leading-relaxed"
                placeholder="Vložte novou verzi..."
              />
           </div>
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 min-h-[320px] animate-fade-in shadow-2xl ring-1 ring-white/5 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
           <div className="relative z-10 text-slate-200 font-mono text-base leading-relaxed whitespace-pre-wrap">
              {diffResult.map((part, i) => (
                <span 
                  key={i} 
                  className={`
                    transition-all duration-500 rounded px-0.5 inline
                    ${part.added ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-500/40 font-bold mx-0.5' : ''}
                    ${part.removed ? 'bg-rose-500/20 text-rose-400 border-b-2 border-rose-500/40 line-through opacity-60 mx-0.5' : ''}
                  `}
                >
                  {part.value}
                </span>
              ))}
           </div>
           {text1 === text2 && (
             <div className="flex flex-col items-center justify-center py-20 text-slate-600 animate-fade-in">
               <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20">
                 <Icons.Check />
               </div>
               <p className="text-sm font-bold uppercase tracking-widest">Texty jsou identické</p>
             </div>
           )}
        </div>
      )}

      <div className="bg-indigo-900/10 border border-indigo-500/10 p-6 rounded-3xl text-center">
         <p className="text-indigo-200/70 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
           💡 <strong>Tip:</strong> Tento nástroj používá algoritmus LCS, který inteligentně vyhledává shody. Je ideální pro kontrolu změn ve smlouvách, revizi článků nebo porovnávání verzí kódu.
         </p>
      </div>
    </div>
  );
};
