
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';

type Category = 'Délka' | 'Hmotnost' | 'Plocha' | 'Objem' | 'Teplota';

interface Unit {
  id: string;
  label: string;
  factor: number; // relative to base unit
  offset?: number; // for temperature
}

const CATEGORIES: Record<Category, Unit[]> = {
  'Délka': [
    { id: 'm', label: 'Metry (m)', factor: 1 },
    { id: 'km', label: 'Kilometry (km)', factor: 1000 },
    { id: 'cm', label: 'Centimetry (cm)', factor: 0.01 },
    { id: 'mm', label: 'Milimetry (mm)', factor: 0.001 },
    { id: 'in', label: 'Palce (in)', factor: 0.0254 },
    { id: 'ft', label: 'Stopy (ft)', factor: 0.3048 },
    { id: 'mi', label: 'Míle (mi)', factor: 1609.34 },
  ],
  'Hmotnost': [
    { id: 'kg', label: 'Kilogramy (kg)', factor: 1 },
    { id: 'g', label: 'Gramy (g)', factor: 0.001 },
    { id: 't', label: 'Tuny (t)', factor: 1000 },
    { id: 'lb', label: 'Libry (lb)', factor: 0.453592 },
    { id: 'oz', label: 'Unce (oz)', factor: 0.0283495 },
  ],
  'Plocha': [
    { id: 'm2', label: 'm²', factor: 1 },
    { id: 'km2', label: 'km²', factor: 1000000 },
    { id: 'ha', label: 'Hektary (ha)', factor: 10000 },
    { id: 'ac', label: 'Akry (ac)', factor: 4046.86 },
    { id: 'ft2', label: 'Stopa čtv. (ft²)', factor: 0.092903 },
  ],
  'Objem': [
    { id: 'l', label: 'Litry (l)', factor: 1 },
    { id: 'm3', label: 'm³', factor: 1000 },
    { id: 'ml', label: 'Mililitry (ml)', factor: 0.001 },
    { id: 'gal', label: 'Galony (US)', factor: 3.78541 },
    { id: 'pt', label: 'Pinty (US)', factor: 0.473176 },
  ],
  'Teplota': [
    { id: 'c', label: 'Celsius (°C)', factor: 1, offset: 0 },
    { id: 'f', label: 'Fahrenheit (°F)', factor: 5/9, offset: 32 },
    { id: 'k', label: 'Kelvin (K)', factor: 1, offset: 273.15 },
  ]
};

export const UnitConverterTool = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('Délka');
  const [values, setValues] = useState<Record<string, string>>({});
  const [lastEdited, setLastEdited] = useState<string>('');

  // Inicializace hodnot při změně kategorie
  useEffect(() => {
    const units = CATEGORIES[activeCategory];
    const base = units[0];
    const initial: Record<string, string> = {};
    units.forEach(u => initial[u.id] = u.id === base.id ? '1' : convert(1, base, u));
    setValues(initial);
  }, [activeCategory]);

  const convert = (val: number, from: Unit, to: Unit): string => {
    if (activeCategory === 'Teplota') {
      // Speciální logika pro teplotu (Linear transformation: T_to = (T_from - offset_from) * factor_from / factor_to + offset_to)
      const baseVal = (val - (from.offset || 0)) * (from.factor);
      const res = (baseVal / to.factor) + (to.offset || 0);
      return Number.isInteger(res) ? res.toString() : parseFloat(res.toFixed(4)).toString();
    } else {
      // Standardní převod přes koeficienty
      const baseVal = val * from.factor;
      const res = baseVal / to.factor;
      return Number.isInteger(res) ? res.toString() : parseFloat(res.toFixed(6)).toString();
    }
  };

  const handleInputChange = (id: string, input: string) => {
    setLastEdited(id);
    const newValues = { ...values, [id]: input };
    const num = parseFloat(input);

    if (isNaN(num)) {
      setValues(newValues);
      return;
    }

    const units = CATEGORIES[activeCategory];
    const sourceUnit = units.find(u => u.id === id)!;

    units.forEach(u => {
      if (u.id !== id) {
        newValues[u.id] = convert(num, sourceUnit, u);
      }
    });

    setValues(newValues);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-2 p-1 bg-slate-950/50 rounded-2xl border border-slate-800 w-full sm:w-fit mx-auto">
        {(Object.keys(CATEGORIES) as Category[]).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES[activeCategory].map(unit => (
          <div 
            key={unit.id}
            className={`group bg-slate-900 border p-5 rounded-2xl transition-all duration-300 ${lastEdited === unit.id ? 'border-indigo-500 shadow-lg shadow-indigo-900/20 ring-1 ring-indigo-500/30' : 'border-slate-800 hover:border-slate-700'}`}
          >
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 group-hover:text-indigo-400 transition-colors">
              {unit.label}
            </label>
            <input 
              type="text"
              inputMode="decimal"
              value={values[unit.id] || ''}
              onChange={(e) => handleInputChange(unit.id, e.target.value)}
              className="w-full bg-transparent text-white text-2xl font-mono font-bold focus:outline-none placeholder-slate-800"
              placeholder="0"
            />
          </div>
        ))}
      </div>

      <div className="bg-indigo-900/10 border border-indigo-500/10 p-6 rounded-3xl text-center flex flex-col sm:flex-row items-center justify-center gap-4">
         <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl flex-shrink-0">
            <Icons.Ruler />
         </div>
         <div className="text-left">
            <h4 className="text-white font-bold text-sm">Chytré převody</h4>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg mt-1">
              Stačí změnit libovolné pole. Ostatní jednotky se automaticky aktualizují. Převody délky i teploty počítají s vysokou přesností na 4-6 desetinných míst.
            </p>
         </div>
      </div>
    </div>
  );
};
