import React, { useState } from 'react';
import { XCircle, X, AlertCircle, FileText, Ban } from 'lucide-react';
import { KanbanCard } from './crmKanban.types';

interface MarkAsLostModalProps {
  card: KanbanCard;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason: string; note: string; competitor?: string }) => void;
  reasons: string[];
}

export function MarkAsLostModal({ card, isOpen, onClose, onConfirm, reasons }: MarkAsLostModalProps) {
  const [reason, setReason] = useState(reasons[0] || 'Outro');
  const [note, setNote] = useState('');
  const [competitor, setCompetitor] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300 font-sans">
      <div className="bg-white w-full max-w-md rounded-[2.5xl] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-6 duration-500">
        <div className="relative p-8 lg:p-10 text-center bg-gradient-to-br from-gray-800 to-slate-900 text-white overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 lg:top-6 right-4 lg:right-6 h-8 w-8 lg:h-10 lg:w-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <X size={18} />
          </button>
          
          <div className="relative mx-auto h-16 w-16 lg:h-20 lg:w-20 bg-white/10 rounded-2xl lg:rounded-[2rem] flex items-center justify-center mb-6 ring-4 ring-white/5">
            <Ban size={32} className="text-white opacity-80" />
          </div>
          
          <h2 className="text-xl lg:text-2xl font-black mb-2 tracking-tight">Marcar como Perdida</h2>
          <p className="text-white/40 text-[10px] lg:text-xs font-black uppercase tracking-widest leading-none">{card.title}</p>
        </div>

        <div className="p-6 lg:p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Motivo Principal</label>
            <div className="grid grid-cols-2 gap-2">
              {reasons.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                    reason === r 
                      ? "bg-gray-900 border-gray-900 text-white shadow-lg shadow-black/10" 
                      : "bg-gray-50/50 border-gray-100 text-gray-400 hover:border-gray-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {reason === 'Escolheu concorrente' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Qual Concorrente?</label>
              <input 
                type="text" 
                value={competitor}
                onChange={e => setCompetitor(e.target.value)}
                placeholder="Ex: Nome da empresa..."
                className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-700 outline-none focus:bg-white focus:border-gray-200 transition-all"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Notas de Aprendizado</label>
            <textarea 
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="O que aconteceu? Detalhe o motivo..."
              className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-[13px] font-bold text-gray-700 outline-none focus:bg-white focus:ring-4 focus:ring-gray-500/5 transition-all resize-none min-h-[100px]"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => onConfirm({ reason, note, competitor })}
              className="flex-1 bg-red-600 text-white py-4 rounded-xl lg:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-700 hover:-translate-y-1 transition-all active:translate-y-0"
            >
              Confirmar Perda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
