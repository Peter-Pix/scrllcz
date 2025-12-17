import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

interface TextStats {
  chars: number;
  charsNoSpaces: number;
  words: number;
  lines: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  speakingTime: number;
  typingTime: number;
  handwritingTime: number;
  avgSentenceLength: number;
  avgWordLength: number;
  syllables: number;
  avgSyllables: number;
  numbers: number;
  uniqueWords: number;
  topWords: [string, number][];
}

const formatTime = (minutes: number) => {
  if (minutes === 0) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

export const TextAnalyzerTool = () => {
  const [text, setText] = useState('');
  const [stats, setStats] = useState<TextStats>({
    chars: 0, charsNoSpaces: 0, words: 0, lines: 0, sentences: 0, paragraphs: 0,
    readingTime: 0, speakingTime: 0, typingTime: 0, handwritingTime: 0,
    avgSentenceLength: 0, avgWordLength: 0, syllables: 0, avgSyllables: 0,
    numbers: 0, uniqueWords: 0, topWords: []
  });

  const countSyllables = (txt: string) => {
    // Czech vowels including diacritics
    const words = txt.split(/\s+/);
    let totalSyllables = 0;

    words.forEach(word => {
      // Remove non-letter characters
      const cleanWord = word.replace(/[^\wáčďéěíňóřšťúůýž]/gi, '');
      if (cleanWord.length === 0) return;

      // Count vowel groups (consecutive vowels = 1 syllable)
      const vowelGroups = cleanWord.match(/[aeiouyáéíóúůýěAEIOUYÁÉÍÓÚŮÝĚ]+/g);
      
      if (vowelGroups) {
        let syllableCount = vowelGroups.length;
        // Minimum 1 syllable per word
        totalSyllables += Math.max(1, syllableCount);
      } else {
        // No vowels found, but word exists - count as 1
        totalSyllables += 1;
      }
    });

    return totalSyllables;
  };

  useEffect(() => {
    // Basic counts
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const wordsArr = text.trim() === '' ? [] : text.trim().split(/\s+/);
    const words = wordsArr.length;
    const lines = text === '' ? 0 : text.split(/\n/).length;
    
    // Sentences - Czech punctuation aware
    const sentences = text.trim() === '' ? 0 : 
        text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    // Paragraphs
    const paragraphs = text.trim() === '' ? 0 : 
        text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

    // Reading times
    const readingTime = Math.ceil(words / 200);
    const speakingTime = Math.ceil(words / 150);
    const typingTime = Math.ceil(words / 40);
    const handwritingTime = Math.ceil(words / 20);

    // Advanced analysis
    const avgSentenceLength = sentences > 0 ? parseFloat((words / sentences).toFixed(1)) : 0;
    const avgWordLength = words > 0 ? parseFloat((charsNoSpaces / words).toFixed(1)) : 0;

    // Syllable counting
    const syllables = countSyllables(text);
    const avgSyllables = words > 0 ? parseFloat((syllables / words).toFixed(2)) : 0;

    // Numbers in text
    const numbers = (text.match(/\d+/g) || []).length;

    // Unique words & Frequency
    const cleanWords = text.toLowerCase()
        .replace(/[^\wáčďéěíňóřšťúůýž\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 0);
    
    const uniqueWords = new Set(cleanWords).size;

    const frequency: Record<string, number> = {};
    const stopWords = new Set(['jsou', 'bylo', 'byla', 'byly', 'bude', 'jsem', 'jsme', 'jste', 'budou', 
                               'není', 'nebyl', 'nebyla', 'nebyly', 'nebude', 'budeme', 'budete',
                               'který', 'která', 'které', 'tohoto', 'toho', 'tato', 'toto', 'tyto',
                               'když', 'proto', 'však', 'tedy', 'také', 'více', 'velmi', 'můžeme',
                               'může', 'musí', 'mají', 'máme', 'máte', 'chce', 'chtějí', 'jako', 'nebo', 'tím']);

    cleanWords.forEach(word => {
        if (word.length >= 4 && !stopWords.has(word)) {
            frequency[word] = (frequency[word] || 0) + 1;
        }
    });

    const topWords = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

    setStats({
      chars, charsNoSpaces, words, lines, sentences, paragraphs,
      readingTime, speakingTime, typingTime, handwritingTime,
      avgSentenceLength, avgWordLength, syllables, avgSyllables,
      numbers, uniqueWords, topWords
    });

  }, [text]);

  const pasteText = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (err) {
      alert('Nelze vložit text ze schránky. Zkuste Ctrl+V.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Editor & Basic Stats */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2"><Icons.Pencil /> Váš text</h3>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setText('')} disabled={!text} className="text-xs">
                <Icons.Trash /> Vymazat
              </Button>
              <Button variant="secondary" onClick={pasteText} className="text-xs">
                <Icons.Copy /> Vložit
              </Button>
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Začněte psát nebo vložte text sem..."
            className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none font-sans leading-relaxed"
          />
        </div>

        {/* Word Frequency */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
           <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">🏆 Nejčastější slova (min. 4 znaky)</h3>
           <div className="flex flex-wrap gap-2">
             {stats.topWords.length > 0 ? (
               stats.topWords.map(([word, count]) => (
                 <span key={word} className="bg-emerald-900/20 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-sm font-medium">
                   {word} <span className="opacity-60 text-xs ml-1">({count}×)</span>
                 </span>
               ))
             ) : (
               <span className="text-slate-500 text-sm italic">Začněte psát pro zobrazení frekvence slov...</span>
             )}
           </div>
        </div>
      </div>

      {/* Sidebar: Statistics */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Basic Stats Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-6 text-white shadow-lg">
           <h3 className="text-emerald-100 font-bold text-sm uppercase mb-4 opacity-80">Základní statistiky</h3>
           <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <div className="text-3xl font-bold">{stats.chars.toLocaleString()}</div>
                <div className="text-xs text-emerald-100 opacity-80">Znaků</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{stats.words.toLocaleString()}</div>
                <div className="text-xs text-emerald-100 opacity-80">Slov</div>
              </div>
              <div>
                <div className="text-xl font-bold">{stats.sentences.toLocaleString()}</div>
                <div className="text-xs text-emerald-100 opacity-80">Vět</div>
              </div>
              <div>
                <div className="text-xl font-bold">{stats.lines.toLocaleString()}</div>
                <div className="text-xs text-emerald-100 opacity-80">Řádků</div>
              </div>
           </div>
           <div className="mt-4 pt-4 border-t border-white/10 text-xs text-emerald-100 opacity-70">
             Bez mezer: {stats.charsNoSpaces.toLocaleString()} znaků
           </div>
        </div>

        {/* Reading Time */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
           <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
             <Icons.Clock /> Časové odhady
           </h3>
           <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-slate-300"><Icons.Eye /></div>
                  <div className="text-sm text-slate-300">Čtení <span className="text-xs text-slate-500 block">200 slov/min</span></div>
                </div>
                <div className="font-bold text-emerald-400">{formatTime(stats.readingTime)}</div>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-slate-300"><Icons.Microphone /></div>
                  <div className="text-sm text-slate-300">Mluvení <span className="text-xs text-slate-500 block">150 slov/min</span></div>
                </div>
                <div className="font-bold text-emerald-400">{formatTime(stats.speakingTime)}</div>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-slate-300"><Icons.Keyboard /></div>
                  <div className="text-sm text-slate-300">Psaní <span className="text-xs text-slate-500 block">40 slov/min</span></div>
                </div>
                <div className="font-bold text-emerald-400">{formatTime(stats.typingTime)}</div>
             </div>
           </div>
        </div>

        {/* Detailed Analysis */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
           <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
             <Icons.DocumentText /> Detailní analýza
           </h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                 <div className="text-slate-500 text-xs mb-1">Délka věty</div>
                 <div className="font-bold text-lg text-white">{stats.avgSentenceLength} <span className="text-xs font-normal text-slate-500">slov</span></div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                 <div className="text-slate-500 text-xs mb-1">Délka slova</div>
                 <div className="font-bold text-lg text-white">{stats.avgWordLength} <span className="text-xs font-normal text-slate-500">znaků</span></div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                 <div className="text-slate-500 text-xs mb-1">Unikátní</div>
                 <div className="font-bold text-lg text-white">{stats.uniqueWords} <span className="text-xs font-normal text-slate-500">slov</span></div>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                 <div className="text-slate-500 text-xs mb-1">Slabiky</div>
                 <div className="font-bold text-lg text-white">{stats.syllables} <span className="text-xs font-normal text-slate-500">celkem</span></div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};