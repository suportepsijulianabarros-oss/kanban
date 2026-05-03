import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Check, 
  Database,
  Users,
  Filter,
  CheckSquare,
  Square,
  ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { KanbanCard, LeadSegment, Pipeline, PipelineStage } from './crmKanban.types';
import { useCRMKanban } from './CRMKanbanContext';
import { cn } from '../../lib/utils';
import { applyFilters } from './crmKanban.utils';

interface ExportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredLeads: KanbanCard[];
}

type ExportFormat = 'csv' | 'xlsx';
type ExportSource = 'selected' | 'filtered' | 'segment';

interface ExportField {
  id: string;
  label: string;
  required?: boolean;
}

const EXPORT_FIELDS: ExportField[] = [
  { id: 'name', label: 'Nome', required: true },
  { id: 'phone', label: 'Telefone', required: true },
  { id: 'email', label: 'Email' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'stage', label: 'Etapa no CRM' },
  { id: 'responsible', label: 'Responsável' },
  { id: 'source', label: 'Origem' },
  { id: 'status', label: 'Status' },
  { id: 'tags', label: 'Tags' },
  { id: 'value', label: 'Valor estimado' },
  { id: 'next_action', label: 'Próxima ação' },
  { id: 'last_activity', label: 'Última atividade' },
  { id: 'created_at', label: 'Data de criação' },
];

export function ExportLeadsModal({ isOpen, onClose, filteredLeads }: ExportLeadsModalProps) {
  const { 
    cards,
    selectedLeadIds, 
    activeSegmentId, 
    segments, 
    pipelines, 
    pipelineStages: stages 
  } = useCRMKanban();

  const [format, setFormat] = useState<ExportFormat>('csv');
  const [source, setSource] = useState<ExportSource>(selectedLeadIds.length > 0 ? 'selected' : 'filtered');
  const [selectedFields, setSelectedFields] = useState<string[]>(EXPORT_FIELDS.map(f => f.id));
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(activeSegmentId || (segments[0]?.id || ''));

  const activeSegment = segments.find(s => s.id === activeSegmentId);
  const selectedSegment = segments.find(s => s.id === selectedSegmentId);

  const toggleField = (fieldId: string) => {
    const field = EXPORT_FIELDS.find(f => f.id === fieldId);
    if (field?.required) return;

    setSelectedFields(prev => 
      prev.includes(fieldId) ? prev.filter(id => id !== fieldId) : [...prev, fieldId]
    );
  };

  const getLeadsToExport = () => {
    switch (source) {
      case 'selected':
        return filteredLeads.filter(l => selectedLeadIds.includes(l.id));
      case 'segment':
        if (selectedSegment) {
          return applyFilters(cards, selectedSegment.filters);
        }
        return [];
      case 'filtered':
      default:
        return filteredLeads;
    }
  };

  const generateData = () => {
    const leads = getLeadsToExport();
    
    return leads.map(lead => {
      const row: any = {};
      const pipeline = pipelines.find(p => p.id === stages.find(s => s.id === lead.stage_id)?.pipeline_id);
      const stage = stages.find(s => s.id === lead.stage_id);

      if (selectedFields.includes('name')) row['Nome'] = lead.lead.name;
      if (selectedFields.includes('phone')) row['Telefone'] = lead.lead.phone || '-';
      if (selectedFields.includes('email')) row['Email'] = lead.lead.email || '-';
      if (selectedFields.includes('pipeline')) row['Pipeline'] = pipeline?.name || '-';
      if (selectedFields.includes('stage')) row['Etapa no CRM'] = stage?.name || '-';
      if (selectedFields.includes('responsible')) row['Responsável'] = lead.responsible?.name || '-';
      if (selectedFields.includes('source')) row['Origem'] = lead.lead.source || '-';
      if (selectedFields.includes('status')) row['Status'] = lead.status.toUpperCase();
      if (selectedFields.includes('tags')) row['Tags'] = lead.tags.map(t => t.name).join(', ');
      if (selectedFields.includes('value')) row['Valor estimado'] = lead.value;
      if (selectedFields.includes('next_action')) row['Próxima ação'] = lead.next_action ? new Date(lead.next_action).toLocaleDateString() : '-';
      if (selectedFields.includes('last_activity')) row['Última atividade'] = lead.last_activity?.description || '-';
      if (selectedFields.includes('created_at')) row['Data de criação'] = new Date(lead.created_at).toLocaleDateString();

      return row;
    });
  };

  const handleExport = () => {
    const data = generateData();
    const fileName = `export_leads_${new Date().toISOString().split('T')[0]}`;

    if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leads");
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    } else {
      // CSV
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${fileName}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
              <div className="h-14 w-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-600/20">
                <Download size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-none mb-1">Exportar Leads</h2>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Extraia seus dados com precisão</p>
              </div>
            </div>
            <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all">
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          {/* Format Selection */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest ml-1">1. Formato do Arquivo</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setFormat('csv')}
                className={cn(
                  "p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 text-center",
                  format === 'csv' 
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-500/10" 
                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                )}
              >
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors",
                  format === 'csv' ? "bg-emerald-500 text-white" : "bg-gray-50 text-gray-400"
                )}>
                  <FileText size={24} />
                </div>
                <span className="text-sm font-black uppercase tracking-wider">Arquivo CSV</span>
                <p className="text-[10px] font-medium opacity-60">Ideal para importar em outros sistemas</p>
              </button>
              <button 
                onClick={() => setFormat('xlsx')}
                className={cn(
                  "p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 text-center",
                  format === 'xlsx' 
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-500/10" 
                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                )}
              >
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors",
                  format === 'xlsx' ? "bg-emerald-500 text-white" : "bg-gray-50 text-gray-400"
                )}>
                  <FileSpreadsheet size={24} />
                </div>
                <span className="text-sm font-black uppercase tracking-wider">Excel (.xlsx)</span>
                <p className="text-[10px] font-medium opacity-60">Perfeito para relatórios e análise manual</p>
              </button>
            </div>
          </section>

          {/* Source Selection */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest ml-1">2. Origem dos Dados</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setSource('selected')}
                disabled={selectedLeadIds.length === 0}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between",
                  source === 'selected' 
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200",
                  selectedLeadIds.length === 0 && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  <CheckSquare size={18} />
                  <span className="text-xs font-black uppercase">Leads Selecionados ({selectedLeadIds.length})</span>
                </div>
                {source === 'selected' && <Check size={16} />}
              </button>
              
              <button 
                onClick={() => setSource('filtered')}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between",
                  source === 'filtered' 
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <Filter size={18} />
                  <span className="text-xs font-black uppercase">Resultado Filtrado ({filteredLeads.length})</span>
                </div>
                {source === 'filtered' && <Check size={16} />}
              </button>

              <button 
                onClick={() => setSource('segment')}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 transition-all flex flex-col items-stretch gap-4",
                  source === 'segment' 
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Database size={18} />
                    <span className="text-xs font-black uppercase">Exportar Segmento Salvo</span>
                  </div>
                  {source === 'segment' && <Check size={16} />}
                </div>

                <div className="relative group">
                  <select 
                    value={selectedSegmentId}
                    onChange={(e) => {
                      setSelectedSegmentId(e.target.value);
                      setSource('segment');
                    }}
                    className={cn(
                      "w-full pl-5 pr-10 py-3 rounded-xl border appearance-none text-[11px] font-black uppercase tracking-widest outline-none transition-all",
                      source === 'segment' 
                        ? "bg-white border-emerald-200 text-emerald-700" 
                        : "bg-gray-50 border-gray-100 text-gray-400"
                    )}
                  >
                    {segments.length === 0 ? (
                      <option disabled>Nenhum segmento salvo</option>
                    ) : (
                      segments.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.count} leads)</option>
                      ))
                    )}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                </div>
              </button>
            </div>
          </section>

          {/* Fields Selection */}
          <section className="space-y-4">
            <div className="flex items-center justify-between ml-1 text-gray-500">
              <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">3. Campos para Exportar</h3>
              <div className="flex gap-4">
                <button 
                  onClick={() => setSelectedFields(EXPORT_FIELDS.map(f => f.id))}
                  className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                >
                  Todos
                </button>
                <div className="w-[1px] h-3 bg-gray-200 self-center" />
                <button 
                  onClick={() => setSelectedFields(EXPORT_FIELDS.filter(f => f.required).map(f => f.id))}
                  className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 hover:underline"
                >
                  Limpar
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {EXPORT_FIELDS.map(field => {
                const isSelected = selectedFields.includes(field.id);
                const isRequired = field.required;
                
                return (
                  <button
                    key={field.id}
                    onClick={() => toggleField(field.id)}
                    className={cn(
                      "p-3 rounded-xl border text-left flex items-center gap-2 transition-all",
                      isSelected
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                        : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200"
                    )}
                  >
                    {isSelected ? <CheckSquare size={14} className="shrink-0" /> : <Square size={14} className="shrink-0" />}
                    <span className="text-[11px] font-bold uppercase tracking-tight truncate">{field.label}</span>
                    {isRequired && <span className="text-[9px] font-black text-emerald-500 ml-auto">*</span>}
                  </button>
                );
              })}
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
            onClick={handleExport}
            className="flex-1 px-8 py-4 bg-emerald-600 text-white text-xs font-black rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-emerald-600/40 transition-all uppercase tracking-widest flex items-center justify-center gap-3"
          >
            <Download size={16} />
            Gerar Arquivo
          </button>
        </div>
      </motion.div>
    </div>
  );
}
