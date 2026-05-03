import React from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle,
  AlertCircle,
  Phone,
  MessageCircle,
  Users,
  Send,
  Target,
  ArrowRight,
  MoreVertical
} from 'lucide-react';
import { FollowUp, FollowUpType } from './crmKanban.types';
import { MOCK_RESPONSIBLES } from './crmKanban.mock';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FollowUpItemProps {
  followUp: FollowUp;
  onComplete: (id: string) => void;
}

export function FollowUpItem({ followUp, onComplete }: FollowUpItemProps) {
  const isOverdue = !followUp.completed && new Date(followUp.due_date) < new Date();
  const responsible = MOCK_RESPONSIBLES.find(r => r.id === followUp.responsible_id);

  const getTypeIcon = (type: FollowUpType) => {
    switch (type) {
      case 'callback': return <ArrowRight size={12} />;
      case 'proposal': return <Send size={12} />;
      case 'collection': return <Target size={12} />;
      case 'call': return <Phone size={12} />;
      case 'message': return <MessageCircle size={12} />;
      case 'meeting': return <Users size={12} />;
      default: return <Calendar size={12} />;
    }
  };

  return (
    <div className={cn(
      "group relative flex items-start gap-4 p-5 rounded-[2rem] border transition-all font-sans",
      followUp.completed 
        ? "bg-gray-50/50 border-transparent opacity-60" 
        : isOverdue 
          ? "bg-rose-50/30 border-rose-100 shadow-sm" 
          : "bg-white border-gray-100 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-0.5"
    )}>
      <button 
        onClick={() => !followUp.completed && onComplete(followUp.id)}
        className={cn(
          "mt-1 shrink-0 transition-all",
          followUp.completed ? "text-emerald-500" : isOverdue ? "text-rose-400 hover:text-rose-600" : "text-gray-300 hover:text-blue-500"
        )}
      >
        {followUp.completed ? <CheckCircle2 size={24} className="fill-emerald-50" /> : <Circle size={24} className="stroke-[1.5]" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className={cn(
              "text-[13px] font-black leading-tight tracking-tight",
              followUp.completed ? "text-gray-400 line-through" : "text-gray-900"
            )}>
              {followUp.title}
            </h4>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className={cn(
                "flex items-center gap-1 text-[9px] font-black uppercase tracking-widest",
                isOverdue && !followUp.completed ? "text-rose-600" : "text-gray-400"
              )}>
                <Calendar size={10} className="opacity-70" />
                {format(new Date(followUp.due_date), "dd 'de' MMM", { locale: ptBR })}
              </div>
              <div className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                <Clock size={10} className="opacity-70" />
                {format(new Date(followUp.due_date), "HH:mm")}
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 text-[8px] font-black text-blue-600 uppercase tracking-widest border border-gray-100/50">
                {getTypeIcon(followUp.type)}
                {followUp.type}
              </div>
            </div>
          </div>
          
          {isOverdue && !followUp.completed && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500 text-white shadow-lg shadow-rose-500/20 animate-pulse">
              <AlertCircle size={10} />
              <span className="text-[9px] font-black uppercase tracking-widest">Atrasada</span>
            </div>
          )}
        </div>

        {followUp.note && (
          <p className="mt-3 text-[11px] font-bold text-gray-500 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
            <span className="text-gray-300 mr-1 opacity-50">"</span>
            {followUp.note}
            <span className="text-gray-300 ml-1 opacity-50">"</span>
          </p>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-blue-100 flex items-center justify-center text-[8px] font-black text-blue-600 border border-blue-200">
              {responsible?.initials}
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">{responsible?.name}</span>
          </div>
          
          <button className="p-1.5 text-gray-200 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100">
            <MoreVertical size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
