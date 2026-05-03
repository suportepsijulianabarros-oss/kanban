import React, { useState } from 'react';
import { ChevronDown, Plus, Layout, Check, Settings2 } from 'lucide-react';
import { useCRMKanban } from './CRMKanbanContext';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function PipelineSelector() {
  const { pipelines, selectedPipelineId, setSelectedPipelineId, addPipeline } = useCRMKanban();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId) || pipelines[0];

  return (
    <div className="relative mb-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-200 transition-all active:scale-95 group"
        >
          <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
            <Layout size={18} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Pipeline Ativo</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-gray-900">{selectedPipeline.name}</span>
              <ChevronDown size={14} className={cn("text-gray-400 transition-transform duration-300", isOpen && "rotate-180")} />
            </div>
          </div>
        </button>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="h-10 w-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-all active:scale-95 shadow-sm"
          title="Novo Pipeline"
        >
          <Plus size={20} />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-40 overflow-hidden py-2"
            >
              <div className="px-4 py-2 border-b border-gray-50 mb-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Meus Pipelines</p>
              </div>
              <div className="max-h-64 overflow-y-auto px-2">
                {pipelines.map((pipe) => (
                  <button
                    key={pipe.id}
                    onClick={() => {
                      setSelectedPipelineId(pipe.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all mb-1 group",
                      selectedPipelineId === pipe.id 
                        ? "bg-blue-50 text-blue-700" 
                        : "hover:bg-gray-50 text-gray-600"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                        selectedPipelineId === pipe.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-white"
                      )}>
                        <Layout size={16} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black">{pipe.name}</p>
                        {pipe.description && (
                          <p className="text-[10px] font-medium opacity-60 truncate w-32">{pipe.description}</p>
                        )}
                      </div>
                    </div>
                    {selectedPipelineId === pipe.id && (
                      <div className="h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center text-white scale-75">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <NewPipelineModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={(data) => {
          addPipeline(data);
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}

function NewPipelineModal({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stages, setStages] = useState(['Lead', 'Contato', 'Proposta', 'Fechamento']);
  const [newStageName, setNewStageName] = useState('');

  if (!isOpen) return null;

  const handleAddStage = () => {
    if (newStageName.trim()) {
      setStages([...stages, newStageName.trim()]);
      setNewStageName('');
    }
  };

  const handleRemoveStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden font-sans border border-white"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Plus size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Novo Pipeline</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Personalize seu funil</p>
              </div>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all">
              <Plus className="rotate-45 text-gray-400" size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome do Pipeline</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Novos Negócios"
                className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-5 py-3 text-sm font-black text-gray-600 placeholder:text-gray-300 focus:border-blue-200 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Descrição (opcional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Para que serve este pipeline?"
                className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-5 py-3 text-sm font-medium text-gray-600 placeholder:text-gray-300 focus:border-blue-200 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner resize-none h-20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Etapas</label>
              <div className="space-y-2 mb-4">
                {stages.map((stage, index) => (
                  <div key={index} className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 bg-blue-50 rounded-lg flex items-center justify-center text-[10px] font-black text-blue-600">
                        {index + 1}
                      </div>
                      <span className="text-sm font-black text-gray-700">{stage}</span>
                    </div>
                    <button onClick={() => handleRemoveStage(index)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Plus className="rotate-45" size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="Nova etapa..."
                  className="flex-1 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-2 text-sm font-bold text-gray-600 placeholder:text-gray-300 focus:bg-white transition-all shadow-inner outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddStage()}
                />
                <button 
                  onClick={handleAddStage}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-50 text-gray-400 text-xs font-black rounded-2xl hover:bg-gray-100 transition-all active:scale-95 uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button 
              onClick={() => name.length > 2 && onSave({ name, description, stageNames: stages })}
              disabled={name.length < 3 || stages.length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white text-xs font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/40 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest"
            >
              Criar Pipeline
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
