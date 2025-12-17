
import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

type DebtType = 'owe' | 'owed';

interface Debt {
  id: string;
  type: DebtType;
  person: string;
  amount: number;
  date: string;
  description: string;
  createdAt: number;
}

export const DebtListTool = () => {
  const [debts, setDebts] = useState<Debt[]>(() => {
    try {
      const saved = localStorage.getItem('scrollo_debt_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<DebtType>('owe');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    person: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('scrollo_debt_list', JSON.stringify(debts));
  }, [debts]);

  const totals = useMemo(() => {
    const oweTotal = debts.filter(d => d.type === 'owe').reduce((acc, d) => acc + d.amount, 0);
    const owedTotal = debts.filter(d => d.type === 'owed').reduce((acc, d) => acc + d.amount, 0);
    return { oweTotal, owedTotal };
  }, [debts]);

  const filteredDebts = useMemo(() => {
    return debts
      .filter(d => d.type === activeTab)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [debts, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.person || !formData.amount) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) return;

    if (editingId) {
      setDebts(prev => prev.map(d => d.id === editingId ? { ...d, ...formData, amount } : d));
    } else {
      const newDebt: Debt = {
        id: crypto.randomUUID(),
        type: activeTab,
        person: formData.person,
        amount,
        date: formData.date,
        description: formData.description,
        createdAt: Date.now()
      };
      setDebts(prev => [...prev, newDebt]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      person: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (debt: Debt) => {
    setFormData({
      person: debt.person,
      amount: debt.amount.toString(),
      date: debt.date,
      description: debt.description
    });
    setEditingId(debt.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Opravdu chcete tento záznam smazat?')) {
      setDebts(prev => prev.filter(d => d.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`p-6 rounded-2xl border transition-all ${activeTab === 'owe' ? 'bg-rose-900/10 border-rose-500/50 shadow-lg shadow-rose-900/20' : 'bg-slate-900 border-slate-800 opacity-60'}`} onClick={() => setActiveTab('owe')}>
           <div className="flex justify-between items-center mb-1">
             <div className="text-xs font-bold uppercase tracking-wider text-rose-400">Dlužím celkem</div>
             <div className="text-rose-500/50"><Icons.Receipt /></div>
           </div>
           <div className="text-3xl font-black text-white">{totals.oweTotal.toLocaleString('cs-CZ')} Kč</div>
        </div>

        <div className={`p-6 rounded-2xl border transition-all ${activeTab === 'owed' ? 'bg-emerald-900/10 border-emerald-500/50 shadow-lg shadow-emerald-900/20' : 'bg-slate-900 border-slate-800 opacity-60'}`} onClick={() => setActiveTab('owed')}>
           <div className="flex justify-between items-center mb-1">
             <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Dluží mi celkem</div>
             <div className="text-emerald-500/50"><Icons.Receipt /></div>
           </div>
           <div className="text-3xl font-black text-white">{totals.owedTotal.toLocaleString('cs-CZ')} Kč</div>
        </div>
      </div>

      {/* Tabs & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-950/50 p-2 rounded-2xl border border-slate-800">
         <div className="flex gap-2 w-full sm:w-auto">
            <button 
               onClick={() => setActiveTab('owe')}
               className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'owe' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
               Dlužím
            </button>
            <button 
               onClick={() => setActiveTab('owed')}
               className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'owed' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
               Dluží mi
            </button>
         </div>
         <Button onClick={() => setIsFormOpen(true)} className={`w-full sm:w-auto ${activeTab === 'owe' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
            <Icons.Plus /> Přidat záznam
         </Button>
      </div>

      {/* Form Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative">
            <button onClick={resetForm} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <Icons.Trash />
            </button>
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingId ? 'Upravit záznam' : activeTab === 'owe' ? 'Komu dlužím?' : 'Kdo mi dluží?'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Osoba / Firma</label>
                <input 
                  type="text" 
                  value={formData.person}
                  onChange={e => setFormData(prev => ({...prev, person: e.target.value}))}
                  placeholder="Např. Petr, Banka, Alza..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Částka (Kč)</label>
                  <input 
                    type="number" 
                    value={formData.amount}
                    onChange={e => setFormData(prev => ({...prev, amount: e.target.value}))}
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Datum</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData(prev => ({...prev, date: e.target.value}))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Popis (nepovinné)</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Za co to bylo..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors h-24 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="ghost" onClick={resetForm} className="flex-1">Zrušit</Button>
                <Button type="submit" className={`flex-1 ${activeTab === 'owe' ? 'bg-rose-600' : 'bg-emerald-600'}`}>Uložit</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List View */}
      {filteredDebts.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl animate-fade-in">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
            <Icons.Receipt />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Žádné záznamy v této sekci</h3>
          <p className="text-slate-500 text-sm mb-6">Přidejte svůj první dluh nebo pohledávku.</p>
          <Button onClick={() => setIsFormOpen(true)} variant="secondary">
            Vytvořit záznam
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 animate-fade-in">
           {filteredDebts.map((debt) => (
             <div key={debt.id} className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-bold text-white truncate">{debt.person}</h4>
                      <span className="text-[10px] bg-slate-950 text-slate-500 px-2 py-0.5 rounded border border-slate-800 font-mono">
                         {new Date(debt.date).toLocaleDateString('cs-CZ')}
                      </span>
                   </div>
                   {debt.description && (
                     <p className="text-slate-400 text-sm line-clamp-1">{debt.description}</p>
                   )}
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-800 pt-4 sm:pt-0">
                   <div className="text-right">
                      <div className={`text-2xl font-black ${activeTab === 'owe' ? 'text-rose-400' : 'text-emerald-400'}`}>
                         {debt.amount.toLocaleString('cs-CZ')} Kč
                      </div>
                   </div>
                   
                   <div className="flex gap-1">
                      <button onClick={() => handleEdit(debt)} className="p-2 text-slate-500 hover:text-indigo-400 transition-colors bg-slate-950 rounded-lg border border-slate-800">
                         <Icons.Pencil />
                      </button>
                      <button onClick={() => handleDelete(debt.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors bg-slate-950 rounded-lg border border-slate-800">
                         <Icons.Trash />
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Privacy Notice */}
      <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl text-slate-500 text-xs text-center">
         🔒 Všechna data o dluzích jsou uložena pouze ve vašem prohlížeči. Nikdo jiný k nim nemá přístup.
      </div>
    </div>
  );
};
