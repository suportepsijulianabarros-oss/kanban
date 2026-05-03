import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Send,
  Phone,
  MessageCircle,
  Users,
  Target,
  ArrowRight
} from 'lucide-react';
import { FollowUp, FollowUpType } from './crmKanban.types';
import { MOCK_RESPONSIBLES } from './crmKanban.mock';
import { cn } from '../../lib/utils';

interface FollowUpFormProps {
  onSave: (followUp: Omit<FollowUp, 'id' | 'completed'>) => void;
  onCancel: () => void;
  initialData?: Partial<FollowUp>;
}

const FOLLOWUP_TYPES: { id: FollowUpType; label: string; icon: React.ReactNode }[] = [
  { id: 'callback', label: 'Retornar contato', icon: <ArrowRight size={14} /> },
  { id: 'proposal', label: 'Enviar proposta', icon: <Send size={14} /> },
  { id: 'collection', label: 'Cobrar resposta', icon: <Target size={14} /> },
  { id: 'call', label: 'Fazer ligação', icon: <Phone size={14} /> },
  { id: 'message', label: 'Enviar mensagem', icon: <MessageCircle size={14} /> },
  { id: 'meeting', label: 'Reunião', icon: <Users size={14} /> },
];

export function FollowUpForm({ onSave, onCancel, initialData }: FollowUpFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    due_date: initialData?.due_date ? initialData.due_date.split('T')[0] : new Date().toISOString().split('T')[0],
    due_time: initialData?.due_date ? initialData.due_date.split('T')[1]?.substring(0, 5) : '09:00',
    type: initialData?.type || 'callback',
    responsible_id: initialData?.responsible_id || MOCK_RESPONSIBLES[0].id,
    note: initialData?.note || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isoDate = `${formData.due_date}T${formData.due_time}:00.000Z`;
    onSave({
      title: formData.title,
      due_date: isoDate,
      type: formData.type,
      responsible_id: formData.responsible_id,
      note: formData.note
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-gray-100 p-6 lg:p-8 space-y-6 lg:shadow-xl lg:shadow-blue-900/5 animate-in slide-in-from-bottom-2 duration-300 font-sans">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Título da Ação</label>
          <input 
            required
            type="text" 
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: Ligar para confirmar proposta"
            className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Data</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500/50" size={14} />
              <input 
                type="date" 
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full bg-gray-50/50 border border-gray-100 rounded-xl pl-9 pr-3 py-3 text-[12px] font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-200 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Horário</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500/50" size={14} />
              <input 
                type="time" 
                value={formData.due_time}
                onChange={e => setFormData({ ...formData, due_time: e.target.value })}
                className="w-full bg-gray-50/50 border border-gray-100 rounded-xl pl-9 pr-3 py-3 text-[12px] font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-200 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Tipo de Ação</label>
          <div className="flex flex-wrap gap-2">
            {FOLLOWUP_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFormData({ ...formData, type: t.id })}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                  formData.type === t.id 
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "bg-gray-50/50 border-gray-100 text-gray-400 hover:bg-gray-100"
                )}
              >
                <span className={cn(formData.type === t.id ? "text-white" : "text-blue-500")}>
                  {t.icon}
                </span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Responsável</label>
          <div className="relative group">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500/50" size={14} />
            <select 
              value={formData.responsible_id}
              onChange={e => setFormData({ ...formData, responsible_id: e.target.value })}
              className="w-full bg-gray-50/50 border border-gray-100 rounded-xl pl-9 pr-4 py-3 text-[12px] font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-200 transition-all appearance-none cursor-pointer"
            >
              {MOCK_RESPONSIBLES.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Observação</label>
          <textarea 
            value={formData.note}
            onChange={e => setFormData({ ...formData, note: e.target.value })}
            placeholder="Alguma nota importante?"
            className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-5 py-4 text-[13px] font-bold text-gray-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all resize-none min-h-[100px]"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button 
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="bg-gray-900 text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-black hover:-translate-y-0.5 transition-all active:translate-y-0"
        >
          Agendar Ação
        </button>
      </div>
    </form>
  );
}
