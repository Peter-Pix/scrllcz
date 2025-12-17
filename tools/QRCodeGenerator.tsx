import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

export const QRCodeGeneratorTool = () => {
  const [text, setText] = useState('https://scrollo.cz');
  const [size, setSize] = useState(300);
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrUrl, setQrUrl] = useState('');

  // Debounced URL update to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text) {
        const c = color.replace('#', '');
        const bg = bgColor.replace('#', '');
        setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${c}&bgcolor=${bg}&margin=10`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [text, size, color, bgColor]);

  const handleDownload = async () => {
    if (!qrUrl) return;
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qrcode.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download QR code', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Settings */}
      <div className="space-y-6">
        <div>
          <label className="block text-slate-400 text-sm font-bold uppercase mb-2">Obsah QR kódu</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 min-h-[100px]"
            placeholder="Zadejte URL, text, telefonní číslo..."
          />
        </div>

        <div>
          <label className="block text-slate-400 text-sm font-bold uppercase mb-2">Velikost: {size}px</label>
          <input
            type="range"
            min="200"
            max="500"
            step="10"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-slate-400 text-sm font-bold uppercase mb-2">Barva kódu</label>
            <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-700">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-none bg-transparent p-0 flex-shrink-0"
              />
              <span className="font-mono text-slate-300 text-sm">{color}</span>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-slate-400 text-sm font-bold uppercase mb-2">Barva pozadí</label>
            <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-700">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-none bg-transparent p-0 flex-shrink-0"
              />
              <span className="font-mono text-slate-300 text-sm">{bgColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="flex flex-col items-center justify-center">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-2xl mb-6 max-w-full">
          {qrUrl ? (
            <img src={qrUrl} alt="QR Code" className="rounded-lg max-w-full h-auto" style={{ maxWidth: '300px' }} />
          ) : (
            <div className="w-[300px] h-[300px] max-w-full flex items-center justify-center text-slate-500">
              Načítám náhled...
            </div>
          )}
        </div>
        
        <Button onClick={handleDownload} disabled={!qrUrl} className="w-full max-w-[300px]">
          <Icons.Download /> Stáhnout PNG
        </Button>
      </div>
    </div>
  );
};