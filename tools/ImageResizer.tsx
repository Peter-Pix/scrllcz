import React, { useState, useRef } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

export const ImageResizerTool = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<{width: number, height: number} | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [quality, setQuality] = useState(90);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setOriginalSize({ width: img.width, height: img.height });
          setWidth(img.width);
          setHeight(img.height);
          setImageSrc(event.target?.result as string);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value) || 0;
    setWidth(newWidth);
    if (lockAspectRatio && originalSize) {
      const ratio = originalSize.height / originalSize.width;
      setHeight(Math.round(newWidth * ratio));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value) || 0;
    setHeight(newHeight);
    if (lockAspectRatio && originalSize) {
      const ratio = originalSize.width / originalSize.height;
      setWidth(Math.round(newHeight * ratio));
    }
  };

  const handleDownload = () => {
    if (!imageSrc) return;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality / 100);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `resized-${width}x${height}.jpg`;
      link.click();
    };
    img.src = imageSrc;
  };

  const triggerUpload = () => fileInputRef.current?.click();

  if (!imageSrc) {
    return (
      <div 
        onClick={triggerUpload}
        className="border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-xl h-64 sm:h-[400px] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-all group p-4 text-center"
      >
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
          <Icons.Upload />
        </div>
        <p className="text-lg sm:text-xl font-medium text-slate-200">Klikněte pro nahrání obrázku</p>
        <p className="text-slate-500 mt-2 text-sm">JPG, PNG, WEBP</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Controls */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Nastavení velikosti</h3>
           
           <div className="space-y-4">
             <div>
               <label className="block text-slate-300 text-sm mb-1">Šířka (px)</label>
               <input 
                 type="number" 
                 value={width} 
                 onChange={handleWidthChange}
                 className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
               />
             </div>
             
             <div>
               <label className="block text-slate-300 text-sm mb-1">Výška (px)</label>
               <input 
                 type="number" 
                 value={height} 
                 onChange={handleHeightChange}
                 className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
               />
             </div>

             <div className="flex items-center gap-2 mt-2">
               <button 
                 onClick={() => setLockAspectRatio(!lockAspectRatio)}
                 className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-colors w-full sm:w-auto justify-center ${lockAspectRatio ? 'bg-indigo-900/30 border-indigo-500/50 text-indigo-200' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
               >
                 {lockAspectRatio ? <Icons.Lock /> : <Icons.Unlock />}
                 {lockAspectRatio ? 'Poměr stran zamčen' : 'Poměr stran odemčen'}
               </button>
             </div>
           </div>
        </div>

        <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Kvalita (JPG)</h3>
           <div className="flex items-center gap-4">
             <input 
               type="range" 
               min="10" 
               max="100" 
               value={quality} 
               onChange={(e) => setQuality(parseInt(e.target.value))}
               className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
             />
             <span className="text-slate-300 font-mono w-8">{quality}%</span>
           </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={handleDownload} variant="primary" className="w-full py-3">
            <Icons.Download /> Stáhnout obrázek
          </Button>
          <Button onClick={() => setImageSrc(null)} variant="ghost" className="w-full">
            <Icons.Trash /> Zrušit a nahrát jiný
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="lg:col-span-2 bg-slate-950/30 rounded-xl border border-slate-800/50 p-4 flex items-center justify-center overflow-hidden min-h-[300px] sm:min-h-[400px]">
        <img 
           src={imageSrc} 
           alt="Preview" 
           style={{ 
             maxWidth: '100%', 
             maxHeight: '500px', 
             aspectRatio: lockAspectRatio ? `${width}/${height}` : 'auto' 
           }} 
           className="rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
};