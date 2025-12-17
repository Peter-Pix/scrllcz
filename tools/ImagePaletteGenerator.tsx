import React, { useState, useRef } from 'react';
import { Icons } from '../components/Icons';
import { Button, useCopyFeedback } from '../components/Shared';

interface ColorSample {
  hex: string;
  rgb: string;
  count: number;
}

export const ImagePaletteGeneratorTool = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { copied, copy } = useCopyFeedback();
  const [lastCopiedColor, setLastCopiedColor] = useState<string | null>(null);

  const handleCopyColor = (color: string) => {
    copy(color);
    setLastCopiedColor(color);
    setTimeout(() => setLastCopiedColor(null), 2000);
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  // Vypočítá rozdíl mezi barvami (Euclidean distance v RGB prostoru)
  const colorDistance = (c1: {r: number, g: number, b: number}, c2: {r: number, g: number, b: number}) => {
    return Math.sqrt(
      Math.pow(c2.r - c1.r, 2) +
      Math.pow(c2.g - c1.g, 2) +
      Math.pow(c2.b - c1.b, 2)
    );
  };

  const extractPalette = (img: HTMLImageElement) => {
    setIsExtracting(true);
    
    // Použijeme canvas pro přístup k pixelům
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Zmenšíme obrázek pro rychlejší zpracování (max 200px)
    const maxSize = 200;
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    if (!ctx) return;
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    const colorMap: Record<string, number> = {};
    const quantization = 25; // Seskupování barev (zaokrouhlení RGB hodnot)

    for (let i = 0; i < imageData.length; i += 4) {
      const alpha = imageData[i + 3];
      if (alpha < 128) continue; // Ignorovat průhledné

      // Kvantizace barev pro shlukování podobných odstínů
      const r = Math.round(imageData[i] / quantization) * quantization;
      const g = Math.round(imageData[i + 1] / quantization) * quantization;
      const b = Math.round(imageData[i + 2] / quantization) * quantization;

      const key = `${r},${g},${b}`;
      colorMap[key] = (colorMap[key] || 0) + 1;
    }

    // Seřadit podle četnosti
    const sortedColors = Object.entries(colorMap)
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => {
        const [r, g, b] = key.split(',').map(Number);
        return { r, g, b, hex: rgbToHex(r, g, b), count };
      });

    // Výběr distinct barev (aby nebyly příliš podobné)
    const distinctColors: string[] = [];
    const minDistance = 40; // Minimální rozdíl mezi barvami

    for (const color of sortedColors) {
      if (distinctColors.length >= 8) break; // Max 8 barev

      const isTooSimilar = distinctColors.some(existingHex => {
         const r = parseInt(existingHex.slice(1, 3), 16);
         const g = parseInt(existingHex.slice(3, 5), 16);
         const b = parseInt(existingHex.slice(5, 7), 16);
         return colorDistance(color, {r, g, b}) < minDistance;
      });

      if (!isTooSimilar) {
        distinctColors.push(color.hex);
      }
    }
    
    // Pokud máme málo barev, snížíme nároky na vzdálenost a doplníme zbytek
    if (distinctColors.length < 5) {
       for (const color of sortedColors) {
          if (distinctColors.length >= 8) break;
          if (!distinctColors.includes(color.hex)) {
             distinctColors.push(color.hex);
          }
       }
    }

    setPalette(distinctColors);
    setIsExtracting(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImageSrc(event.target?.result as string);
          extractPalette(img);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const copyCSS = () => {
    const css = `:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`;
    copy(css);
  };

  const copyJSON = () => {
    copy(JSON.stringify(palette));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Left / Top: Upload Area */}
      <div className="lg:col-span-2 space-y-6">
        {!imageSrc ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-xl h-64 sm:h-[400px] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-all group p-4 text-center animate-fade-in"
          >
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl">
              <Icons.Palette />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nahrát obrázek</h3>
            <p className="text-slate-500">Extrahovat barvy z JPG, PNG, WEBP</p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
             <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
               <img src={imageSrc} alt="Source" className="w-full h-auto object-contain max-h-[400px]" />
               <button 
                 onClick={() => { setImageSrc(null); setPalette([]); }}
                 className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur text-white p-2 rounded-lg hover:bg-red-900/80 transition-colors border border-white/10"
                 title="Zrušit"
               >
                 <Icons.Trash />
               </button>
             </div>
             <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full">
               Nahrát jiný obrázek
               <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
             </Button>
          </div>
        )}
      </div>

      {/* Right / Bottom: Palette */}
      <div className="lg:col-span-3 space-y-6">
        {palette.length > 0 ? (
          <div className="animate-fade-in space-y-8">
             <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                   <Icons.Palette /> Nalezená paleta
                </h3>
                
                {/* Large Swatches */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {palette.map((color, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleCopyColor(color)}
                      className="group relative aspect-square rounded-2xl cursor-pointer shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl ring-1 ring-white/5 overflow-hidden"
                      style={{ backgroundColor: color }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 backdrop-blur-[2px] transition-opacity">
                         <span className="font-mono font-bold text-white drop-shadow-md tracking-wider">
                           {lastCopiedColor === color ? 'COPIED' : color}
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             {/* Details List */}
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                   <h4 className="text-sm font-bold text-slate-400 uppercase">Kódy barev</h4>
                   <div className="flex gap-2">
                      <button onClick={copyCSS} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors border border-slate-700">
                         Kopírovat CSS
                      </button>
                      <button onClick={copyJSON} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors border border-slate-700">
                         Kopírovat JSON
                      </button>
                   </div>
                </div>

                <div className="space-y-2">
                   {palette.map((color, idx) => (
                     <div 
                       key={idx} 
                       onClick={() => handleCopyColor(color)}
                       className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 cursor-pointer group transition-colors border border-transparent hover:border-slate-700"
                     >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-lg shadow-sm border border-white/10" style={{backgroundColor: color}} />
                           <div>
                              <div className="text-white font-mono font-bold">{color}</div>
                              <div className="text-xs text-slate-500">Barva #{idx + 1}</div>
                           </div>
                        </div>
                        <div className="text-slate-500 group-hover:text-white transition-colors">
                           {lastCopiedColor === color ? <Icons.Check /> : <Icons.Copy />}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        ) : (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-500 bg-slate-950/30 border border-dashed border-slate-800 rounded-xl">
             {imageSrc && isExtracting ? (
                <div className="animate-pulse flex flex-col items-center">
                   <div className="text-4xl mb-4">🎨</div>
                   <p>Analyzuji barvy...</p>
                </div>
             ) : (
                <>
                   <div className="text-6xl mb-4 opacity-20"><Icons.Palette /></div>
                   <p>Nahrajte obrázek pro vygenerování palety</p>
                </>
             )}
          </div>
        )}
      </div>
    </div>
  );
};