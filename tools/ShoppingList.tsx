
import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '../components/Icons';
import { Button, Modal } from '../components/Shared';

interface ShoppingItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export const ShoppingListTool = () => {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem('scrollo_shopping_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inputText, setInputText] = useState('');
  const [clearMode, setClearMode] = useState<'completed' | 'all' | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('scrollo_shopping_list', JSON.stringify(items));
  }, [items]);

  const handleAddItem = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      text: inputText.trim(),
      completed: false,
      createdAt: Date.now()
    };

    setItems(prev => [newItem, ...prev]);
    setInputText('');
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const confirmClear = () => {
    if (clearMode === 'completed') {
      setItems(prev => prev.filter(item => !item.completed));
    } else if (clearMode === 'all') {
      setItems([]);
    }
    setClearMode(null);
  };

  // Stats & Sorting
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.completed === b.completed) {
        return b.createdAt - a.createdAt;
      }
      return a.completed ? 1 : -1;
    });
  }, [items]);

  const progress = useMemo(() => {
    if (items.length === 0) return 0;
    const completedCount = items.filter(i => i.completed).length;
    return Math.round((completedCount / items.length) * 100);
  }, [items]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Confirmation Modal */}
      <Modal 
        isOpen={!!clearMode} 
        onClose={() => setClearMode(null)} 
        title={clearMode === 'all' ? "Vymazat celý seznam" : "Odstranit nakoupené"}
        variant="danger"
        footer={
          <>
            <Button variant="secondary" onClick={() => setClearMode(null)}>Zrušit</Button>
            <Button variant="danger" onClick={confirmClear}>Potvrdit</Button>
          </>
        }
      >
        {clearMode === 'all' 
          ? "Opravdu chcete smazat úplně všechny položky z nákupního seznamu?" 
          : "Přejete si odstranit všechny položky, které již máte označené jako nakoupené?"}
      </Modal>

      {/* Header & Input */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Icons.ShoppingCart /> Co je třeba nakoupit?
        </h3>
        
        <form onSubmit={handleAddItem} className="flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Mléko, chleba, ovoce..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
          />
          <Button type="submit" disabled={!inputText.trim()} className="bg-indigo-600 hover:bg-indigo-500">
            <Icons.Plus /> Přidat
          </Button>
        </form>

        {items.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Postup nákupu</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {items.length > 0 && (
        <div className="flex justify-between items-center px-2">
          <span className="text-sm text-slate-500 font-medium">
            {items.length} {items.length === 1 ? 'položka' : (items.length < 5 ? 'položky' : 'položek')}
          </span>
          <div className="flex gap-4">
            <button 
              onClick={() => setClearMode('completed')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-all uppercase tracking-widest disabled:opacity-30"
              disabled={!items.some(i => i.completed)}
            >
              Smazat koupené
            </button>
            <button 
              onClick={() => setClearMode('all')}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-all uppercase tracking-widest"
            >
              Vymazat vše
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3 animate-fade-in">
        {items.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
              <Icons.ShoppingCart />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Seznam je prázdný</h3>
            <p className="text-slate-500 text-sm">Váš nákupní lístek čeká na první položku.</p>
          </div>
        ) : (
          sortedItems.map(item => (
            <div 
              key={item.id}
              className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                item.completed 
                  ? 'bg-slate-900/40 border-slate-800/50 opacity-60' 
                  : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/50 shadow-lg'
              }`}
              onClick={() => toggleItem(item.id)}
            >
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                item.completed 
                  ? 'bg-emerald-600 border-emerald-600 text-white' 
                  : 'border-slate-600 group-hover:border-indigo-500'
              }`}>
                {item.completed && <Icons.Check />}
              </div>
              
              <span className={`flex-1 text-lg font-medium transition-all ${
                item.completed ? 'text-slate-500 line-through' : 'text-slate-200'
              }`}>
                {item.text}
              </span>

              <button 
                onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                className="p-2 text-slate-600 hover:text-rose-400 transition-colors sm:opacity-0 group-hover:opacity-100"
              >
                <Icons.Trash />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
