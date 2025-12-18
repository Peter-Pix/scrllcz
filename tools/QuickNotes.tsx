
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
  "výjimečná", "krásná", "speciální", "nezapomenutelná", "šokující", "obyčejná"
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
      height: 350, // Zvětšeno na 350px pro pohodlnější psaní na mobilu
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
    <div className="relative">
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

      {/* Ultra kompaktní hlavička */}
      <div className="flex justify-between items-center mb-3 sm:mb-8 px-1">
        <div className="flex items-center gap-2 sm:gap-3">
           <div className="w-7 h-7 sm:w-10 sm:h-10 bg-amber-500/10 rounded-lg sm:rounded-xl flex items-center justify-center text-amber-500">
             <Icons.Note />
           </div>
           <div>
             <h3 className="text-white font-bold text-sm sm:text-lg leading-tight">Poznámky</h3>
             <p className="text-slate-500 text-[8px] sm:text-[10px] uppercase tracking-widest font-black opacity-60">Celkem {notes.length}</p>
           </div>
        </div>
        
        {/* Kruhové tlačítko pro přidání - minimalistické */}
        <button 
          onClick={addNote}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-900/40 transition-all active:scale-90 ring-4 ring-slate-900"
          title="Nová poznámka"
        >
          <Icons.Plus />
        </button>
      </div>

      <div className="flex flex-wrap gap-3 sm:gap-4 items-start content-start min-h-[200px]">
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
                relative flex flex-col bg-slate-900 border transition-all duration-300 group
                ${isMinimized 
                  ? 'w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] border-slate-800 hover:border-slate-600 rounded-xl' 
                  : 'w-full border-slate-700 shadow-2xl rounded-2xl ring-1 ring-white/5'
                }
                ${dragItem.current === index ? 'opacity-20 scale-95' : 'opacity-100'}
              `}
            >
              <div className="flex items-center p-2 sm:p-4 gap-1 sm:gap-2 select-none cursor-move">
                <button 
                  onClick={() => updateNote(note.id, { minimized: !isMinimized })}
                  className={`p-2 rounded-lg transition-all flex-shrink-0 ${isMinimized ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-white'}`}
                >
                  <svg className={`w-3.5 h-3.5 sm:w-4 h-4 transform transition-transform duration-300 ${isMinimized ? '-rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <input 
                  type="text" 
                  value={note.title}
                  onChange={e => updateNote(note.id, { title: e.target.value })}
                  placeholder="Název..."
                  className={`bg-transparent border-none text-white font-bold transition-all focus:outline-none placeholder-slate-700 flex-1 min-w-0 truncate ${isMinimized ? 'text-[11px]' : 'text-sm sm:text-base'}`}
                />

                <div className={`flex items-center gap-1 flex-shrink-0 ${isMinimized ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                  <button onClick={() => exportNote(note)} className="p-1 text-slate-500 hover:text-emerald-400 transition-colors"><Icons.Download /></button>
                  <button onClick={() => setNoteToDelete(note.id)} className="p-1 text-slate-500 hover:text-rose-500 transition-colors"><Icons.Trash /></button>
                </div>
              </div>

              <div className={`px-2 sm:px-4 transition-all duration-300 overflow-hidden ${isMinimized ? 'max-h-0 opacity-0' : 'max-h-[1500px] opacity-100 pb-3 sm:pb-4'}`}>
                <textarea
                  value={note.content}
                  onKeyDown={(e) => handleKeyDown(e, note.id)}
                  onChange={e => updateNote(note.id, { content: e.target.value })}
                  style={{ height: note.height || 350 }}
                  placeholder="Zde začněte psát..."
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl p-3 sm:p-4 text-slate-200 text-sm sm:text-lg focus:border-indigo-500/50 resize-y leading-relaxed font-sans outline-none shadow-inner custom-scrollbar"
                />
                
                <div className="mt-2.5 flex justify-between items-center text-[7px] sm:text-[9px] font-bold uppercase tracking-widest text-slate-600 px-1 pt-2 border-t border-slate-800/50">
                  <span>Vytvořeno: {noteDate.toLocaleDateString('cs-CZ')}</span>
                  <span>{note.content.length} znaků</span>
                </div>
              </div>
            </div>
          );
        })}

        {notes.length === 0 && (
          <div className="w-full text-center py-16 sm:py-32 bg-slate-900/10 border-2 border-dashed border-slate-800/50 rounded-3xl animate-fade-in">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-700">
               <Icons.Note />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Vaše nástěnka je prázdná</h3>
            <p className="text-slate-500 max-w-xs mx-auto text-xs px-6">
              Všechny skvělé nápady začínají jednou malou poznámkou. Přidejte ji kliknutím na plus.
            </p>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
};
