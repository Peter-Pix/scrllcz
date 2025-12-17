import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { Button, useCopyFeedback } from '../components/Shared';

interface AresAddress {
  textovaAdresa?: string;
  nazevUlice?: string;
  nazevObce?: string;
  cisloDomovni?: number;
  cisloOrientacni?: number;
  cisloOrientacniPismeno?: string;
  psc?: number;
  nazevCastiObce?: string;
  stat?: string;
}

interface CompanyData {
  ico: string;
  dic?: string;
  name: string;
  address: string;
  dateCreated?: string;
  legalFormCode?: string;
}

export const AresValidatorTool = () => {
  const [ico, setIco] = useState('');
  const [data, setData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { copied, copy } = useCopyFeedback();

  const formatAddress = (sidlo: AresAddress): string => {
    if (sidlo.textovaAdresa) {
      return sidlo.textovaAdresa;
    }

    const street = sidlo.nazevUlice || sidlo.nazevObce || '';
    const city = sidlo.nazevObce || '';
    const part = sidlo.nazevCastiObce && sidlo.nazevCastiObce !== city ? `(${sidlo.nazevCastiObce})` : '';
    const zip = sidlo.psc ? String(sidlo.psc).replace(/\s/g, '') : '';
    
    // Číslo popisné / orientační
    let numbers = '';
    if (sidlo.cisloDomovni) {
      numbers += sidlo.cisloDomovni;
      if (sidlo.cisloOrientacni) {
        numbers += `/${sidlo.cisloOrientacni}`;
        if (sidlo.cisloOrientacniPismeno) {
          numbers += sidlo.cisloOrientacniPismeno;
        }
      }
    }

    return `${street} ${numbers}, ${zip} ${city} ${part}`.replace(/\s+/g, ' ').trim();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  const handleFetch = async () => {
    // 1. Čištění vstupu
    let cleanIco = ico.replace(/\s/g, '');
    
    // Auto-fix: pokud má 7 číslic a jsou to čísla, doplníme nulu na začátek
    if (cleanIco.length === 7 && /^\d+$/.test(cleanIco)) {
        cleanIco = '0' + cleanIco;
        setIco(cleanIco);
    }

    if (!cleanIco || cleanIco.length !== 8 || !/^\d+$/.test(cleanIco)) {
      setError('IČO musí mít přesně 8 číslic.');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      // Použití corsproxy.io pro spolehlivější přenos JSON
      const aresUrl = `https://ares.gov.cz/ekonomicke-subjekty/v-1.0.3/ekonomicke-subjekty/${cleanIco}`;
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(aresUrl)}`;
      
      const response = await fetch(proxyUrl);
      
      if (response.status === 404) {
         throw new Error('Subjekt s tímto IČO nebyl v ARES nalezen.');
      }
      
      if (response.status === 400) {
         throw new Error('Neplatné IČO.');
      }

      if (!response.ok) {
         throw new Error(`Chyba komunikace s ARES (HTTP ${response.status}).`);
      }

      let company;
      try {
        company = await response.json();
      } catch (e) {
        throw new Error('Chyba při zpracování dat (nevalidní odpověď API).');
      }

      // Kontrola chybových kódů definovaných ve Swaggeru (např. CHYBA_VSTUPU)
      if (company.kod) {
         throw new Error(company.popis || 'Chyba API ARES.');
      }

      setData({
        ico: company.ico,
        dic: company.dic, // Může být null
        name: company.obchodniJmeno,
        address: company.sidlo ? formatAddress(company.sidlo) : 'Adresa neuvedena',
        dateCreated: company.datumVzniku,
        legalFormCode: company.pravniForma
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Nepodařilo se načíst data. Zkuste to prosím později.');
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    if (!data) return;
    const lines = [
      `Název: ${data.name}`,
      `IČO: ${data.ico}`,
      `DIČ: ${data.dic || 'Není plátce DPH (nebo neuvedeno)'}`,
      `Adresa: ${data.address}`
    ];
    copy(lines.join('\n'));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Vstupní formulář */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
          <label className="block text-slate-400 text-xs font-bold uppercase mb-4 tracking-wider">Zadejte IČO firmy</label>
          <div className="flex gap-3">
             <input
                type="text"
                value={ico}
                onChange={(e) => setIco(e.target.value.replace(/[^\d]/g, ''))} 
                onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                placeholder="Např. 12345678"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                maxLength={8}
                autoFocus
             />
             <Button onClick={handleFetch} disabled={loading} className="px-6 whitespace-nowrap min-w-[100px]">
                {loading ? 'Hledám...' : 'Ověřit'}
             </Button>
          </div>
          {error && (
             <div className="mt-4 bg-red-900/20 border border-red-500/30 text-red-300 p-3 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
                <span className="text-xl">⚠️</span> {error}
             </div>
          )}
          <p className="text-slate-500 text-xs mt-3">
            Hledání probíhá v registru ekonomických subjektů (ARES v1.0.3).
          </p>
        </div>

        <div className="bg-blue-900/10 border border-blue-500/10 p-4 rounded-xl text-blue-200 text-sm">
          <h4 className="font-bold mb-2 flex items-center gap-2 text-blue-300"><Icons.Building /> Oficiální data</h4>
          <p className="opacity-80 leading-relaxed">
            Data jsou čerpána přímo ze státního registru. Ověříte zde správnost fakturačních údajů, existenci subjektu a jeho sídlo.
          </p>
        </div>
      </div>

      {/* Zobrazení výsledku */}
      <div className="relative min-h-[300px]">
         {data ? (
           <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-fade-in shadow-2xl ring-1 ring-white/5">
              {/* Header Card */}
              <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-6 relative overflow-hidden">
                 <div className="relative z-10">
                    <h2 className="text-xl font-bold text-white mb-2 pr-8 leading-snug">{data.name}</h2>
                    <div className="flex items-center gap-3 text-blue-100 text-xs font-medium">
                      <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> 
                        Aktivní záznam
                      </span>
                      {data.dateCreated && (
                        <span>Vznik: {formatDate(data.dateCreated)}</span>
                      )}
                    </div>
                 </div>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none"></div>
              </div>
              
              <div className="p-6 space-y-4">
                 {/* Grid for ICO/DIC */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 group hover:border-indigo-500/30 transition-colors">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">IČO</div>
                       <div className="text-lg font-mono text-white flex items-center justify-between">
                          {data.ico}
                          <button onClick={() => copy(data.ico)} className="text-slate-600 hover:text-white transition-colors p-1" title="Kopírovat IČO"><Icons.Copy /></button>
                       </div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 group hover:border-indigo-500/30 transition-colors">
                       <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">DIČ</div>
                       <div className="text-lg font-mono text-white flex items-center justify-between">
                          {data.dic || <span className="text-slate-600 text-sm italic font-sans">Není plátce</span>}
                          {data.dic && <button onClick={() => copy(data.dic!)} className="text-slate-600 hover:text-white transition-colors p-1" title="Kopírovat DIČ"><Icons.Copy /></button>}
                       </div>
                    </div>
                 </div>

                 {/* Address */}
                 <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 group hover:border-indigo-500/30 transition-colors">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-wider">Sídlo společnosti</div>
                    <div className="text-base text-white flex items-start justify-between">
                       <span className="leading-relaxed">{data.address}</span>
                       <button onClick={() => copy(data.address)} className="text-slate-600 hover:text-white transition-colors mt-1 p-1" title="Kopírovat adresu"><Icons.Copy /></button>
                    </div>
                 </div>

                 <div className="pt-2">
                    <Button variant="secondary" onClick={copyAll} className="w-full py-3 border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300">
                        {copied ? <><Icons.Check /> Zkopírováno do schránky</> : <><Icons.Copy /> Zkopírovat kompletní vizitku</>}
                    </Button>
                 </div>
              </div>
           </div>
         ) : (
           <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
              <div className="mb-4 text-slate-700 transform scale-150">
                <Icons.Building />
              </div>
              <p className="font-medium text-slate-400">Výsledky se zobrazí zde</p>
              <p className="text-xs text-slate-600 mt-1">Zadejte IČO vlevo pro zahájení hledání</p>
           </div>
         )}
      </div>
    </div>
  );
};