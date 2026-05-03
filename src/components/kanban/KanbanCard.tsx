import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanCard as KanbanCardType } from './crmKanban.types';
import { cn } from '../../lib/utils';
import { formatKanbanCurrency } from './crmKanban.utils';
import { 
  Building2, 
  Calendar, 
  MessageSquare,
  Paperclip,
  CircleDollarSign,
  User
} from 'lucide-react';

interface KanbanCardProps {
  deal: KanbanCardType;
  isOverlay?: boolean;
  onClick?: () => void;
}

export function KanbanCard({ deal, isOverlay = false, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const cardClasses = cn(
    "group relative rounded-2xl border border-gray-100 bg-white p-4.5 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all hover:border-blue-200 hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] cursor-grab active:cursor-grabbing active:scale-[0.98]",
    isDragging && !isOverlay ? "opacity-30 border-blue-400 bg-blue-50/30" : "opacity-100",
    isOverlay && "shadow-2xl border-blue-400 rotate-[1deg] scale-105 z-50 pointer-events-none ring-4 ring-blue-500/10"
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        onClick?.();
      }}
      className={cardClasses}
    >
      <div className="mb-2 flex items-start justify-between pr-4">
        <h4 className="text-[13px] font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight tracking-tightest">
          {deal.title}
        </h4>
      </div>

      <div className="mb-4 flex items-center gap-2 text-[10px] font-black text-gray-400/80 uppercase tracking-widest">
        {deal.lead.photoUrl ? (
          <img 
            src={deal.lead.photoUrl} 
            alt={deal.lead.name}
            className="h-6 w-6 rounded-lg object-cover ring-2 ring-white shadow-sm flex-shrink-0"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-6 w-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-[8px] font-black border border-blue-100 flex-shrink-0">
            {deal.lead.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()}
          </div>
        )}
        <span className="truncate">{deal.lead.name}</span>
      </div>

      {/* Tags */}
      {deal.tags && deal.tags.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-1">
          {deal.tags.map((tag) => (
            <span 
              key={tag.id}
              className="inline-flex items-center rounded-md px-2 py-0.5 text-[8px] font-black text-white uppercase tracking-widest shadow-sm shadow-black/5"
              style={{ backgroundColor: tag.color || '#94a3b8' }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Value and Responsible */}
      {(deal.value > 0 || (deal.responsible && deal.responsible.name)) && (
        <div className="mb-5 space-y-2">
          {deal.value > 0 && (
            <div className="flex items-center gap-3 bg-emerald-50/30 p-1.5 rounded-2xl border border-emerald-100/50 group/value transition-colors hover:bg-emerald-50/60">
              <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
                <CircleDollarSign size={16} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-black text-emerald-600/70 uppercase tracking-widest leading-none mb-0.5">Valor Estimado</span>
                <span className="text-[13px] font-black text-gray-900 tracking-tight leading-none">
                  {formatKanbanCurrency(deal.value, deal.currency)}
                </span>
              </div>
            </div>
          )}

          {deal.responsible && deal.responsible.name && (
            <div className="flex items-center gap-3 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100 group/resp transition-colors hover:bg-gray-100/80">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-[10px] font-black text-white uppercase shadow-lg shadow-blue-600/20 flex-shrink-0 border border-white/20">
                {deal.responsible.initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Responsável</span>
                <span className="text-[11px] font-black text-gray-700 truncate leading-none">
                  {deal.responsible.name}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-50 pt-4 text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none">
        <div className="flex items-center gap-2">
          {deal.next_action ? (
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1.5 rounded-lg ring-1 transition-all",
              new Date(deal.next_action) < new Date() 
                ? "text-red-600 bg-red-50/50 ring-red-500/20 animate-pulse" 
                : "text-orange-500 bg-orange-50/50 ring-orange-500/10"
            )}>
              <Calendar size={10} className={cn(new Date(deal.next_action) < new Date() ? "text-red-400" : "text-orange-400")} />
              <span>{new Date(deal.next_action).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
            </div>
          ) : (
             <div className="flex items-center gap-1.5 text-gray-300 px-2 py-1.5 rounded-lg bg-gray-50/30 ring-1 ring-gray-100">
               <Calendar size={10} />
               <span>Sem ação</span>
             </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-50/50 px-1.5 py-1 rounded-md transition-colors hover:bg-gray-100 border border-gray-100/50">
            <MessageSquare size={9} className="text-gray-300" />
            <span className="text-gray-400">2</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-50/50 px-1.5 py-1 rounded-md transition-colors hover:bg-gray-100 border border-gray-100/50">
            <Paperclip size={9} className="text-gray-300" />
            <span className="text-gray-400">1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
