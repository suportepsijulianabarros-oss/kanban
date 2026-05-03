import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  MessageSquare, 
  Send,
  MessageCircle,
  FileText,
  UserCheck,
  XCircle,
  Clock
} from 'lucide-react';
import { Activity } from './crmKanban.types';
import { cn } from '../../lib/utils';

interface ActivityFormProps {
  onAdd: (activity: Omit<Activity, 'id' | 'date'>) => void;
  onCancel: () => void;
}

const ACTIVITY_TYPES = [
  { id: 'note', label: 'Observação', icon: <FileText size={14} /> },
  { id: 'call', label: 'Ligação', icon: <Phone size={14} /> },
  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle size={14} /> },
  { id: 'email', label: 'E-mail', icon: <Mail size={14} /> },
  { id: 'meeting', label: 'Reunião', icon: <Calendar size={14} /> },
  { id: 'proposal', label: 'Proposta', icon: <Send size={14} /> },
] as const;

export function ActivityForm({ onAdd, onCancel }: ActivityFormProps) {
  const [type, setType] = useState<typeof ACTIVITY_TYPES[number]['id']>('note');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onAdd({ type, description });
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-gray-100 p-5 lg:p-6 space-y-5 lg:space-y-6 shadow-xl shadow-blue-900/5 animate-in slide-in-from-top-4 duration-300 font-sans">
      <div className="flex flex-wrap gap-2">
        {ACTIVITY_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setType(t.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
              type === t.id 
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : "bg-gray-50/50 border-gray-100 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            )}
          >
            <span className={cn(type === t.id ? "text-white" : "text-blue-500")}>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <textarea
          autoFocus
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="O que aconteceu? Descreva os detalhes..."
          className="w-full bg-gray-50/30 border border-gray-100 rounded-2xl px-5 py-4 text-[13px] font-bold text-gray-700 outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 resize-none min-h-[120px]"
        />
        
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!description.trim()}
            className="flex items-center gap-2.5 bg-gray-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-black hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all"
          >
            <Send size={14} className="stroke-[2.5]" />
            Registrar
          </button>
        </div>
      </div>
    </form>
  );
}
