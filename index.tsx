
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Icons } from './components/Icons';
import { Button, Card } from './components/Shared';
import { tools, ToolId, ToolCategory } from './tools/registry';

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
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('scrollo_favorites');
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

  const activeTool = tools.find(t => t.id === currentToolId);

  useEffect(() => {
    if (currentToolId) {
      localStorage.setItem('scrollo_last_tool', currentToolId);
    } else {
      localStorage.removeItem('scrollo_last_tool');
    }
  }, [currentToolId]);

  useEffect(() => {
    localStorage.setItem('scrollo_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const sortedTools = [...tools]
    .filter(t => activeCategory === 'Vše' || t.category === activeCategory)
    .sort((a, b) => {
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <header className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-white/5 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            onClick={() => { setCurrentToolId(null); setActiveCategory('Vše'); }} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
              S
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-200 transition-colors">Scrollo.cz</span>
          </div>
          
          {currentToolId && (
             <Button variant="ghost" onClick={() => setCurrentToolId(null)} className="px-2 sm:px-4">
               <Icons.Home /> <span className="hidden sm:inline">Zpět</span>
             </Button>
          )}
        </div>
      </header>

      <main className="pt-20 sm:pt-24 pb-12 px-2 sm:px-4 max-w-6xl mx-auto min-h-[calc(100vh-64px)]">
        
        {!currentToolId && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8 sm:mb-12 space-y-4">
              <h1 className="text-3xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Sada užitečných nástrojů
              </h1>
              <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto px-4">
                Vše co potřebujete pro produktivní práci na jednom místě.
              </p>
            </div>

            {/* Dot Filter System */}
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mb-10 sm:mb-16 px-4">
               {CATEGORIES.map((cat) => {
                 const isActive = activeCategory === cat.label;
                 return (
                   <button
                     key={cat.label}
                     onClick={() => setActiveCategory(cat.label)}
                     className={`
                       relative flex items-center transition-all duration-500 ease-out overflow-hidden
                       ${isActive 
                         ? `px-5 py-2.5 rounded-full ${cat.color} text-white shadow-lg ring-4 ring-white/5` 
                         : 'w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-800 hover:scale-125 hover:bg-slate-700'
                       }
                     `}
                     title={cat.label}
                   >
                     {isActive && (
                       <span className="whitespace-nowrap text-xs sm:text-sm font-black uppercase tracking-widest animate-fade-in">
                         {cat.label}
                       </span>
                     )}
                     {!isActive && (
                        <div className={`absolute inset-0 rounded-full ${cat.color} opacity-40 shadow-[0_0_10px_rgba(255,255,255,0.1)]`} />
                     )}
                   </button>
                 );
               })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortedTools.map((tool) => {
                const isFav = favorites.includes(tool.id);
                return (
                  <div 
                    key={tool.id}
                    onClick={() => setCurrentToolId(tool.id)}
                    className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${tool.color} opacity-10 blur-2xl rounded-bl-full group-hover:opacity-20 transition-opacity`} />
                    
                    <button 
                      onClick={(e) => toggleFavorite(e, tool.id)}
                      className={`absolute top-4 right-4 z-20 p-1.5 rounded-full transition-all duration-200 ${isFav ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-600 hover:text-yellow-400 hover:bg-slate-700'}`}
                      title={isFav ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
                    >
                      {isFav ? <Icons.Star /> : <Icons.StarOutline />}
                    </button>

                    <div className="relative z-10">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        {tool.icon}
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors flex items-center gap-2">
                        {tool.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {sortedTools.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-500">V této kategorii zatím nejsou žádné nástroje.</p>
              </div>
            )}
          </div>
        )}

        {activeTool && (
          <div className="animate-fade-in">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-2 px-1">
               <div>
                 <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                   <span className={`w-2 sm:w-3 h-6 sm:h-8 rounded-full bg-gradient-to-b ${activeTool.color}`} />
                   {activeTool.title}
                   <button 
                      onClick={(e) => toggleFavorite(e, activeTool.id)}
                      className={`ml-1 text-xl transition-colors ${favorites.includes(activeTool.id) ? 'text-yellow-400' : 'text-slate-700 hover:text-yellow-400'}`}
                      title="Oblíbené"
                   >
                      {favorites.includes(activeTool.id) ? <Icons.Star /> : <Icons.StarOutline />}
                   </button>
                 </h2>
               </div>
            </div>
            
            <Card className={`min-h-[400px] p-2 sm:p-6`}>
              <activeTool.component />
            </Card>
          </div>
        )}

      </main>

      <footer className="border-t border-white/5 py-8 text-center text-slate-600 text-sm">
         <p>&copy; {new Date().getFullYear()} Scrollo.cz &bull; Vytvořil Petr Piskáček</p>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

