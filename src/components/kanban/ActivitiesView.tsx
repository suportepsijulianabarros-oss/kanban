import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle2, 
  MessageCircle, 
  Send, 
  Trophy, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  User as UserIcon,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { KanbanCard, Activity, ResponsibleUser } from './crmKanban.types';
import { MOCK_RESPONSIBLES } from './crmKanban.mock';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCRMKanban } from './CRMKanbanContext';

interface ActivitiesViewProps {
  onLeadClick: (lead: KanbanCard) => void;
}

interface ActivityWithLead extends Activity {
  leadTitle: string;
  leadId: string;
  leadResponsible?: ResponsibleUser;
  card: KanbanCard;
}

const ITEMS_PER_PAGE = 10;

export function ActivitiesView({ onLeadClick }: ActivitiesViewProps) {
  const { pipelineCards: cards } = useCRMKanban();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedResponsible, setSelectedResponsible] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const observerTarget = useRef<HTMLDivElement>(null);

  const allActivities = useMemo(() => {
    const activities: ActivityWithLead[] = [];
    cards.forEach(card => {
      card.activities?.forEach(act => {
        activities.push({
          ...act,
          leadTitle: card.title,
          leadId: card.id,
          leadResponsible: card.responsible,
          card
        });
      });
    });
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cards]);

  const filteredActivities = useMemo(() => {
    return allActivities.filter(act => {
      const matchesSearch = act.leadTitle.toLowerCase().includes(search.toLowerCase()) || 
                           act.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = selectedType === 'all' || act.type === selectedType;
      const matchesResponsible = selectedResponsible === 'all' || act.leadResponsible?.id === selectedResponsible;
      
      return matchesSearch && matchesType && matchesResponsible;
    });
  }, [allActivities, search, selectedType, selectedResponsible]);

  const displayedActivities = useMemo(() => {
    return filteredActivities.slice(0, visibleCount);
  }, [filteredActivities, visibleCount]);

  const hasMore = visibleCount < filteredActivities.length;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    }
  }, [hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadMore, hasMore]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [search, selectedType, selectedResponsible]);

  const activityTypes = [
    { id: 'all', label: 'Todos', icon: <Filter size={14} /> },
    { id: 'call', label: 'Ligações', icon: <Phone size={14} /> },
    { id: 'email', label: 'E-mails', icon: <Mail size={14} /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle size={14} /> },
    { id: 'meeting', label: 'Reuniões', icon: <Calendar size={14} /> },
    { id: 'won', label: 'Vendas', icon: <Trophy size={14} /> },
    { id: 'lost', label: 'Perdas', icon: <XCircle size={14} /> },
  ];

  return (
    <div className="flex flex-col gap-6 lg:gap-10 p-6 lg:p-12 bg-gray-50/20 min-h-screen animate-in fade-in duration-500 font-sans">
      {/* Filters Header */}
      <div className="bg-white p-5 lg:p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 flex flex-wrap items-center gap-4 lg:gap-8">
        <div className="flex-1 min-w-[280px] relative group px-2">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Lead ou descrição..."
            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-[13px] font-bold text-gray-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all font-sans"
          />
        </div>

        <div className="hidden lg:flex items-center gap-3 bg-gray-50/50 p-2 rounded-2xl border border-gray-100/50">
          {activityTypes.slice(0, 5).map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all leading-none",
                selectedType === type.id 
                  ? "bg-white text-blue-600 shadow-lg shadow-blue-600/5 border border-blue-50" 
                  : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
              )}
            >
              {React.cloneElement(type.icon as React.ReactElement<{ size?: number; className?: string }>, { size: 12, className: "opacity-80" })}
              {type.label}
            </button>
          ))}
        </div>

        <div className="relative group min-w-[160px]">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center text-[9px] font-black text-blue-600 border border-blue-200">
            <UserIcon size={14} className="opacity-70" />
          </div>
          <select 
            value={selectedResponsible}
            onChange={e => setSelectedResponsible(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 pl-14 pr-10 text-[10px] font-black text-gray-500 uppercase tracking-widest outline-none focus:bg-white focus:border-blue-200 transition-all appearance-none cursor-pointer"
          >
            <option value="all">Filtro: Todos</option>
            {MOCK_RESPONSIBLES.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="relative max-w-4xl mx-auto w-full px-2 lg:px-0">
        <div className="absolute left-6 lg:left-[43px] top-4 bottom-0 w-1 bg-gradient-to-b from-gray-100 via-gray-100 to-transparent rounded-full opacity-50" />
        
        <div className="space-y-12 lg:space-y-16">
          {displayedActivities.length > 0 ? (
            <>
              {displayedActivities.map((act, index) => (
                <div key={act.id} className="relative flex flex-col sm:flex-row gap-6 lg:gap-10 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index % ITEMS_PER_PAGE * 50}ms` }}>
                  {/* Timeline Icon Marker */}
                  <div className="relative flex flex-col items-center shrink-0">
                    <div className={cn(
                      "relative z-10 h-12 w-12 lg:h-[86px] lg:w-[86px] rounded-2xl lg:rounded-[2.5rem] flex items-center justify-center shadow-2xl ring-8 lg:ring-[12px] ring-white tracking-widest hover:scale-105 transition-transform",
                      getActivityColor(act.type)
                    )}>
                      <ActivityIcon type={act.type} size={act.type === 'won' || act.type === 'lost' ? 32 : 24} />
                      <div className="absolute -bottom-2 lg:-bottom-3 bg-white px-2 py-1 rounded-md shadow-lg shadow-black/5 border border-gray-50 text-[7px] lg:text-[8px] font-black text-gray-400 uppercase">
                        {format(new Date(act.date), "HH:mm")}
                      </div>
                    </div>
                  </div>

                  {/* Event Content Card */}
                  <div 
                    onClick={() => onLeadClick(act.card)}
                    className="flex-1 bg-white p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-900/5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    {/* Subtle accent border */}
                    <div className={cn("absolute left-0 top-0 bottom-0 w-2 opacity-20", 
                      act.type === 'won' ? 'bg-emerald-500' : 
                      act.type === 'lost' ? 'bg-rose-500' : 'bg-blue-500'
                    )} />

                    <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-6 lg:mb-8">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h4 className="text-[16px] lg:text-[18px] font-black text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight leading-tight">
                            {act.leadTitle}
                          </h4>
                          <div className={cn(
                            "px-3 py-1 rounded-lg text-[8px] lg:text-[9px] font-black uppercase tracking-widest leading-none border",
                            act.type === 'won' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            act.type === 'lost' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            'bg-blue-50 text-blue-600 border-blue-100'
                          )}>
                            {act.type.replace('_', ' ')}
                          </div>
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="flex items-center gap-1.5 text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <Calendar size={12} className="opacity-50 text-blue-500" />
                            {format(new Date(act.date), "dd 'de' MMMM", { locale: ptBR })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-gray-50/50 pl-2 pr-4 py-2 rounded-2xl border border-gray-100/50">
                        <div className="h-8 w-8 rounded-xl bg-blue-100 flex items-center justify-center text-[9px] font-black text-blue-600 border border-blue-200">
                          {act.leadResponsible?.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest leading-none">Responsável</span>
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{act.leadResponsible?.name.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative group-hover:translate-x-1 transition-transform">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 lg:w-2 bg-blue-50 rounded-full" />
                      <p className="text-[13px] lg:text-[14px] font-bold text-gray-500 leading-relaxed pl-6 lg:pl-8 py-1 italic tracking-tight">
                        "{act.description}"
                      </p>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-end">
                      <div className="flex items-center gap-2 text-[9px] lg:text-[10px] font-black text-blue-600 uppercase tracking-widest opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                        Abrir Detalhes do Lead
                        <ChevronRight size={14} className="stroke-[2.5]" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Observer Target / Loading Indicator */}
              <div 
                ref={observerTarget} 
                className="h-20 flex items-center justify-center"
              >
                {hasMore && (
                  <div className="flex items-center gap-3 text-blue-600/50">
                    <Loader2 size={24} className="animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Carregando mais atividades...</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 animate-in fade-in zoom-in-95 duration-700">
              <div className="h-24 w-24 lg:h-32 lg:w-32 rounded-[2.5rem] lg:rounded-[3rem] bg-white border border-gray-100 flex items-center justify-center mb-8 shadow-2xl shadow-blue-900/5 group">
                <Search size={48} className="text-gray-200 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-500 opacity-50" />
              </div>
              <h3 className="text-lg lg:text-xl font-black text-gray-900 uppercase tracking-[0.2em] mb-2 leading-none">Silêncio no Radar</h3>
              <p className="font-bold text-[10px] lg:text-[11px] uppercase tracking-[0.15em] text-gray-400">Nenhum evento corresponde aos seus critérios</p>
              <button 
                onClick={() => { setSearch(''); setSelectedType('all'); setSelectedResponsible('all'); }}
                className="mt-8 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityIcon({ type, size = 16 }: { type: Activity['type']; size?: number }) {
  switch (type) {
    case 'call': return <Phone size={size} />;
    case 'email': return <Mail size={size} />;
    case 'meeting': return <Calendar size={size} />;
    case 'note': return <MessageSquare size={size} />;
    case 'task': return <CheckCircle2 size={size} />;
    case 'whatsapp': return <MessageCircle size={size} />;
    case 'stage_change': return <TrendingUp size={size} />;
    case 'proposal': return <Send size={size} />;
    case 'follow_up': return <Clock size={size} />;
    case 'won': return <Trophy size={size} />;
    case 'lost': return <XCircle size={size} />;
    default: return <MessageSquare size={size} />;
  }
}

function getActivityColor(type: Activity['type']) {
  switch (type) {
    case 'call': return "bg-blue-600 text-white shadow-blue-600/30";
    case 'email': return "bg-indigo-600 text-white shadow-indigo-600/30";
    case 'whatsapp': return "bg-green-500 text-white shadow-green-500/30";
    case 'meeting': return "bg-purple-600 text-white shadow-purple-600/30";
    case 'won': return "bg-emerald-600 text-white shadow-emerald-600/30 ring-emerald-100";
    case 'lost': return "bg-gray-900 text-white shadow-gray-900/30";
    case 'stage_change': return "bg-orange-500 text-white shadow-orange-500/30";
    case 'proposal': return "bg-blue-400 text-white shadow-blue-400/30";
    case 'follow_up': return "bg-blue-800 text-white shadow-blue-800/30";
    default: return "bg-gray-600 text-white shadow-gray-600/30";
  }
}
