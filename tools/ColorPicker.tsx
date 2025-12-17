import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../components/Icons';
import { Button, useCopyFeedback } from '../components/Shared';

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

const basicColors = [
    '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3',
    '#FF1493', '#00CED1', '#FFD700', '#FF69B4', '#8B4513', '#000000', '#808080', '#FFFFFF'
];
const pastelColors = [
    '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E0BBE4', '#FFDFD3',
    '#FEC8D8', '#D4F1F4', '#F9E79F', '#ABEBC6', '#D7BDE2', '#F8B4B4', '#C5E1A5'
];

const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
};

const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    if (max === min) h = s = 0;
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToRgb = (h: number, s: number, l: number) => {
    s /= 100; l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
};

const getColorName = (r: number, g: number, b: number) => {
    const { h, s, l } = rgbToHsl(r, g, b);
    let intensity = '';
    if (l < 20) intensity = 'velmi tmavá ';
    else if (l < 35) intensity = 'tmavá ';
    else if (l < 45) intensity = '';
    else if (l < 65) intensity = '';
    else if (l < 80) intensity = 'světlá ';
    else if (l < 95) intensity = 'velmi světlá ';
    else return 'bílá';

    let saturation = '';
    if (s < 10) return intensity + 'šedá';
    else if (s < 30) saturation = 'bledá ';
    else if (s < 60) saturation = '';
    else saturation = 'sytá ';

    let hue = '';
    if (h < 15) hue = 'červená';
    else if (h < 30) hue = 'oranžovo-červená';
    else if (h < 45) hue = 'oranžová';
    else if (h < 65) hue = 'žluto-oranžová';
    else if (h < 75) hue = 'žlutá';
    else if (h < 90) hue = 'žluto-zelená';
    else if (h < 150) hue = 'zelená';
    else if (h < 175) hue = 'modrozelená';
    else if (h < 195) hue = 'azurová';
    else if (h < 220) hue = 'nebesky modrá';
    else if (h < 250) hue = 'modrá';
    else if (h < 280) hue = 'fialovo-modrá';
    else if (h < 310) hue = 'fialová';
    else if (h < 330) hue = 'růžovo-fialová';
    else if (h < 345) hue = 'růžová';
    else hue = 'červená';

    return (intensity + saturation + hue).trim();
};

export const ColorPickerTool = () => {
  const [color, setColor] = useState<Color>({ r: 14, g: 165, b: 233, a: 1 });
  const [activeTab, setActiveTab] = useState<'rgb' | 'hex' | 'hsl'>('rgb');
  const [eyedropperActive, setEyedropperActive] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cursorColor, setCursorColor] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [hasImage, setHasImage] = useState(false);
  const { copied, copy } = useCopyFeedback();

  useEffect(() => {
    const saved = localStorage.getItem('scrollo_color_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const saveFavorites = (favs: string[]) => {
    setFavorites(favs);
    localStorage.setItem('scrollo_color_favorites', JSON.stringify(favs));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            // Max width 600px
            const scale = Math.min(1, 600 / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            setHasImage(true);
          }
        };
        img.src = evt.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!eyedropperActive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvasRef.current.getContext('2d');
    const data = ctx?.getImageData(x, y, 1, 1).data;
    if (data) {
      setColor({ r: data[0], g: data[1], b: data[2], a: 1 });
      setEyedropperActive(false);
      setCursorColor(null);
    }
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!eyedropperActive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCursorPos({ x: e.clientX, y: e.clientY });
    
    const ctx = canvasRef.current.getContext('2d');
    const data = ctx?.getImageData(x, y, 1, 1).data;
    if (data) {
      setCursorColor(`rgb(${data[0]}, ${data[1]}, ${data[2]})`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
      {cursorColor && eyedropperActive && (
        <div 
          className="fixed w-16 h-16 rounded-full border-4 border-white shadow-xl pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-slate-900"
          style={{ left: cursorPos.x, top: cursorPos.y, backgroundColor: cursorColor }}
        >
        </div>
      )}

      {/* Left Column: Controls */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
          <div className="flex gap-2 mb-4">
             {['rgb', 'hex', 'hsl'].map((t) => (
               <button
                 key={t}
                 onClick={() => setActiveTab(t as any)}
                 className={`flex-1 py-1.5 rounded-lg text-sm font-bold uppercase transition-all ${activeTab === t ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
               >
                 {t}
               </button>
             ))}
          </div>

          {activeTab === 'rgb' && (
             <div className="space-y-4">
               {['r', 'g', 'b'].map((c) => (
                 <div key={c}>
                   <div className="flex justify-between text-xs text-slate-400 uppercase mb-1">
                     <span>{c}</span>
                     <span>{(color as any)[c]}</span>
                   </div>
                   <input 
                     type="range" min="0" max="255" 
                     value={(color as any)[c]}
                     onChange={(e) => setColor({...color, [c]: parseInt(e.target.value)})}
                     className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                   />
                 </div>
               ))}
             </div>
          )}

          {activeTab === 'hex' && (
             <div>
               <label className="text-xs text-slate-400 uppercase font-bold">HEX Barva</label>
               <input 
                 type="text" 
                 value={rgbToHex(color.r, color.g, color.b)}
                 onChange={(e) => {
                    const c = hexToRgb(e.target.value);
                    if (c) setColor({ ...c, a: color.a });
                 }}
                 className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-mono mt-1 focus:border-indigo-500 focus:outline-none"
               />
             </div>
          )}

          {activeTab === 'hsl' && (
             <div className="space-y-4">
               {(() => {
                 const { h, s, l } = rgbToHsl(color.r, color.g, color.b);
                 return (
                   <>
                     <div>
                       <div className="flex justify-between text-xs text-slate-400 uppercase mb-1">
                         <span>Hue</span> <span>{h}°</span>
                       </div>
                       <input 
                         type="range" min="0" max="360" value={h}
                         onChange={(e) => setColor({...hslToRgb(parseInt(e.target.value), s, l), a: color.a})}
                         className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                         style={{background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)'}}
                       />
                     </div>
                     <div>
                       <div className="flex justify-between text-xs text-slate-400 uppercase mb-1">
                         <span>Saturation</span> <span>{s}%</span>
                       </div>
                       <input 
                         type="range" min="0" max="100" value={s}
                         onChange={(e) => setColor({...hslToRgb(h, parseInt(e.target.value), l), a: color.a})}
                         className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                       />
                     </div>
                     <div>
                       <div className="flex justify-between text-xs text-slate-400 uppercase mb-1">
                         <span>Lightness</span> <span>{l}%</span>
                       </div>
                       <input 
                         type="range" min="0" max="100" value={l}
                         onChange={(e) => setColor({...hslToRgb(h, s, parseInt(e.target.value)), a: color.a})}
                         className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                       />
                     </div>
                   </>
                 );
               })()}
             </div>
          )}
        </div>
        
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
           <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Základní paleta</h3>
           <div className="grid grid-cols-5 gap-2">
              {basicColors.map(c => (
                <div 
                  key={c} 
                  onClick={() => setColor({...hexToRgb(c)!, a: 1})}
                  className="w-full aspect-square rounded cursor-pointer hover:scale-110 transition-transform border border-white/10"
                  style={{backgroundColor: c}}
                />
              ))}
           </div>
           <h3 className="text-xs font-bold text-slate-400 uppercase mt-4 mb-3">Pastelová paleta</h3>
           <div className="grid grid-cols-5 gap-2">
              {pastelColors.map(c => (
                <div 
                  key={c} 
                  onClick={() => setColor({...hexToRgb(c)!, a: 1})}
                  className="w-full aspect-square rounded cursor-pointer hover:scale-110 transition-transform border border-white/10"
                  style={{backgroundColor: c}}
                />
              ))}
           </div>
        </div>
      </div>

      {/* Right Column: Preview & Image */}
      <div className="lg:col-span-2 space-y-6">
         {/* Preview Box */}
         <div className="flex flex-col md:flex-row gap-6">
            <div 
              className="flex-1 h-32 md:h-auto rounded-xl shadow-2xl border border-slate-700 relative overflow-hidden group"
              style={{backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`}}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm">
                 <span className="font-bold text-white drop-shadow-md text-lg">{getColorName(color.r, color.g, color.b)}</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-3">
               {[
                 { label: 'HEX', val: rgbToHex(color.r, color.g, color.b) },
                 { label: 'RGB', val: `rgb(${color.r}, ${color.g}, ${color.b})` },
                 { label: 'HSL', val: (() => { const {h,s,l} = rgbToHsl(color.r, color.g, color.b); return `hsl(${h}, ${s}%, ${l}%)` })() }
               ].map((item) => (
                 <div key={item.label} onClick={() => copy(item.val)} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-lg cursor-pointer hover:border-indigo-500 group transition-all">
                    <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-400">{item.label}</span>
                    <span className="font-mono text-slate-300">{item.val}</span>
                    <Icons.Copy />
                 </div>
               ))}
               <Button onClick={() => {
                 const hex = rgbToHex(color.r, color.g, color.b);
                 if (!favorites.includes(hex)) saveFavorites([...favorites, hex]);
               }} className="w-full">
                 <span className="text-lg">+</span> Uložit do oblíbených
               </Button>
            </div>
         </div>
         
         {favorites.length > 0 && (
           <div className="bg-slate-950/30 border border-slate-800/50 p-4 rounded-xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Oblíbené barvy</h3>
              <div className="flex flex-wrap gap-2">
                 {favorites.map(hex => (
                   <div key={hex} className="group relative">
                      <div 
                        onClick={() => setColor({...hexToRgb(hex)!, a: 1})}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-white/10"
                        style={{backgroundColor: hex}}
                      />
                      <button 
                        onClick={(e) => { e.stopPropagation(); saveFavorites(favorites.filter(f => f !== hex)); }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                   </div>
                 ))}
              </div>
           </div>
         )}

         {/* Image Upload Area */}
         <div className="border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white flex items-center gap-2"><Icons.Photo /> Pipeta z obrázku</h3>
              <div className="flex gap-2">
                {hasImage && (
                  <button 
                    onClick={() => setEyedropperActive(!eyedropperActive)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${eyedropperActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    <Icons.Eyedropper /> {eyedropperActive ? 'Aktivní' : 'Aktivovat pipetu'}
                  </button>
                )}
                <button onClick={() => fileInputRef.current?.click()} className="text-sm text-indigo-400 hover:text-indigo-300">
                   {hasImage ? 'Změnit obrázek' : 'Nahrát obrázek'}
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>
            
            <div className={`relative min-h-[200px] flex items-center justify-center bg-slate-950 rounded-lg overflow-hidden ${eyedropperActive ? 'cursor-none' : ''}`}>
               <canvas 
                 ref={canvasRef} 
                 onClick={handleCanvasClick}
                 onMouseMove={handleCanvasMove}
                 onMouseLeave={() => setCursorColor(null)}
                 className="max-w-full rounded-lg"
               />
               {!hasImage && (
                 <div className="text-slate-500 text-sm">
                   Nahrajte obrázek pro použití pipety
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};