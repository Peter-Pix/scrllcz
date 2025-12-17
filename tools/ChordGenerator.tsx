
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { Button, useCopyFeedback } from '../components/Shared';

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface Scale {
  name: string;
  intervals: number[];
  suffixes: string[];
}

const SCALES: Record<string, Scale> = {
  major: {
    name: 'Durová (Major)',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    suffixes: ['', 'm', 'm', '', '', 'm', 'dim']
  },
  minor: {
    name: 'Mollová (Minor)',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    suffixes: ['m', 'dim', '', 'm', 'm', '', '']
  },
  dorian: {
    name: 'Dórská (Dorian)',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    suffixes: ['m', 'm', '', '', 'm', 'dim', '']
  },
  phrygian: {
    name: 'Frygická (Phrygian)',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    suffixes: ['m', '', '', 'm', 'dim', '', 'm']
  },
  lydian: {
    name: 'Lydická (Lydian)',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    suffixes: ['', '', 'm', 'dim', '', 'm', 'm']
  },
  mixolydian: {
    name: 'Mixolydická (Mixolydian)',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    suffixes: ['', 'm', 'dim', '', 'm', 'm', '']
  },
};

const PRESETS: Record<string, number[][]> = {
  pop: [[1, 5, 6, 4], [1, 4, 1, 5], [6, 4, 1, 5]],
  jazz: [[2, 5, 1, 6], [1, 6, 2, 5], [3, 6, 2, 5]],
  blues: [[1, 4, 1, 5], [1, 1, 4, 4], [1, 4, 5, 4]],
  sad: [[6, 4, 1, 5], [1, 6, 4, 5], [6, 5, 4, 5]],
};

export const ChordGeneratorTool = () => {
  const [selectedKey, setSelectedKey] = useState('C');
  const [selectedScale, setSelectedScale] = useState('major');
  const [selectedStyle, setSelectedStyle] = useState('pop');
  const [progression, setProgression] = useState<string[]>([]);
  const { copied, copy } = useCopyFeedback();

  const getNote = (root: string, interval: number) => {
    const rootIndex = ALL_NOTES.indexOf(root);
    return ALL_NOTES[(rootIndex + interval) % 12];
  };

  const generateChord = (degree: number) => {
    const scale = SCALES[selectedScale];
    const note = getNote(selectedKey, scale.intervals[degree - 1]);
    const suffix = scale.suffixes[degree - 1];
    return note + suffix;
  };

  const generateProgression = () => {
    const stylePresets = PRESETS[selectedStyle];
    const pattern = stylePresets[Math.floor(Math.random() * stylePresets.length)];
    const chords = pattern.map(degree => generateChord(degree));
    setProgression(chords);
  };

  useEffect(() => {
    generateProgression();
  }, [selectedKey, selectedScale, selectedStyle]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Key Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tónina (Key)</label>
          <div className="grid grid-cols-4 gap-2">
            {KEYS.map(key => (
              <button
                key={key}
                onClick={() => setSelectedKey(key)}
                className={`py-2 rounded-lg text-sm font-bold transition-all border ${selectedKey === key ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Scale Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stupnice (Scale)</label>
          <div className="flex flex-col gap-2">
            {Object.entries(SCALES).map(([id, scale]) => (
              <button
                key={id}
                onClick={() => setSelectedScale(id)}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left border ${selectedScale === id ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}
              >
                {scale.name}
              </button>
            ))}
          </div>
        </div>

        {/* Style Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Styl / Mood</label>
          <div className="flex flex-col gap-2">
            {[
              { id: 'pop', name: 'Pop / Moderní', icon: '🎸' },
              { id: 'jazz', name: 'Jazz / Sofistikované', icon: '🎷' },
              { id: 'blues', name: 'Blues / Klasika', icon: '🎹' },
              { id: 'sad', name: 'Melancholie / Emoce', icon: '🎻' }
            ].map(style => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left border ${selectedStyle === style.id ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}
              >
                <span className="mr-2">{style.icon}</span> {style.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Display */}
      <div className="bg-slate-950/30 border border-slate-800/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[250px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        {progression.length > 0 ? (
          <div className="relative z-10 w-full animate-fade-in-up">
            <h3 className="text-slate-500 text-sm font-bold uppercase mb-8 tracking-[0.2em]">Vygenerovaná progrese</h3>
            
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-12">
              {progression.map((chord, i) => (
                <div key={i} className="flex items-center gap-4 sm:gap-6">
                  <div className="group relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-0 group-hover:opacity-20 transition-opacity rounded-full" />
                    <div className="relative bg-slate-900 border-2 border-slate-800 text-white w-20 h-20 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center text-2xl sm:text-4xl font-black shadow-xl group-hover:border-indigo-500 group-hover:-translate-y-1 transition-all">
                      {chord}
                    </div>
                  </div>
                  {i < progression.length - 1 && (
                    <div className="text-slate-700 text-2xl font-light">→</div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button onClick={generateProgression} variant="primary" className="px-8">
                <Icons.Dice /> Zkusit jinou
              </Button>
              <Button onClick={() => copy(progression.join(' - '))} variant="secondary" className="px-8">
                {copied ? <><Icons.Check /> Zkopírováno</> : <><Icons.Copy /> Kopírovat text</>}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-slate-500 flex flex-col items-center">
            <div className="text-6xl mb-4 opacity-20"><Icons.Music /></div>
            <p>Klikněte pro vygenerování akordů</p>
          </div>
        )}
      </div>

      <div className="bg-indigo-900/10 border border-indigo-500/10 p-6 rounded-2xl text-indigo-200 text-sm leading-relaxed">
        <h4 className="font-bold mb-2 flex items-center gap-2 text-indigo-300">
          <Icons.Brain /> Jak to funguje?
        </h4>
        <p>
          Nástroj využívá hudební teorii k odvození správných akordů pro zvolenou tóninu a modus. 
          Každý modus (Dórská, Lydická atd.) má unikátní charakter a emoci. 
          Vygenerované progrese vycházejí z osvědčených harmonických vzorců používaných v popu, jazzu i blues.
        </p>
      </div>
    </div>
  );
};
