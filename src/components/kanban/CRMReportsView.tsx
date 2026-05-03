import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart, 
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Trophy, 
  Clock, 
  DollarSign,
  ArrowUpRight
} from 'lucide-react';
import { formatKanbanCurrency } from './crmKanban.utils';
import { cn } from '../../lib/utils';
import { useCRMKanban } from './CRMKanbanContext';

export function CRMReportsView() {
  const { pipelineCards: cards, pipelineStages: stages } = useCRMKanban();

  const metrics = useMemo(() => {
    const openLeads = cards.filter(c => c.status === 'open');
    const wonLeads = cards.filter(c => c.status === 'won');
    const lostLeads = cards.filter(c => c.status === 'lost');
    
    const totalOpenValue = openLeads.reduce((acc, c) => acc + c.value, 0);
    const totalWonValue = wonLeads.reduce((acc, c) => acc + c.value, 0);
    
    const winRate = cards.length > 0 ? (wonLeads.length / (wonLeads.length + lostLeads.length || 1)) * 100 : 0;
    
    const overdueFollowUps = cards.reduce((acc, c) => 
      acc + (c.follow_ups?.filter(f => !f.completed && new Date(f.due_date) < new Date()).length || 0), 0
    );

    const stageData = stages.map(stage => {
      const stageCards = openLeads.filter(c => c.stage_id === stage.id);
      return {
        name: stage.name,
        value: stageCards.reduce((acc, c) => acc + c.value, 0),
        count: stageCards.length
      };
    });

    const statusData = [
      { name: 'Ganhos', value: wonLeads.length, color: '#10b981' },
      { name: 'Perdidos', value: lostLeads.length, color: '#ef4444' },
      { name: 'Em Aberto', value: openLeads.length, color: '#3b82f6' }
    ];

    return {
      total: cards.length,
      openCount: openLeads.length,
      wonCount: wonLeads.length,
      lostCount: lostLeads.length,
      totalOpenValue,
      totalWonValue,
      winRate,
      overdueFollowUps,
      stageData,
      statusData
    };
  }, [cards, stages]);

  return (
    <div className="p-6 lg:p-10 space-y-6 lg:space-y-10 bg-gray-50/20 min-h-screen animate-in fade-in duration-700 font-sans">
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <MetricCard 
          label="Valor em Aberto" 
          value={formatKanbanCurrency(metrics.totalOpenValue)} 
          icon={<DollarSign size={22} />}
          color="blue"
          description="Oportunidades ativas"
        />
        <MetricCard 
          label="Conversão" 
          value={`${metrics.winRate.toFixed(1)}%`} 
          icon={<Target size={22} />}
          color="emerald"
          trend="+2.4%"
          description="Ganhos vs Perdas"
        />
        <MetricCard 
          label="Ações Atrasadas" 
          value={metrics.overdueFollowUps.toString()} 
          icon={<Clock size={22} />}
          color="rose"
          description="Precisa de atenção"
          isAlert={metrics.overdueFollowUps > 0}
        />
        <MetricCard 
          label="Leads Ganhos" 
          value={metrics.wonCount.toString()} 
          icon={<Trophy size={22} />}
          color="amber"
          description="Vendas concluídas"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Chart - Value per Stage */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-6 lg:p-10 border border-gray-100 shadow-xl shadow-blue-900/5">
          <div className="flex items-center justify-between mb-8 lg:mb-10">
            <div>
              <h3 className="text-lg lg:text-xl font-black text-gray-900 tracking-tight">Distribuição por Etapa</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Pipeline Ativo / Valor Estimado</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest leading-none">
              <TrendingUp size={14} />
              Real Time
            </div>
          </div>
          
          <div className="h-[300px] lg:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.stageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#cbd5e1', fontSize: 9, fontWeight: 900 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#cbd5e1', fontSize: 9, fontWeight: 900 }}
                  tickFormatter={(val) => `R$ ${val/1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  labelStyle={{ fontWeight: 900, marginBottom: '4px', fontSize: '12px' }}
                  itemStyle={{ fontWeight: 700, fontSize: '11px' }}
                  formatter={(value: number) => [formatKanbanCurrency(value), 'Valor']}
                />
                <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={32}>
                  {metrics.stageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(217, 91%, ${45 + (index * 8)}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Chart - Won/Lost Status */}
        <div className="bg-white rounded-[2.5rem] p-6 lg:p-10 border border-gray-100 shadow-xl shadow-blue-900/5">
          <h3 className="text-lg lg:text-xl font-black text-gray-900 mb-8 lg:mb-10 text-center tracking-tight">Status Geral</h3>
          <div className="h-[200px] lg:h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {metrics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-gray-900 leading-none">{metrics.total}</span>
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1">Total Leads</span>
            </div>
          </div>
          
          <div className="mt-8 lg:mt-10 space-y-3">
            {metrics.statusData.map((status) => (
              <div key={status.name} className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/50 border border-gray-100/50">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: status.color }} />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{status.name}</span>
                </div>
                <span className="text-sm font-black text-gray-900">{status.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stage Detail Table */}
      <div className="bg-white rounded-[2.5rem] p-6 lg:p-10 border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden">
        <h3 className="text-lg lg:text-xl font-black text-gray-900 mb-8 tracking-tight">Resumo Operacional</h3>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Etapa</th>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none text-center">Volume</th>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none text-right">Montante Total</th>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none text-right">LTV Médio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {metrics.stageData.map((stage) => (
                <tr key={stage.name} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-6 py-5 text-[13px] font-black text-gray-900 group-hover:text-blue-600 transition-colors">{stage.name}</td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                      {stage.count} {stage.count === 1 ? 'lead' : 'leads'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-black text-gray-700">
                    {formatKanbanCurrency(stage.value)}
                  </td>
                  <td className="px-6 py-5 text-right font-bold text-gray-400 text-xs">
                    {formatKanbanCurrency(stage.count > 0 ? stage.value / stage.count : 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'rose' | 'amber';
  trend?: string;
  description: string;
  isAlert?: boolean;
}

function MetricCard({ label, value, icon, color, trend, description, isAlert }: MetricCardProps) {
  const colors = {
    blue: "bg-blue-600 shadow-blue-600/20",
    emerald: "bg-emerald-500 shadow-emerald-500/20",
    rose: "bg-rose-500 shadow-rose-500/20",
    amber: "bg-amber-500 shadow-amber-500/20"
  };

  return (
    <div className={cn(
      "bg-white p-6 lg:p-8 rounded-[2rem] border border-gray-100 shadow-lg shadow-blue-900/5 transition-all hover:scale-[1.02] group",
      isAlert && "ring-2 ring-rose-500/50 animate-pulse bg-rose-50/10"
    )}>
      <div className="flex items-start justify-between mb-6">
        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6", colors[color])}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100/50">
            <ArrowUpRight size={10} />
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">{label}</p>
        <h4 className="text-xl lg:text-2xl font-black text-gray-900 mb-1 leading-none tracking-tight">{value}</h4>
        <p className="text-[10px] font-bold text-gray-400 mt-2">{description}</p>
      </div>
    </div>
  );
}
