import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { Button, useCopyFeedback } from '../components/Shared';

export const PasswordGeneratorTool = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [useSymbols, setUseSymbols] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const { copied, copy } = useCopyFeedback();

  const generate = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const syms = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let validChars = chars;
    if (useNumbers) validChars += nums;
    if (useSymbols) validChars += syms;

    let pass = '';
    for (let i = 0; i < length; i++) {
      pass += validChars.charAt(Math.floor(Math.random() * validChars.length));
    }
    setPassword(pass);
  };

  useEffect(() => {
    generate();
  }, []);

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div 
        onClick={() => copy(password)}
        className="group relative bg-slate-950 border-2 border-slate-800 hover:border-indigo-500 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300"
      >
        <p className="text-2xl sm:text-4xl font-mono text-white break-all tracking-wider font-bold">
          {password}
        </p>
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 transition-colors">
          {copied ? (
             <div className="flex items-center gap-1 text-green-500 font-bold text-sm animate-bounce">
               <Icons.Check /> <span className="hidden sm:inline">Zkopírováno!</span>
             </div>
          ) : (
             <div className="text-slate-500 group-hover:text-indigo-400">
               <Icons.Copy />
             </div>
          )}
        </div>
        <p className="text-slate-600 text-sm mt-4">Klikněte pro zkopírování</p>
      </div>

      <div className="bg-slate-900 p-4 sm:p-6 rounded-xl border border-slate-800 space-y-6">
        <div>
          <label className="flex justify-between text-slate-300 mb-2 font-medium">
            <span>Délka hesla</span>
            <span className="text-indigo-400 font-bold">{length}</span>
          </label>
          <input 
            type="range" 
            min="6" 
            max="64" 
            value={length} 
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <label className="flex items-center gap-3 cursor-pointer group p-2 sm:p-0 rounded hover:bg-slate-800 sm:hover:bg-transparent transition-colors">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${useNumbers ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600 group-hover:border-slate-500'}`}>
              {useNumbers && <Icons.Check />}
            </div>
            <input type="checkbox" checked={useNumbers} onChange={() => setUseNumbers(!useNumbers)} className="hidden" />
            <span className="text-slate-300 group-hover:text-white transition-colors">Čísla (0-9)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group p-2 sm:p-0 rounded hover:bg-slate-800 sm:hover:bg-transparent transition-colors">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${useSymbols ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600 group-hover:border-slate-500'}`}>
              {useSymbols && <Icons.Check />}
            </div>
            <input type="checkbox" checked={useSymbols} onChange={() => setUseSymbols(!useSymbols)} className="hidden" />
            <span className="text-slate-300 group-hover:text-white transition-colors">Symboly (!@#)</span>
          </label>
        </div>

        <Button onClick={generate} className="w-full py-3 sm:py-4 text-lg">
           Vygenerovat nové heslo
        </Button>
      </div>
    </div>
  );
};