import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

interface Pizza {
  id: number;
  name: string;
  diameter: string;
  price: string;
  delivery: string;
  includeDelivery: boolean;
  // Calculated properties
  area?: number;
  totalPrice?: number;
  pricePerM2?: number;
}

interface FavoritePizza {
  name: string;
  diameter: string;
  price: string;
  delivery: string;
}

export const PizzaCalculatorTool = () => {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [favorites, setFavorites] = useState<FavoritePizza[]>([]);
  const [counter, setCounter] = useState(0);

  // Load favorites on mount
  useEffect(() => {
    const saved = localStorage.getItem('scrollo_pizza_favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
    // Add first pizza automatically
    addPizza();
  }, []);

  const addPizza = () => {
    if (pizzas.length >= 4) return;
    const newId = counter + 1;
    setCounter(newId);
    setPizzas(prev => [...prev, {
      id: newId,
      name: '',
      diameter: '',
      price: '',
      delivery: '',
      includeDelivery: false
    }]);
  };

  const removePizza = (id: number) => {
    setPizzas(prev => prev.filter(p => p.id !== id));
  };

  const updatePizza = (id: number, field: keyof Pizza, value: any) => {
    setPizzas(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, [field]: value };
      
      // Calculate
      const d = parseFloat(updated.diameter) || 0;
      const pr = parseFloat(updated.price) || 0;
      const del = parseFloat(updated.delivery) || 0;
      
      if (d > 0) {
        const radius = d / 2;
        const area = Math.PI * radius * radius / 10000; // m2
        const total = updated.includeDelivery ? pr + del : pr;
        
        updated.area = area;
        updated.totalPrice = total;
        updated.pricePerM2 = area > 0 ? total / area : 0;
      } else {
        updated.area = undefined;
        updated.totalPrice = undefined;
        updated.pricePerM2 = undefined;
      }
      
      return updated;
    }));
  };

  const toggleFavorite = (pizza: Pizza) => {
    if (!pizza.name) return;
    
    const exists = favorites.some(f => f.name === pizza.name);
    let newFavs;
    
    if (exists) {
      newFavs = favorites.filter(f => f.name !== pizza.name);
    } else {
      newFavs = [...favorites, {
        name: pizza.name,
        diameter: pizza.diameter,
        price: pizza.price,
        delivery: pizza.delivery
      }];
    }
    
    setFavorites(newFavs);
    localStorage.setItem('scrollo_pizza_favorites', JSON.stringify(newFavs));
  };

  const removeFavorite = (name: string) => {
    const newFavs = favorites.filter(f => f.name !== name);
    setFavorites(newFavs);
    localStorage.setItem('scrollo_pizza_favorites', JSON.stringify(newFavs));
  };

  const loadFavorite = (fav: FavoritePizza) => {
    if (pizzas.length >= 4) return;
    const newId = counter + 1;
    setCounter(newId);
    
    const d = parseFloat(fav.diameter) || 0;
    const pr = parseFloat(fav.price) || 0;
    const del = parseFloat(fav.delivery) || 0;
    
    const radius = d / 2;
    const area = Math.PI * radius * radius / 10000;
    const total = pr; // Default no delivery included initially
    
    setPizzas(prev => [...prev, {
      id: newId,
      name: fav.name,
      diameter: fav.diameter,
      price: fav.price,
      delivery: fav.delivery,
      includeDelivery: false,
      area,
      totalPrice: total,
      pricePerM2: area > 0 ? total / area : 0
    }]);
  };

  // Stats calculation
  const validPizzas = pizzas.filter(p => p.area && p.pricePerM2);
  let bestPizzaId: number | null = null;
  let worstPizzaId: number | null = null;
  let largestPizzaId: number | null = null;

  if (validPizzas.length > 1) {
    bestPizzaId = validPizzas.reduce((min, p) => (p.pricePerM2! < min.pricePerM2!) ? p : min).id;
    worstPizzaId = validPizzas.reduce((max, p) => (p.pricePerM2! > max.pricePerM2!) ? p : max).id;
    largestPizzaId = validPizzas.reduce((max, p) => (p.area! > max.area!) ? p : max).id;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Sidebar: Favorites */}
      <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Icons.Star /> Oblíbené pizzy
          </h3>
          
          {favorites.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Zatím nemáte žádné oblíbené pizzy. <br/>
              Přidejte je pomocí hvězdičky na kartě pizzy.
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((fav, i) => (
                <div 
                  key={i} 
                  onClick={() => loadFavorite(fav)}
                  className="bg-slate-900 border border-slate-800 p-3 rounded-lg hover:border-yellow-500/50 cursor-pointer group transition-all flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-white group-hover:text-yellow-400 transition-colors">{fav.name}</div>
                    <div className="text-xs text-slate-400">{fav.diameter} cm • {fav.price} Kč</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFavorite(fav.name); }}
                    className="w-6 h-6 rounded-full hover:bg-red-900/50 text-slate-600 hover:text-red-400 flex items-center justify-center transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {validPizzas.length > 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg animate-fade-in">
             <h3 className="text-lg font-bold text-white mb-4">🏆 Výsledek porovnání</h3>
             
             <div className="space-y-4">
               <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                 <div className="text-xs text-green-400 uppercase font-bold mb-1">Nejlepší cena / výkon</div>
                 <div className="text-xl font-bold text-white">{validPizzas.find(p => p.id === bestPizzaId)?.name || `Pizza ${validPizzas.find(p => p.id === bestPizzaId)?.id}`}</div>
                 <div className="text-sm text-green-300 font-mono">
                    {validPizzas.find(p => p.id === bestPizzaId)?.pricePerM2?.toFixed(0)} Kč/m²
                 </div>
               </div>

               <div className="p-3 bg-red-900/10 border border-red-500/20 rounded-lg opacity-80">
                 <div className="text-xs text-red-400 uppercase font-bold mb-1">Nejdražší na plochu</div>
                 <div className="text-base font-bold text-white">{validPizzas.find(p => p.id === worstPizzaId)?.name || `Pizza ${validPizzas.find(p => p.id === worstPizzaId)?.id}`}</div>
               </div>

               <div className="p-3 bg-indigo-900/10 border border-indigo-500/20 rounded-lg opacity-80">
                 <div className="text-xs text-indigo-400 uppercase font-bold mb-1">Největší pizza</div>
                 <div className="text-base font-bold text-white">
                   {validPizzas.find(p => p.id === largestPizzaId)?.name || `Pizza ${validPizzas.find(p => p.id === largestPizzaId)?.id}`}
                   <span className="text-slate-400 font-normal ml-2">({validPizzas.find(p => p.id === largestPizzaId)?.area?.toFixed(3)} m²)</span>
                 </div>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Main Area: Pizza Cards */}
      <div className="lg:col-span-2 order-1 lg:order-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pizzas.map((pizza) => {
            const isBest = pizza.id === bestPizzaId;
            const isWorst = pizza.id === worstPizzaId;
            const isFavorite = favorites.some(f => f.name === pizza.name && pizza.name);

            return (
              <div 
                key={pizza.id} 
                className={`bg-slate-900 border rounded-2xl p-5 relative transition-all duration-300 ${isBest ? 'border-green-500 shadow-lg shadow-green-900/20 ring-1 ring-green-500/50' : isWorst ? 'border-red-900/50 shadow-none' : 'border-slate-800'}`}
              >
                {isBest && <div className="absolute -top-3 right-4 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">✨ Nejlepší volba</div>}
                
                <div className="flex justify-between items-start mb-4">
                  <div className="text-slate-500 font-bold text-xs uppercase tracking-wider">Pizza #{pizza.id}</div>
                  <div className="flex gap-2">
                     {pizza.name && pizza.diameter && pizza.price && (
                       <button onClick={() => toggleFavorite(pizza)} className={`transition-colors ${isFavorite ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-400'}`}>
                         {isFavorite ? <Icons.Star /> : <Icons.StarOutline />}
                       </button>
                     )}
                     {pizzas.length > 1 && (
                       <button onClick={() => removePizza(pizza.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                         <Icons.Trash />
                       </button>
                     )}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Název</label>
                    <input 
                      type="text" 
                      value={pizza.name}
                      onChange={(e) => updatePizza(pizza.id, 'name', e.target.value)}
                      placeholder="Margherita"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Průměr (cm)</label>
                      <input 
                        type="number" 
                        value={pizza.diameter}
                        onChange={(e) => updatePizza(pizza.id, 'diameter', e.target.value)}
                        placeholder="32"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Cena (Kč)</label>
                      <input 
                        type="number" 
                        value={pizza.price}
                        onChange={(e) => updatePizza(pizza.id, 'price', e.target.value)}
                        placeholder="180"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 items-end">
                     <div className="flex-1">
                        <label className="text-xs text-slate-400 block mb-1">Rozvoz (Kč)</label>
                        <input 
                          type="number" 
                          value={pizza.delivery}
                          onChange={(e) => updatePizza(pizza.id, 'delivery', e.target.value)}
                          placeholder="0"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                        />
                     </div>
                     <label className="flex items-center gap-2 cursor-pointer bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 h-[42px] hover:border-slate-500 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={pizza.includeDelivery} 
                          onChange={(e) => updatePizza(pizza.id, 'includeDelivery', e.target.checked)} 
                          className="accent-indigo-500"
                        />
                        <span className="text-xs text-slate-300 select-none">Započítat</span>
                     </label>
                  </div>
                </div>

                {pizza.area ? (
                  <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Plocha</div>
                      <div className="text-sm font-bold text-slate-300">{pizza.area.toFixed(3)} m²</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Celkem</div>
                      <div className="text-sm font-bold text-white">{pizza.totalPrice?.toFixed(0)} Kč</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Cena/m²</div>
                      <div className={`text-sm font-bold ${isBest ? 'text-green-400' : 'text-indigo-400'}`}>
                        {pizza.pricePerM2?.toFixed(0)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-600">
                    Zadejte průměr a cenu pro výpočet
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button 
          onClick={addPizza} 
          disabled={pizzas.length >= 4}
          className="w-full py-4 text-lg border-2 border-dashed border-slate-700 bg-transparent hover:bg-slate-800 hover:border-indigo-500 text-slate-400 hover:text-white"
        >
          {pizzas.length >= 4 ? 'Maximální počet pizz dosažen (4)' : <><Icons.Plus /> Přidat další pizzu</>}
        </Button>
      </div>
    </div>
  );
};