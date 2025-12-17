import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Icons } from './components/Icons';
import { Button, Card } from './components/Shared';
import { tools, ToolId } from './tools/registry';

const App = () => {
  // Load favorites from localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('scrollo_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load last active tool from localStorage
  const [currentToolId, setCurrentToolId] = useState<ToolId | null>(() => {
    try {
      const last = localStorage.getItem('scrollo_last_tool');
      // Validate if the tool still exists in registry
      return last && tools.some(t => t.id === last) ? (last as ToolId) : null;
    } catch {
      return null;
    }
  });

  const activeTool = tools.find(t => t.id === currentToolId);

  // Persistence effects
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

  // Sort tools: Favorites first
  const sortedTools = [...tools].sort((a, b) => {
    const aFav = favorites.includes(a.id);
    const bFav = favorites.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-white/5 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            onClick={() => setCurrentToolId(null)} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
              S
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-200 transition-colors">Scrollo.cz</span>
          </div>
          
          {currentToolId && (
             <Button variant="ghost" onClick={() => setCurrentToolId(null)}>
               <Icons.Home /> <span className="hidden sm:inline">Zpět na přehled</span>
             </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 max-w-6xl mx-auto min-h-[calc(100vh-64px)]">
        
        {/* Dashboard View */}
        {!currentToolId && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-16 space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Sada užitečných nástrojů
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Vše co potřebujete pro produktivní práci na jednom místě.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>
        )}

        {/* Tool View */}
        {activeTool && (
          <div className="animate-fade-in">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                 <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                   <span className={`w-3 h-8 rounded-full bg-gradient-to-b ${activeTool.color}`} />
                   {activeTool.title}
                   <button 
                      onClick={(e) => toggleFavorite(e, activeTool.id)}
                      className={`ml-2 text-2xl transition-colors ${favorites.includes(activeTool.id) ? 'text-yellow-400' : 'text-slate-700 hover:text-yellow-400'}`}
                      title="Oblíbené"
                   >
                      {favorites.includes(activeTool.id) ? <Icons.Star /> : <Icons.StarOutline />}
                   </button>
                 </h2>
                 <p className="text-slate-400 mt-2 ml-6">{activeTool.description}</p>
               </div>
            </div>
            
            <Card className={`min-h-[400px] ${activeTool.id === 'qr-code' ? 'p-6' : 'p-6'}`}>
              <activeTool.component />
            </Card>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-slate-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Scrollo.cz &bull; Vytvořeno s Gemini API</p>
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