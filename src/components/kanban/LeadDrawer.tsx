import React from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  User, 
  Calendar, 
  Tag as TagIcon, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Edit2, 
  MoreVertical,
  ChevronRight,
  TrendingUp,
  History,
  MessageCircle,
  Trophy,
  Send,
  XCircle,
  Target,
  FileText,
  Ban
} from 'lucide-react';
import { KanbanCard, Activity } from './crmKanban.types';
import { formatKanbanCurrency } from './crmKanban.utils';
import { cn } from '../../lib/utils';
import { LeadTagsEditor } from './LeadTags';
import { ActivityForm } from './ActivityForm';
import { FollowUpForm } from './FollowUpForm';
import { FollowUpItem } from './FollowUpItem';
import { MarkAsWonModal } from './MarkAsWonModal';
import { MarkAsLostModal } from './MarkAsLostModal';
import { useCRMKanban } from './CRMKanbanContext';

export function LeadDrawer() {
  const { 
    selectedCard: card, 
    setSelectedCard, 
    stages, 
    responsibles,
    markCardResult, 
    moveCard, 
    setEditingCard, 
    setIsModalOpen, 
    updateCardTags, 
    addActivity, 
    addFollowUp, 
    completeFollowUp,
    updateCard
  } = useCRMKanban();

  const [lossReasons] = React.useState<string[]>([
    'Preço',
    'Sem resposta',
    'Não era o momento',
    'Escolheu concorrente',
    'Sem orçamento',
    'Não qualificado'
  ]);

  const [isAddingActivity, setIsAddingActivity] = React.useState(false);
  const [isAddingFollowUp, setIsAddingFollowUp] = React.useState(false);
  const [isWonModalOpen, setIsWonModalOpen] = React.useState(false);
  const [isLostModalOpen, setIsLostModalOpen] = React.useState(false);
  const [isEditingValue, setIsEditingValue] = React.useState(false);
  const [isEditingResponsible, setIsEditingResponsible] = React.useState(false);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [isEditingPhone, setIsEditingPhone] = React.useState(false);
  const [isEditingEmail, setIsEditingEmail] = React.useState(false);
  const [isEditingSource, setIsEditingSource] = React.useState(false);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [localValue, setLocalValue] = React.useState(0);
  const [localName, setLocalName] = React.useState('');
  const [localPhone, setLocalPhone] = React.useState('');
  const [localEmail, setLocalEmail] = React.useState('');
  const [localTitle, setLocalTitle] = React.useState('');

  React.useEffect(() => {
    if (card) {
      setLocalValue(card.value);
      setLocalName(card.lead.name);
      setLocalPhone(card.lead.phone || '');
      setLocalEmail(card.lead.email || '');
      setLocalTitle(card.title);
    }
  }, [card?.id]);

  if (!card) return null;

  const currentStage = stages.find(s => s.id === card.stage_id);

  const onClose = () => setSelectedCard(null);

  const onEdit = () => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleValueUpdate = () => {
    updateCard(card.id, { value: localValue });
    setIsEditingValue(false);
  };

  const handleResponsibleUpdate = (respId: string) => {
    const responsible = responsibles.find(r => r.id === respId);
    if (responsible) {
      updateCard(card.id, { responsible });
    }
    setIsEditingResponsible(false);
  };

  const handleLeadUpdate = (field: keyof typeof card.lead, value: string) => {
    updateCard(card.id, {
      lead: { ...card.lead, [field]: value }
    });
    if (field === 'name') setIsEditingName(false);
    if (field === 'phone') setIsEditingPhone(false);
    if (field === 'email') setIsEditingEmail(false);
    if (field === 'source') setIsEditingSource(false);
  };

  const handleTitleUpdate = () => {
    updateCard(card.id, { title: localTitle });
    setIsEditingTitle(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden outline-none focus:outline-none">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-gray-900/10 backdrop-blur-[2px] transition-opacity duration-300" 
        onClick={onClose}
      />
      
      {/* Drawer Content */}
      <div className="relative w-full max-w-lg bg-white shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {card.lead.photoUrl ? (
              <img 
                src={card.lead.photoUrl} 
                alt={card.lead.name}
                className="h-12 w-12 rounded-2xl object-cover ring-4 ring-gray-50 shadow-lg shadow-blue-500/10 flex-shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg shadow-blue-600/20 flex-shrink-0">
                {card.lead.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">{card.lead.name}</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                ID: CRM-{card.id.substring(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-10">
          {/* Main Info */}
          <section className="space-y-6">
            <div className="flex flex-col gap-2 group/title relative">
              {isEditingTitle ? (
                <input 
                  autoFocus
                  type="text"
                  value={localTitle}
                  onChange={e => setLocalTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTitleUpdate()}
                  onBlur={handleTitleUpdate}
                  className="text-3xl font-black text-gray-900 tracking-tighter leading-tight bg-transparent border-none outline-none w-full p-0"
                />
              ) : (
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-tight">
                    {card.title}
                  </h1>
                  <Edit2 size={16} className="text-gray-300 opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0" />
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm",
                  card.status === 'open' ? "bg-blue-50 text-blue-600" :
                  card.status === 'won' ? "bg-green-50 text-green-600" :
                  "bg-red-50 text-red-600"
                )}>
                  {card.status === 'open' ? 'Em aberto' : card.status === 'won' ? 'Ganho' : 'Perdido'}
                </span>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentStage?.color }} />
                  <span className="text-xs font-bold uppercase tracking-wide">{currentStage?.name}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={cn(
                  "bg-gray-50/50 p-5 rounded-[1.5rem] border transition-all relative group cursor-pointer",
                  isEditingValue ? "border-blue-400 ring-4 ring-blue-50" : "border-gray-100 hover:shadow-lg hover:shadow-gray-200/50 hover:bg-white"
                )}
                onClick={() => !isEditingValue && setIsEditingValue(true)}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Valor Estimado</p>
                  {!isEditingValue && <Edit2 size={10} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
                {isEditingValue ? (
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <span className="text-gray-400 font-bold">R$</span>
                    <input 
                      autoFocus
                      type="number"
                      value={localValue}
                      onChange={e => setLocalValue(Number(e.target.value))}
                      onKeyDown={e => e.key === 'Enter' && handleValueUpdate()}
                      onBlur={handleValueUpdate}
                      className="bg-transparent border-none outline-none text-xl font-black text-gray-900 w-full p-0"
                    />
                  </div>
                ) : (
                  <div className="text-2xl font-black text-gray-900 tracking-tight">
                    {formatKanbanCurrency(card.value, card.currency)}
                  </div>
                )}
              </div>

              <div 
                className={cn(
                  "bg-gray-50/50 p-5 rounded-[1.5rem] border transition-all relative group cursor-pointer",
                  isEditingResponsible ? "border-blue-400 ring-4 ring-blue-50" : "border-gray-100 hover:shadow-lg hover:shadow-gray-200/50 hover:bg-white"
                )}
                onClick={() => !isEditingResponsible && setIsEditingResponsible(true)}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Responsável</p>
                  {!isEditingResponsible && <Edit2 size={10} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>

                {isEditingResponsible ? (
                  <div className="relative" onClick={e => e.stopPropagation()}>
                    <select
                      autoFocus
                      value={card.responsible?.id || ''}
                      onChange={e => handleResponsibleUpdate(e.target.value)}
                      onBlur={() => setIsEditingResponsible(false)}
                      className="w-full bg-transparent border-none outline-none text-sm font-bold text-gray-700 appearance-none p-0"
                    >
                      {responsibles.map(resp => (
                        <option key={resp.id} value={resp.id}>{resp.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-md shadow-blue-600/20">
                      {card.responsible?.initials || 'JA'}
                    </div>
                    <span className="text-sm font-bold text-gray-700">{card.responsible?.name || 'Não atribuído'}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Lead Details */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <User size={16} className="text-blue-500" />
                Informações do Lead
              </h3>
              <button 
                onClick={onEdit}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
              >
                <Edit2 size={14} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
            
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-6 space-y-5">
                <DetailItem 
                  icon={<User size={14} />} 
                  label="Nome" 
                  value={localName} 
                  isEditing={isEditingName}
                  onEdit={() => setIsEditingName(true)}
                  onChange={setLocalName}
                  onSave={() => handleLeadUpdate('name', localName)}
                  onCancel={() => { setIsEditingName(false); setLocalName(card.lead.name); }}
                />
                <DetailItem 
                  icon={<Phone size={14} />} 
                  label="Telefone" 
                  value={localPhone} 
                  isEditing={isEditingPhone}
                  onEdit={() => setIsEditingPhone(true)}
                  onChange={setLocalPhone}
                  onSave={() => handleLeadUpdate('phone', localPhone)}
                  onCancel={() => { setIsEditingPhone(false); setLocalPhone(card.lead.phone || ''); }}
                  isAction 
                  onAction={() => {}}
                />
                <DetailItem 
                  icon={<Mail size={14} />} 
                  label="E-mail" 
                  value={localEmail} 
                  isEditing={isEditingEmail}
                  onEdit={() => setIsEditingEmail(true)}
                  onChange={setLocalEmail}
                  onSave={() => handleLeadUpdate('email', localEmail)}
                  onCancel={() => { setIsEditingEmail(false); setLocalEmail(card.lead.email || ''); }}
                  isAction 
                  onAction={() => {}}
                />
                <DetailItem 
                  icon={<Clock size={14} />} 
                  label="Origem" 
                  value={card.lead.source} 
                  isEditing={isEditingSource}
                  onEdit={() => setIsEditingSource(true)}
                  onSave={(val) => handleLeadUpdate('source', val)}
                  onCancel={() => setIsEditingSource(false)}
                  isBadge
                  isSelect
                  options={(useCRMKanban().sources || []).map(s => s.label)}
                />
              </div>
              
              <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Último Contato:</span>
                  <span className="text-[11px] font-bold text-gray-600">Há 2 dias</span>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-blue-600/20 active:scale-95 transition-all">
                  <MessageCircle size={12} />
                  Abrir Chat
                </button>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section className="bg-amber-50/20 p-6 rounded-[2rem] border border-amber-100/50 space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <FileText size={16} className="text-amber-500" />
              Observações
            </h3>
            {card.notes ? (
              <p className="text-[13px] font-bold text-gray-600 leading-relaxed italic">
                "{card.notes}"
              </p>
            ) : (
              <p className="text-[11px] font-bold text-gray-300 italic">Nenhuma observação adicionada.</p>
            )}
            <button 
              onClick={onEdit}
              className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline flex items-center gap-1"
            >
              <Edit2 size={10} />
              Editar Notas
            </button>
          </section>

          {/* Tags */}
          <section>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
              <TagIcon size={16} className="text-blue-500" />
              Categorização
            </h3>
            <LeadTagsEditor tags={card.tags} onTagsChange={(tags) => updateCardTags(card.id, tags)} />
          </section>

          {/* Follow-ups / Next Actions */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Target size={16} className="text-blue-500" />
                Próximas Ações
              </h3>
              {!isAddingFollowUp && (
                <button 
                  onClick={() => setIsAddingFollowUp(true)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                >
                  <Plus size={12} />
                  Agendar
                </button>
              )}
            </div>

            {isAddingFollowUp && (
              <FollowUpForm 
                onSave={(data) => {
                  addFollowUp(card.id, data);
                  setIsAddingFollowUp(false);
                }}
                onCancel={() => setIsAddingFollowUp(false)}
              />
            )}

            <div className="space-y-4">
              {card.follow_ups?.length ? (
                card.follow_ups
                  .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                  .map(fu => (
                    <FollowUpItem 
                      key={fu.id} 
                      followUp={fu} 
                      onComplete={(id) => completeFollowUp(card.id, id)} 
                    />
                  ))
              ) : (
                !isAddingFollowUp && (
                  <div 
                    onClick={() => setIsAddingFollowUp(true)}
                    className="p-8 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-blue-200 hover:bg-blue-50/10 cursor-pointer transition-all group"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:scale-110 transition-transform">
                      <Calendar size={24} />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest">Nenhuma ação agendada</p>
                    <span className="text-[10px] font-bold text-gray-300">Clique para definir o próximo passo</span>
                  </div>
                )
              )}
            </div>
          </section>

          {/* Activities / Timeline */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <History size={16} className="text-blue-500" />
                Cronologia
              </h3>
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                Filtrar
              </button>
            </div>

            <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-blue-500/20 before:via-gray-100 before:to-gray-100">
              {isAddingActivity && (
                <div className="relative mb-8 pt-2">
                  <div className="absolute -left-[32px] top-6 h-5 w-5 rounded-full bg-blue-600 ring-4 ring-blue-50 shadow-lg shadow-blue-600/20 flex items-center justify-center z-10">
                    <Plus size={10} className="text-white stroke-[4]" />
                  </div>
                  <ActivityForm 
                    onAdd={(act) => {
                      addActivity(card.id, act);
                      setIsAddingActivity(false);
                    }}
                    onCancel={() => setIsAddingActivity(false)}
                  />
                </div>
              )}

              {card.activities?.length ? [...card.activities].reverse().map((act, i) => (
                <div key={act.id} className="relative group px-1">
                  <div className={cn(
                    "absolute -left-[32.5px] top-2 h-6 w-6 rounded-full ring-4 ring-white shadow-sm transition-all group-hover:scale-110 flex items-center justify-center z-10",
                    i === 0 ? "bg-blue-600 ring-blue-50 text-white" : "bg-white ring-gray-50 text-gray-400 border border-gray-100"
                  )}>
                    <ActivityIcon type={act.type} />
                  </div>
                  <div className="bg-white group-hover:bg-gray-50/50 p-4 rounded-3xl border border-transparent group-hover:border-gray-100/50 transition-all shadow-sm group-hover:shadow-md group-hover:shadow-gray-200/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                        {act.type}
                      </span>
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                        {new Date(act.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} às {new Date(act.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[13px] font-bold text-gray-700 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 bg-gray-50/30 rounded-[2.5rem] border border-dashed border-gray-100 mx-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-200 shadow-sm">
                    <History size={24} />
                  </div>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Nenhuma atividade registrada</p>
                </div>
              )}
            </div>
            
            {!isAddingActivity && (
              <button 
                onClick={() => setIsAddingActivity(true)}
                className="w-full mt-8 py-5 rounded-[2rem] border-2 border-dashed border-gray-100 text-gray-400 hover:border-blue-200 hover:bg-blue-50/20 hover:text-blue-600 transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest group shadow-sm hover:shadow-md hover:shadow-blue-500/5"
              >
                <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-blue-100 transition-colors">
                  <Plus size={14} className="group-hover:scale-110 transition-transform stroke-[3]" />
                </div>
                Registrar Atividade
              </button>
            )}
          </section>

          {/* Closing Deal Actions */}
          <section className="sticky bottom-0 pt-6 pb-2 mt-auto bg-gradient-to-t from-white via-white to-transparent">
            {card.status === 'open' ? (
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsWonModalOpen(true)}
                  className="flex-1 bg-green-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-green-600/20 hover:bg-green-700 hover:shadow-green-600/30 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Trophy size={20} />
                  Ganho
                </button>
                <button 
                  onClick={() => setIsLostModalOpen(true)}
                  className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl shadow-sm hover:bg-black hover:text-white active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <XCircle size={20} />
                  Perdido
                </button>
                <button className="p-4 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors">
                  <MoreVertical size={20} className="text-gray-400" />
                </button>
              </div>
            ) : (
              <div className={cn(
                "p-4 rounded-2xl border flex items-center justify-between gap-4",
                card.status === 'won' ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center text-white",
                    card.status === 'won' ? "bg-green-600 shadow-lg shadow-green-600/20" : "bg-red-600 shadow-lg shadow-red-600/20"
                  )}>
                    {card.status === 'won' ? <Trophy size={20} /> : <Ban size={20} />}
                  </div>
                  <div>
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      card.status === 'won' ? "text-green-600" : "text-red-600"
                    )}>
                      Lead {card.status === 'won' ? 'Ganho' : 'Perdido'}
                    </p>
                    <p className="text-xs font-bold text-gray-500">
                      {card.closed_at ? new Date(card.closed_at).toLocaleDateString() : 'Finalizado'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => markCardResult(card.id, 'open')}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                >
                  Reabrir
                </button>
              </div>
            )}
          </section>

          <MarkAsWonModal 
            card={card}
            isOpen={isWonModalOpen}
            onClose={() => setIsWonModalOpen(false)}
            onConfirm={(details) => {
              markCardResult(card.id, 'won', details);
              setIsWonModalOpen(false);
            }}
          />

          <MarkAsLostModal 
            card={card}
            isOpen={isLostModalOpen}
            onClose={() => setIsLostModalOpen(false)}
            onConfirm={(details) => {
              markCardResult(card.id, 'lost', details);
              setIsLostModalOpen(false);
            }}
            reasons={lossReasons}
          />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ 
  icon, 
  label, 
  value, 
  isAction, 
  onAction, 
  isBadge,
  isEditing,
  onEdit,
  onChange,
  onSave,
  onCancel,
  isSelect,
  options
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  isAction?: boolean;
  onAction?: () => void;
  isBadge?: boolean;
  isEditing?: boolean;
  onEdit?: () => void;
  onChange?: (val: string) => void;
  onSave?: (val: string) => void;
  onCancel?: () => void;
  isSelect?: boolean;
  options?: string[];
}) {
  return (
    <div className={cn(
      "flex items-center justify-between group/item p-1 -m-1 rounded-xl transition-all",
      isEditing ? "bg-blue-50/30" : "hover:bg-gray-50/50"
    )}>
      <div className="flex items-center gap-4 flex-1">
        <div className="h-8 w-8 bg-gray-50/80 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
          {isEditing ? (
            isSelect ? (
              <select
                autoFocus
                value={value}
                onChange={e => onSave?.(e.target.value)}
                onBlur={onCancel}
                className="w-full bg-transparent border-none outline-none text-[13px] font-bold text-gray-900 p-0 appearance-none"
              >
                {options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                autoFocus
                type="text"
                value={value}
                onChange={e => onChange?.(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSave?.(value)}
                onBlur={() => onSave?.(value)}
                className="w-full bg-transparent border-none outline-none text-[13px] font-bold text-gray-900 p-0"
              />
            )
          ) : (
            <div className="flex items-center gap-2 group/text cursor-pointer" onClick={onEdit}>
              {isBadge ? (
                <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg mt-0.5 inline-block uppercase tracking-wider">
                  {value}
                </span>
              ) : (
                <p className="text-[13px] font-bold text-gray-900">{value}</p>
              )}
              {onEdit && <Edit2 size={10} className="text-gray-300 opacity-0 group-hover/item:opacity-100 transition-opacity" />}
            </div>
          )}
        </div>
      </div>
      {isAction && !isEditing && (
        <button 
          onClick={onAction}
          className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

function ActivityIcon({ type }: { type: Activity['type'] }) {
  switch (type) {
    case 'call': return <Phone size={10} />;
    case 'email': return <Mail size={10} />;
    case 'meeting': return <Calendar size={10} />;
    case 'task': return <CheckCircle2 size={10} />;
    case 'whatsapp': return <MessageCircle size={10} />;
    case 'stage_change': return <TrendingUp size={10} />;
    case 'proposal': return <Send size={10} />;
    case 'follow_up': return <Clock size={10} />;
    case 'won': return <Trophy size={10} />;
    case 'lost': return <XCircle size={10} />;
    default: return <MessageSquare size={10} />;
  }
}
