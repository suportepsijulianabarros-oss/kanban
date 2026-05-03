import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  Mail, 
  Calendar, 
  TrendingUp,
  Search,
  ArrowUpDown,
  Check,
  ListRestart,
  X,
  Download,
  Upload,
  ChevronDown,
  UserPlus,
  FileText,
  LayoutGrid,
  MoreHorizontal
} from 'lucide-react';
import { KanbanCard, Tag } from './crmKanban.types';
import { formatKanbanCurrency } from './crmKanban.utils';
import { cn } from '../../lib/utils';
import { useCRMKanban } from './CRMKanbanContext';
import { SegmentManager } from './SegmentManager';
import { ExportLeadsModal } from './ExportLeadsModal';
import { ImportLeadsModal } from './ImportLeadsModal';

interface LeadsListViewProps {
  onLeadClick: (lead: KanbanCard) => void;
  leads: KanbanCard[];
}

type SortKey = 'title' | 'value' | 'next_action';

export function LeadsListView({ onLeadClick, leads }: LeadsListViewProps) {
  const { 
    pipelineStages: stages, 
    selectedLeadIds, 
    toggleLeadSelection, 
    selectAllLeads, 
    clearLeadSelection,
    responsibles,
    bulkUpdateCards,
    filters,
    setFilters,
    tags
  } = useCRMKanban();
  const [sortConfig, setSortConfig] = React.useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [isBulkMenuOpen, setIsBulkMenuOpen] = React.useState(false);
  const [isResponsibleMenuOpen, setIsResponsibleMenuOpen] = React.useState(false);

  const selectedLeads = React.useMemo(() => 
    leads.filter(l => selectedLeadIds.includes(l.id))
  , [leads, selectedLeadIds]);

  const sortedLeads = React.useMemo(() => {
    if (!sortConfig) return leads;

    return [...leads].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === undefined || bValue === undefined) return 0;

      if (sortConfig.key === 'value') {
        return sortConfig.direction === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leads, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const isAllSelected = leads.length > 0 && leads.every(lead => selectedLeadIds.includes(lead.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      clearLeadSelection();
    } else {
      selectAllLeads(leads.map(l => l.id));
    }
  };

  return (
    <div className="flex gap-10 flex-1 overflow-hidden relative">
      <SegmentManager />
      
      <div className="flex-1 bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans flex flex-col relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between px-8 py-6 border-b border-gray-50 bg-gray-50/5 text-gray-500 gap-4 lg:gap-0">
           <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
               <div className="h-6 w-6 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                 <ListRestart size={12} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{leads.length} Leads Encontrados</span>
             </div>

             <div className="hidden xl:flex items-center gap-4 border-l border-gray-100 pl-6">
               {/* Search */}
               <div className="relative group min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={14} />
                  <input 
                    type="text" 
                    placeholder="Pesquisar leads..." 
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full bg-white border border-gray-100 rounded-xl py-2 pl-9 pr-3 text-[11px] font-bold text-gray-700 placeholder:text-gray-300 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                  />
               </div>

               {/* Responsible */}
               <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Resp:</span>
                  <select 
                    value={filters.responsible_id || 'all'}
                    onChange={(e) => setFilters({ ...filters, responsible_id: e.target.value })}
                    className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-[11px] font-bold text-gray-600 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm cursor-pointer appearance-none min-w-[120px]"
                  >
                    <option value="all">Todos</option>
                    {responsibles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
               </div>

               {/* Tags */}
               <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Tag:</span>
                  <select 
                    value={filters.tags?.[0] || 'all'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFilters({ ...filters, tags: val === 'all' ? [] : [val] });
                    }}
                    className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-[11px] font-bold text-gray-600 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm cursor-pointer appearance-none min-w-[120px]"
                  >
                    <option value="all">Qualquer Tag</option>
                    {tags.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
               </div>
             </div>
           </div>
           <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsImportModalOpen(true)}
               className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all text-gray-600 shadow-sm"
             >
               <Upload size={12} />
               Importar leads
             </button>
             <button 
               onClick={() => setIsExportModalOpen(true)}
               className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all text-gray-600 shadow-sm"
             >
               <Download size={12} />
               Exportar Leads
             </button>
           </div>
        </div>
        <div className="overflow-x-auto min-h-[400px] no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/10">
              <th className="pl-8 py-6 w-10">
                <div 
                  onClick={handleSelectAll}
                  className={cn(
                    "h-4 w-4 rounded border transition-all cursor-pointer flex items-center justify-center",
                    isAllSelected ? "bg-blue-600 border-blue-600 shadow-sm" : "bg-white border-gray-200 hover:border-blue-400"
                  )}
                >
                  {isAllSelected && <Check size={10} strokeWidth={4} className="text-white" />}
                </div>
              </th>
              <th className="pr-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                <button 
                  onClick={() => requestSort('title')}
                  className="flex items-center gap-2 cursor-pointer hover:text-gray-600 transition-colors uppercase"
                >
                  Oportunidade
                  <ArrowUpDown size={10} className={cn(sortConfig?.key === 'title' ? 'text-blue-600' : 'text-gray-300')} />
                </button>
              </th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Contato</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none text-center">Responsável</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none text-center">Etapa</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none text-right">
                <button 
                  onClick={() => requestSort('value')}
                  className="w-full flex items-center justify-end gap-2 cursor-pointer hover:text-gray-600 transition-colors uppercase font-black"
                >
                  Valor
                  <ArrowUpDown size={10} className={cn(sortConfig?.key === 'value' ? 'text-blue-600' : 'text-gray-300')} />
                </button>
              </th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                <button 
                  onClick={() => requestSort('next_action')}
                  className="flex items-center gap-2 cursor-pointer hover:text-gray-600 transition-colors uppercase font-black"
                >
                  Ação
                  <ArrowUpDown size={10} className={cn(sortConfig?.key === 'next_action' ? 'text-blue-600' : 'text-gray-300')} />
                </button>
              </th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none text-center">Última Ativ.</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/50">
            {sortedLeads.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 text-gray-300">
                    <div className="h-16 w-16 bg-gray-50 rounded-[2rem] flex items-center justify-center">
                      <Search size={32} className="opacity-20" />
                    </div>
                    <div className="text-center">
                      <p className="font-black text-sm text-gray-900 uppercase tracking-widest">Nenhum lead encontrado</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Tente ajustar seus filtros de pesquisa</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              sortedLeads.map((lead) => (
                <LeadsTableRow 
                  key={lead.id} 
                  lead={lead} 
                  onClick={() => onLeadClick(lead)} 
                  stages={stages} 
                  isSelected={selectedLeadIds.includes(lead.id)}
                  onToggleSelection={(e) => {
                    e.stopPropagation();
                    toggleLeadSelection(lead.id);
                  }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Selection Bar */}
      <AnimatePresence>
        {selectedLeadIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-xl px-10 py-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 flex items-center gap-10 z-50 min-w-max"
          >
            <div className="flex items-center gap-4 border-r border-white/10 pr-10">
              <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <Check size={20} strokeWidth={3} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-white leading-none mb-1">{selectedLeadIds.length} <span className="opacity-50 font-bold ml-1">leads selecionados</span></span>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Ações em massa disponíveis</p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="relative">
                <button 
                  onClick={() => setIsBulkMenuOpen(!isBulkMenuOpen)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                >
                  <LayoutGrid size={14} />
                  Ações em Massa
                  <ChevronDown size={12} className={cn("transition-transform", isBulkMenuOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isBulkMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => { setIsBulkMenuOpen(false); setIsResponsibleMenuOpen(false); }} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full mb-4 left-0 w-64 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden z-20 p-2"
                      >
                        <div className="p-2">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-3">Exportação</p>
                          <button 
                            onClick={() => {
                              setIsExportModalOpen(true);
                              setIsBulkMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all"
                          >
                            <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <Download size={14} />
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="text-[11px] font-black uppercase">Exportar para CSV/Excel</span>
                              <span className="text-[9px] font-medium opacity-70">Escolha campos e formato</span>
                            </div>
                          </button>
                        </div>

                        <div className="p-2 border-t border-gray-50 mt-1">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-3">Gestão</p>
                          <div className="relative">
                            <button 
                              onClick={() => setIsResponsibleMenuOpen(!isResponsibleMenuOpen)}
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-3 hover:bg-blue-50 text-blue-600 rounded-xl transition-all",
                                isResponsibleMenuOpen && "bg-blue-50"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <UserPlus size={14} />
                                </div>
                                <div className="flex flex-col text-left">
                                  <span className="text-[11px] font-black uppercase">Mudar Responsável</span>
                                  <span className="text-[9px] font-medium opacity-70">Atribuir a outro usuário</span>
                                </div>
                              </div>
                              <ChevronDown size={12} className={cn("-rotate-90 transition-transform", isResponsibleMenuOpen && "rotate-0")} />
                            </button>

                            <AnimatePresence>
                              {isResponsibleMenuOpen && (
                                <motion.div 
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                  className="absolute bottom-0 left-full ml-2 w-56 bg-white rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden p-2 z-30"
                                >
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-3">Selecionar Usuário</p>
                                  <div className="max-h-48 overflow-y-auto no-scrollbar py-1">
                                    {responsibles.map(resp => (
                                      <button
                                        key={resp.id}
                                        onClick={() => {
                                          bulkUpdateCards(selectedLeadIds, { responsible: resp });
                                          setIsBulkMenuOpen(false);
                                          setIsResponsibleMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-all"
                                      >
                                        <div className="h-7 w-7 bg-gray-900 rounded-lg flex items-center justify-center text-[9px] font-black text-white">
                                          {resp.initials}
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-700">{resp.name}</span>
                                      </button>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-px h-6 bg-white/10" />

              <button 
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-2.5 text-xs font-black text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest"
              >
                <Download size={14} />
                Exportar
              </button>
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2.5 text-xs font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
              >
                <Upload size={14} />
                Importar
              </button>
              <button className="flex items-center gap-2.5 text-xs font-black text-white hover:text-blue-400 transition-colors uppercase tracking-widest grayscale hover:grayscale-0">
                <Phone size={14} className="text-blue-500" />
                Agendar Chamada
              </button>
              <button className="flex items-center gap-2.5 text-xs font-black text-white hover:text-indigo-400 transition-colors uppercase tracking-widest grayscale hover:grayscale-0">
                <TrendingUp size={14} className="text-indigo-500" />
                Mudar Etapa
              </button>
              <button 
                onClick={clearLeadSelection}
                className="h-10 w-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all ml-4"
                title="Limpar seleção"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Modals */}
      <ExportLeadsModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        filteredLeads={selectedLeadIds.length > 0 ? selectedLeads : leads}
      />
      <ImportLeadsModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
    </div>
  </div>
);
}

interface LeadsTableRowProps {
  lead: KanbanCard;
  onClick: () => void;
  stages: any[];
  isSelected: boolean;
  onToggleSelection: (e: React.MouseEvent) => void;
}

function LeadsTableRow({ lead, onClick, stages, isSelected, onToggleSelection }: LeadsTableRowProps) {
  const stage = stages.find(s => s.id === lead.stage_id);
  const isOverdue = lead.next_action && new Date(lead.next_action) < new Date();

  return (
    <tr 
      onClick={onClick}
      className={cn(
        "group hover:bg-blue-50/10 transition-all cursor-pointer font-sans",
        isSelected && "bg-blue-50/30"
      )}
    >
      <td className="pl-8 py-6">
        <div 
          onClick={onToggleSelection}
          className={cn(
            "h-4 w-4 rounded border transition-all flex items-center justify-center",
            isSelected ? "bg-blue-600 border-blue-600 shadow-sm" : "bg-white border-gray-200 group-hover:border-blue-400"
          )}
        >
          {isSelected && <Check size={10} strokeWidth={4} className="text-white" />}
        </div>
      </td>
      <td className="pr-8 py-6">
        <div className="flex items-center gap-4">
          {lead.lead.photoUrl ? (
            <img 
              src={lead.lead.photoUrl} 
              alt={lead.lead.name}
              className="h-11 w-11 rounded-2xl object-cover ring-4 ring-gray-50 flex-shrink-0 shadow-sm group-hover:ring-blue-50 transition-all"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-11 w-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-black border border-blue-100 flex-shrink-0 shadow-sm group-hover:bg-blue-100 transition-all">
              {lead.lead.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col gap-1.5 overflow-hidden">
            <span className="text-[14px] font-black text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight leading-tight truncate">{lead.title}</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lead.lead.name}</span>
              <div className="flex items-center gap-1.5">
                {lead.tags.slice(0, 2).map((tag: Tag) => (
                  <span 
                    key={tag.id}
                    className="px-2 py-0.5 rounded-md text-[8px] font-black text-white uppercase tracking-widest shadow-sm shadow-black/5"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
                {lead.tags.length > 2 && (
                  <span className="text-[9px] font-black text-gray-200 uppercase tracking-widest">+{lead.tags.length - 2}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5 text-[11px] font-bold text-gray-600">
            <Phone size={12} className="text-blue-500 opacity-50" />
            {lead.lead.phone}
          </div>
          <div className="flex items-center gap-2.5 text-[11px] font-bold text-gray-400">
            <Mail size={12} className="text-gray-300" />
            <span className="truncate max-w-[140px]">{lead.lead.email}</span>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex flex-col items-center">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center text-[10px] font-black text-white shadow-xl shadow-black/10 mb-2 border border-white/10 ring-4 ring-gray-50/50">
            {lead.responsible?.initials}
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lead.responsible?.name.split(' ')[0]}</span>
        </div>
      </td>
      <td className="px-8 py-6 text-center">
        <div 
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50/50 text-[9px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100/50 group-hover:bg-white transition-all shadow-sm"
        >
          <TrendingUp size={11} className="opacity-70" />
          {stage?.name}
        </div>
      </td>
      <td className="px-8 py-6 text-right">
        <div className="inline-block px-3 py-2 rounded-2xl bg-gray-50 border border-gray-100 shadow-inner">
          <span className="text-[14px] font-black text-blue-600 tracking-tight">
            {formatKanbanCurrency(lead.value, lead.currency)}
          </span>
        </div>
      </td>
      <td className="px-8 py-6">
        {lead.next_action ? (
          <div className={cn(
            "flex flex-col gap-1.5 px-3.5 py-2.5 rounded-2xl transition-all shadow-sm border",
            isOverdue 
              ? "bg-rose-50 border-rose-100 text-rose-600" 
              : "bg-blue-50 border-blue-100 text-blue-600"
          )}>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest leading-none">
              <Calendar size={12} className="opacity-60" />
              {new Date(lead.next_action).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest pl-2">
             <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
             Sem agenda
          </div>
        )}
      </td>
      <td className="px-8 py-6 text-center">
        <div className="bg-gray-50/80 px-2.5 py-1.5 rounded-xl border border-gray-100 group-hover:bg-white transition-all">
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
            {lead.last_activity?.type === 'call' && 'Chamada'}
            {lead.last_activity?.type === 'email' && 'E-mail'}
            {lead.last_activity?.type === 'meeting' && 'Reunião'}
            {lead.last_activity?.type === 'note' && 'Nota'}
            {lead.last_activity?.type === 'task' && 'Tarefa'}
            {lead.last_activity?.type === 'whatsapp' && 'WhatsApp'}
            {lead.last_activity?.type === 'stage_change' && 'Etapa'}
            {lead.last_activity?.type === 'proposal' && 'Proposta'}
            {lead.last_activity?.type === 'follow_up' && 'Follow-up'}
            {lead.last_activity?.type === 'won' && 'Venda'}
            {lead.last_activity?.type === 'lost' && 'Perda'}
            {!lead.last_activity && '-'}
          </span>
        </div>
      </td>
      <td className="px-8 py-6 text-center">
        <StatusBadge status={lead.status} />
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: KanbanCard['status'] }) {
  const config = {
    open: { label: 'Aberto', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    won: { label: 'Ganho', color: 'bg-green-100 text-green-700 border-green-200' },
    lost: { label: 'Perdido', color: 'bg-red-100 text-red-700 border-red-200' },
  };

  const current = config[status] || config.open;

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
      current.color
    )}>
      {current.label}
    </span>
  );
}
