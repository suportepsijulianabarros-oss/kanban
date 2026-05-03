import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard as KanbanCardType, PipelineStage } from './crmKanban.types';
import { KanbanCard } from './KanbanCard';
import { MoreHorizontal, Plus } from 'lucide-react';
import { formatKanbanCurrency, calculateStageTotal } from './crmKanban.utils';

interface KanbanColumnProps {
  stage: PipelineStage;
  deals: KanbanCardType[];
  onDealClick?: (deal: KanbanCardType) => void;
  onAddClick?: () => void;
}

export function KanbanColumn({ stage, deals, onDealClick, onAddClick }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  const totalValue = calculateStageTotal(deals);

  return (
    <div className="flex w-76 lg:w-80 flex-shrink-0 flex-col rounded-[2rem] bg-gray-50/50 p-3 shadow-none border border-transparent hover:bg-gray-100/30 transition-all font-sans">
      <div className="mb-5 flex items-center justify-between px-2 pt-1">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <div 
              className="h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]" 
              style={{ backgroundColor: stage.color || '#3b82f6' }}
            />
            <h3 className="text-sm font-black text-gray-900 tracking-tight">{stage.name}</h3>
            <span className="flex h-5 items-center justify-center rounded-lg bg-white px-2 py-0.5 text-[9px] font-black text-gray-400 shadow-sm border border-gray-100">
              {deals.length}
            </span>
          </div>
          <div className="text-[10px] font-black text-blue-600/60 mt-1 pl-4 uppercase tracking-widest">
            {formatKanbanCurrency(totalValue)}
          </div>
        </div>
        <button className="rounded-xl p-2 text-gray-300 transition-all hover:bg-white hover:text-gray-600 hover:shadow-xl hover:shadow-blue-900/5">
          <MoreHorizontal size={14} />
        </button>
      </div>

      <div 
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-4 min-h-[500px]"
      >
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.length > 0 ? (
            deals.map((deal) => (
              <KanbanCard key={deal.id} deal={deal} onClick={() => onDealClick?.(deal)} />
            ))
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-10 rounded-[2.5rem] border-2 border-dashed border-gray-100 bg-gray-50/20 transition-all group/empty">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 text-gray-200 shadow-sm group-hover/empty:scale-110 transition-transform">
                <Plus size={24} className="opacity-50" />
               </div>
               <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] text-center leading-relaxed">Etapa Vazia</span>
            </div>
          )}
        </SortableContext>
        
        <button 
          onClick={onAddClick}
          className="group mt-2 border-2 border-dashed border-gray-200/50 rounded-2xl flex flex-col items-center justify-center py-5 gap-2 transition-all hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 cursor-pointer"
        >
          <div className="bg-gray-100/30 group-hover:bg-blue-100/50 p-1.5 rounded-lg transition-all group-hover:rotate-90">
            <Plus size={14} className="text-gray-300 group-hover:text-blue-600 transition-all stroke-[3]" />
          </div>
          <span className="text-[9px] font-black text-gray-400 group-hover:text-blue-600 transition-colors uppercase tracking-[0.2em] leading-none">Novo Lead</span>
        </button>
      </div>
    </div>
  );
}
