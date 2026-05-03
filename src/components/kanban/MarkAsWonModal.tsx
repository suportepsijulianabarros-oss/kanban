import React, { useState } from 'react';
import { Trophy, X, DollarSign, Calendar, FileText } from 'lucide-react';
import { KanbanCard } from './crmKanban.types';

interface MarkAsWonModalProps {
  card: KanbanCard;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { value: number; closed_at: string; note: string }) => void;
}

export function MarkAsWonModal({ card, isOpen, onClose, onConfirm }: MarkAsWonModalProps) {
  const [value, setValue] = useState(card.value);
  const [closedAt, setClosedAt] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300 font-sans">
      <div className="bg-white w-full max-w-md rounded-[2.5xl] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-6 duration-500">
        <div className="relative p-8 lg:p-10 text-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden">
          {/* Sparkle effects or similar could go here */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 lg:top-6 right-4 lg:right-6 h-8 w-8 lg:h-10 lg:w-10 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition-colors z-10"
          >
            <X size={18} />
          </button>
          
          <div className="relative mx-auto h-16 w-16 lg:h-20 lg:w-20 bg-white shadow-2xl rounded-2xl lg:rounded-[2rem] flex items-center justify-center mb-6 ring-4 ring-white/20 animate-bounce cursor-default">
            <Trophy size={32} className="text-emerald-500" />
          </div>
          
          <h2 className="text-xl lg:text-2xl font-black mb-2 tracking-tight">Parabéns pela venda!</h2>
          <p className="text-white/80 text-[10px] lg:text-xs font-black uppercase tracking-widest leading-none">{card.title}</p>
        </div>

        <div className="p-6 lg:p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Valor Final Fechado</label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm group-focus-within:text-emerald-500 transition-colors">R$</span>
              <input 
                type="number" 
                value={value}
                onChange={e => setValue(Number(e.target.value))}
                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-xl font-black text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Data do Fechamento</label>
              <div className="relative">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500/50" size={16} />
                <input 
                  type="date" 
                  value={closedAt}
                  onChange={e => setClosedAt(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-[13px] font-bold text-gray-700 outline-none focus:bg-white focus:border-emerald-200 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Notas de Sucesso</label>
            <textarea 
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Alguma observação importante?"
              className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 text-[13px] font-bold text-gray-700 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-200 transition-all resize-none min-h-[100px]"
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
              onClick={() => onConfirm({ value, closed_at: closedAt, note })}
              className="flex-1 bg-gray-900 text-white py-4 rounded-xl lg:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-black hover:-translate-y-1 transition-all active:translate-y-0"
            >
              Confirmar Fechamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
