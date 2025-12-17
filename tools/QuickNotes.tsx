
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

interface NoteHistory {
  past: string[];
  present: string;
  future: string[];
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export const QuickNotesTool = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('scrollo_quick_notes');
      return saved ? JSON.parse(saved) : [{ id: crypto.randomUUID(), title: '', content: '', createdAt: Date.now() }];
    } catch {
      return [{ id: crypto.randomUUID(), title: '', content: '', createdAt: Date.now() }];
    }
  });

  // History state management (in-memory only, present persists to localstorage via notes)
  const historiesRef = useRef<Record<string, { past: string[], future: string[] }>>({});

  useEffect(() => {
    localStorage.setItem('scrollo_quick_notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      createdAt: Date.now()
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const deleteNote = (id: string) => {
    if (window.confirm('Opravdu chcete tuto poznámku smazat?')) {
      setNotes(prev => prev.filter(n => n.id !== id));
      delete historiesRef.current[id];
    }
  };

  const updateNote = (id: string, field: 'title' | 'content', value: string) => {
    if (field === 'content') {
      const noteHist = historiesRef.current[id] || { past: [], future: [] };
      const currentNote = notes.find(n => n.id === id);
      
      if (currentNote && currentNote.content !== value) {
        // Limit history to 100 steps
        const newPast = [...noteHist.past, currentNote.content].slice(-100);
        historiesRef.current[id] = {
          past: newPast,
          future: []
        };
      }
    }

    setNotes(prev => prev.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const undo = (id: string) => {
    const noteHist = historiesRef.current[id];
    if (!noteHist || noteHist.past.length === 0) return;

    const currentNote = notes.find(n => n.id === id);
    if (!currentNote) return;

    const previous = noteHist.past[noteHist.past.length - 1];
    const newPast = noteHist.past.slice(0, -1);
    
    historiesRef.current[id] = {
      past: newPast,
      future: [currentNote.content, ...noteHist.future]
    };

    setNotes(prev => prev.map(n => n.id === id ? { ...n, content: previous } : n));
  };

  const redo = (id: string) => {
    const noteHist = historiesRef.current[id];
    if (!noteHist || noteHist.future.length === 0) return;

    const currentNote = notes.find(n => n.id === id);
    if (!currentNote) return;

    const next = noteHist.future[0];
    const newFuture = noteHist.future.slice(1);

    historiesRef.current[id] = {
      past: [...noteHist.past, currentNote.content],
      future: newFuture
    };

    setNotes(prev => prev.map(n => n.id === id ? { ...n, content: next } : n));
  };

  const exportNote = (note: Note) => {
    let filename = note.title.trim();
    if (!filename) {
      const words = note.content.trim().split(/\s+/).slice(0, 2);
      filename = words.length > 0 ? words.join('_') : 'poznámka';
    }
    
    const blob = new Blob([note.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Icons.Note /> Rychlé poznámky
        </h3>
        <Button onClick={addNote} className="bg-indigo-600 hover:bg-indigo-500">
          <Icons.Plus /> Nová poznámka
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        {notes.map((note) => {
          const hist = historiesRef.current[note.id] || { past: [], future: [] };
          return (
            <div key={note.id} className="group flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl hover:border-indigo-500/30 transition-all">
              {/* Note Header / Tiny Actions */}
              <div className="flex items-center justify-between mb-3">
                <input 
                  type="text" 
                  value={note.title}
                  onChange={e => updateNote(note.id, 'title', e.target.value)}
                  placeholder="Bez názvu..."
                  className="bg-transparent border-none text-white font-bold text-sm focus:outline-none placeholder-slate-600 flex-1 mr-2"
                />
                <div className="flex items-center gap-1.5">
                   <button 
                    onClick={() => undo(note.id)} 
                    disabled={hist.past.length === 0}
                    className="p-1 text-slate-600 hover:text-indigo-400 transition-colors disabled:opacity-20"
                    title="Zpět (Ctrl+Z)"
                  >
                    <Icons.RotateCcw />
                  </button>
                  <button 
                    onClick={() => redo(note.id)} 
                    disabled={hist.future.length === 0}
                    className="p-1 text-slate-600 hover:text-indigo-400 transition-colors disabled:opacity-20"
                    title="Vpřed (Ctrl+Y)"
                  >
                    <Icons.RotateCw />
                  </button>
                  <button 
                    onClick={() => exportNote(note)} 
                    className="p-1 text-slate-600 hover:text-emerald-400 transition-colors"
                    title="Uložit jako TXT"
                  >
                    <Icons.Download />
                  </button>
                  <button 
                    onClick={() => deleteNote(note.id)} 
                    className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                    title="Smazat"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              </div>

              {/* Text Area */}
              <textarea
                value={note.content}
                onChange={e => updateNote(note.id, 'content', e.target.value)}
                onKeyDown={e => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                    e.preventDefault();
                    undo(note.id);
                  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
                    e.preventDefault();
                    redo(note.id);
                  }
                }}
                placeholder="Pište si poznámku..."
                className="flex-1 w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-slate-200 text-sm placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 resize-none min-h-[150px] leading-relaxed"
              />
              
              <div className="mt-2 text-[10px] text-slate-600 flex justify-between uppercase font-bold tracking-tighter">
                <span>{new Date(note.createdAt).toLocaleDateString('cs-CZ')}</span>
                <span>{note.content.length} znaků</span>
              </div>
            </div>
          );
        })}
      </div>

      {notes.length === 0 && (
        <div className="text-center py-20 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl">
          <p className="text-slate-500">Nemáte žádné poznámky. Klikněte na tlačítko výše a vytvořte si první.</p>
        </div>
      )}

      <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl text-slate-500 text-xs text-center">
        💡 Tip: Každá poznámka si pamatuje až 100 kroků historie. Můžete používat i klávesové zkratky Ctrl+Z a Ctrl+Y.
      </div>
    </div>
  );
};
