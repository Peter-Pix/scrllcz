
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../components/Icons';
import { Button, Modal } from '../components/Shared';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  height?: number;
  minimized?: boolean;
}

const ADJECTIVES = [
  "nová", "úžasná", "další", "moje", "legendární", "důležitá", "nevšední", "nezbytná", 
  "výjimečná", "krásná", "speciální", "nezapomenutelná", "šokující", "obyčejná", 
  "epesní", "klasická", "zlobivá", "laskavá", "stydlivá", "přímočará", "okouzlující"
];

export const QuickNotesTool = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('scrollo_quick_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [lastAdjective, setLastAdjective] = useState("");
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem('scrollo_quick_notes', JSON.stringify(notes));
  }, [notes]);

  const generateTitle = () => {
    let available = ADJECTIVES.filter(a => a !== lastAdjective);
    const adj = available[Math.floor(Math.random() * available.length)];
    setLastAdjective(adj);
    return `${adj.charAt(0).toUpperCase() + adj.slice(1)} poznámka`;
  };

  const addNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: generateTitle(),
      content: ``,
      createdAt: Date.now(),
      height: 200,
      minimized: false
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const confirmDeleteNote = () => {
    if (noteToDelete) {
      setNotes(prev => prev.filter(n => n.id !== noteToDelete));
      setNoteToDelete(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, id: string) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const newVal = val.substring(0, start) + "\t" + val.substring(end);
      updateNote(id, { content: newVal });
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  const exportNote = (note: Note) => {
    const now = new Date(note.createdAt);
    const footer = `\n\nExportováno ze Scrollo.cz\nDatum: ${now.toLocaleDateString('cs-CZ')}`;
    const blob = new Blob([note.content + footer], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title || 'Poznámka'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const _notes = [...notes];
    const draggedItemContent = _notes.splice(dragItem.current, 1)[0];
    _notes.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setNotes(_notes);
  };

  return (
    <div className="relative pb-20 sm:pb-0">
      {/* Delete Note Modal */}
      <Modal 
        isOpen={!!noteToDelete} 
        onClose={() => setNoteToDelete(null)} 
        title="Smazat poznámku"
        variant="danger"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNoteToDelete(null)}>Zrušit</Button>
            <Button variant="danger" onClick={confirmDeleteNote}>Odstranit</Button>
          </>
        }
      >
        Opravdu chcete tuto poznámku nenávratně smazat?
      </Modal>

      <div className="flex justify-between items-center mb-8 px-2">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
             <Icons.Note />
           </div>
           <div>
             <h3 className="text-white font-bold text-lg">Nástěnka poznámek</h3>
             <p className="text-slate-500 text-xs uppercase tracking-widest font-black">{notes.length} celkem</p>
           </div>
        </div>
        <Button onClick={addNote} className="bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-900/20">
          <Icons.Plus /> <span className="hidden sm:inline">Nová poznámka</span>
        </Button>
      </div>

      {/* Dynamic Flex Flow Grid */}
      <div className="flex flex-wrap gap-4 items-start content-start min-h-[300px]">
        {notes.map((note, index) => {
          const noteDate = new Date(note.createdAt);
          const isMinimized = note.minimized;
          
          return (
            <div 
              key={note.id} 
              draggable 
              onDragStart={() => (dragItem.current = index)}
              onDragEnter={() => (dragOverItem.current = index)}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
              className={`
                relative flex flex-col bg-slate-900 border transition-all duration-500 ease-in-out group
                ${isMinimized 
                  ? 'w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/40 rounded-xl' 
                  : 'w-full border-slate-700 shadow-2xl rounded-2xl ring-1 ring-white/5'
                }
                ${dragItem.current === index ? 'opacity-20' : 'opacity-100'}
              `}
            >
              {/* Header */}
              <div className={`flex items-center p-3 sm:p-4 gap-2 select-none cursor-move min-w-0`}>
                <button 
                  onClick={() => updateNote(note.id, { minimized: !isMinimized })}
                  className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${isMinimized ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                  title={isMinimized ? "Rozbalit" : "Sbalit"}
                >
                  <svg className={`w-4 h-4 transform transition-transform duration-300 ${isMinimized ? '-rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <input 
                  type="text" 
                  value={note.title}
                  onChange={e => updateNote(note.id, { title: e.target.value })}
                  placeholder="Název poznámky..."
                  className={`bg-transparent border-none text-white font-bold transition-all focus:outline-none placeholder-slate-700 flex-1 min-w-0 truncate ${isMinimized ? 'text-sm' : 'text-base'}`}
                />

                <div className={`flex items-center gap-1 flex-shrink-0 transition-all ${isMinimized ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                  <button onClick={() => exportNote(note)} className="p-1.5 text-slate-500 hover:text-emerald-400 transition-colors" title="Uložit jako .txt"><Icons.Download /></button>
                  <button onClick={() => setNoteToDelete(note.id)} className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors" title="Smazat"><Icons.Trash /></button>
                </div>
              </div>

              {/* Content Area */}
              <div className={`px-4 transition-all duration-500 overflow-hidden ${isMinimized ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100 pb-4'}`}>
                <div className="relative">
                  <textarea
                    value={note.content}
                    onKeyDown={(e) => handleKeyDown(e, note.id)}
                    onChange={e => updateNote(note.id, { content: e.target.value })}
                    style={{ height: note.height || 220 }}
                    placeholder="Začněte psát své myšlenky..."
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-slate-200 text-sm placeholder-slate-800 focus:outline-none focus:border-indigo-500/50 resize-y leading-relaxed font-sans"
                  />
                  <div className="absolute bottom-2 right-2 text-slate-800 pointer-events-none">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414l6-6a1 1 0 011.414 0zM12.707 6.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414l6-6a1 1 0 011.414 0z" /></svg>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-600 px-1 border-t border-slate-800/50 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                    <span>{noteDate.toLocaleDateString('cs-CZ')} {noteDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <span>{note.content.length} znaků</span>
                </div>
              </div>

              {/* Indicator for Minimized state content */}
              {isMinimized && note.content.trim().length > 0 && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-500/20 rounded-full mb-1"></div>
              )}
            </div>
          );
        })}

        {notes.length === 0 && (
          <div className="w-full text-center py-20 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl animate-fade-in">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
               <Icons.Note />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Vaše nástěnka je prázdná</h3>
            <p className="text-slate-500 max-w-xs mx-auto mb-2 px-4 text-sm">Zachyťte své nápady dříve, než uletí. Každá velká věc začala jednou malou poznámkou.</p>
          </div>
        )}
      </div>

      {/* Floating Action Button (Mobile only) */}
      <button 
        onClick={addNote}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-90 transition-transform border-4 border-slate-950"
      >
        <Icons.Plus />
      </button>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};
