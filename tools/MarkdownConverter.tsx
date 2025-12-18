
import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../components/Icons';
import { Button, useCopyFeedback } from '../components/Shared';

const DEFAULT_CONTENT = `# Vítejte v Scrollo konvertoru

Tento nástroj vám pomůže s:
- Převodem **Markdown** do **HTML**
- Vyčištěním textu na *prostý text*
- Generováním syntaxe z HTML

[Odkaz na Scrollo](https://scrollo.cz)`;

export const MarkdownConverterTool = () => {
  const [markdown, setMarkdown] = useState(DEFAULT_CONTENT);
  const [html, setHtml] = useState('');
  const [plainText, setPlainText] = useState('');
  
  const { copied: copiedMd, copy: copyMd } = useCopyFeedback();
  const { copied: copiedHtml, copy: copyHtml } = useCopyFeedback();
  const { copied: copiedText, copy: copyText } = useCopyFeedback();

  // MD -> HTML Converter
  const convertMdToHtml = (md: string): string => {
    let result = md;
    
    // Nadpisy
    result = result.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    result = result.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    result = result.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    
    // Tučné a Kurzíva
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Odkazy
    result = result.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    
    // Seznamy (zjednodušené)
    result = result.replace(/^\- (.*$)/gim, '<li>$1</li>');

    // Odstavce
    result = result.split('\n\n').map(p => {
       if (p.startsWith('<h') || p.startsWith('<li>')) return p;
       return `<p>${p}</p>`;
    }).join('\n\n');

    return result;
  };

  // HTML -> MD Converter
  const convertHtmlToMd = (h: string): string => {
    let result = h;
    result = result.replace(/<h1>(.*?)<\/h1>/gi, '# $1');
    result = result.replace(/<h2>(.*?)<\/h2>/gi, '## $1');
    result = result.replace(/<h3>(.*?)<\/h3>/gi, '### $1');
    result = result.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
    result = result.replace(/<b>(.*?)<\/b>/gi, '**$1**');
    result = result.replace(/<em>(.*?)<\/em>/gi, '*$1*');
    result = result.replace(/<i>(.*?)<\/i>/gi, '*$1*');
    result = result.replace(/<a href="(.*?)">(.*?)<\/a>/gi, '[$2]($1)');
    result = result.replace(/<li>(.*?)<\/li>/gi, '- $1');
    result = result.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
    result = result.replace(/<br\s*\/?>/gi, '\n');
    return result.trim();
  };

  // HTML -> Plain Text
  const convertHtmlToText = (h: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = h;
    return temp.textContent || temp.innerText || "";
  };

  // Sync Logic
  const handleMdChange = (val: string) => {
    setMarkdown(val);
    const convertedHtml = convertMdToHtml(val);
    setHtml(convertedHtml);
    setPlainText(convertHtmlToText(convertedHtml));
  };

  const handleHtmlChange = (val: string) => {
    setHtml(val);
    setMarkdown(convertHtmlToMd(val));
    setPlainText(convertHtmlToText(val));
  };

  const handleTextChange = (val: string) => {
    setPlainText(val);
    setMarkdown(val);
    setHtml(`<p>${val.replace(/\n/g, '<br>')}</p>`);
  };

  // Initial Sync
  useEffect(() => {
    handleMdChange(DEFAULT_CONTENT);
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Markdown Pane */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
             <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500">Markdown</label>
             <button 
               onClick={() => copyMd(markdown)} 
               className={`text-[9px] sm:text-[10px] font-bold uppercase transition-all px-2 py-1 rounded ${copiedMd ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
             >
               {copiedMd ? 'Zkopírováno!' : 'Kopírovat'}
             </button>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => handleMdChange(e.target.value)}
            className="w-full h-[200px] sm:h-[400px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 resize-none custom-scrollbar transition-colors"
            placeholder="Vložte Markdown..."
          />
        </div>

        {/* HTML Pane */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
             <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500">HTML Kód</label>
             <button 
               onClick={() => copyHtml(html)} 
               className={`text-[9px] sm:text-[10px] font-bold uppercase transition-all px-2 py-1 rounded ${copiedHtml ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
             >
               {copiedHtml ? 'Zkopírováno!' : 'Kopírovat'}
             </button>
          </div>
          <textarea
            value={html}
            onChange={(e) => handleHtmlChange(e.target.value)}
            className="w-full h-[200px] sm:h-[400px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-indigo-300 font-mono text-sm focus:outline-none focus:border-indigo-500 resize-none custom-scrollbar transition-colors"
            placeholder="Vložte HTML..."
          />
        </div>

        {/* Plain Text Pane */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
             <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500">Čistý Text</label>
             <button 
               onClick={() => copyText(plainText)} 
               className={`text-[9px] sm:text-[10px] font-bold uppercase transition-all px-2 py-1 rounded ${copiedText ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
             >
               {copiedText ? 'Zkopírováno!' : 'Kopírovat'}
             </button>
          </div>
          <textarea
            value={plainText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full h-[200px] sm:h-[400px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 font-sans text-sm focus:outline-none focus:border-indigo-500 resize-none custom-scrollbar transition-colors"
            placeholder="Vložte čistý text..."
          />
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-4 sm:p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
         <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <Icons.Code />
         </div>
         <div className="flex-1 text-center sm:text-left">
            <h4 className="text-white font-bold text-sm sm:text-base">Tip pro vývojáře</h4>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mt-1">
              Potřebujete rychle převést článek z redakčního systému do Markdownu pro GitHub? Stačí vložit HTML do prostředního pole.
            </p>
         </div>
         <div className="w-full sm:w-auto">
            <Button variant="secondary" onClick={() => handleMdChange('')} className="text-[10px] sm:text-xs w-full sm:w-auto py-2">
              <Icons.Trash /> Vymazat vše
            </Button>
         </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};
