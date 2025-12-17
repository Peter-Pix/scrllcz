import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

interface Preset {
  label: string;
  ratio: number; // width / height
  category: string;
  desc?: string;
}

const presets: Preset[] = [
  { label: 'Volný', ratio: 0, category: 'Základní' },
  { label: 'Čtverec (1:1)', ratio: 1, category: 'Základní' },
  { label: 'Portrét (2:3)', ratio: 2/3, category: 'Základní' },
  { label: 'Krajina (3:2)', ratio: 3/2, category: 'Základní' },
  { label: 'Klasika (4:3)', ratio: 4/3, category: 'Základní' },
  { label: 'Širokoúhlé (16:9)', ratio: 16/9, category: 'Základní' },
  
  { label: 'Příspěvek (1:1)', ratio: 1, category: 'Instagram' },
  { label: 'Portrét (4:5)', ratio: 4/5, category: 'Instagram' },
  { label: 'Story / Reel (9:16)', ratio: 9/16, category: 'Instagram' },
  
  { label: 'Cover Photo', ratio: 820/312, category: 'Facebook' },
  { label: 'Příspěvek', ratio: 1.91, category: 'Facebook' },
  
  { label: 'Thumbnail (16:9)', ratio: 16/9, category: 'YouTube' },
  { label: 'Channel Art', ratio: 2560/1440, category: 'YouTube' },
  
  { label: 'Příspěvek', ratio: 1.91, category: 'LinkedIn' },
  { label: 'Video (9:16)', ratio: 9/16, category: 'TikTok' },
];

export const ImageCropperTool = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(1); // Default square
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropShape, setCropShape] = useState<'rect' | 'round'>('rect');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const VIEWPORT_WIDTH = 500; // Fixed width for the editor view (responsive via CSS)
  const currentRatio = presets[selectedPresetIndex].ratio || 1;
  // If ratio is 0 (free), we default to image ratio, but for UI simplicity let's default to square or image aspect if image loaded
  // For this implementation, "Free" will just be a 1:1 view where you can fit anything, or better, fallback to 1.
  
  const viewportHeight = currentRatio === 0 
    ? (originalImage ? VIEWPORT_WIDTH / (originalImage.width / originalImage.height) : VIEWPORT_WIDTH) 
    : VIEWPORT_WIDTH / currentRatio;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
          setImageSrc(event.target?.result as string);
          setZoom(1);
          setOffset({ x: 0, y: 0 });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    if (!originalImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculation logic:
    // The viewport shows a portion of the image.
    // Viewport pixels = VIEWPORT_WIDTH x viewportHeight.
    // Image is drawn at: offset.x, offset.y with size: original.width * scale, original.height * scale
    // Where scale = (VIEWPORT_WIDTH / original.width) * zoom? 
    // Wait, let's normalize. 
    // "Fit to width" base scale:
    const baseScale = Math.max(VIEWPORT_WIDTH / originalImage.width, viewportHeight / originalImage.height);
    const renderScale = baseScale * zoom;

    // Output resolution: We want high quality. Let's use the viewport size * 2 or just match natural relation.
    // Let's target the output size to be based on the crop box, but reasonably high res.
    // For simplicity and quality, let's make the canvas size = VIEWPORT size * (1 / baseScale) (so it's closer to original resolution)
    // Or simpler: Output width = 1080 (standard) and calculate height.
    const outputWidth = 1200;
    const outputHeight = outputWidth / (currentRatio || (originalImage.width / originalImage.height));

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // We need to map the "visual" offset/zoom to the new canvas size.
    // Visual multiplier: outputWidth / VIEWPORT_WIDTH
    const visualMult = outputWidth / VIEWPORT_WIDTH;

    // Fill background (for transparent images or if dragged out of bounds)
    // ctx.fillStyle = '#000000';
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (cropShape === 'round') {
      ctx.beginPath();
      ctx.arc(outputWidth / 2, outputHeight / 2, Math.min(outputWidth, outputHeight) / 2, 0, 2 * Math.PI);
      ctx.clip();
    }

    // Draw image
    // renderX on output = offset.x * visualMult
    // renderW on output = originalImage.width * renderScale * visualMult
    
    // Center alignment fix if needed, but offset handles movement.
    // Actually, we usually want to start centered. 
    // Let's assume offset (0,0) is centered? No, in the DOM offset 0,0 is usually top-left.
    // Let's rely on what the user sees.
    // Initial load: image is centered?
    // We didn't enforce centering logic on load, so (0,0) is top-left of image at top-left of container.
    // To allow user to center easily, we should probably auto-center on load.
    
    ctx.drawImage(
      originalImage,
      offset.x * visualMult,
      offset.y * visualMult,
      originalImage.width * renderScale * visualMult,
      originalImage.height * renderScale * visualMult
    );

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `cropped-${cropShape}-${Date.now()}.png`;
    link.click();
  };

  // Auto center image on load or ratio change
  useEffect(() => {
    if (originalImage) {
       // Fit image to cover the viewport
       const scaleW = VIEWPORT_WIDTH / originalImage.width;
       const scaleH = viewportHeight / originalImage.height;
       const scale = Math.max(scaleW, scaleH); // cover
       // In our render logic, zoom=1 means "cover" or "fit"? 
       // Let's define: base state is image rendered at 'scale'.
       // zoom state multiplies that.
       
       // Center it
       const renderW = originalImage.width * scale;
       const renderH = originalImage.height * scale;
       
       setOffset({
         x: (VIEWPORT_WIDTH - renderW) / 2,
         y: (viewportHeight - renderH) / 2
       });
    }
  }, [originalImage, selectedPresetIndex, viewportHeight]);

  const baseScale = originalImage ? Math.max(VIEWPORT_WIDTH / originalImage.width, viewportHeight / originalImage.height) : 1;
  const currentRenderW = originalImage ? originalImage.width * baseScale * zoom : 0;
  const currentRenderH = originalImage ? originalImage.height * baseScale * zoom : 0;

  if (!imageSrc) {
    return (
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-xl h-64 sm:h-[500px] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-all group p-4 text-center animate-fade-in"
      >
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl">
          <Icons.Photo />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Nahrát obrázek k ořezu</h3>
        <p className="text-slate-500">Podporuje JPG, PNG, WEBP</p>
      </div>
    );
  }

  // Group presets
  const groupedPresets: Record<string, Preset[]> = {};
  presets.forEach((p, index) => {
    if (!groupedPresets[p.category]) groupedPresets[p.category] = [];
    groupedPresets[p.category].push({ ...p, originalIndex: index } as any);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Controls */}
      <div className="lg:col-span-1 space-y-6 order-2 lg:order-1 h-fit">
        
        {/* Presets */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Formát ořezu</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(groupedPresets).map(([category, items]) => (
              <div key={category}>
                <div className="text-xs font-bold text-indigo-400 mb-2">{category}</div>
                <div className="grid grid-cols-2 gap-2">
                  {items.map((p: any) => (
                    <button
                      key={p.label}
                      onClick={() => setSelectedPresetIndex(p.originalIndex)}
                      className={`text-xs p-2 rounded-lg border transition-all text-left ${selectedPresetIndex === p.originalIndex ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shape & Zoom */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Tvar</h3>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
               <button 
                 onClick={() => setCropShape('rect')}
                 className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${cropShape === 'rect' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
               >
                 Obdélník
               </button>
               <button 
                 onClick={() => setCropShape('round')}
                 className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${cropShape === 'round' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
               >
                 Kruh / Ovál
               </button>
            </div>
          </div>

          <div>
             <div className="flex justify-between text-xs text-slate-400 uppercase mb-2">
               <span>Přiblížení</span>
               <span>{Math.round(zoom * 100)}%</span>
             </div>
             <input 
               type="range"
               min="0.5"
               max="3"
               step="0.05"
               value={zoom}
               onChange={(e) => setZoom(parseFloat(e.target.value))}
               className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
             />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={handleDownload} className="w-full py-3 text-lg">
             <Icons.Download /> Stáhnout ořez
          </Button>
          <Button variant="secondary" onClick={() => { setImageSrc(null); setOriginalImage(null); }} className="w-full">
             <Icons.Trash /> Zahodit a nahrát jiný
          </Button>
        </div>
      </div>

      {/* Editor Workspace */}
      <div className="lg:col-span-2 order-1 lg:order-2 flex flex-col items-center">
         <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-8 w-full flex items-center justify-center min-h-[500px] overflow-hidden relative select-none">
            
            <div 
              ref={containerRef}
              className="relative overflow-hidden bg-slate-900 shadow-2xl ring-1 ring-white/10"
              style={{
                width: VIEWPORT_WIDTH,
                height: viewportHeight,
                maxWidth: '100%',
                borderRadius: cropShape === 'round' ? '50%' : '4px',
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none' // Prevent scroll on mobile while dragging
              }}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            >
               {/* Grid overlay for better alignment */}
               <div className="absolute inset-0 z-20 pointer-events-none opacity-30 grid grid-cols-3 grid-rows-3">
                 <div className="border-r border-b border-white/50"></div>
                 <div className="border-r border-b border-white/50"></div>
                 <div className="border-b border-white/50"></div>
                 <div className="border-r border-b border-white/50"></div>
                 <div className="border-r border-b border-white/50"></div>
                 <div className="border-b border-white/50"></div>
                 <div className="border-r border-white/50"></div>
                 <div className="border-r border-white/50"></div>
                 <div></div>
               </div>

               {imageSrc && (
                 <img 
                   src={imageSrc} 
                   alt="Crop target" 
                   draggable={false}
                   style={{
                     width: currentRenderW,
                     height: currentRenderH,
                     transform: `translate(${offset.x}px, ${offset.y}px)`,
                     maxWidth: 'none',
                     maxHeight: 'none',
                     display: 'block',
                     willChange: 'transform'
                   }}
                 />
               )}
            </div>
            
            <p className="absolute bottom-4 text-slate-500 text-xs text-center pointer-events-none">
              Táhnutím myši posunete obrázek • Kolečkem nebo sliderem přiblížíte
            </p>
         </div>
      </div>
    </div>
  );
};