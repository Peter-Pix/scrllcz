
import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type FilterType = 'all' | 'active' | 'completed';

export const TodoListTool = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const saved = localStorage.getItem('scrollo_todo_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  // Persistence
  useEffect(() => {
    localStorage.setItem('scrollo_todo_list', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputText.trim(),
      completed: false,
      createdAt: Date.now()
    };

    setTodos(prev => [newTodo, ...prev]);
    setInputText('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const clearCompleted = () => {
    if (window.confirm('Odstranit všechny hotové úkoly?')) {
      setTodos(prev => prev.filter(todo => !todo.completed));
    }
  };

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active': return todos.filter(t => !t.completed);
      case 'completed': return todos.filter(t => t.completed);
      default: return todos;
    }
  }, [todos, filter]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, progress };
  }, [todos]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Input Section */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Icons.ClipboardList /> Moje úkoly
          </h3>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
            {stats.active} zbývá
          </div>
        </div>
        
        <form onSubmit={addTodo} className="flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Co je třeba udělat?"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all placeholder-slate-600 shadow-inner"
            autoFocus
          />
          <Button type="submit" disabled={!inputText.trim()} className="bg-indigo-600 hover:bg-indigo-500 px-6">
            <Icons.Plus />
          </Button>
        </form>

        {todos.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <span>Produktivita</span>
              <span>{stats.progress}% hotovo</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-700 ease-out"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {todos.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
          <div className="flex gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {f === 'all' ? 'Vše' : f === 'active' ? 'Aktivní' : 'Hotové'}
              </button>
            ))}
          </div>
          
          <button 
            onClick={clearCompleted}
            disabled={stats.completed === 0}
            className="text-[10px] font-bold text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest disabled:opacity-0 px-4"
          >
            Smazat hotové
          </button>
        </div>
      )}

      {/* List */}
      <div className="space-y-2 animate-fade-in">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/10 border-2 border-dashed border-slate-800/50 rounded-3xl">
            <div className="w-16 h-16 bg-slate-800/30 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-700">
              <Icons.ClipboardList />
            </div>
            <h3 className="text-lg font-bold text-slate-400 mb-1">Žádné úkoly</h3>
            <p className="text-slate-600 text-sm">V tomto filtru nic není. Užijte si volno!</p>
          </div>
        ) : (
          filteredTodos.map(todo => (
            <div 
              key={todo.id}
              className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                todo.completed 
                  ? 'bg-slate-900/30 border-slate-800/50 opacity-50' 
                  : 'bg-slate-900 border-slate-800 hover:border-indigo-500/30 hover:bg-slate-800/50 shadow-lg'
              }`}
              onClick={() => toggleTodo(todo.id)}
            >
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                todo.completed 
                  ? 'bg-emerald-500 border-emerald-500 text-white rotate-0' 
                  : 'border-slate-700 group-hover:border-indigo-500 -rotate-12 group-hover:rotate-0'
              }`}>
                {todo.completed && <Icons.Check />}
              </div>
              
              <span className={`flex-1 text-base font-medium transition-all duration-300 ${
                todo.completed ? 'text-slate-500 line-through' : 'text-slate-200'
              }`}>
                {todo.text}
              </span>

              <button 
                onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
                className="p-2 text-slate-700 hover:text-rose-400 transition-colors sm:opacity-0 group-hover:opacity-100"
                title="Odstranit"
              >
                <Icons.Trash />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="bg-slate-900/20 border border-slate-800/50 p-4 rounded-2xl text-slate-600 text-[10px] uppercase font-bold tracking-[0.2em] text-center">
        ⚡ Úkoly jsou uloženy pouze ve vašem prohlížeči.
      </div>
    </div>
  );
};
