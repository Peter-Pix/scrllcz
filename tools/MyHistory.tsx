
import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '../components/Icons';
import { Button, Modal } from '../components/Shared';

type EventType = 'milestone' | 'normal' | 'goal';

interface LifeEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: EventType;
  createdAt: number;
}

export const MyHistoryTool = () => {
  const [events, setEvents] = useState<LifeEvent[]>(() => {
    try {
      const saved = localStorage.getItem('scrollo_history_events');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    type: 'normal' as EventType
  });

  useEffect(() => {
    localStorage.setItem('scrollo_history_events', JSON.stringify(events));
  }, [events]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  const groupedEvents = useMemo(() => {
    const groups: Record<string, LifeEvent[]> = {};
    sortedEvents.forEach(event => {
      const year = new Date(event.date).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(event);
    });
    return groups;
  }, [sortedEvents]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;

    const today = new Date().toISOString().split('T')[0];
    const finalType = formData.date > today ? 'goal' : formData.type;

    if (editingId) {
      setEvents(prev => prev.map(ev => ev.id === editingId ? { ...ev, ...formData, type: finalType } : ev));
    } else {
      const newEvent: LifeEvent = {
        id: crypto.randomUUID(),
        ...formData,
        type: finalType,
        createdAt: Date.now()
      };
      setEvents(prev => [...prev, newEvent]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      title: '',
      description: '',
      type: 'normal'
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (event: LifeEvent) => {
    setFormData({
      date: event.date,
      title: event.title,
      description: event.description,
      type: event.type
    });
    setEditingId(event.id);
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setEvents(prev => prev.filter(ev => ev.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Modal 
        isOpen={!!deleteConfirmId} 
        onClose={() => setDeleteConfirmId(null)} 
        title="Odstranit z historie"
        variant="danger"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>Zrušit</Button>
            <Button variant="danger" onClick={confirmDelete}>Smazat</Button>
          </>
        }
      >
        Opravdu si přejete smazat tento záznam z vaší časové osy?
      </Modal>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-4 sm:p-6 rounded-2xl border border-slate-800">
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-white">{events.length}</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Událostí</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-indigo-400">{events.filter(e => e.type === 'milestone').length}</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Milníků</div>
          </div>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto py-2.5">
          <Icons.Plus /> Přidat moment
        </Button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative">
            <button onClick={resetForm} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <Icons.Trash />
            </button>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">
              {editingId ? 'Upravit moment' : 'Nový moment'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Datum</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData(prev => ({...prev, date: e.target.value}))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Typ</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData(prev => ({...prev, type: e.target.value as EventType}))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 outline-none appearance-none"
                    disabled={formData.date > new Date().toISOString().split('T')[0]}
                  >
                    <option value="normal">Běžná událost</option>
                    <option value="milestone">Milník</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Název</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData(prev => ({...prev, title: e.target.value}))}
                  placeholder="Co se stalo?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Popis</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData(prev => ({...prev, description: e.target.value}))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 outline-none h-24 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="ghost" onClick={resetForm} className="flex-1">Zrušit</Button>
                <Button type="submit" className="flex-1">Uložit</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-24 bg-slate-900/10 border-2 border-dashed border-slate-800/50 rounded-3xl animate-fade-in">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-700">
            <Icons.History />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Časová osa je prázdná</h3>
          <p className="text-slate-500 max-w-xs mx-auto text-xs px-6">
            Začněte psát příběh svého života. Přidejte své narození, první úspěchy nebo budoucí cíle.
          </p>
        </div>
      ) : (
        <div className="relative animate-fade-in pl-4 sm:pl-0 pb-10">
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-slate-800 -translate-x-1/2" />

          <div className="space-y-12">
            {(Object.entries(groupedEvents) as [string, LifeEvent[]][]).map(([year, yearEvents]) => (
              <div key={year} className="relative">
                <div className="sticky top-24 z-10 flex justify-center mb-8">
                   <div className="bg-slate-950 border border-slate-800 text-slate-500 px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest shadow-xl">
                      {year}
                   </div>
                </div>

                <div className="space-y-10">
                  {yearEvents.map((event, idx) => {
                    const isLeft = idx % 2 === 0;
                    const isMilestone = event.type === 'milestone';
                    
                    return (
                      <div key={event.id} className={`flex flex-col sm:flex-row items-start sm:items-center w-full ${isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                        <div className="hidden sm:block w-1/2" />
                        <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-slate-950 z-20 flex items-center justify-center">
                           <div className={`w-full h-full rounded-full ${isMilestone ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-700'}`} />
                        </div>

                        <div className={`w-full sm:w-1/2 pl-10 sm:pl-0 ${isLeft ? 'sm:pr-10' : 'sm:pl-10'}`}>
                          <div className={`group bg-slate-900 border ${isMilestone ? 'border-indigo-500/30 ring-1 ring-indigo-500/10' : 'border-slate-800'} p-4 rounded-xl transition-all hover:border-slate-600`}>
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                {new Date(event.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' })}
                              </span>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(event)} className="p-1 text-slate-600 hover:text-indigo-400 transition-colors"><Icons.Pencil /></button>
                                <button onClick={() => setDeleteConfirmId(event.id)} className="p-1 text-slate-600 hover:text-rose-400 transition-colors"><Icons.Trash /></button>
                              </div>
                            </div>
                            <h4 className="text-base font-bold text-white mb-1 leading-tight">{event.title}</h4>
                            {event.description && <p className="text-slate-400 text-xs leading-relaxed">{event.description}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
