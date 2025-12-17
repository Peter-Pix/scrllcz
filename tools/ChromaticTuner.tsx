
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../components/Icons';
import { Button, Card } from '../components/Shared';

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

interface TuningPreset {
  name: string;
  notes: string[];
}

const TUNINGS: Record<string, TuningPreset> = {
  chromatic: { name: 'Chromatika / Zpěv', notes: [] },
  guitar: { name: 'Kytara (EADGBE)', notes: ['E', 'A', 'D', 'G', 'B', 'E'] },
  ukulele: { name: 'Ukulele (GCEA)', notes: ['G', 'C', 'E', 'A'] },
  banjo: { name: 'Banjo (GDGBD)', notes: ['G', 'D', 'G', 'B', 'D'] },
};

export const ChromaticTunerTool = () => {
  const [isListening, setIsListening] = useState(false);
  const [pitch, setPitch] = useState<number | null>(null);
  const [note, setNote] = useState<string>("-");
  const [cents, setCents] = useState<number>(0);
  const [tuning, setTuning] = useState<string>('chromatic');
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      setIsListening(true);
      setError(null);
      updatePitch();
    } catch (err) {
      setError('Nepodařilo se získat přístup k mikrofonu. Zkontrolujte oprávnění.');
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    setPitch(null);
    setNote("-");
    setCents(0);
  };

  const updatePitch = () => {
    if (!analyserRef.current) return;
    
    const buffer = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(buffer);
    
    const detectedPitch = autoCorrelate(buffer, audioCtxRef.current!.sampleRate);
    
    if (detectedPitch !== -1) {
      setPitch(detectedPitch);
      const noteNum = 12 * (Math.log(detectedPitch / 440) / Math.log(2)) + 69;
      const roundedNote = Math.round(noteNum);
      const diff = (noteNum - roundedNote) * 100;
      
      setNote(NOTE_NAMES[roundedNote % 12]);
      setCents(diff);
    }
    
    animationRef.current = requestAnimationFrame(updatePitch);
  };

  // Algoritmus autokorelace pro přesné určení základní frekvence
  const autoCorrelate = (buffer: Float32Array, sampleRate: number) => {
    let SIZE = buffer.length;
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1; // Ticho

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    }

    buffer = buffer.slice(r1, r2);
    SIZE = buffer.length;

    const c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        c[i] = c[i] + buffer[j] * buffer[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;

    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
  };

  useEffect(() => {
    return () => stopListening();
  }, []);

  // Vizuální indikátory
  const isTuned = Math.abs(cents) < 5 && note !== "-";
  const needleRotation = (cents / 50) * 45; // Max 45 stupňů na každou stranu

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col items-center gap-6">
        <div className="w-full flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Icons.Music /> Chromatická ladička
          </h3>
          <select 
            value={tuning}
            onChange={(e) => setTuning(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:border-indigo-500 outline-none"
          >
            {Object.entries(TUNINGS).map(([key, val]) => (
              <option key={key} value={key}>{val.name}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="w-full p-4 bg-rose-900/20 border border-rose-500/30 rounded-xl text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* The Tuner Visual UI */}
        <div className="relative w-full aspect-square max-w-[350px] flex items-center justify-center bg-slate-950 rounded-full border-8 border-slate-900 shadow-2xl overflow-hidden group">
          {/* Inner Glow */}
          <div className={`absolute inset-0 transition-opacity duration-300 opacity-20 ${isTuned ? 'bg-indigo-500 blur-3xl' : 'bg-transparent'}`} />

          {/* Scale Marks */}
          <div className="absolute inset-4 pointer-events-none">
            {[...Array(21)].map((_, i) => {
              const angle = (i - 10) * 9; // -90 to 90
              return (
                <div 
                  key={i} 
                  className={`absolute left-1/2 top-0 w-0.5 h-3 origin-[0_155px] -translate-x-1/2 ${i % 5 === 0 ? 'h-5 bg-slate-600' : 'bg-slate-800'}`}
                  style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
                />
              );
            })}
          </div>

          {/* Large Note Display */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`text-8xl font-black transition-colors duration-200 ${isTuned ? 'text-indigo-400' : 'text-white'}`}>
              {note}
            </div>
            <div className="text-slate-500 font-mono text-sm mt-2">
              {pitch ? `${pitch.toFixed(1)} Hz` : 'Ticho'}
            </div>
          </div>

          {/* Needle */}
          <div 
            className={`absolute bottom-1/2 left-1/2 w-1 h-[140px] origin-bottom -translate-x-1/2 transition-transform duration-75 ease-linear ${isTuned ? 'bg-indigo-400' : 'bg-rose-500'}`}
            style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-inherit shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
          </div>
          
          {/* Bottom Indicators */}
          <div className="absolute bottom-12 flex gap-12 font-black text-xs">
            <span className={cents < -5 ? 'text-rose-500' : 'text-slate-700'}>FLAT</span>
            <span className={isTuned ? 'text-indigo-400' : 'text-slate-700'}>TUNED</span>
            <span className={cents > 5 ? 'text-rose-500' : 'text-slate-700'}>SHARP</span>
          </div>
        </div>

        <Button 
          onClick={isListening ? stopListening : startListening} 
          className={`w-full py-4 text-xl font-bold ${isListening ? 'bg-slate-800 hover:bg-slate-700' : 'bg-indigo-600 hover:bg-indigo-500'}`}
        >
          {isListening ? 'Vypnout ladičku' : 'Zapnout mikrofon'}
        </Button>
      </div>

      {/* Target Notes Info */}
      {tuning !== 'chromatic' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl animate-fade-in">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Cílové tóny</h4>
          <div className="flex justify-center gap-4">
            {TUNINGS[tuning].notes.map((n, i) => (
              <div 
                key={i} 
                className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-bold text-lg transition-all ${note === n ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
              >
                {n}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center text-slate-500 text-xs px-6">
        ℹ️ Tip: Pro nejlepší výsledek hrajte jednotlivé struny čistě a v tichém prostředí. Ladička automaticky ignoruje šum pod určitou hranicí hlasitosti.
      </div>
    </div>
  );
};
