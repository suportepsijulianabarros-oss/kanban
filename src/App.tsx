import { useState, useEffect } from 'react';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { Layout } from './components/Layout';
import { 
  Loader2, 
  Plus, 
  Search, 
  Kanban as KanbanIcon, 
  List, 
  Activity as ActivityIcon, 
  BarChart3, 
  Settings,
  Bell
} from 'lucide-react';
import { applyFilters } from './components/kanban/crmKanban.utils';
import { LeadDrawer } from './components/kanban/LeadDrawer';
import { LeadFormModal } from './components/kanban/LeadFormModal';
import { cn } from './lib/utils';
import { KanbanFiltersBar } from './components/kanban/KanbanFiltersBar';
import { LeadsListView } from './components/kanban/LeadsListView';
import { ActivitiesView } from './components/kanban/ActivitiesView';
import { CRMReportsView } from './components/kanban/CRMReportsView';
import { CRMSettingsView } from './components/kanban/CRMSettingsView';
import { useCRMKanban } from './components/kanban/CRMKanbanContext';
import { PipelineSelector } from './components/kanban/PipelineSelector';

export default function App() {
  const {
    cards,
    stages,
    selectedPipelineId,
    filters,
    setFilters,
    activeTab,
    setActiveTab,
    selectedCard,
    setSelectedCard,
    setIsModalOpen,
    setEditingCard,
    setPreselectedStageId,
  } = useCRMKanban();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const pipelineStages = stages.filter(s => s.pipeline_id === selectedPipelineId);
  const pipelineStageIds = pipelineStages.map(s => s.id);
  const pipelineCards = cards.filter(c => pipelineStageIds.includes(c.stage_id));
  const filteredCards = applyFilters(pipelineCards, filters);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pipeline':
        return (
          <div className="flex-1 overflow-hidden flex flex-col p-10 bg-gray-50/20">
            <PipelineSelector />
            <KanbanFiltersBar />
            
            <div className="flex-1 overflow-x-auto relative">
              {filteredCards.length === 0 && (
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                    <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                      <Search className="text-gray-300" size={32} />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-black text-gray-900">Nenhum resultado</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Tente ajustar seus filtros</p>
                    </div>
                    <button 
                      onClick={() => setFilters({ search: '', tags: [], responsible_id: 'all' })}
                      className="pointer-events-auto mt-2 px-6 py-2.5 bg-blue-600 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
                    >
                      Limpar filtros
                    </button>
                  </div>
                </div>
              )}
              <KanbanBoard />
            </div>
          </div>
        );
      case 'lista':
        return (
          <div className="flex-1 overflow-hidden flex flex-col p-10 bg-gray-50/20">
            <PipelineSelector />
            <KanbanFiltersBar />
            <LeadsListView onLeadClick={setSelectedCard as any} leads={filteredCards} />
          </div>
        );
      case 'atividades':
        return <ActivitiesView onLeadClick={setSelectedCard} />;
      case 'relatorios':
        return <CRMReportsView />;
      case 'configuracoes':
        return <CRMSettingsView />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="flex h-full flex-col overflow-hidden bg-white">
        {/* Section Header */}
        <div className="px-10 pt-10 pb-0 shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6 lg:gap-0 font-sans">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <KanbanIcon size={20} className="text-white" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tightest">CRM Kanban</h1>
              </div>
              <p className="text-xs lg:text-sm font-bold text-gray-400 pl-13">Gerencie oportunidades comerciais por etapa</p>
            </div>
            
            <div className="flex items-center gap-4 lg:gap-6">
              <div className="relative group flex-1 lg:flex-none">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-all duration-300" size={16} />
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="rounded-2xl border border-gray-100 bg-gray-50/30 py-2.5 pl-11 pr-6 text-sm font-bold text-gray-600 placeholder:text-gray-300 focus:border-blue-200 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all w-full lg:w-72 shadow-inner"
                />
              </div>
              
              <div className="flex items-center gap-2 lg:gap-3">
                <button className="relative rounded-xl p-3 text-gray-300 hover:bg-gray-50 hover:text-gray-500 transition-all hidden md:block">
                  <Bell size={18} />
                  <span className="absolute right-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>
                
                <button 
                  onClick={() => {
                    setEditingCard(null);
                    setPreselectedStageId(undefined);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs lg:text-sm font-black text-white shadow-xl shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shrink-0"
                >
                  <Plus size={18} className="stroke-[3]" />
                  <span>Novo lead</span>
                </button>
              </div>

              <div className="flex items-center gap-3 pl-4 lg:pl-6 border-l border-gray-100 shrink-0">
                <div className="text-right hidden xl:block">
                  <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">João Agente</p>
                  <p className="text-[10px] font-bold text-gray-400">Comercial</p>
                </div>
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center font-black text-blue-600 text-[10px] shadow-sm cursor-pointer hover:scale-105 transition-transform">
                  JA
                </div>
              </div>
            </div>
          </div>

          {/* Internal Navigation Tabs */}
          <div className="flex items-center gap-6 lg:gap-10 border-b border-gray-100 overflow-x-auto no-scrollbar">
            <TabButton 
              active={activeTab === 'pipeline'} 
              onClick={() => setActiveTab('pipeline')}
              label="Pipeline"
              icon={<KanbanIcon size={16} />}
              count={pipelineCards.filter(c => c.status === 'open').length}
            />
            <TabButton 
              active={activeTab === 'lista'} 
              onClick={() => setActiveTab('lista')}
              label="Leads"
              icon={<List size={16} />}
              count={pipelineCards.length}
            />
            <TabButton 
              active={activeTab === 'atividades'} 
              onClick={() => setActiveTab('atividades')}
              label="Atividades"
              icon={<ActivityIcon size={16} />}
              count={pipelineCards.reduce((acc, card) => acc + (card.activities?.length || 0), 0)}
            />
            <TabButton 
              active={activeTab === 'relatorios'} 
              onClick={() => setActiveTab('relatorios')}
              label="Relatórios"
              icon={<BarChart3 size={16} />}
            />
            <TabButton 
              active={activeTab === 'configuracoes'} 
              onClick={() => setActiveTab('configuracoes')}
              label="Ajustes"
              icon={<Settings size={16} />}
            />
          </div>
        </div>
        
        <div className="flex flex-1 overflow-hidden bg-gray-50/30">
          <div className="flex flex-1 overflow-hidden">
            {renderTabContent()}
          </div>

          {/* Card Detail Drawer */}
          <LeadDrawer />

          {/* Lead Creation/Edit Modal */}
          <LeadFormModal />
        </div>
      </div>
    </Layout>
  );
}

function TabButton({ label, icon, active, onClick, count }: { label: string, icon: React.ReactNode, active: boolean, onClick: () => void, count?: number }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative ${
        active 
          ? 'text-blue-600' 
          : 'text-gray-400 hover:text-gray-900'
      }`}
    >
      <span className={active ? 'text-blue-600' : 'text-gray-300'}>{icon}</span>
      {label}
      {count !== undefined && (
        <span className={cn(
          "ml-1 px-1.5 py-0.5 rounded-lg text-[9px] font-black transition-all",
          active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
        )}>
          {count}
        </span>
      )}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />
      )}
    </button>
  );
}
