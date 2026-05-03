import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  MoreVertical,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  Tag as TagIcon
} from 'lucide-react';
import { useCRMKanban } from './CRMKanbanContext';
import { LeadSegment } from './crmKanban.types';
import { SegmentEditorModal } from './SegmentEditorModal';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export function SegmentManager() {
  const { 
    segments, 
    activeSegmentId, 
    applySegment, 
    deleteSegment, 
    addSegment, 
    setActiveSegmentId,
    setFilters
  } = useCRMKanban();
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleClearSegment = () => {
    setActiveSegmentId(null);
    setFilters({ search: '', tags: [], responsible_id: 'all' });
  };

  return (
    <div className="w-80 shrink-0 border-r border-gray-100 flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <Users size={16} />
            </div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Segmentos</h3>
          </div>
          <button 
            onClick={() => setIsEditorOpen(true)}
            className="h-8 w-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
            title="Novo Segmento"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <button 
          onClick={handleClearSegment}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black transition-all",
            activeSegmentId === null 
              ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 shadow-sm" 
              : "text-gray-400 hover:bg-gray-50"
          )}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 size={16} />
            <span>Todos os Leads</span>
          </div>
          {activeSegmentId === null && <ChevronRight size={14} />}
        </button>
      </div>

      {/* Segments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">Meus Grupos</p>
        
        {segments.map((segment) => (
          <div
            key={segment.id}
            onMouseEnter={() => setHoveredId(segment.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="relative group"
          >
            <button
              onClick={() => applySegment(segment)}
              className={cn(
                "w-full flex flex-col gap-1 px-4 py-3 rounded-2xl transition-all border text-left",
                activeSegmentId === segment.id
                  ? "bg-white border-indigo-200 shadow-lg shadow-indigo-600/5 ring-1 ring-indigo-50"
                  : "bg-white border-transparent hover:border-gray-100 hover:bg-gray-50/50"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-sm font-black transition-colors",
                  activeSegmentId === segment.id ? "text-indigo-600" : "text-gray-700 hover:text-indigo-600"
                )}>
                  {segment.name}
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-black border",
                  activeSegmentId === segment.id 
                    ? "bg-indigo-50 border-indigo-100 text-indigo-600" 
                    : "bg-gray-50 border-gray-100 text-gray-400"
                )}>
                  {segment.count}
                </span>
              </div>
              
              {segment.description && (
                <p className="text-[10px] font-medium text-gray-400 truncate w-48">
                  {segment.description}
                </p>
              )}

              <div className="flex items-center gap-3 mt-1">
                {segment.filters.tags.length > 0 && (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                    <TagIcon size={10} />
                    <span>{segment.filters.tags.length} tags</span>
                  </div>
                )}
                {segment.filters.overdue_only && (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-red-400">
                    <Clock size={10} />
                    <span>Atrasados</span>
                  </div>
                )}
              </div>
            </button>

            {hoveredId === segment.id && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 animate-in fade-in slide-in-from-right-1 duration-200">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSegment(segment.id);
                  }}
                  className="h-7 w-7 bg-white shadow-sm border border-red-50 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-6 bg-gray-50/50 border-t border-gray-50">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Dica CRM</p>
              <p className="text-xs font-black text-gray-800">Crie segmentos por tag!</p>
            </div>
          </div>
          <p className="text-[10px] font-medium text-gray-500 leading-relaxed">
            Segmentar seus leads ajuda a focar em quem realmente importa agora.
          </p>
        </div>
      </div>

      <SegmentEditorModal 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)}
        onSave={(data) => {
          addSegment(data);
          setIsEditorOpen(false);
        }}
      />
    </div>
  );
}
