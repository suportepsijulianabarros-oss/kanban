import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Upload, 
  FileText, 
  Check, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Layout, 
  Tags, 
  User, 
  Database,
  ArrowRight,
  Info,
  Layers,
  Settings,
  Table,
  Plus
} from 'lucide-react';
import { useCRMKanban } from './CRMKanbanContext';
import { 
  CRM_FIELDS, 
  parseFile, 
  validateImportRows, 
  mapRowsToCards, 
  ImportFieldMapping, 
  ImportLeadRow,
  ImportDestination,
  identifyDuplicates
} from './crmKanban.importUtils';
import { Tag, Pipeline, PipelineStage, KanbanCard } from './crmKanban.types';
import { cn } from '../../lib/utils';

interface ImportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ImportStep = 'upload' | 'mapping' | 'destination' | 'review' | 'success';

export function ImportLeadsModal({ isOpen, onClose }: ImportLeadsModalProps) {
  const { 
    pipelines, 
    stages, 
    responsibles, 
    cards: existingCards,
    setCards,
    tags: systemTags, 
    bulkAddCards, 
    addSegment,
    addTags 
  } = useCRMKanban();

  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [columns, setColumns] = useState<string[]>([]);
  const [rawData, setRawData] = useState<ImportLeadRow[]>([]);
  const [fieldMapping, setFieldMapping] = useState<ImportFieldMapping[]>([]);
  
  // Destination State
  const [destination, setDestination] = useState<ImportDestination>({
    pipelineId: pipelines[0]?.id || '',
    stageId: stages.find(s => s.pipeline_id === pipelines[0]?.id)?.id || '',
    tags: [],
    responsibleId: responsibles[0]?.id || '',
    createSegment: false,
    segmentName: '',
    segmentDescription: '',
    duplicateStrategy: 'ignore'
  });

  const [importResult, setImportResult] = useState<any>(null);

  const reset = useCallback(() => {
    setStep('upload');
    setFile(null);
    setColumns([]);
    setRawData([]);
    setFieldMapping([]);
    setLoading(false);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setLoading(true);
    try {
      const { columns, data } = await parseFile(selectedFile);
      setFile(selectedFile);
      setColumns(columns);
      setRawData(data);
      
      // Auto-mapping based on column names
      const initialMapping = columns.map(col => {
        const lowerCol = col.toLowerCase();
        const field = CRM_FIELDS.find(f => 
          lowerCol.includes(f.label.toLowerCase()) || 
          lowerCol.includes(f.id.toLowerCase())
        );
        return { csvColumn: col, crmField: (field?.id as any) || 'ignore' };
      });
      setFieldMapping(initialMapping);
      setStep('mapping');
    } catch (err) {
      console.error('Error parsing file:', err);
      alert('Erro ao ler arquivo. Verifique o formato.');
    } finally {
      setLoading(false);
    }
  };

  const validationResult = useMemo(() => {
    if (step === 'upload' || !file) return null;
    return validateImportRows(rawData, fieldMapping);
  }, [rawData, fieldMapping, file, step]);

  const handleImport = () => {
    if (!validationResult) return;

    const { valid } = validationResult;
    
    let rowsToImport = [...valid];
    let rowsToUpdate: { row: ImportLeadRow, existingCard: KanbanCard }[] = [];
    
    if (destination.duplicateStrategy !== 'import') {
      const { newLeads, duplicates } = identifyDuplicates(valid, fieldMapping, existingCards);
      
      if (destination.duplicateStrategy === 'ignore') {
        rowsToImport = newLeads;
      } else if (destination.duplicateStrategy === 'update') {
        rowsToImport = newLeads;
        rowsToUpdate = duplicates;
      }
    }

    const cardsToImport = mapRowsToCards(
      rowsToImport,
      fieldMapping,
      destination,
      responsibles,
      systemTags
    );

    // Apply Tags
    if (destination.tags.length > 0) {
      addTags(destination.tags);
    }

    // Process Updates if strategy is 'update'
    if (rowsToUpdate.length > 0) {
      const updatedCardIds = new Set(rowsToUpdate.map(d => d.existingCard.id));
      
      // We map the duplicate rows to cards to get the new field values
      const mappedUpdatedCards = mapRowsToCards(
        rowsToUpdate.map(d => d.row),
        fieldMapping,
        destination,
        responsibles,
        systemTags
      );

      setCards(prev => prev.map(card => {
        const updateInfoIdx = rowsToUpdate.findIndex(d => d.existingCard.id === card.id);
        if (updateInfoIdx !== -1) {
          const newData = mappedUpdatedCards[updateInfoIdx];
          return {
            ...card,
            title: newData.title || card.title,
            value: newData.value || card.value,
            notes: newData.notes ? (card.notes ? `${card.notes}\n\n${newData.notes}` : newData.notes) : card.notes,
            lead: {
              ...card.lead,
              ...newData.lead,
              id: card.lead.id // preserve original lead id
            },
            tags: [...new Set([...card.tags.map(t => t.id), ...newData.tags.map(t => t.id)])]
              .map(id => [...card.tags, ...newData.tags].find(t => t.id === id)!)
          };
        }
        return card;
      }));
    }

    // Bulk Add New Cards
    if (cardsToImport.length > 0) {
      bulkAddCards(cardsToImport);
    }

    // Create Segment
    if (destination.createSegment && destination.segmentName) {
      addSegment({
        name: destination.segmentName,
        description: destination.segmentDescription || `Importação realizada em ${new Date().toLocaleDateString()}`,
        filters: {
          search: '',
          tags: destination.tags.map(t => t.id),
          tag_logic: 'any',
          pipeline_id: destination.pipelineId,
          stage_id: destination.stageId
        }
      });
    }

    setImportResult({
      newLeads: cardsToImport.length,
      updatedLeads: rowsToUpdate.length,
      ignoredLeads: destination.duplicateStrategy === 'ignore' ? rowsToUpdate.length : 0, // This logic needs to be careful
      invalidLeads: validationResult.invalid.length,
      totalDuplicates: duplicateStats.duplicateCount,
      strategy: destination.duplicateStrategy,
      pipeline: pipelines.find(p => p.id === destination.pipelineId)?.name,
      stage: stages.find(s => s.id === destination.stageId)?.name
    });
    
    setStep('success');
  };

  const duplicateStats = useMemo(() => {
    if (!validationResult || step !== 'review') return { newCount: 0, duplicateCount: 0 };
    const { newLeads, duplicates } = identifyDuplicates(validationResult.valid, fieldMapping, existingCards);
    return { newCount: newLeads.length, duplicateCount: duplicates.length };
  }, [validationResult, fieldMapping, existingCards, step]);

  const cardsToImportCount = useMemo(() => {
    if (destination.duplicateStrategy === 'import') return validationResult?.valid.length || 0;
    if (destination.duplicateStrategy === 'ignore') return duplicateStats.newCount;
    return duplicateStats.newCount; // only new ones are "imported" as new cards if strategy is update
  }, [destination.duplicateStrategy, validationResult, duplicateStats]);

  const cardsToUpdateCount = useMemo(() => {
    return destination.duplicateStrategy === 'update' ? duplicateStats.duplicateCount : 0;
  }, [destination.duplicateStrategy, duplicateStats]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden font-sans border border-white max-h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-12 py-10 border-b border-gray-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/30">
              <Upload size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 leading-none mb-1">Importar Leads</h2>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Sincronize sua base de contatos</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(['upload', 'mapping', 'destination', 'review', 'success'] as const).map((s, idx) => (
              <React.Fragment key={idx}>
                <div className={cn(
                  "h-2 w-2 rounded-full transition-all duration-500",
                  step === s ? "bg-blue-600 w-6" : idx < ['upload', 'mapping', 'destination', 'review', 'success'].indexOf(step) ? "bg-blue-200" : "bg-gray-100"
                )} />
                {idx < 4 && <div className="w-4 h-[1px] bg-gray-100" />}
              </React.Fragment>
            ))}
          </div>

          <button onClick={onClose} className="h-12 w-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all bg-gray-50 border border-gray-100">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 'upload' && (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="relative group cursor-pointer">
                  <input 
                    type="file" 
                    accept=".csv, .xlsx" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="h-40 w-40 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 group-hover:border-blue-400 group-hover:bg-blue-50/30 transition-all duration-500">
                    <FileText size={48} className="text-gray-300 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-500" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selecionar Arquivo</span>
                  </div>
                  {loading && (
                    <div className="absolute inset-0 bg-white/80 rounded-[40px] flex items-center justify-center">
                      <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="mt-10 space-y-3">
                  <h3 className="text-xl font-black text-gray-900">Envie uma planilha com seus leads</h3>
                  <p className="text-sm text-gray-500 max-w-md font-medium leading-relaxed">
                    Formatos suportados: CSV e Excel (.xlsx). Na próxima etapa, você poderá escolher quais colunas deseja importar.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-8 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 bg-green-100 text-green-600 rounded flex items-center justify-center text-[10px] font-bold">CSV</div>
                    <span className="text-xs font-bold text-gray-600">Texto separado por vírgula</span>
                  </div>
                  <div className="h-4 w-[1px] bg-gray-200" />
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-[10px] font-bold">XLSX</div>
                    <span className="text-xs font-bold text-gray-600">Planilha Microsoft Excel</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'mapping' && (
              <motion.div 
                key="mapping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 leading-none mb-2">Mapear campos</h3>
                    <p className="text-sm text-gray-400 font-medium">Relacione as colunas do seu arquivo com os campos do CRM.</p>
                  </div>
                  <div className="flex items-center gap-4 px-6 py-3 bg-blue-50 rounded-2xl border border-blue-100">
                    <Table size={20} className="text-blue-600" />
                    <span className="text-xs font-black text-blue-700 uppercase tracking-widest">{rawData.length} linhas detectadas</span>
                  </div>
                </div>

                <div className="bg-gray-50/50 rounded-[2.5rem] border border-gray-100 overflow-hidden">
                  <div className="p-8 space-y-6">
                    {fieldMapping.map((mapping, idx) => (
                      <div key={idx} className="flex items-center gap-10 group">
                        <div className="flex-1 space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Coluna no Arquivo</label>
                          <div className="px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-sm font-bold text-gray-700">
                            {mapping.csvColumn}
                          </div>
                        </div>
                        <div className="shrink-0 pt-6">
                          <ArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" size={20} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Campo no CRM</label>
                          <select
                            value={mapping.crmField}
                            onChange={(e) => {
                              const newMapping = [...fieldMapping];
                              newMapping[idx].crmField = e.target.value;
                              setFieldMapping(newMapping);
                            }}
                            className="w-full px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-sm font-black text-gray-700 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all cursor-pointer appearance-none"
                          >
                            <option value="ignore">Ignorar esta coluna</option>
                            {CRM_FIELDS.map(f => (
                              <option key={f.id} value={f.id}>{f.label} {f.required ? '*' : ''}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {validationResult?.invalid.length! > 0 && (
                  <div className="p-6 bg-amber-50 rounded-3xl border border-amber-200 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-sm font-black text-amber-900 leading-none mb-1">Atenção com algumas linhas</h4>
                      <p className="text-xs font-medium text-amber-700 leading-relaxed">
                        {validationResult?.invalid.length} linhas possuem problemas (nome ou contato ausente) e não serão importadas por padrão.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 'destination' && (
              <motion.div 
                key="destination"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-none mb-2">Destino e ações</h3>
                  <p className="text-sm text-gray-400 font-medium">Onde os novos leads serão colocados?</p>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  {/* Left Column: Pipeline & Responsible */}
                  <div className="space-y-10">
                    <section className="space-y-5">
                      <div className="flex items-center gap-3 ml-1">
                        <Layout size={18} className="text-blue-500" />
                        <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Pipeline de Destino</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Selecionar Pipeline</label>
                          <select 
                            value={destination.pipelineId}
                            onChange={(e) => {
                              const pId = e.target.value;
                              const firstStage = stages.find(s => s.pipeline_id === pId);
                              setDestination(prev => ({ ...prev, pipelineId: pId, stageId: firstStage?.id || '' }));
                            }}
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm text-sm font-black text-gray-700 outline-none focus:bg-white focus:border-blue-600 transition-all"
                          >
                            {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Etapa Inicial</label>
                          <select 
                            value={destination.stageId}
                            onChange={(e) => setDestination(prev => ({ ...prev, stageId: e.target.value }))}
                            className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm text-sm font-black text-gray-700 outline-none focus:bg-white focus:border-blue-600 transition-all"
                          >
                            {stages.filter(s => s.pipeline_id === destination.pipelineId).map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-5">
                      <div className="flex items-center gap-3 ml-1">
                        <User size={18} className="text-indigo-500" />
                        <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Responsável Padrão</h4>
                      </div>
                      <select 
                        value={destination.responsibleId}
                        onChange={(e) => setDestination(prev => ({ ...prev, responsibleId: e.target.value }))}
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm text-sm font-black text-gray-700 outline-none focus:bg-white focus:border-blue-600 transition-all"
                      >
                        {responsibles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </section>
                  </div>

                  {/* Right Column: Tags & Segment */}
                  <div className="space-y-10">
                    <section className="space-y-5">
                      <div className="flex items-center gap-3 ml-1">
                        <Tags size={18} className="text-emerald-500" />
                        <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Aplicar Tags</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {systemTags.map(tag => (
                          <button
                            key={tag.id}
                            onClick={() => {
                              const alreadyHas = destination.tags.some(t => t.id === tag.id);
                              setDestination(prev => ({
                                ...prev,
                                tags: alreadyHas ? prev.tags.filter(t => t.id !== tag.id) : [...prev.tags, tag]
                              }));
                            }}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-black transition-all border",
                              destination.tags.some(t => t.id === tag.id)
                                ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                                : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200"
                            )}
                          >
                            {tag.name}
                          </button>
                        ))}
                        <button className="px-4 py-2 rounded-xl text-xs font-black bg-gray-100 text-gray-400 hover:bg-gray-200 transition-all border border-transparent">
                          <Plus size={14} className="inline mr-1" /> Customizada
                        </button>
                      </div>
                    </section>

                    <section className="space-y-5">
                      <div className="flex items-center gap-3 ml-1">
                        <AlertCircle size={18} className="text-rose-500" />
                        <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Leads Duplicados</h4>
                      </div>
                      <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                          Como lidar com leads que já existem baseados em <span className="text-gray-600">Email</span> ou <span className="text-gray-600">Telefone</span>?
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { id: 'ignore', label: 'Ignorar', desc: 'Não importa duplicados', color: 'rose' },
                            { id: 'update', label: 'Atualizar', desc: 'Atualiza dados existentes', color: 'blue' },
                            { id: 'import', label: 'Importar Mesmo Assim', desc: 'Cria um novo card duplicado', color: 'emerald' },
                          ].map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => setDestination(prev => ({ ...prev, duplicateStrategy: opt.id as any }))}
                              className={cn(
                                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
                                destination.duplicateStrategy === opt.id 
                                  ? `bg-${opt.color}-50 border-${opt.color}-500 text-${opt.color}-700`
                                  : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                              )}
                            >
                              <div>
                                <p className="text-xs font-black uppercase">{opt.label}</p>
                                <p className="text-[9px] font-medium opacity-70">{opt.desc}</p>
                              </div>
                              {destination.duplicateStrategy === opt.id && <Check size={16} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section className="space-y-5">
                      <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-gray-700 uppercase tracking-wide">Criar segmento inteligente?</span>
                          <button 
                            onClick={() => setDestination(prev => ({ ...prev, createSegment: !prev.createSegment }))}
                            className={cn(
                              "w-12 h-7 rounded-full relative transition-all duration-300",
                              destination.createSegment ? "bg-emerald-500" : "bg-gray-300"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 left-1 h-5 w-5 bg-white rounded-full transition-all duration-300 shadow-sm",
                              destination.createSegment && "translate-x-5"
                            )} />
                          </button>
                        </div>
                        {destination.createSegment && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4 pt-4 border-t border-gray-200"
                          >
                            <input 
                              type="text" 
                              placeholder="Nome do segmento (ex: Importação Maio)"
                              value={destination.segmentName}
                              onChange={(e) => setDestination(prev => ({ ...prev, segmentName: e.target.value }))}
                              className="w-full px-5 py-3 bg-white rounded-xl border border-gray-100 text-sm font-bold text-gray-700 outline-none focus:border-blue-400"
                            />
                            <textarea 
                              placeholder="Descrição curta..."
                              value={destination.segmentDescription}
                              onChange={(e) => setDestination(prev => ({ ...prev, segmentDescription: e.target.value }))}
                              className="w-full px-5 py-3 bg-white rounded-xl border border-gray-100 text-sm font-medium text-gray-700 outline-none focus:border-blue-400 h-20 resize-none"
                            />
                          </motion.div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'review' && (
              <motion.div 
                key="review"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-12"
              >
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-none mb-2">Revisão final</h3>
                  <p className="text-sm text-gray-400 font-medium">Tudo pronto para injetar os dados.</p>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex flex-col items-center text-center gap-3">
                    <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                      <Plus size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Novos Cards</p>
                      <p className="text-2xl font-black text-gray-900">{cardsToImportCount}</p>
                    </div>
                  </div>
                  <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex flex-col items-center text-center gap-3">
                    <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                      <Settings size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">Atualizados</p>
                      <p className="text-2xl font-black text-gray-900">{cardsToUpdateCount}</p>
                    </div>
                  </div>
                  <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex flex-col items-center text-center gap-3">
                    <div className="h-10 w-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                      <X size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Ignorados</p>
                      <p className="text-2xl font-black text-gray-900">
                        {destination.duplicateStrategy === 'ignore' 
                          ? (validationResult?.invalid.length || 0) + duplicateStats.duplicateCount
                          : (validationResult?.invalid.length || 0)
                        }
                      </p>
                    </div>
                  </div>
                  <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex flex-col items-center text-center gap-3">
                    <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/20">
                      <Check size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Prontos</p>
                      <p className="text-2xl font-black text-gray-900">{cardsToImportCount + cardsToUpdateCount}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-[3rem] p-10 border border-gray-100 grid grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-gray-400">
                        <Layout size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Destino</p>
                        <p className="text-sm font-black text-gray-800">
                          {pipelines.find(p => p.id === destination.pipelineId)?.name} • {stages.find(s => s.id === destination.stageId)?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-gray-400">
                        <Tags size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Tags Adicionais</p>
                        <p className="text-sm font-black text-gray-800">
                          {destination.tags.length > 0 ? destination.tags.map(t => t.name).join(', ') : 'Nenhuma tag extra'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-gray-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Responsável</p>
                        <p className="text-sm font-black text-gray-800">
                          {responsibles.find(r => r.id === destination.responsibleId)?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-gray-400">
                        <Database size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Segmentação</p>
                        <p className="text-sm font-black text-gray-800">
                          {destination.createSegment ? `Criar segmento: ${destination.segmentName}` : 'Não criar segmento'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                  <Info className="text-blue-600 shrink-0" size={20} />
                  <p className="text-xs font-medium text-blue-800 leading-relaxed">
                    Ao confirmar, os leads serão injatados instantaneamente no CRM e estarão disponíveis para consulta e exportação.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 'success' && importResult && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 text-center space-y-8"
              >
                <div className="h-24 w-24 bg-emerald-100 rounded-[2.5rem] flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/10 animate-bounce">
                  <Check size={48} />
                </div>

                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight">Importação Concluída!</h3>
                  <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto">
                    Os dados foram processados e injetados com sucesso no pipeline <span className="text-blue-600 font-bold">{importResult.pipeline}</span>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                  <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">
                      {importResult.newLeads}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Novos Leads</p>
                      <p className="text-sm font-bold text-gray-700">Criados no sistema</p>
                    </div>
                  </div>

                  <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                      {importResult.updatedLeads}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Leads Atualizados</p>
                      <p className="text-sm font-bold text-gray-700">Dados complementados</p>
                    </div>
                  </div>

                  <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 opacity-60">
                    <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-black">
                      {importResult.strategy === 'ignore' ? importResult.totalDuplicates : 0}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duplicados Ignorados</p>
                      <p className="text-sm font-bold text-gray-700">Com base em sua escolha</p>
                    </div>
                  </div>

                  <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 opacity-60">
                    <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-black">
                      {importResult.invalidLeads}
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Linhas Inválidas</p>
                      <p className="text-sm font-bold text-gray-700">Dados ausentes ou corrompidos</p>
                    </div>
                  </div>
                </div>

                {destination.createSegment && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                    <Check size={16} className="text-emerald-600" />
                    <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Segmento "{destination.segmentName}" criado com sucesso</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-12 py-10 border-t border-gray-50 bg-gray-50/20 flex gap-6 shrink-0">
          {step !== 'upload' && step !== 'success' && (
            <button 
              onClick={() => {
                if (step === 'mapping') setStep('upload');
                else if (step === 'destination') setStep('mapping');
                else if (step === 'review') setStep('destination');
              }}
              className="px-8 py-5 border border-gray-100 bg-white text-gray-400 text-xs font-black rounded-[2rem] hover:bg-gray-50 transition-all uppercase tracking-widest flex items-center gap-3"
            >
              <ChevronLeft size={18} />
              Voltar
            </button>
          )}
          
          <div className="flex-1" />

          {step === 'success' ? (
            <button 
              onClick={() => {
                onClose();
                reset();
              }}
              className="px-16 py-5 bg-blue-600 text-white text-xs font-black rounded-[2rem] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-1 transition-all uppercase tracking-widest"
            >
              Concluir e Fechar
            </button>
          ) : step !== 'upload' && (
            <button 
              onClick={() => {
                if (step === 'mapping') setStep('destination');
                else if (step === 'destination') setStep('review');
                else if (step === 'review') handleImport();
              }}
              className={cn(
                "px-12 py-5 text-white text-xs font-black rounded-[2rem] shadow-2xl transition-all uppercase tracking-widest flex items-center gap-4",
                step === 'review' ? "bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-700" : "bg-blue-600 shadow-blue-600/30 hover:bg-blue-700"
              )}
            >
              {step === 'review' ? 'Confirmar e Importar' : 'Próxima Etapa'}
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
