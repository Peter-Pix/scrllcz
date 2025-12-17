import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '../components/Icons';
import { Button, Card } from '../components/Shared';

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
  
  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    type: 'normal' as EventType
  });

  // Persistence
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

  const handleDelete = (id: string) => {
    if (confirm('Opravdu chcete tuto událost smazat?')) {
      setEvents(prev => prev.filter(ev => ev.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{events.length}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Událostí</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-400">{events.filter(e => e.type === 'milestone').length}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Milníků</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-400">{events.filter(e => e.type === 'goal').length}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Cílů</div>
          </div>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
          <Icons.Plus /> Přidat moment
        </Button>
      </div>

      {/* Editor Modal/Panel Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative">
            <button onClick={resetForm} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <Icons.Trash />
            </button>
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingId ? 'Upravit moment' : 'Nový moment v čase'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Datum</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData(prev => ({...prev, date: e.target.value}))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Typ (pouze pro minulost)</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData(prev => ({...prev, type: e.target.value as EventType}))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors appearance-none"
                    disabled={formData.date > new Date().toISOString().split('T')[0]}
                  >
                    <option value="normal">Běžná událost</option>
                    <option value="milestone">Zásadní milník</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Název události</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData(prev => ({...prev, title: e.target.value}))}
                  placeholder="Narození, první práce, svatba..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Popis (nepovinné)</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Detaily, pocity, vzpomínky..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors h-32 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="ghost" onClick={resetForm} className="flex-1">Zrušit</Button>
                <Button type="submit" className="flex-1">Uložit do historie</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline View */}
      {events.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl animate-fade-in">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
            <Icons.History />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Vaše osa je zatím prázdná</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            Začněte psát příběh svého života. Přidejte své narození, první úspěchy nebo budoucí sny.
          </p>
          <Button onClick={() => setIsFormOpen(true)} variant="primary">
            Vytvořit první záznam
          </Button>
        </div>
      ) : (
        <div className="relative animate-fade-in pl-4 sm:pl-0">
          {/* Vertical Line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-slate-800 to-teal-500/50 -translate-x-1/2" />

          <div className="space-y-16">
            {/* Fix: Explicitly cast Object.entries result to fix 'Property map does not exist on type unknown' error */}
            {(Object.entries(groupedEvents) as [string, LifeEvent[]][]).map(([year, yearEvents]) => (
              <div key={year} className="relative">
                {/* Year Badge */}
                <div className="sticky top-24 z-10 flex justify-center mb-10">
                   <div className="bg-slate-950 border border-slate-800 text-slate-400 px-4 py-1 rounded-full text-sm font-black tracking-[0.2em] shadow-xl">
                      {year}
                   </div>
                </div>

                <div className="space-y-12">
                  {yearEvents.map((event, idx) => {
                    const isLeft = idx % 2 === 0;
                    const isMilestone = event.type === 'milestone';
                    const isGoal = event.type === 'goal';
                    
                    return (
                      <div key={event.id} className={`flex flex-col sm:flex-row items-start sm:items-center w-full ${isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                        {/* Empty side for layout on desktop */}
                        <div className="hidden sm:block w-1/2" />
                        
                        {/* Timeline Node */}
                        <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-slate-950 z-20 flex items-center justify-center">
                           <div className={`w-full h-full rounded-full ${isMilestone ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]' : isGoal ? 'bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.6)]' : 'bg-slate-700'}`} />
                        </div>

                        {/* Event Card */}
                        <div className={`w-full sm:w-1/2 pl-10 sm:pl-0 ${isLeft ? 'sm:pr-12' : 'sm:pl-12'} animate-fade-in-up`}>
                          <div className={`group bg-slate-900 border ${isMilestone ? 'border-indigo-500/30 bg-indigo-500/5 shadow-indigo-500/5' : isGoal ? 'border-teal-500/30 border-dashed bg-teal-500/5' : 'border-slate-800'} p-5 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl`}>
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${isMilestone ? 'text-indigo-400' : isGoal ? 'text-teal-400' : 'text-slate-500'}`}>
                                {new Date(event.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' })}
                                {isGoal && ' • CÍL'}
                                {isMilestone && ' • MILNÍK'}
                              </span>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(event)} className="p-1 text-slate-500 hover:text-indigo-400 transition-colors">
                                  <Icons.Pencil />
                                </button>
                                <button onClick={() => handleDelete(event.id)} className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                                  <Icons.Trash />
                                </button>
                              </div>
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2 leading-tight">{event.title}</h4>
                            {event.description && (
                              <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center py-20">
             <div className="inline-block p-1 bg-slate-900 rounded-full">
               <div className="w-2 h-2 rounded-full bg-slate-800"></div>
             </div>
          </div>
        </div>
      )}

      {/* Manual & Privacy Notice */}
      <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-2xl text-slate-500 text-xs leading-relaxed space-y-2">
        <h5 className="font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Icons.Lock /> Vaše soukromí
        </h5>
        <p>Všechna data jsou uložena výhradně ve vašem prohlížeči (LocalStorage). Scrollo.cz neodesílá vaše vzpomínky na žádný server.</p>
        <p>Tip: Pokud vymažete data prohlížeče, vaše historie bude ztracena. Brzy přidáme možnost exportu dat.</p>
      </div>
    </div>
  );
};