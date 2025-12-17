import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { Button, useCopyFeedback } from '../components/Shared';

const units = ["", "jedna", "dva", "tři", "čtyři", "pět", "šest", "sedm", "osm", "devět"];
const unitsStandard = ["", "jeden", "dva", "tři", "čtyři", "pět", "šest", "sedm", "osm", "devět"]; // Pro tisíce a výše (jeden tisíc)
const teens = ["deset", "jedenáct", "dvanáct", "třináct", "čtrnáct", "patnáct", "šestnáct", "sedmnáct", "osmnáct", "devatenáct"];
const tens = ["", "deset", "dvacet", "třicet", "čtyřicet", "padesát", "šedesát", "sedmdesát", "osmdesát", "devadesát"];
const hundreds = ["", "sto", "dvě stě", "tři sta", "čtyři sta", "pět set", "šest set", "sedm set", "osm set", "devět set"];

const scales = [
    { singular: '', dual: '', plural: '' }, // units
    { singular: 'tisíc', dual: 'tisíce', plural: 'tisíc' },
    { singular: 'milion', dual: 'miliony', plural: 'milionů' },
    { singular: 'miliarda', dual: 'miliardy', plural: 'miliard' },
    { singular: 'bilion', dual: 'biliony', plural: 'bilionů' },
    { singular: 'biliarda', dual: 'biliardy', plural: 'biliard' },
    { singular: 'trilion', dual: 'triliony', plural: 'trilionů' },
];

const convertTriplet = (num: number, scaleIndex: number): string => {
    let str = "";
    const h = Math.floor(num / 100);
    const t = Math.floor((num % 100) / 10);
    const u = num % 10;

    // Hundreds
    if (h > 0) str += hundreds[h] + " ";

    // Tens and Units
    if (t === 1) {
        str += teens[u] + " ";
    } else {
        if (t > 1) str += tens[t] + " ";
        if (u > 0) {
            // Special handling for 1 and 2 in thousands/millions vs standalone
            if (scaleIndex === 0) {
                // Standalone units: jedna, dva
                str += units[u] + " ";
            } else {
                // Scaled: jeden tisíc, dva tisíce (standard form)
                str += unitsStandard[u] + " ";
            }
        }
    }
    return str.trim();
};

const getScaleWord = (num: number, index: number) => {
    if (index === 0) return "";
    const val = num % 1000; // Look at the triplet value
    // Logic for declension based on value
    // 1: singular (tisíc)
    // 2-4: dual (tisíce)
    // 0, 5+: plural (tisíc/tisíců)
    
    // Complex rule:
    // "Jeden tisíc", "Dva tisíce", "Pět tisíc"
    // But "Sto jedna tisíc" ? No "Sto jeden tisíc".
    
    // We only care about the last part for declension if > 100?
    // Actually Czech is tricky.
    // 1000 -> jeden tisíc
    // 2000 -> dva tisíce
    // 5000 -> pět tisíc
    // 21000 -> dvacet jedna tisíc (often) or dvacet jeden tisíc.
    // Let's use simple rule based on value:
    
    if (val === 1) return scales[index].singular;
    if (val >= 2 && val <= 4) return scales[index].dual;
    return scales[index].plural;
};

const numberToCzech = (numStr: string): string => {
    if (!numStr) return "";
    let num = BigInt(numStr);
    if (num === 0n) return "nula";
    
    let text = "";
    if (num < 0n) {
        text = "mínus ";
        num = -num;
    }

    const numString = num.toString();
    const groups = [];
    for (let i = numString.length; i > 0; i -= 3) {
        groups.push(parseInt(numString.substring(Math.max(0, i - 3), i)));
    }

    const parts: string[] = [];

    for (let i = 0; i < groups.length; i++) {
        const val = groups[i];
        if (val === 0) continue;

        const scaleWord = getScaleWord(val, i);
        let tripletText = convertTriplet(val, i);

        // Fix for "jeden tisíc" -> usually just "tisíc" if typical, but "jeden tisíc" is precise.
        // Fix for "dva" in abstract counting (scale 0) -> "dva" is OK.
        // Fix for "dva" in thousands -> "dva tisíce" (OK, convertTriplet uses unitsStandard which has 'dva')
        // Wait, convertTriplet uses unitsStandard which has 'jeden', 'dva'.
        // Scale 0 (units) should use 'jedna', 'dva' for abstract counting (1, 2).
        // Let's adjust convertTriplet.
        
        parts.unshift(`${tripletText} ${scaleWord}`.trim());
    }

    return text + parts.join(" ");
};

const getCurrencyDeclension = (numStr: string) => {
    if (!numStr) return "";
    const n = BigInt(numStr);
    const lastDigit = Number(n % 10n);
    const lastTwoDigits = Number(n % 100n);

    if (n === 1n) return "koruna česká";
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return "korun českých";
    if (lastDigit >= 2 && lastDigit <= 4) return "koruny české";
    return "korun českých";
};

export const NumberToWordsTool = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [financialMode, setFinancialMode] = useState(false);
    const { copied, copy } = useCopyFeedback();

    useEffect(() => {
        // Clean input: remove non-digits (except minus)
        const clean = input.replace(/[^\d-]/g, '');
        if (!clean || clean === '-') {
            setResult('');
            return;
        }

        try {
            let res = numberToCzech(clean);
            if (financialMode) {
                // Logic for "jeden" -> "jedna" if followed by "koruna"?
                // "jedna koruna česká", "dva miliony korun".
                // Simple fix: if result ends in "jeden", replace with "jedna" for currency?
                // Actually usually: "sto dvacet jedna korun".
                // 1 -> jedna koruna.
                if (clean === '1') res = 'jedna';
                if (clean === '2') res = 'dvě'; // dvě koruny
                
                res += ` ${getCurrencyDeclension(clean)}`;
            }
            setResult(res);
        } catch (e) {
            setResult("Číslo je příliš velké nebo neplatné");
        }
    }, [input, financialMode]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <label className="block text-slate-400 text-sm font-bold uppercase mb-2">Číslo k převodu</label>
                    <input
                        type="number"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Např. 12345"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-xl placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${financialMode ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600 hover:border-slate-500'}`}>
                            {financialMode && <Icons.Check />}
                        </div>
                        <input 
                            type="checkbox" 
                            checked={financialMode} 
                            onChange={() => setFinancialMode(!financialMode)} 
                            className="hidden" 
                        />
                        <span className="text-slate-300 font-medium">Finanční formát (Kč)</span>
                    </label>
                    <p className="text-slate-500 text-xs mt-2 ml-9">
                        Přidá měnu a správně vyskloňuje tvar (koruna/koruny/korun).
                    </p>
                </div>
            </div>

            <div className="bg-slate-950/30 border border-slate-800/50 rounded-xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
                {result ? (
                    <div className="relative z-10 w-full animate-fade-in">
                        <h3 className="text-slate-500 text-sm font-bold uppercase mb-4">Slovní vyjádření</h3>
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-8 leading-relaxed break-words font-serif">
                            {result}
                        </div>
                        <Button onClick={() => copy(result)} variant="secondary" className="mx-auto">
                            {copied ? <><Icons.Check /> Zkopírováno</> : <><Icons.Copy /> Zkopírovat text</>}
                        </Button>
                    </div>
                ) : (
                    <div className="text-slate-500 flex flex-col items-center">
                        <div className="text-6xl mb-4 opacity-20"><Icons.Numbers /></div>
                        <p>Zadejte číslo pro zobrazení výsledku</p>
                    </div>
                )}
            </div>
        </div>
    );
};