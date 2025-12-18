
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Icons } from './components/Icons';
import { Button, Card } from './components/Shared';
import { tools, ToolId, ToolCategory, ToolConfig } from './tools/registry';

const CATEGORIES: { label: ToolCategory; color: string; bg: string }[] = [
  { label: 'Vše', color: 'bg-slate-500', bg: 'bg-slate-500/10' },
  { label: 'Grafika', color: 'bg-cyan-500', bg: 'bg-cyan-500/10' },
  { label: 'Text', color: 'bg-amber-500', bg: 'bg-amber-500/10' },
  { label: 'Produktivita', color: 'bg-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Hudba', color: 'bg-pink-500', bg: 'bg-pink-500/10' },
  { label: 'Finance', color: 'bg-indigo-500', bg: 'bg-indigo-500/10' },
  { label: 'Ostatní', color: 'bg-purple-500', bg: 'bg-purple-500/10' },
];

const App = () => {
  // --- STATE & PERSISTENCE ---
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('scrollo_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [pinnedOrder, setPinnedOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('scrollo_pinned_order');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentToolId, setCurrentToolId] = useState<ToolId | null>(() => {
    try {
      const last = localStorage.getItem('scrollo_last_tool');
      return last && tools.some(t => t.id === last) ? (last as ToolId) : null;
    } catch {
      return null;
    }
  });

  const [activeCategory, setActiveCategory] = useState<ToolCategory>('Vše');
  const [isSyncing, setIsSyncing] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const activeTool = tools.find(t => t.id === currentToolId);

  // --- EFFECTS ---
  useEffect(() => {
    if (currentToolId) {
      localStorage.setItem('scrollo_last_tool', currentToolId);
    } else {
      localStorage.removeItem('scrollo_last_tool');
    }
  }, [currentToolId]);

  useEffect(() => {
    localStorage.setItem('scrollo_favorites', JSON.stringify(favorites));
    // Sync pinned order with favorites (add new ones to the end)
    setPinnedOrder(prev => {
      const newPinned = favorites.filter(f => !prev.includes(f));
      const filteredPrev = prev.filter(p => favorites.includes(p));
      return [...filteredPrev, ...newPinned];
    });
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('scrollo_pinned_order', JSON.stringify(pinnedOrder));
  }, [pinnedOrder]);

  // --- HANDLERS ---
  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleCategoryChange = (cat: ToolCategory) => {
    if (cat === activeCategory) return;
    setIsSyncing(true);
    setTimeout(() => {
      setActiveCategory(cat);
      setIsSyncing(false);
    }, 250);
  };

  const handleSortPinned = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const _order = [...pinnedOrder];
    const draggedItemContent = _order.splice(dragItem.current, 1)[0];
    _order.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setPinnedOrder(_order);
  };

  const sortedTools = useMemo(() => {
    return [...tools]
      .filter(t => activeCategory === 'Vše' || t.category === activeCategory)
      .sort((a, b) => {
        const aFav = favorites.includes(a.id);
        const bFav = favorites.includes(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return 0;
      });
  }, [activeCategory, favorites]);

  const pinnedTools = useMemo(() => {
    return pinnedOrder
      .map(id => tools.find(t => t.id === id))
      .filter((t): t is ToolConfig => !!t);
  }, [pinnedOrder]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 pb-20">
      <header className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-white/5 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            onClick={() => { setCurrentToolId(null); handleCategoryChange('Vše'); }} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
              S
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-200 transition-colors">Scrollo.cz</span>
          </div>
          
          <div className="flex items-center gap-2">
            {currentToolId && (
               <Button variant="ghost" onClick={() => setCurrentToolId(null)} className="px-2 sm:px-4 h-10">
                 <Icons.Home /> <span className="hidden sm:inline">Zpět</span>
               </Button>
            )}
          </div>
        </div>
      </header>

      {/* QUICK ACCESS DRAGGABLE TOOLBAR */}
      {favorites.length > 0 && (
        <div className="fixed top-16 left-0 w-full z-40 bg-slate-950/40 backdrop-blur-sm border-b border-white/5 animate-fade-in">
          <div className="max-w-6xl mx-auto px-4 py-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 min-w-max">
              <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mr-2 flex items-center gap-1">
                 <Icons.Star />
              </div>
              {pinnedTools.map((tool, index) => (
                <div
                  key={tool.id}
                  draggable
                  onDragStart={() => (dragItem.current = index)}
                  onDragEnter={() => (dragOverItem.current = index)}
                  onDragEnd={handleSortPinned}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => setCurrentToolId(tool.id)}
                  className={`
                    group relative flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer transition-all duration-300
                    ${currentToolId === tool.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-white/5'}
                    ${dragItem.current === index ? 'opacity-20 scale-90' : 'opacity-100'}
                  `}
                  title={tool.title}
                >
                  <div className="scale-75">{tool.icon}</div>
                  {/* Tooltip on hover */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {tool.title}
                  </div>
                </div>
              ))}
              <div className="text-[9px] font-black text-slate-700 ml-4 uppercase tracking-[0.2em] hidden sm:block">
                 Chytni a srovnej
              </div>
            </div>
          </div>
        </div>
      )}

      <main className={`${favorites.length > 0 ? 'pt-28 sm:pt-32' : 'pt-20 sm:pt-24'} pb-12 px-2 sm:px-4 max-w-6xl mx-auto min-h-[calc(100vh-64px)]`}>
        
        {!currentToolId && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-10 sm:mb-14 space-y-4">
              <h1 className="text-3xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Sada užitečných nástrojů
              </h1>
              <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto px-4">
                Vše co potřebujete pro produktivní práci na jednom místě.
              </p>
            </div>

            {/* Liquid Pill Filter System */}
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mb-14 sm:mb-24 px-4 min-h-[40px] sm:min-h-[48px]">
               {CATEGORIES.map((cat) => {
                 const isActive = activeCategory === cat.label;
                 return (
                   <button
                     key={cat.label}
                     onClick={() => handleCategoryChange(cat.label)}
                     className={`
                       group relative flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] overflow-hidden
                       ${isActive 
                         ? `w-auto px-5 sm:px-8 h-9 sm:h-12 rounded-full ${cat.color} text-white shadow-2xl ring-2 sm:ring-4 ring-white/10 sm:scale-105` 
                         : 'w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-900 hover:bg-slate-800 hover:scale-125'
                       }
                     `}
                     title={cat.label}
                   >
                     <span className={`
                        whitespace-nowrap text-[10px] sm:text-sm font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] transition-all duration-500
                        ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none w-0 overflow-hidden'}
                     `}>
                        {cat.label}
                     </span>
                     {!isActive && (
                        <div className={`absolute inset-0 rounded-full ${cat.color} opacity-20 blur-[1px] group-hover:opacity-60 transition-opacity`} />
                     )}
                   </button>
                 );
               })}
            </div>

            {/* Grid with stable plane transition */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${isSyncing ? 'opacity-0 blur-lg scale-[0.97] -translate-y-2' : 'opacity-100 blur-0 scale-100 translate-y-0'}`}>
              {sortedTools.map((tool, index) => {
                const isFav = favorites.includes(tool.id);
                return (
                  <div 
                    key={tool.id}
                    onClick={() => setCurrentToolId(tool.id)}
                    className="group relative bg-slate-900/80 border border-slate-800 rounded-3xl p-7 hover:border-indigo-500/40 hover:bg-slate-800/80 transition-all duration-500 cursor-pointer overflow-hidden animate-staggered-fade shadow-sm hover:shadow-2xl hover:-translate-y-1"
                    style={{ animationDelay: `${index * 45}ms` }}
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tool.color} opacity-5 blur-3xl rounded-bl-full group-hover:opacity-15 transition-opacity duration-700`} />
                    
                    <button 
                      onClick={(e) => toggleFavorite(e, tool.id)}
                      className={`absolute top-6 right-6 z-20 p-2 rounded-full transition-all duration-300 ${isFav ? 'text-yellow-400 bg-yellow-400/10 scale-110' : 'text-slate-700 hover:text-yellow-400 hover:bg-slate-700'}`}
                    >
                      {isFav ? <Icons.Star /> : <Icons.StarOutline />}
                    </button>

                    <div className="relative z-10">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-xl mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                        {tool.icon}
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-200 transition-colors flex items-center gap-2">
                        {tool.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed opacity-80 group-hover:opacity-100">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {sortedTools.length === 0 && !isSyncing && (
              <div className="text-center py-32 animate-fade-in">
                <p className="text-slate-600 font-medium italic">V této kategorii zatím nejsou žádné nástroje.</p>
              </div>
            )}
          </div>
        )}

        {activeTool && (
          <div className="animate-fade-in-up">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
               <div>
                 <h2 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-4">
                   <span className={`w-2.5 h-10 rounded-full bg-gradient-to-b ${activeTool.color}`} />
                   {activeTool.title}
                   <button 
                      onClick={(e) => toggleFavorite(e, activeTool.id)}
                      className={`ml-1 text-2xl transition-all hover:scale-110 ${favorites.includes(activeTool.id) ? 'text-yellow-400' : 'text-slate-800 hover:text-yellow-400'}`}
                   >
                      {favorites.includes(activeTool.id) ? <Icons.Star /> : <Icons.StarOutline />}
                   </button>
                 </h2>
               </div>
            </div>
            
            <Card className={`min-h-[500px] p-4 sm:p-10 shadow-2xl ring-1 ring-white/5`}>
              <activeTool.component />
            </Card>
          </div>
        )}

      </main>

      <footer className="border-t border-white/5 py-12 text-center text-slate-700 text-sm">
         <p>&copy; {new Date().getFullYear()} Scrollo.cz &bull; S úctou k detailu Petr Piskáček</p>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes staggeredFade {
          from { opacity: 0; transform: scale(0.9) translateY(40px) rotateX(10deg); filter: blur(10px); }
          to { opacity: 1; transform: scale(1) translateY(0) rotateX(0); filter: blur(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .animate-staggered-fade { animation: staggeredFade 0.75s cubic-bezier(0.19, 1, 0.22, 1) both; }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        html { scroll-behavior: smooth; }
        body { -webkit-font-smoothing: antialiased; }
      `}</style>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
