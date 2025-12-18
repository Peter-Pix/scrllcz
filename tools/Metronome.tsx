
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

const TIME_SIGNATURES = ['2/4', '3/4', '4/4', '5/4', '6/8'];

export const MetronomeTool = () => {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [volume, setVolume] = useState(50);
  const [currentBeat, setCurrentBeat] = useState(0);

  // Audio Context & Scheduling refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef(0);
  const beatRef = useRef(0);
  const timerIDRef = useRef<number | null>(null);
  const bpmRef = useRef(120);
  const beatsPerMeasureRef = useRef(4);

  // Sync refs with state for use in the tick loop
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    beatsPerMeasureRef.current = parseInt(timeSignature.split('/')[0]);
  }, [timeSignature]);

  const playClick = useCallback((time: number, isAccent: boolean) => {
    if (!audioCtxRef.current) return;

    const osc = audioCtxRef.current.createOscillator();
    const envelope = audioCtxRef.current.createGain();

    osc.frequency.value = isAccent ? 1000 : 800;
    envelope.gain.value = (volume / 100) * 0.5;
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(envelope);
    envelope.connect(audioCtxRef.current.destination);

    osc.start(time);
    osc.stop(time + 0.1);
  }, [volume]);

  const scheduler = useCallback(() => {
    if (!audioCtxRef.current) return;

    // Schedule nodes for the next 100ms
    while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + 0.1) {
      const isFirstBeat = beatRef.current % beatsPerMeasureRef.current === 0;
      
      playClick(nextNoteTimeRef.current, isFirstBeat);
      
      // Update UI (current beat) - needs to be roughly synced
      const beatToDisplay = beatRef.current % beatsPerMeasureRef.current;
      setTimeout(() => setCurrentBeat(beatToDisplay), (nextNoteTimeRef.current - audioCtxRef.current.currentTime) * 1000);

      // Advance time
      const secondsPerBeat = 60.0 / bpmRef.current;
      nextNoteTimeRef.current += secondsPerBeat;
      beatRef.current++;
    }

    timerIDRef.current = window.setTimeout(scheduler, 25);
  }, [playClick]);

  const startStop = () => {
    if (isPlaying) {
      if (timerIDRef.current) clearTimeout(timerIDRef.current);
      setIsPlaying(false);
      setCurrentBeat(0);
    } else {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Ensure context is running (needed for Chrome after user interaction)
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.05;
      beatRef.current = 0;
      setIsPlaying(true);
      scheduler();
    }
  };

  useEffect(() => {
    return () => {
      if (timerIDRef.current) clearTimeout(timerIDRef.current);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-8 select-none">
      {/* Visual Display Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Pulsing visual glow */}
        <div 
          className={`absolute inset-0 bg-rose-500/5 blur-3xl transition-opacity duration-150 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: `scale(${isPlaying ? 1.2 : 1})` }}
        />
        
        {/* BPM Display */}
        <div className="relative z-10 text-center space-y-2 mb-10">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            Tempo (BPM)
          </div>
          <div className="text-[120px] font-black leading-none text-white tabular-nums tracking-tighter">
            {bpm}
          </div>
          <div className="flex justify-center gap-4">
             <button 
                onClick={() => setBpm(Math.max(30, bpm - 1))}
                className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-white flex items-center justify-center hover:bg-slate-700 transition-colors active:scale-90"
             >
               -
             </button>
             <button 
                onClick={() => setBpm(Math.min(300, bpm + 1))}
                className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-white flex items-center justify-center hover:bg-slate-700 transition-colors active:scale-90"
             >
               +
             </button>
          </div>
        </div>

        {/* Beat Indicators */}
        <div className="flex gap-3 mb-10 relative z-10">
          {[...Array(parseInt(timeSignature.split('/')[0]))].map((_, i) => (
            <div 
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-100 ${
                isPlaying && currentBeat === i 
                  ? (i === 0 ? 'bg-rose-500 scale-150 shadow-[0_0_15px_#f43f5e]' : 'bg-indigo-400 scale-125 shadow-[0_0_10px_#818cf8]') 
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Play Button */}
        <button 
          onClick={startStop}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl relative z-10 hover:scale-105 active:scale-95 ${isPlaying ? 'bg-rose-600 text-white shadow-rose-900/40' : 'bg-indigo-600 text-white shadow-indigo-900/40'}`}
        >
          <div className="transform scale-150">
            {isPlaying ? <Icons.Square /> : <Icons.Play />}
          </div>
        </button>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time Signature */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
           <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Takt (Signature)</div>
           <div className="flex flex-wrap gap-2">
              {TIME_SIGNATURES.map(sig => (
                <button
                  key={sig}
                  onClick={() => setTimeSignature(sig)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${timeSignature === sig ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  {sig}
                </button>
              ))}
           </div>
        </div>

        {/* Volume & Fine Tuning */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
           <div>
              <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hlasitost</span>
                 <Icons.Volume />
              </div>
              <input 
                 type="range" 
                 min="0" max="100" 
                 value={volume}
                 onChange={(e) => setVolume(parseInt(e.target.value))}
                 className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
           </div>
           
           <div className="pt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 text-center">Rychlá volba tempa</span>
              <input 
                 type="range" 
                 min="30" max="300" 
                 value={bpm}
                 onChange={(e) => setBpm(parseInt(e.target.value))}
                 className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
           </div>
        </div>
      </div>

      <div className="bg-indigo-900/10 border border-indigo-500/10 p-6 rounded-3xl text-center">
         <p className="text-indigo-200 text-sm leading-relaxed italic">
           💡 <strong>Pro hudebníky:</strong> Tento metronom běží přímo na hardware vašem prohlížeči, což zajišťuje dokonalou přesnost i při rychlém tempu. Akcent na první dobu vám pomůže udržet se v taktu.
         </p>
      </div>
    </div>
  );
};
