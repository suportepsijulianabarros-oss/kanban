import React, { useState, useEffect } from 'react';
import { X, Save, Building2, User, Phone, Mail, DollarSign, Tag as TagIcon, Layout, FileText, Share2, Users, Edit2, TrendingUp } from 'lucide-react';
import { KanbanCard, PipelineStage, Tag, ResponsibleUser, SourceOption } from './crmKanban.types';
import { MOCK_RESPONSIBLES } from './crmKanban.mock';
import { cn } from '../../lib/utils';
import { useCRMKanban } from './CRMKanbanContext';

export function LeadFormModal() {
  const { 
    isModalOpen: isOpen, 
    setIsModalOpen, 
    editingCard, 
    setEditingCard, 
    preselectedStageId, 
    setPreselectedStageId, 
    pipelineStages: stages, 
    tags, 
    sources, 
    saveCard 
  } = useCRMKanban();

  const onClose = () => {
    setIsModalOpen(false);
    setEditingCard(null);
    setPreselectedStageId(undefined);
  };

  const onSave = saveCard;

  const [formData, setFormData] = useState<Partial<KanbanCard>>({
    title: '',
    value: 0,
    currency: 'BRL',
    stage_id: preselectedStageId || stages[0]?.id,
    tags: [],
    responsible: MOCK_RESPONSIBLES[0],
    lead: {
      id: '',
      name: '',
      email: '',
      phone: '',
      source: 'organic',
      status: 'new'
    },
    notes: ''
  });

  useEffect(() => {
    if (editingCard) {
      setFormData({ ...editingCard });
    } else {
      setFormData({
        title: '',
        value: 0,
        currency: 'BRL',
        stage_id: preselectedStageId || stages[0]?.id,
        tags: [],
        responsible: MOCK_RESPONSIBLES[0],
        lead: {
          id: '',
          name: '',
          email: '',
          phone: '',
          source: 'organic',
          status: 'new'
        },
        notes: ''
      });
    }
  }, [editingCard, isOpen, preselectedStageId, stages]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleTagToggle = (tag: Tag) => {
    const exists = formData.tags?.find(t => t.id === tag.id);
    if (exists) {
      setFormData({ ...formData, tags: formData.tags?.filter(t => t.id !== tag.id) });
    } else {
      setFormData({ ...formData, tags: [...(formData.tags || []), tag] });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden font-sans">
        {/* Header */}
        <div className="px-6 lg:px-8 py-5 lg:py-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <PlusIcon isEdit={!!editingCard} />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-black text-gray-900 tracking-tight">
                {editingCard ? 'Editar Lead' : 'Novo Lead'}
              </h2>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-0.5">
                Preencha os detalhes abaixo
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-300 hover:bg-gray-100 hover:text-gray-600 transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 lg:p-8 max-h-[75vh] lg:max-h-[70vh] overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <FormField label="Título" icon={<Layout size={14} />}>
                <input 
                  required
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Consultoria Premium"
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 outline-none transition-all"
                />
              </FormField>

              <FormField label="Nome / Empresa" icon={<Building2 size={14} />}>
                <input 
                  required
                  type="text" 
                  value={formData.lead?.name} 
                  onChange={e => setFormData({ ...formData, lead: { ...formData.lead!, name: e.target.value } })}
                  placeholder="Nome do cliente"
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 outline-none transition-all"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <FormField label="Email" icon={<Mail size={14} />}>
                  <input 
                    type="email" 
                    value={formData.lead?.email} 
                    onChange={e => setFormData({ ...formData, lead: { ...formData.lead!, email: e.target.value } })}
                    placeholder="email@..."
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-bold text-gray-700 outline-none transition-all focus:bg-white"
                  />
                </FormField>
                <FormField label="Telefone" icon={<Phone size={14} />}>
                  <input 
                    type="text" 
                    value={formData.lead?.phone} 
                    onChange={e => setFormData({ ...formData, lead: { ...formData.lead!, phone: e.target.value } })}
                    placeholder="(00) 00000-..."
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-[11px] font-bold text-gray-700 outline-none transition-all focus:bg-white"
                  />
                </FormField>
              </div>

              <FormField label="Valor Estimado" icon={<DollarSign size={14} />}>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-300">R$</span>
                  <input 
                    type="number" 
                    value={formData.value} 
                    onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm font-black text-blue-600 outline-none transition-all focus:bg-white"
                  />
                </div>
              </FormField>

              <FormField label="Notas (Opcional)" icon={<FileText size={14} />}>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Detalhes adicionais..."
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-700 outline-none transition-all focus:bg-white resize-none shadow-inner"
                />
              </FormField>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <FormField label="Etapa" icon={<TrendingUp size={14} />}>
                <select 
                  value={formData.stage_id} 
                  onChange={e => setFormData({ ...formData, stage_id: e.target.value })}
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-black text-gray-700 outline-none transition-all focus:bg-white appearance-none cursor-pointer"
                >
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Origem" icon={<Share2 size={14} />}>
                <select 
                  value={formData.lead?.source} 
                  onChange={e => setFormData({ ...formData, lead: { ...formData.lead!, source: e.target.value } })}
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-black text-gray-700 outline-none transition-all focus:bg-white appearance-none cursor-pointer"
                >
                  {sources.map(source => (
                    <option key={source.id} value={source.id}>{source.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Responsável" icon={<Users size={14} />}>
                <div className="flex flex-wrap gap-2">
                  {MOCK_RESPONSIBLES.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, responsible: u })}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-all border",
                        formData.responsible?.id === u.id 
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                          : "bg-gray-50/50 border-gray-100 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      )}
                    >
                      <div className={cn(
                        "h-5 w-5 rounded-lg flex items-center justify-center text-[9px] font-black leading-none",
                        formData.responsible?.id === u.id ? "bg-white/20" : "bg-blue-50 text-blue-600"
                      )}>
                        {u.initials}
                      </div>
                      {u.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField label="Etiquetas" icon={<TagIcon size={14} />}>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => {
                    const isSelected = formData.tags?.some(t => t.id === tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all border",
                          isSelected 
                            ? "border-transparent text-white shadow-md shadow-black/10 scale-105" 
                            : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                        )}
                        style={isSelected ? { backgroundColor: tag.color } : {}}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </FormField>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 lg:px-8 py-5 lg:py-6 bg-gray-50/20 border-t border-gray-100 flex items-center justify-end gap-2 lg:gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
          >
            Sair
          </button>
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2.5 bg-gray-900 text-white px-8 py-3.5 rounded-xl lg:rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-black hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all"
          >
            <Save size={16} />
            {editingCard ? 'Salvar Alterações' : 'Concluir Cadastro'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
        <span className="text-blue-500 opacity-60">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

function PlusIcon({ isEdit }: { isEdit: boolean }) {
  if (isEdit) return <Edit2 size={20} className="text-white" />;
  return <Save size={20} className="text-white" />;
}
