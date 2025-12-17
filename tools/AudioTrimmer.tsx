
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

export const AudioTrimmerTool = () => {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Trimming states (in seconds)
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Effects
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setFileName(file.name);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      setStartTime(0);
      setEndTime(buffer.duration);
      setCurrentTime(0);
      // Timeout to ensure canvas is rendered
      setTimeout(() => drawWaveform(buffer), 50);
    } catch (err) {
      console.error("Chyba při dekódování audia:", err);
      alert("Nepodařilo se načíst audio soubor. Zkuste jiný formát (MP3, WAV, OGG).");
    } finally {
      setLoading(false);
    }
  };

  const drawWaveform = (buffer: AudioBuffer) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    
    // Set internal resolution for sharp lines
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.clearRect(0, 0, width, height);
    
    // Waveform gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#10b981'); // Emerald
    gradient.addColorStop(0.5, '#34d399'); // Lighter Emerald
    gradient.addColorStop(1, '#10b981');

    ctx.fillStyle = gradient;

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      
      const barHeight = Math.max(2, (max - min) * amp);
      const x = i;
      const y = (height - barHeight) / 2;
      
      // Rounded bars for professional look
      ctx.beginPath();
      ctx.roundRect(x, y, 1.5, barHeight, 1);
      ctx.fill();
    }
  };

  const playPreview = () => {
    if (!audioBuffer || !audioContextRef.current) return;
    
    stopPlayback();
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    
    const gainNode = audioContextRef.current.createGain();
    source.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    const duration = endTime - startTime;
    startTimeRef.current = audioContextRef.current.currentTime;
    
    source.start(0, startTime, duration);
    sourceNodeRef.current = source;
    setIsPlaying(true);
    
    source.onended = () => {
      setIsPlaying(false);
      setCurrentTime(startTime);
    };

    updatePlayhead();
  };

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
  };

  const updatePlayhead = () => {
    if (!isPlaying || !audioContextRef.current) return;
    
    const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
    const current = startTime + elapsed;
    
    if (current >= endTime) {
      setCurrentTime(endTime);
      stopPlayback();
    } else {
      setCurrentTime(current);
      animationFrameRef.current = requestAnimationFrame(updatePlayhead);
    }
  };

  const exportAudio = async () => {
    if (!audioBuffer) return;
    
    const duration = endTime - startTime;
    const sampleRate = audioBuffer.sampleRate;
    const frameCount = duration * sampleRate;
    
    const offlineCtx = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      frameCount,
      sampleRate
    );
    
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    
    const gainNode = offlineCtx.createGain();
    
    // Apply Fades with correct ramping
    if (fadeIn) {
      const fadeDuration = Math.min(2, duration / 3);
      gainNode.gain.setValueAtTime(0, 0);
      gainNode.gain.linearRampToValueAtTime(1, fadeDuration);
    }
    
    if (fadeOut) {
      const fadeDuration = Math.min(2, duration / 3);
      gainNode.gain.setValueAtTime(1, Math.max(0, duration - fadeDuration));
      gainNode.gain.linearRampToValueAtTime(0, duration);
    }
    
    source.connect(gainNode);
    gainNode.connect(offlineCtx.destination);
    
    source.start(0, startTime, duration);
    
    const renderedBuffer = await offlineCtx.startRendering();
    downloadAsWav(renderedBuffer);
  };

  const downloadAsWav = (buffer: AudioBuffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) { view.setUint16(pos, data, true); pos += 2; }
    function setUint32(data: number) { view.setUint32(pos, data, true); pos += 4; }

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));
    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    const blob = new Blob([bufferArray], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `zkraceno-${fileName.split('.')[0]}.wav`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    window.addEventListener('resize', () => audioBuffer && drawWaveform(audioBuffer));
    return () => {
      stopPlayback();
      window.removeEventListener('resize', () => audioBuffer && drawWaveform(audioBuffer));
    };
  }, [audioBuffer]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {!audioBuffer ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-3xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-slate-800/50 transition-all group p-4 text-center animate-fade-in"
        >
          <input 
            type="file" 
            accept="audio/*" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-emerald-400 font-bold">Načítám audio data...</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icons.Upload />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Vyberte písničku nebo zvuk</h3>
              <p className="text-slate-500">Formáty: MP3, WAV, OGG, AAC...</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-white font-bold truncate max-w-[250px] flex items-center gap-2">
                 <Icons.Music /> {fileName}
               </h3>
               <div className="flex items-center gap-4">
                  <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                    Délka: {formatTime(audioBuffer.duration)}
                  </div>
                  <button onClick={() => setAudioBuffer(null)} className="text-slate-600 hover:text-rose-400 transition-colors">
                    <Icons.Trash />
                  </button>
               </div>
            </div>

            {/* Waveform Visualization */}
            <div className="relative w-full h-48 bg-slate-950 rounded-2xl overflow-hidden mb-10 border border-slate-800">
              <canvas 
                ref={canvasRef} 
                className="w-full h-full opacity-80"
              />
              
              {/* Shaded Areas (Out of selection) */}
              <div 
                className="absolute top-0 left-0 h-full bg-slate-950/60 pointer-events-none"
                style={{ width: `${(startTime / audioBuffer.duration) * 100}%` }}
              />
              <div 
                className="absolute top-0 right-0 h-full bg-slate-950/60 pointer-events-none"
                style={{ width: `${(1 - endTime / audioBuffer.duration) * 100}%` }}
              />

              {/* Selection Border */}
              <div 
                className="absolute top-0 h-full border-x-2 border-emerald-500/50 bg-emerald-500/5 pointer-events-none"
                style={{ 
                  left: `${(startTime / audioBuffer.duration) * 100}%`, 
                  width: `${((endTime - startTime) / audioBuffer.duration) * 100}%` 
                }}
              />

              {/* Playhead */}
              <div 
                className="absolute top-0 h-full w-0.5 bg-white shadow-[0_0_10px_white] z-10 transition-all duration-75 linear"
                style={{ left: `${(currentTime / audioBuffer.duration) * 100}%` }}
              />
            </div>

            {/* Dual Range Controls */}
            <div className="space-y-10 mb-8 px-2">
               <div className="relative h-12">
                  <div className="absolute top-5 w-full h-1.5 bg-slate-800 rounded-full" />
                  
                  {/* Start Slider */}
                  <input 
                    type="range"
                    min="0"
                    max={audioBuffer.duration}
                    step="0.01"
                    value={startTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const safeVal = Math.min(val, endTime - 0.5);
                      setStartTime(safeVal);
                      if (!isPlaying) setCurrentTime(safeVal);
                    }}
                    className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-30 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-slate-900 [&::-webkit-slider-thumb]:shadow-lg"
                    style={{ top: '15px' }}
                  />
                  
                  {/* End Slider */}
                  <input 
                    type="range"
                    min="0"
                    max={audioBuffer.duration}
                    step="0.01"
                    value={endTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const safeVal = Math.max(val, startTime + 0.5);
                      setEndTime(safeVal);
                    }}
                    className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-20 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-slate-900 [&::-webkit-slider-thumb]:shadow-lg"
                    style={{ top: '15px' }}
                  />
               </div>

               <div className="flex justify-between items-center text-xs font-black uppercase text-slate-500 tracking-widest px-1">
                  <div className="space-y-1">
                    <span className="block text-[10px] text-slate-600">Začátek ořezu</span>
                    <span className="text-emerald-400 font-mono text-base">{formatTime(startTime)}</span>
                  </div>
                  <div className="text-center space-y-1">
                    <span className="block text-[10px] text-slate-600">Nová délka</span>
                    <span className="text-white font-mono text-base">{formatTime(endTime - startTime)}</span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="block text-[10px] text-slate-600">Konec ořezu</span>
                    <span className="text-indigo-400 font-mono text-base">{formatTime(endTime)}</span>
                  </div>
               </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-slate-800">
               {/* Effects Settings */}
               <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                  <button 
                    onClick={() => setFadeIn(!fadeIn)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${fadeIn ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Fade In
                  </button>
                  <button 
                    onClick={() => setFadeOut(!fadeOut)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${fadeOut ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Fade Out
                  </button>
               </div>

               {/* Central Play/Reset */}
               <div className="flex items-center gap-4">
                  <button 
                    onClick={() => { stopPlayback(); setCurrentTime(startTime); }}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full transition-all hover:rotate-[-90deg]"
                    title="Zpět na začátek výběru"
                  >
                    <Icons.RotateCcw />
                  </button>
                  <button 
                    onClick={isPlaying ? stopPlayback : playPreview}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 ${isPlaying ? 'bg-rose-600 shadow-rose-900/40' : 'bg-emerald-600 shadow-emerald-900/40'}`}
                  >
                    <div className="transform scale-125 text-white">
                      {isPlaying ? <Icons.Square /> : <Icons.Play />}
                    </div>
                  </button>
               </div>

               <Button onClick={exportAudio} className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/40 font-bold text-lg">
                 <Icons.Download /> Stáhnout výsledek
               </Button>
            </div>
          </div>

          <div className="bg-emerald-900/10 border border-emerald-500/10 p-6 rounded-3xl text-emerald-200/70 text-sm leading-relaxed text-center italic">
            "Posuňte zelený bod pro začátek a modrý pro konec. Vizualizace vám pomůže přesně najít ticho nebo začátek skladby."
          </div>
        </div>
      )}
      
      <style>{`
        input[type=range]::-webkit-slider-runnable-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};
