import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Filter, 
  Tag as TagIcon, 
  Layout, 
  Users, 
  Globe, 
  DollarSign, 
  Calendar,
  AlertCircle,
  Plus,
  Check,
  ChevronDown
} from 'lucide-react';
import { useCRMKanban } from './CRMKanbanContext';
import { SegmentFilters, LeadSegment, Tag, PipelineStage, ResponsibleUser, SourceOption } from './crmKanban.types';
import { cn } from '../../lib/utils';

interface SegmentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<LeadSegment, 'id' | 'count' | 'created_at'>) => void;
  initialSegment?: LeadSegment;
}

export function SegmentEditorModal({ isOpen, onClose, onSave, initialSegment }: SegmentEditorModalProps) {
  const { tags, stages, responsibles, sources, pipelines } = useCRMKanban();
  
  const [name, setName] = useState(initialSegment?.name || '');
  const [description, setDescription] = useState(initialSegment?.description || '');
  
  const [segmentFilters, setSegmentFilters] = useState<SegmentFilters>(initialSegment?.filters || {
    search: '',
    tags: [],
    tag_logic: 'any',
    responsible_id: 'all',
    stage_id: undefined,
    pipeline_id: undefined,
    source: undefined,
    status: undefined,
    min_value: undefined,
    max_value: undefined,
    overdue_only: false,
    no_activity: false
  });

  const handleToggleTag = (tagId: string) => {
    setSegmentFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId) 
        ? prev.tags.filter(id => id !== tagId) 
        : [...prev.tags, tagId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden font-sans border border-white max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-10 py-8 border-b border-gray-50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                <Filter size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-none mb-1">
                  {initialSegment ? 'Editar Segmento' : 'Novo Segmento'}
                </h2>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Crie grupos inteligentes de leads</p>
              </div>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all">
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          {/* Basic Info */}
          <section className="grid grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome do Segmento</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Leads Quentes"
                className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-5 py-3 text-sm font-black text-gray-600 focus:border-indigo-200 focus:bg-white transition-all outline-none"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Descrição</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Para que serve este grupo?"
                className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-5 py-3 text-sm font-bold text-gray-600 focus:border-indigo-200 focus:bg-white transition-all outline-none"
              />
            </div>
          </section>

          {/* Tags Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TagIcon size={14} className="text-gray-400" />
                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Segmentar por Tags</h3>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {(['any', 'all', 'not'] as const).map((logic) => (
                  <button
                    key={logic}
                    onClick={() => setSegmentFilters(prev => ({ ...prev, tag_logic: logic }))}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                      segmentFilters.tag_logic === logic 
                        ? "bg-white text-indigo-600 shadow-sm" 
                        : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {logic === 'any' ? 'Qualquer' : logic === 'all' ? 'Todas' : 'Não contém'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleToggleTag(tag.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border",
                    segmentFilters.tags.includes(tag.id)
                      ? "bg-white border-indigo-200 text-indigo-600 shadow-sm"
                      : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200"
                  )}
                >
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                  {segmentFilters.tags.includes(tag.id) && <Check size={12} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </section>

          {/* Funnel Section */}
          <section className="grid grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                <Layout size={12} /> Pipeline
              </label>
              <select
                value={segmentFilters.pipeline_id || ''}
                onChange={(e) => setSegmentFilters(prev => ({ ...prev, pipeline_id: e.target.value || undefined }))}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-5 py-3 text-sm font-black text-gray-600 outline-none focus:bg-white"
              >
                <option value="">Todos os Pipelines</option>
                {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                <Filter size={12} /> Etapa
              </label>
              <select
                value={segmentFilters.stage_id || ''}
                onChange={(e) => setSegmentFilters(prev => ({ ...prev, stage_id: e.target.value || undefined }))}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-5 py-3 text-sm font-black text-gray-600 outline-none focus:bg-white"
              >
                <option value="">Todas as Etapas</option>
                {stages
                  .filter(s => !segmentFilters.pipeline_id || s.pipeline_id === segmentFilters.pipeline_id)
                  .map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </section>

          {/* Responsible & Source */}
          <section className="grid grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                <Users size={12} /> Responsável
              </label>
              <select
                value={segmentFilters.responsible_id || 'all'}
                onChange={(e) => setSegmentFilters(prev => ({ ...prev, responsible_id: e.target.value }))}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-5 py-3 text-sm font-black text-gray-600 outline-none focus:bg-white"
              >
                <option value="all">Todos</option>
                {responsibles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                <Globe size={12} /> Origem
              </label>
              <select
                value={segmentFilters.source || ''}
                onChange={(e) => setSegmentFilters(prev => ({ ...prev, source: e.target.value || undefined }))}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-5 py-3 text-sm font-black text-gray-600 outline-none focus:bg-white"
              >
                <option value="">Todas</option>
                {sources.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </section>

          {/* Monetary & Special */}
          <section className="grid grid-cols-2 gap-x-6 gap-y-8">
            <div className="col-span-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">
                <DollarSign size={12} /> Faixa de Valor
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <span className="text-[9px] font-black text-gray-300 uppercase ml-2">Mínimo</span>
                  <input 
                    type="number" 
                    value={segmentFilters.min_value || ''}
                    onChange={(e) => setSegmentFilters(prev => ({ ...prev, min_value: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-2 text-sm font-black text-gray-600 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] font-black text-gray-300 uppercase ml-2">Máximo</span>
                  <input 
                    type="number" 
                    value={segmentFilters.max_value || ''}
                    onChange={(e) => setSegmentFilters(prev => ({ ...prev, max_value: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-2 text-sm font-black text-gray-600 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between col-span-2 md:col-span-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-700 leading-none mb-1">Ações Atrasadas</p>
                  <p className="text-[9px] font-medium text-gray-400">Leads com follow-up vencido</p>
                </div>
              </div>
              <button
                onClick={() => setSegmentFilters(prev => ({ ...prev, overdue_only: !prev.overdue_only }))}
                className={cn(
                  "w-10 h-6 rounded-full relative transition-all duration-300",
                  segmentFilters.overdue_only ? "bg-red-500" : "bg-gray-300"
                )}
              >
                <div className={cn(
                  "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm",
                  segmentFilters.overdue_only && "translate-x-4"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between col-span-2 md:col-span-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-700 leading-none mb-1">Sem Atividade</p>
                  <p className="text-[9px] font-medium text-gray-400">Leads ignorados há dias</p>
                </div>
              </div>
              <button
                onClick={() => setSegmentFilters(prev => ({ ...prev, no_activity: !prev.no_activity }))}
                className={cn(
                  "w-10 h-6 rounded-full relative transition-all duration-300",
                  segmentFilters.no_activity ? "bg-orange-500" : "bg-gray-300"
                )}
              >
                <div className={cn(
                  "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm",
                  segmentFilters.no_activity && "translate-x-4"
                )} />
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex gap-4 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 px-8 py-4 bg-white border border-gray-100 text-gray-400 text-xs font-black rounded-2xl hover:bg-gray-50 transition-all uppercase tracking-widest"
          >
            Cancelar
          </button>
          <button 
            onClick={() => name.length > 2 && onSave({ name, description, filters: segmentFilters })}
            disabled={name.length < 3}
            className="flex-1 px-8 py-4 bg-indigo-600 text-white text-xs font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/40 transition-all disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest"
          >
            {initialSegment ? 'Salvar Alterações' : 'Criar Segmento'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
