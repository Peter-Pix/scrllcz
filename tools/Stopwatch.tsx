import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

type Mode = 'stopwatch' | 'timer';
type VisualStyle = 'digital' | 'analog';

interface Preset {
  id: string;
  label: string;
  durationMinutes: number;
  color: string;
  icon: string;
}

const PRESETS: Preset[] = [
  { id: 'work', label: 'Práce (Pomodoro)', durationMinutes: 25, color: 'bg-indigo-600', icon: '💼' },
  { id: 'short-break', label: 'Pauza', durationMinutes: 5, color: 'bg-emerald-600', icon: '☕' },
  { id: 'long-break', label: 'Velká pauza', durationMinutes: 15, color: 'bg-teal-600', icon: '🥪' },
  { id: 'meditation', label: 'Meditace', durationMinutes: 10, color: 'bg-violet-600', icon: '🧘' },
  { id: 'quick', label: 'Rychlovka', durationMinutes: 1, color: 'bg-blue-600', icon: '⚡' },
  { id: 'lunch', label: 'Oběd', durationMinutes: 30, color: 'bg-orange-600', icon: '🥗' },
  { id: 'workout', label: 'Trénink', durationMinutes: 60, color: 'bg-red-600', icon: '💪' },
];

export const StopwatchTool = () => {
  const [mode, setMode] = useState<Mode>('timer');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('digital');
  
  // Timer specific state
  const [timerTime, setTimerTime] = useState(25 * 60 * 1000); // Remaining time
  const [initialTimerTime, setInitialTimerTime] = useState(25 * 60 * 1000); // Total duration for progress calc
  const [timerDurationInput, setTimerDurationInput] = useState({ min: 25, sec: 0 });
  const [selectedPresetId, setSelectedPresetId] = useState<string>('work');

  // Stopwatch specific state
  const [stopwatchTime, setStopwatchTime] = useState(0);

  // Common state
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const intervalRef = useRef<number | null>(null);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Timer/Stopwatch Interval Logic
  useEffect(() => {
    if (isRunning) {
      if (mode === 'stopwatch') {
        // Stopwatch: Count UP
        const startTime = Date.now() - stopwatchTime;
        intervalRef.current = window.setInterval(() => {
          setStopwatchTime(Date.now() - startTime);
        }, 10);
      } else {
        // Timer: Count DOWN
        // We calculate expected end time to prevent drift, but simple decrement works for pauses better here
        const lastTick = Date.now();
        intervalRef.current = window.setInterval(() => {
          setTimerTime(prev => {
            const newVal = prev - 10;
            if (newVal <= 0) {
              handleFinish();
              return 0;
            }
            return newVal;
          });
        }, 10);
      }
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  const handleFinish = () => {
    setIsRunning(false);
    setIsFinished(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audio.play().catch(e => console.log('Audio play failed', e));
  };

  const handleStartStop = () => {
    if (isFinished) {
      // If finished, reset logic based on mode
      if (mode === 'timer') resetTimer();
      else resetStopwatch();
      return;
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsFinished(false);
    setTimerTime(initialTimerTime);
  };

  const resetStopwatch = () => {
    setIsRunning(false);
    setIsFinished(false);
    setStopwatchTime(0);
  };

  const handlePresetClick = (preset: Preset) => {
    setIsRunning(false);
    setIsFinished(false);
    setSelectedPresetId(preset.id);
    const ms = preset.durationMinutes * 60 * 1000;
    setInitialTimerTime(ms);
    setTimerTime(ms);
    setTimerDurationInput({ min: preset.durationMinutes, sec: 0 });
  };

  const handleManualInput = (field: 'min' | 'sec', value: number) => {
    if (isRunning) return;
    const newVal = Math.max(0, value);
    const newInputs = { ...timerDurationInput, [field]: newVal };
    setTimerDurationInput(newInputs);
    
    // Custom means no preset selected
    setSelectedPresetId(''); 
    
    const totalMs = (newInputs.min * 60 + newInputs.sec) * 1000;
    setInitialTimerTime(totalMs);
    setTimerTime(totalMs);
    setIsFinished(false);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setIsRunning(false);
    setIsFinished(false);
    if (newMode === 'stopwatch') {
      setStopwatchTime(0);
    } else {
      // Reset to last set timer
      setTimerTime(initialTimerTime);
    }
  };

  // Render Helpers
  const renderDigitalTime = (ms: number, showMs = true) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    // For stopwatch we show milliseconds, for timer usually not unless < 1 min?
    // Let's stick to consistent big numbers.
    const realMs = Math.floor((ms % 1000) / 10);

    return (
      <div className={`font-mono leading-none tracking-tighter flex items-baseline justify-center select-none ${isFinished ? 'animate-pulse text-red-500' : 'text-white'}`}>
        <span className="text-[18vw] sm:text-[10rem] font-bold tabular-nums">
           {minutes > 99 ? minutes : String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        {showMs && mode === 'stopwatch' && (
           <span className="text-[6vw] sm:text-[3rem] text-slate-500 ml-2 sm:ml-4 w-[2ch] tabular-nums">
              {String(realMs).padStart(2, '0')}
           </span>
        )}
      </div>
    );
  };

  const renderAnalogClock = (ms: number, maxMs: number) => {
    const radius = 120;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    
    let progress = 0;
    
    if (mode === 'timer') {
       // Timer: Full circle at start, empty at 0
       progress = maxMs > 0 ? ms / maxMs : 0;
    } else {
       // Stopwatch: Second hand logic (0 to 60s loop)
       const seconds = (ms / 1000) % 60;
       progress = seconds / 60;
    }

    const strokeDashoffset = circumference - progress * circumference;

    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return (
      <div className="relative flex items-center justify-center">
         <svg
           height={radius * 2}
           width={radius * 2}
           className={`transform -rotate-90 ${isFinished ? 'animate-pulse' : ''}`}
           style={{ maxWidth: '100%', maxHeight: '60vh', width: 'auto', height: 'auto', minWidth: '300px', minHeight: '300px' }}
           viewBox={`0 0 ${radius * 2} ${radius * 2}`}
         >
           {/* Background Track */}
           <circle
             stroke="#1e293b"
             fill="transparent"
             strokeWidth={stroke}
             r={normalizedRadius}
             cx={radius}
             cy={radius}
           />
           {/* Progress */}
           <circle
             stroke={isFinished ? '#ef4444' : (mode === 'timer' && progress < 0.1 ? '#f59e0b' : '#6366f1')}
             fill="transparent"
             strokeWidth={stroke}
             strokeDasharray={circumference + ' ' + circumference}
             style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.1s linear' }}
             strokeLinecap="round"
             r={normalizedRadius}
             cx={radius}
             cy={radius}
           />
         </svg>
         
         <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`font-mono font-bold text-5xl sm:text-7xl ${isFinished ? 'text-red-500' : 'text-white'}`}>
               {minutes > 99 ? minutes : String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            {mode === 'timer' && selectedPresetId && (
               <div className="text-slate-400 mt-2 font-medium uppercase tracking-wider text-sm">
                  {PRESETS.find(p => p.id === selectedPresetId)?.label || 'Vlastní'}
               </div>
            )}
         </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-[100] bg-slate-950 p-6 sm:p-12' : 'min-h-[600px]'}`}>
      
      {/* 1. Header & Tabs */}
      <div className={`flex justify-between items-start sm:items-center mb-6 transition-all duration-300 ${isFullscreen ? (isRunning ? 'opacity-0 hover:opacity-100' : 'opacity-100') : ''}`}>
        <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex shadow-sm">
           <button
             onClick={() => switchMode('timer')}
             className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'timer' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
           >
             Odpočet
           </button>
           <button
             onClick={() => switchMode('stopwatch')}
             className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'stopwatch' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
           >
             Stopky
           </button>
        </div>
        
        <div className="flex gap-2">
           <button 
              onClick={() => setVisualStyle(prev => prev === 'digital' ? 'analog' : 'digital')}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Přepnout styl zobrazení"
           >
              {visualStyle === 'digital' ? <Icons.Clock /> : <Icons.Numbers />}
           </button>
           <button 
              onClick={toggleFullscreen}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Celá obrazovka"
           >
              {isFullscreen ? <Icons.Minimize /> : <Icons.Maximize />}
           </button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
         
         {/* Timer Presets (Only in Timer mode) */}
         {mode === 'timer' && (
           <div className={`transition-all duration-500 mb-8 ${isRunning || isFullscreen ? 'max-h-0 opacity-0 overflow-hidden mb-0' : 'max-h-[300px] opacity-100'}`}>
              <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x">
                 {PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetClick(preset)}
                      className={`flex-shrink-0 snap-start flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${selectedPresetId === preset.id ? `border-transparent ${preset.color} text-white shadow-lg shadow-indigo-500/20 ring-2 ring-white/10` : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'}`}
                    >
                       <span className="text-xl">{preset.icon}</span>
                       <div className="text-left">
                          <div className="font-bold text-sm">{preset.label}</div>
                          <div className="text-xs opacity-80 font-mono">{preset.durationMinutes} min</div>
                       </div>
                    </button>
                 ))}
              </div>
           </div>
         )}

         {/* Time Display */}
         <div className="flex-1 flex items-center justify-center w-full">
            {visualStyle === 'digital' ? (
               renderDigitalTime(mode === 'timer' ? timerTime : stopwatchTime)
            ) : (
               renderAnalogClock(mode === 'timer' ? timerTime : stopwatchTime, initialTimerTime)
            )}
         </div>

         {/* Finished State Message */}
         {isFinished && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-32 text-center pointer-events-none">
               <div className="text-red-500 text-2xl font-bold uppercase tracking-[0.5em] animate-bounce bg-slate-950/80 px-4 py-2 rounded-lg backdrop-blur-sm">
                  Čas vypršel
               </div>
            </div>
         )}

         {/* Manual Input (Only Timer mode, not running) */}
         {mode === 'timer' && !isRunning && !isFullscreen && (
           <div className="flex justify-center items-center gap-4 mt-8 animate-fade-in">
              <div className="flex flex-col items-center group">
                 <input 
                   type="number" 
                   value={timerDurationInput.min}
                   onChange={(e) => handleManualInput('min', parseInt(e.target.value))}
                   className="bg-transparent border-b-2 border-slate-700 text-center text-3xl font-mono w-24 text-slate-300 focus:border-indigo-500 focus:outline-none transition-colors"
                   min="0"
                 />
                 <span className="text-xs text-slate-500 uppercase mt-2 group-hover:text-slate-400 transition-colors">Minuty</span>
              </div>
              <span className="text-2xl text-slate-700 pb-6">:</span>
              <div className="flex flex-col items-center group">
                 <input 
                   type="number" 
                   value={timerDurationInput.sec}
                   onChange={(e) => handleManualInput('sec', parseInt(e.target.value))}
                   className="bg-transparent border-b-2 border-slate-700 text-center text-3xl font-mono w-24 text-slate-300 focus:border-indigo-500 focus:outline-none transition-colors"
                   min="0"
                   max="59"
                 />
                 <span className="text-xs text-slate-500 uppercase mt-2 group-hover:text-slate-400 transition-colors">Sekundy</span>
              </div>
           </div>
         )}
      </div>

      {/* 3. Controls Footer */}
      <div className={`flex justify-center gap-8 mt-8 transition-all duration-300 ${isFullscreen && isRunning ? 'opacity-10 hover:opacity-100' : 'opacity-100'}`}>
         <button 
           onClick={mode === 'timer' ? resetTimer : resetStopwatch}
           className="w-16 h-16 rounded-full flex items-center justify-center bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all border border-slate-700 hover:scale-110 active:scale-95"
           title="Reset"
         >
           <Icons.RotateCcw />
         </button>
         
         <button 
           onClick={handleStartStop}
           className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl hover:scale-105 active:scale-95 ${isRunning ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/40' : (isFinished ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-900/40' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40')}`}
         >
           <div className="transform scale-150">
             {isRunning ? <Icons.Square /> : (isFinished ? <Icons.RotateCcw /> : <Icons.Play />)}
           </div>
         </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};