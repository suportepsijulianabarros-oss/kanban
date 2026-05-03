import React, { useState } from 'react';
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Settings2, 
  Layout, 
  Tag as TagIcon, 
  Share2,
  Ban,
  Pencil
} from 'lucide-react';
import { PipelineStage, Tag, SourceOption } from './crmKanban.types';
import { cn } from '../../lib/utils';
import { useCRMKanban } from './CRMKanbanContext';

export function CRMSettingsView() {
  const { 
    stages: allStages, 
    setStages, 
    selectedPipelineId,
    selectedPipeline,
    updatePipeline,
    deletePipeline,
    tags, 
    setTags, 
    sources, 
    setSources 
  } = useCRMKanban();
  
  const pipelineStages = allStages.filter(s => s.pipeline_id === selectedPipelineId);

  const setPipelineStages = (newPipelineStages: PipelineStage[]) => {
    setStages(prev => [
      ...prev.filter(s => s.pipeline_id !== selectedPipelineId),
      ...newPipelineStages
    ]);
  };

  // Local state for non-context settings for now
  const [lossReasons, setLossReasons] = useState<string[]>([
    'Preço',
    'Sem resposta',
    'Não era o momento',
    'Escolheu concorrente',
    'Sem orçamento',
    'Não qualificado'
  ]);
  
  const [activeConfigTab, setActiveConfigTab] = useState<'pipelines' | 'stages' | 'tags' | 'loss_reasons' | 'sources'>('pipelines');

  return (
    <div className="p-6 lg:p-10 bg-gray-50/20 min-h-screen animate-in fade-in duration-500 font-sans w-full">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 lg:mb-10">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl lg:rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <Settings2 size={20} className="lg:scale-100 scale-90" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight">Configurações</h2>
                <p className="text-[10px] lg:text-xs font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Personalize seu ambiente localmente</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* Navigation */}
          <aside className="w-full lg:w-64 shrink-0 overflow-x-auto no-scrollbar">
            <div className="flex lg:flex-col gap-2 pb-2 lg:pb-0">
              <NavButton 
                active={activeConfigTab === 'pipelines'} 
                onClick={() => setActiveConfigTab('pipelines')}
                icon={<Layout size={16} />}
                label="Pipelines"
              />
              <NavButton 
                active={activeConfigTab === 'stages'} 
                onClick={() => setActiveConfigTab('stages')}
                icon={<GripVertical size={16} />}
                label="Etapas"
              />
              <NavButton 
                active={activeConfigTab === 'tags'} 
                onClick={() => setActiveConfigTab('tags')}
                icon={<TagIcon size={16} />}
                label="Etiquetas"
              />
              <NavButton 
                active={activeConfigTab === 'loss_reasons'} 
                onClick={() => setActiveConfigTab('loss_reasons')}
                icon={<Ban size={16} />}
                label="Motivos"
              />
              <NavButton 
                active={activeConfigTab === 'sources'} 
                onClick={() => setActiveConfigTab('sources')}
                icon={<Share2 size={16} />}
                label="Origens"
              />
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {activeConfigTab === 'pipelines' && (
              <PipelinesSettings />
            )}
            {activeConfigTab === 'stages' && (
              <StageSettings 
                stages={pipelineStages} 
                onChange={setPipelineStages} 
                pipelineName={selectedPipeline.name}
              />
            )}
            {activeConfigTab === 'tags' && (
              <TagsSettings tags={tags} onChange={setTags} />
            )}
            {activeConfigTab === 'loss_reasons' && (
              <LossReasonsSettings reasons={lossReasons} onChange={setLossReasons} />
            )}
            {activeConfigTab === 'sources' && (
              <SourcesSettings sources={sources} onChange={setSources} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
        active 
          ? "bg-white text-blue-600 shadow-xl shadow-blue-900/5 ring-1 ring-blue-50" 
          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function PipelinesSettings() {
  const { pipelines, updatePipeline, deletePipeline, selectedPipelineId, setSelectedPipelineId } = useCRMKanban();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const startEditing = (p: any) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDesc(p.description || '');
  };

  const handleSave = (id: string) => {
    updatePipeline(id, { name: editName, description: editDesc });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-[2rem] p-6 lg:p-8 border border-gray-100 shadow-xl shadow-blue-900/5 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-black text-gray-900 uppercase tracking-tight">Gerenciar Pipelines</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Configure todos os seus processos de vendas</p>
          </div>
        </div>

        <div className="space-y-4">
          {pipelines.map(p => (
            <div key={p.id} className={cn(
              "p-6 rounded-3xl border transition-all relative overflow-hidden group",
              selectedPipelineId === p.id ? "bg-blue-50/30 border-blue-100 ring-2 ring-blue-500/5" : "bg-gray-50/30 border-transparent hover:bg-white hover:border-gray-100 hover:shadow-xl hover:shadow-blue-900/2"
            )}>
              {editingId === p.id ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome do Pipeline</label>
                    <input 
                      type="text"
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Descrição</label>
                    <textarea 
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => handleSave(p.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition-all"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">{p.name}</h4>
                      {selectedPipelineId === p.id && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">Selecionado</span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-gray-500 line-clamp-1">{p.description || 'Sem descrição definida.'}</p>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2">
                    {selectedPipelineId !== p.id && (
                      <button 
                        onClick={() => setSelectedPipelineId(p.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Selecionar Pipeline"
                      >
                        <Layout size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => startEditing(p)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 px-3 bg-gray-50 rounded-xl"
                    >
                      <Pencil size={14} />
                      <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Editar</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Excluir o pipeline "${p.name}"? Isso apagará todas as etapas e negociações associadas.`)) {
                          deletePipeline(p.id);
                        }
                      }}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors bg-gray-50/50 hover:bg-red-50 rounded-xl"
                      title="Excluir Pipeline"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StageSettings({ 
  stages, 
  onChange, 
  pipelineName
}: { 
  stages: PipelineStage[]; 
  onChange: (stages: PipelineStage[]) => void;
  pipelineName: string;
}) {
  const [newStageName, setNewStageName] = useState('');

  const addStage = () => {
    if (!newStageName.trim()) return;
    const { selectedPipelineId } = useCRMKanban(); // Access directly if needed or pass as prop
    const newStage: PipelineStage = {
      id: `stage-${Date.now()}`,
      pipeline_id: selectedPipelineId,
      name: newStageName,
      color: '#3b82f6',
      order: stages.length
    };
    onChange([...stages, newStage]);
    setNewStageName('');
  };

  const removeStage = (id: string) => {
    onChange(stages.filter(s => s.id !== id));
  };

  const updateStage = (id: string, updates: Partial<PipelineStage>) => {
    onChange(stages.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-[2rem] p-6 lg:p-8 border border-gray-100 shadow-xl shadow-blue-900/5 space-y-6 lg:space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-black text-gray-900 uppercase tracking-tight">Etapas do Pipeline: {pipelineName}</h3>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">{stages.length} Etapas</span>
        </div>

      {/* Quick Add Stage Input */}
      <div className="flex gap-3 bg-blue-50/20 p-2 rounded-[1.5rem] border border-dashed border-blue-200/50">
        <input 
          type="text" 
          value={newStageName}
          onChange={e => setNewStageName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addStage()}
          placeholder="Adicionar nova etapa rapidamente..."
          className="flex-1 bg-white border border-gray-100 rounded-xl px-5 py-3 text-[12px] font-bold text-gray-700 outline-none shadow-sm focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5 transition-all"
        />
        <button 
          onClick={addStage}
          className="bg-blue-600 text-white px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/10 hover:bg-blue-700 hover:-translate-y-0.5 transition-all whitespace-nowrap"
        >
          <Plus size={14} className="inline mr-2" />
          Adicionar
        </button>
      </div>

      <div className="space-y-3">
        {stages.sort((a,b) => a.order - b.order).map((stage, index) => (
          <div key={stage.id} className="flex items-center gap-4 p-4 bg-gray-50/30 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all rounded-2xl group border border-transparent hover:border-gray-100">
            <div className="cursor-grab text-gray-200 group-hover:text-gray-400 transition-colors">
              <GripVertical size={16} />
            </div>
            
            <div 
              className="h-8 w-8 rounded-xl shrink-0 shadow-sm" 
              style={{ backgroundColor: stage.color }}
            />
            
            <input 
              type="text" 
              value={stage.name}
              onChange={(e) => updateStage(stage.id, { name: e.target.value })}
              className="flex-1 bg-transparent border-none text-[13px] font-black text-gray-700 outline-none focus:text-blue-600 transition-colors"
            />

            <div className="relative group/color">
               <input 
                type="color" 
                value={stage.color}
                onChange={(e) => updateStage(stage.id, { color: e.target.value })}
                className="w-8 h-8 p-0 border-none rounded-lg bg-transparent cursor-pointer opacity-0 absolute inset-0 z-10"
              />
              <div className="w-8 h-8 rounded-lg border border-gray-100 shadow-sm flex items-center justify-center text-[10px] font-black text-gray-400 group-hover/color:border-blue-200">
                <Plus size={12} />
              </div>
            </div>

            <button 
              onClick={() => removeStage(stage.id)}
              className="p-2 text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-gray-100">
        <div className="flex gap-3">
          <input 
            type="text" 
            value={newStageName}
            onChange={e => setNewStageName(e.target.value)}
            placeholder="Nova etapa..."
            className="flex-1 bg-gray-50 border-none rounded-xl px-5 py-3.5 text-[13px] font-bold text-gray-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
          />
          <button 
            onClick={addStage}
            className="bg-gray-900 text-white px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 hover:bg-black hover:-translate-y-0.5 transition-all whitespace-nowrap"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}

function TagsSettings({ tags, onChange }: { tags: Tag[]; onChange: (tags: Tag[]) => void }) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');

  const addTag = () => {
    if (!newName.trim()) return;
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name: newName,
      color: newColor
    };
    onChange([...tags, newTag]);
    setNewName('');
  };

  const removeTag = (id: string) => {
    onChange(tags.filter(t => t.id !== id));
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-blue-900/5 space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-gray-900">Etiquetas / Tags</h3>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{tags.length} Criadas</span>
      </div>

      {/* Quick Add Tag Input */}
      <div className="flex flex-col sm:flex-row gap-3 bg-blue-50/20 p-2 rounded-2xl border border-dashed border-blue-200/50">
        <input 
          type="text" 
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTag()}
          placeholder="Nome da tag..."
          className="flex-1 bg-white border border-gray-100 rounded-xl px-5 py-3 text-[12px] font-bold text-gray-700 outline-none shadow-sm focus:border-blue-300 focus:ring-4 focus:ring-blue-500/5 transition-all"
        />
        <div className="flex items-center gap-2">
          <input 
            type="color" 
            value={newColor}
            onChange={e => setNewColor(e.target.value)}
            className="h-10 w-10 p-0 border-none rounded-lg bg-white shadow-sm cursor-pointer shrink-0"
          />
          <button 
            onClick={addTag}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/10 hover:bg-blue-700 hover:-translate-y-0.5 transition-all whitespace-nowrap"
          >
            <Plus size={14} className="inline mr-2" />
            Adicionar Tag
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {tags.map(tag => (
          <div 
            key={tag.id}
            className="flex items-center gap-2 pl-4 pr-2 py-2 rounded-xl text-white shadow-sm transition-all hover:scale-105 group"
            style={{ backgroundColor: tag.color }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest">{tag.name}</span>
            <button 
              onClick={() => removeTag(tag.id)}
              className="p-1 hover:bg-black/10 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

function LossReasonsSettings({ reasons, onChange }: { reasons: string[]; onChange: (reasons: string[]) => void }) {
  const [newReason, setNewReason] = useState('');

  const addReason = () => {
    if (!newReason.trim()) return;
    onChange([...reasons, newReason]);
    setNewReason('');
  };

  const removeReason = (reason: string) => {
    onChange(reasons.filter(r => r !== reason));
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 lg:p-8 border border-gray-100 shadow-xl shadow-blue-900/5 space-y-6 lg:space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-black text-gray-900 uppercase tracking-tight">Motivos de Perda</h3>
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">{reasons.length} Motivos</span>
      </div>

      <div className="space-y-2">
        {reasons.map(reason => (
          <div key={reason} className="flex items-center justify-between p-4 bg-gray-50/30 rounded-2xl group transition-all hover:bg-white hover:shadow-lg hover:shadow-blue-900/5 border border-transparent hover:border-gray-100">
            <span className="text-[13px] font-bold text-gray-700">{reason}</span>
            <button 
              onClick={() => removeReason(reason)}
              className="p-2 text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-gray-100 flex gap-3">
        <input 
          type="text" 
          value={newReason}
          onChange={e => setNewReason(e.target.value)}
          placeholder="Novo motivo..."
          className="flex-1 bg-gray-50 border-none rounded-xl px-5 py-3.5 text-[13px] font-bold text-gray-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
        />
        <button 
          onClick={addReason}
          className="bg-gray-900 text-white px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 hover:bg-black hover:-translate-y-0.5 transition-all whitespace-nowrap"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}

function SourcesSettings({ sources, onChange }: { sources: SourceOption[]; onChange: (sources: SourceOption[]) => void }) {
  const [newLabel, setNewLabel] = useState('');
  const [newId, setNewId] = useState('');

  const addSource = () => {
    if (!newLabel.trim() || !newId.trim()) return;
    const newSource: SourceOption = {
      id: newId.toLowerCase().replace(/\s+/g, '_'),
      label: newLabel
    };
    onChange([...sources, newSource]);
    setNewLabel('');
    setNewId('');
  };

  const removeSource = (id: string) => {
    onChange(sources.filter(s => s.id !== id));
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 lg:p-8 border border-gray-100 shadow-xl shadow-blue-900/5 space-y-6 lg:space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-black text-gray-900 uppercase tracking-tight">Origens de Leads</h3>
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">{sources.length} Origens</span>
      </div>

      <div className="space-y-2">
        {sources.map(source => (
          <div key={source.id} className="flex items-center justify-between p-4 bg-gray-50/30 rounded-2xl group transition-all hover:bg-white hover:shadow-lg hover:shadow-blue-900/5 border border-transparent hover:border-gray-100">
            <div className="flex flex-col">
              <span className="text-[13px] font-black text-gray-700">{source.label}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">ID: {source.id}</span>
            </div>
            <button 
              onClick={() => removeSource(source.id)}
              className="p-2 text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-gray-100 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input 
            type="text" 
            value={newLabel}
            onChange={e => {
              setNewLabel(e.target.value);
              if (!newId) setNewId(e.target.value.toLowerCase().replace(/\s+/g, '_'));
            }}
            placeholder="Origem (ex: Google Ads)"
            className="flex-1 bg-gray-50 border-none rounded-xl px-5 py-3.5 text-[13px] font-bold text-gray-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
          />
          <input 
            type="text" 
            value={newId}
            onChange={e => setNewId(e.target.value)}
            placeholder="ID (ex: google_ads)"
            className="flex-1 bg-gray-50 border-none rounded-xl px-5 py-3.5 text-[13px] font-bold text-gray-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
          />
        </div>
        <button 
          onClick={addSource}
          className="w-full bg-blue-600 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
        >
          Criar Origem
        </button>
      </div>
    </div>
  );
}
