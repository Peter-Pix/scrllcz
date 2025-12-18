
import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '../components/Icons';
import { Button, useCopyFeedback } from '../components/Shared';

export const EmbeddableCountdownTool = () => {
  const [targetDate, setTargetDate] = useState('2025-12-24');
  const [targetTime, setTargetTime] = useState('00:00');
  const [title, setTitle] = useState('Do Vánoc zbývá');
  const [bgColor, setBgColor] = useState('#0f172a');
  const [textColor, setTextColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#6366f1');
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  const { copied, copy } = useCopyFeedback();

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(`${targetDate}T${targetTime}`).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff > 0) {
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((diff % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, targetTime]);

  const embedCode = useMemo(() => {
    const id = `scrollo-timer-${Math.random().toString(36).substr(2, 9)}`;
    const fullTarget = `${targetDate}T${targetTime}`;
    
    return `<!-- Scrollo.cz Countdown Widget -->
<div id="${id}" style="background:${bgColor};color:${textColor};padding:2rem;border-radius:1rem;font-family:sans-serif;text-align:center;max-width:400px;margin:1rem auto;box-shadow:0 10px 25px rgba(0,0,0,0.2)">
  <div style="font-size:0.8rem;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1rem;opacity:0.8">${title}</div>
  <div style="display:flex;justify-content:center;gap:1rem;">
    <div style="flex:1"><div class="val" style="font-size:2rem;font-weight:bold;color:${accentColor}">00</div><div style="font-size:0.6rem;opacity:0.6">Dní</div></div>
    <div style="flex:1"><div class="val" style="font-size:2rem;font-weight:bold;color:${accentColor}">00</div><div style="font-size:0.6rem;opacity:0.6">Hod</div></div>
    <div style="flex:1"><div class="val" style="font-size:2rem;font-weight:bold;color:${accentColor}">00</div><div style="font-size:0.6rem;opacity:0.6">Min</div></div>
    <div style="flex:1"><div class="val" style="font-size:2rem;font-weight:bold;color:${accentColor}">00</div><div style="font-size:0.6rem;opacity:0.6">Sek</div></div>
  </div>
</div>
<script>
(function(){
  const el = document.getElementById('${id}');
  const vals = el.querySelectorAll('.val');
  const target = new Date('${fullTarget}').getTime();
  function update(){
    const now = new Date().getTime();
    const d = target - now;
    if(d <= 0) return;
    const parts = [
      Math.floor(d/(864e5)),
      Math.floor((d%864e5)/36e5),
      Math.floor((d%36e5)/6e4),
      Math.floor((d%6e4)/1e3)
    ];
    parts.forEach((v, i) => { vals[i].innerText = v.toString().padStart(2, '0'); });
  }
  setInterval(update, 1000); update();
})();
</script>`;
  }, [targetDate, targetTime, title, bgColor, textColor, accentColor]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Settings */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Icons.Hourglass /> Nastavení odpočtu
          </h3>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Cíl (Datum a čas)</label>
            <div className="flex gap-2">
              <input 
                type="date" 
                value={targetDate} 
                onChange={e => setTargetDate(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none"
              />
              <input 
                type="time" 
                value={targetTime} 
                onChange={e => setTargetTime(e.target.value)}
                className="w-32 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Text nad odpočtem</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none"
              placeholder="Např. Do konce akce zbývá"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Pozadí</label>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer bg-transparent" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Text</label>
              <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer bg-transparent" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Akcent</label>
              <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer bg-transparent" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
           <h4 className="text-xs font-bold text-slate-500 uppercase px-2">Kód k vložení</h4>
           <div className="relative">
              <textarea 
                readOnly 
                value={embedCode}
                className="w-full h-40 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-[10px] font-mono text-indigo-300 focus:outline-none resize-none"
              />
              <Button 
                onClick={() => copy(embedCode)} 
                className="absolute bottom-4 right-4 text-xs"
                variant={copied ? 'success' : 'primary'}
              >
                {copied ? <Icons.Check /> : <Icons.Copy />} {copied ? 'Zkopírováno' : 'Kopírovat kód'}
              </Button>
           </div>
        </div>
      </div>

      {/* Preview */}
      <div className="flex flex-col items-center justify-center p-8 bg-slate-950/50 rounded-3xl border border-slate-800/50">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-8">Živý náhled widgetu</h4>
        
        <div 
          className="w-full max-w-[350px] p-8 rounded-3xl shadow-2xl transition-all duration-500 text-center"
          style={{ background: bgColor, color: textColor }}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 opacity-70">
            {title}
          </div>
          
          <div className="flex justify-between items-center gap-2">
             {[
               { val: timeLeft.d, label: 'Dní' },
               { val: timeLeft.h, label: 'Hod' },
               { val: timeLeft.m, label: 'Min' },
               { val: timeLeft.s, label: 'Sek' }
             ].map((unit, i) => (
               <React.Fragment key={unit.label}>
                 <div className="flex-1">
                   <div className="text-3xl sm:text-4xl font-black mb-1 tabular-nums" style={{ color: accentColor }}>
                     {unit.val.toString().padStart(2, '0')}
                   </div>
                   <div className="text-[9px] font-bold uppercase opacity-50 tracking-wider">
                     {unit.label}
                   </div>
                 </div>
                 {i < 3 && <div className="text-xl font-bold opacity-20">:</div>}
               </React.Fragment>
             ))}
          </div>
        </div>
        
        <p className="mt-8 text-slate-500 text-xs max-w-[300px] text-center leading-relaxed">
          Tento widget můžete vložit do jakéhokoliv HTML webu, Shoptetu, WordPressu nebo do vlastního podpisu.
        </p>
      </div>
    </div>
  );
};
