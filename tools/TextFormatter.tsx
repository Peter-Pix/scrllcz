import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { Button, useCopyFeedback } from '../components/Shared';

export const TextFormatterTool = () => {
  const [text, setText] = useState('');
  const { copied, copy } = useCopyFeedback();

  const actions = [
    { label: 'VELKÁ PÍSMENA', fn: () => setText(text.toUpperCase()) },
    { label: 'malá písmena', fn: () => setText(text.toLowerCase()) },
    { label: 'Odstranit mezery navíc', fn: () => setText(text.replace(/\s+/g, ' ').trim()) },
    { label: 'Řádky na čárky', fn: () => setText(text.split('\n').filter(l => l.trim()).join(', ')) },
    { label: 'Odstranit diakritiku', fn: () => setText(text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")) },
    { label: 'Base64 Encode', fn: () => setText(btoa(text)) },
    { label: 'Vyčistit', fn: () => setText('') },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Vložte text sem..."
          className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-mono min-h-[300px]"
        />
        <div className="flex justify-between text-slate-500 text-sm px-2">
           <span>Znaků: {text.length}</span>
           <span>Slov: {text.trim() ? text.trim().split(/\s+/).length : 0}</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 overflow-y-auto">
        <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Akce</div>
        {actions.map((action, i) => (
          <Button 
            key={i} 
            variant="secondary" 
            onClick={action.fn}
            className="w-full justify-start text-left"
          >
            {action.label}
          </Button>
        ))}
        <Button 
            variant="primary"
            onClick={() => copy(text)}
            className={`mt-4 w-full transition-all ${copied ? 'bg-green-600 hover:bg-green-500' : ''}`}
            disabled={!text}
        >
            {copied ? <><Icons.Check /> Zkopírováno!</> : <><Icons.Copy /> Zkopírovat výsledek</>}
        </Button>
      </div>
    </div>
  );
};