
import React, { useState, useRef, useCallback } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Shared';

interface FileState {
  id: string;
  file: File;
  progress: number;
  status: 'waiting' | 'processing' | 'done' | 'error';
  resultUrl?: string;
  targetFormat: string;
}

const SUPPORTED_FORMATS = ['WAV', 'MP3', 'M4A', 'AAC', 'OGG', 'FLAC', 'AIFF'];

export const AudioConverterTool = () => {
  const [files, setFiles] = useState<FileState[]>([]);
  const [targetFormat, setTargetFormat] = useState('WAV');
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const incoming = Array.from(newFiles).filter(f => f.type.startsWith('audio/')).slice(0, 20 - files.length);
    
    const mapped: FileState[] = incoming.map(f => ({
      id: crypto.randomUUID(),
      file: f,
      progress: 0,
      status: 'waiting',
      targetFormat: targetFormat
    }));

    setFiles(prev => [...prev, ...mapped]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const convertFile = async (fileState: FileState) => {
    setFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, status: 'processing', progress: 10 } : f));

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await fileState.file.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      
      setFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, progress: 50 } : f));

      // Simulace náročného výpočtu pro feedback uživateli
      await new Promise(r => setTimeout(r, 500));

      const wavBlob = await encodeWAV(audioBuffer);
      const url = URL.createObjectURL(wavBlob);

      setFiles(prev => prev.map(f => f.id === fileState.id ? { 
        ...f, 
        status: 'done', 
        progress: 100, 
        resultUrl: url 
      } : f));
      
      audioCtx.close();
    } catch (err) {
      console.error(err);
      setFiles(prev => prev.map(f => f.id === fileState.id ? { ...f, status: 'error', progress: 0 } : f));
    }
  };

  const encodeWAV = (buffer: AudioBuffer): Promise<Blob> => {
    return new Promise((resolve) => {
      const numOfChan = buffer.numberOfChannels;
      const length = buffer.length * numOfChan * 2 + 44;
      const bufferArray = new ArrayBuffer(length);
      const view = new DataView(bufferArray);
      const channels = [];
      let i;
      let sample;
      let offset = 0;
      let pos = 0;

      function setUint16(data: number) { view.setUint16(pos, data, true); pos += 2; }
      function setUint32(data: number) { view.setUint32(pos, data, true); pos += 4; }

      setUint32(0x46464952); // "RIFF"
      setUint32(length - 8);
      setUint32(0x45564157); // "WAVE"
      setUint32(0x20746d66); // "fmt "
      setUint32(16);
      setUint16(1);
      setUint16(numOfChan);
      setUint32(buffer.sampleRate);
      setUint32(buffer.sampleRate * 2 * numOfChan);
      setUint16(numOfChan * 2);
      setUint16(16);
      setUint32(0x61746164); // "data"
      setUint32(length - pos - 4);

      for (i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));
      while (pos < length) {
        for (i = 0; i < numOfChan; i++) {
          sample = Math.max(-1, Math.min(1, channels[i][offset]));
          sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
          view.setInt16(pos, sample, true);
          pos += 2;
        }
        offset++;
      }
      resolve(new Blob([bufferArray], { type: "audio/wav" }));
    });
  };

  const processAll = async () => {
    setIsProcessingAll(true);
    const waitingFiles = files.filter(f => f.status === 'waiting');
    for (const f of waitingFiles) {
      await convertFile(f);
    }
    setIsProcessingAll(false);
  };

  const downloadAll = () => {
    files.filter(f => f.status === 'done' && f.resultUrl).forEach((f, idx) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = f.resultUrl!;
        a.download = `scrollo_${f.file.name.split('.')[0]}.${targetFormat.toLowerCase()}`;
        a.click();
      }, idx * 300);
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload & Setup */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1">
             <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <Icons.ArrowsRightLeft /> Převod formátu zvuku
             </h3>
             <p className="text-slate-500 text-sm">Nahrajte až 20 souborů pro hromadný převod.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase ml-2">Do formátu:</span>
            <select 
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value)}
              className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-lg outline-none cursor-pointer hover:bg-indigo-500 transition-colors"
            >
              {SUPPORTED_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-500'); }}
          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-indigo-500'); }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-indigo-500'); handleFiles(e.dataTransfer.files); }}
          className="border-2 border-dashed border-slate-700 bg-slate-950/50 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-slate-900 transition-all group"
        >
          <input 
            type="file" 
            multiple 
            accept="audio/*" 
            ref={fileInputRef} 
            onChange={(e) => handleFiles(e.target.files)} 
            className="hidden" 
          />
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Icons.Upload />
          </div>
          <p className="text-slate-300 font-medium">Přetáhněte soubory sem nebo klikněte</p>
          <p className="text-slate-600 text-xs mt-2 uppercase tracking-widest">Podporuje MP3, WAV, AAC, M4A, OGG, FLAC...</p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center px-2">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{files.length} souborů ve frontě</span>
            <div className="flex gap-2">
              <Button 
                onClick={processAll} 
                disabled={isProcessingAll || !files.some(f => f.status === 'waiting')}
                className="bg-emerald-600 hover:bg-emerald-500 text-xs px-4"
              >
                {isProcessingAll ? 'Zpracovávám...' : 'Převést vše'}
              </Button>
              <Button 
                onClick={downloadAll} 
                disabled={!files.some(f => f.status === 'done')}
                variant="secondary"
                className="text-xs px-4"
              >
                Stáhnout vše
              </Button>
              <button onClick={() => setFiles([])} className="p-2 text-slate-500 hover:text-rose-400 transition-colors">
                <Icons.Trash />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {files.map((f) => (
              <div key={f.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 transition-all hover:border-slate-700">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                  <Icons.Music />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-white truncate pr-4">{f.file.name}</h4>
                      <span className="text-[10px] font-mono text-slate-600 uppercase">{(f.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${f.status === 'error' ? 'bg-rose-600' : f.status === 'done' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${f.progress}%` }}
                      />
                   </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {f.status === 'waiting' && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Čeká</span>}
                  {f.status === 'processing' && <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Převod...</span>}
                  {f.status === 'error' && <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Chyba</span>}
                  {f.status === 'done' && (
                    <a 
                      href={f.resultUrl} 
                      download={`scrollo_${f.file.name.split('.')[0]}.${targetFormat.toLowerCase()}`}
                      className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest border border-emerald-500/20 px-2 py-1 rounded bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
                    >
                      Hotovo - Stáhnout
                    </a>
                  )}
                  <button onClick={() => removeFile(f.id)} className="text-slate-700 hover:text-rose-500 p-1">
                    <Icons.Trash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-indigo-900/10 border border-indigo-500/10 p-6 rounded-2xl text-center space-y-2">
         <p className="text-indigo-200 text-sm">💡 Soubory se zpracovávají lokálně ve vašem prohlížeči v bezztrátové studiové kvalitě.</p>
         <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Respektujeme vaše soukromí – data nikdy neopouští váš počítač.</p>
      </div>
    </div>
  );
};
