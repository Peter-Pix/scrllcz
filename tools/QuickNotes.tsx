
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

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
  const historiesRef = useRef<Record<string, { past: string[], future: string[] }>>({});
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const deleteNote = (id: string) => {
    if (window.confirm('Smazat tuto poznámku?')) {
      setNotes(prev => prev.filter(n => n.id !== id));
      delete historiesRef.current[id];
    }
  };

  // Keyboard Logic
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, id: string) => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;

    // Tab (Indent)
    if (e.key === 'Tab') {
      e.preventDefault();
      if (!e.shiftKey) {
        const newVal = val.substring(0, start) + "\t" + val.substring(end);
        updateNote(id, { content: newVal });
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        }, 0);
      } else {
        // Outdent
        if (val.substring(start - 1, start) === "\t") {
          const newVal = val.substring(0, start - 1) + val.substring(start);
          updateNote(id, { content: newVal });
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - 1;
          }, 0);
        }
      }
    }

    // Page Break (Ctrl + Enter)
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      const newVal = val.substring(0, start) + "\n\n--- NOVÁ STRANA ---\n\n" + val.substring(end);
      updateNote(id, { content: newVal });
    }

    // New Paragraph (Enter) vs New Line (Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      const newVal = val.substring(0, start) + "\n\n" + val.substring(end);
      updateNote(id, { content: newVal });
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const exportNote = (note: Note) => {
    const now = new Date(note.createdAt);
    const timeStr = now.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('cs-CZ');
    
    // Determine final name
    let finalTitle = note.title.trim();
    const isPlaceholder = ADJECTIVES.some(adj => finalTitle.toLowerCase().includes(adj));
    
    if (isPlaceholder && note.content.trim()) {
      const words = note.content.trim().split(/\s+/).slice(0, 2);
      if (words.length > 0) finalTitle = words.join(' ');
    }
    
    if (!finalTitle) finalTitle = "Nepojmenovaná poznámka";

    // Update app title for consistency
    updateNote(note.id, { title: finalTitle });

    const footer = `\n\nVytvořeno:\n--------------------------------\n Čas ${timeStr} / Datum ${dateStr}\n--------------------------------`;
    const blob = new Blob([note.content + footer], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${finalTitle}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Drag & Drop logic
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
    <div className="relative pb-20 sm:pb-0 -mx-1 sm:mx-0">
      <div className="hidden sm:flex justify-end mb-6">
        <Button onClick={addNote} className="bg-indigo-600 hover:bg-indigo-500 shadow-xl">
          <Icons.Plus /> Nová poznámka
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
        {notes.map((note, index) => {
          const noteDate = new Date(note.createdAt);
          return (
            <div 
              key={note.id} 
              draggable 
              onDragStart={() => (dragItem.current = index)}
              onDragEnter={() => (dragOverItem.current = index)}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
              className={`flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-xl hover:border-indigo-500/30 transition-all cursor-default ${note.minimized ? 'opacity-80 scale-95' : ''}`}
            >
              {/* Note Header */}
              <div className="flex items-center justify-between p-2 sm:p-4 gap-2 relative">
                {/* Minimize Dot */}
                <button 
                  onClick={() => updateNote(note.id, { minimized: !note.minimized })}
                  className={`absolute top-2 left-2 w-2 h-2 rounded-full transition-all z-20 ${note.minimized ? 'bg-indigo-500 shadow-[0_0_8px_#6366f1]' : 'bg-slate-700 hover:bg-indigo-400'}`}
                  title={note.minimized ? "Rozbalit" : "Minimalizovat"}
                />

                <input 
                  type="text" 
                  value={note.title}
                  onChange={e => updateNote(note.id, { title: e.target.value })}
                  placeholder="Zadejte název..."
                  className={`bg-transparent border-none text-white font-bold text-sm focus:outline-none placeholder-slate-700 flex-1 min-w-0 pl-4 transition-all ${note.minimized ? 'text-slate-400' : ''}`}
                />

                <div className="flex items-center bg-slate-950/50 rounded-lg p-0.5 border border-slate-800/50">
                  <button onClick={() => exportNote(note)} className="p-1.5 text-slate-500 hover:text-emerald-400 transition-colors" title="Uložit"><Icons.Download /></button>
                  <button onClick={() => deleteNote(note.id)} className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors" title="Smazat"><Icons.Trash /></button>
                </div>
              </div>

              {/* Note Body */}
              {!note.minimized && (
                <div className="px-2 pb-2 sm:px-4 sm:pb-4 animate-fade-in">
                  <textarea
                    value={note.content}
                    onKeyDown={(e) => handleKeyDown(e, note.id)}
                    onChange={e => updateNote(note.id, { content: e.target.value })}
                    onMouseUp={e => {
                      const target = e.target as HTMLTextAreaElement;
                      if (target.offsetHeight !== note.height) {
                        updateNote(note.id, { height: target.offsetHeight });
                      }
                    }}
                    style={{ height: note.height || 180 }}
                    placeholder="Začněte psát... (Enter = odstavec, Shift+Enter = řádek, Tab = odsazení)"
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl p-3 text-slate-200 text-sm placeholder-slate-800 focus:outline-none focus:border-indigo-500/50 resize-y leading-relaxed custom-scrollbar font-sans"
                  />
                  
                  <div className="mt-2 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-600 px-1">
                    <span>{noteDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })} / {noteDate.toLocaleDateString('cs-CZ')}</span>
                    <span>{note.content.length} znaků</span>
                  </div>
                </div>
              )}

              {note.minimized && (
                <div className="px-4 pb-3 flex justify-between items-center">
                   <span className="text-[10px] text-slate-600 italic">Kliknutím na tečku rozbalíte</span>
                   <span className="text-[10px] font-mono text-slate-700">{noteDate.toLocaleDateString('cs-CZ')}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {notes.length === 0 && (
        <div className="text-center py-20 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl">
          <p className="text-slate-500">Žádné poznámky. Začněte kliknutím na tlačítko.</p>
        </div>
      )}

      {/* Mobile FAB */}
      <button 
        onClick={addNote}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-90 transition-transform border-4 border-slate-950"
      >
        <Icons.Plus />
      </button>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        textarea { tab-size: 4; }
      `}</style>
    </div>
  );
};
