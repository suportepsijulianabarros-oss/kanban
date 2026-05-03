import { 
  Pipeline,
  PipelineStage, 
  KanbanCard, 
  ResponsibleUser, 
  Tag,
  LossReason,
  Activity,
  FollowUp,
  LeadSource,
  LeadSegment
} from './crmKanban.types';

export const MOCK_RESPONSIBLES: ResponsibleUser[] = [
  { id: 'user-1', name: 'João Agente', initials: 'JA' },
  { id: 'user-2', name: 'Maria Silva', initials: 'MS' },
  { id: 'user-3', name: 'Ricardo Costa', initials: 'RC' },
];

export const MOCK_TAGS: Tag[] = [
  { id: 'tag-1', name: 'Quente', color: '#ef4444' },
  { id: 'tag-2', name: 'Morno', color: '#f97316' },
  { id: 'tag-3', name: 'Frio', color: '#3b82f6' },
  { id: 'tag-4', name: 'Importante', color: '#dc2626' },
  { id: 'tag-5', name: 'Recorrente', color: '#10b981' },
  { id: 'tag-6', name: 'SaaS', color: '#8b5cf6' },
  { id: 'tag-7', name: 'WhatsApp', color: '#22c55e' },
  { id: 'tag-8', name: 'Indicação', color: '#ec4899' },
  { id: 'tag-9', name: 'Instagram', color: '#d946ef' },
  { id: 'tag-10', name: 'Google Ads', color: '#4f46e5' },
  { id: 'tag-11', name: 'Sem resposta', color: '#94a3b8' },
  { id: 'tag-12', name: 'Urgente', color: '#7f1d1d' },
];

export const MOCK_ACTIVITIES: Activity[] = [
  { id: 'act-1', type: 'call', description: 'Ligação de qualificação realizada', date: '2026-04-20T14:30:00Z' },
  { id: 'act-2', type: 'email', description: 'Proposta enviada por e-mail', date: '2026-04-22T10:00:00Z' },
  { id: 'act-3', type: 'meeting', description: 'Reunião de apresentação técnica', date: '2026-04-25T16:00:00Z' },
];

export const MOCK_CARDS: KanbanCard[] = [
  // COMERCIAL
  {
    id: 'card-1',
    title: 'Consultoria de Software',
    lead: {
      id: 'lead-1',
      name: 'Tech Solutions Ltd',
      phone: '(11) 98888-7777',
      email: 'contato@techsolutions.com',
      source: 'organic',
      status: 'contacted',
      photoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop'
    },
    value: 15000,
    currency: 'BRL',
    stage_id: 'stage-2',
    tags: [MOCK_TAGS[0], MOCK_TAGS[3]],
    responsible: MOCK_RESPONSIBLES[0],
    last_activity: MOCK_ACTIVITIES[0],
    next_action: '2026-05-05T10:00:00Z',
    status: 'open',
    created_at: '2026-04-10T08:00:00Z',
    activities: [MOCK_ACTIVITIES[0]]
  },
  {
    id: 'card-2',
    title: 'Suporte Anual Premier',
    lead: { id: 'lead-2', name: 'Innovate S.A.', phone: '(21) 97777-6666', source: 'referral', status: 'new' },
    value: 5500,
    currency: 'BRL',
    stage_id: 'stage-1',
    tags: [MOCK_TAGS[4]],
    responsible: MOCK_RESPONSIBLES[1],
    status: 'open',
    created_at: '2026-04-12T11:30:00Z',
  },
  
  // PÓS-VENDA
  {
    id: 'card-pv-1',
    title: 'Implementation Project',
    lead: { 
      id: 'l-pv-1', 
      name: 'Global Tech', 
      source: 'organic', 
      status: 'qualified',
      photoUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop'
    },
    value: 12000,
    currency: 'BRL',
    stage_id: 'stage-7',
    tags: [MOCK_TAGS[3]],
    responsible: MOCK_RESPONSIBLES[1],
    status: 'open',
    created_at: '2026-04-15T10:00:00Z',
  },

  // SUPORTE
  {
    id: 'card-sp-1',
    title: 'Erro no Checkout',
    lead: { id: 'l-sp-1', name: 'E-Shop Pro', source: 'event', status: 'contacted' },
    value: 0,
    currency: 'BRL',
    stage_id: 'stage-11',
    tags: [MOCK_TAGS[11]], // Urgente
    responsible: MOCK_RESPONSIBLES[2],
    status: 'open',
    created_at: '2026-04-20T09:00:00Z',
  },

  // RENOVAÇÃO
  {
    id: 'card-rn-1',
    title: 'Renovação Licença SaaS',
    lead: { 
      id: 'l-rn-1', 
      name: 'Modern Systems', 
      source: 'organic', 
      status: 'qualified',
      photoUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19313f?w=100&h=100&fit=crop'
    },
    value: 8900,
    currency: 'BRL',
    stage_id: 'stage-14',
    tags: [MOCK_TAGS[5]],
    responsible: MOCK_RESPONSIBLES[0],
    status: 'open',
    created_at: '2026-04-01T14:00:00Z',
  }
];

export const MOCK_SEGMENTS: LeadSegment[] = [
  {
    id: 'seg-1',
    name: 'Leads Quentes',
    description: 'Leads marcados com a tag Quente',
    filters: { search: '', tags: ['tag-1'], tag_logic: 'any' },
    count: 1,
    created_at: '2026-04-20T10:00:00Z'
  },
  {
    id: 'seg-2',
    name: 'Leads do Instagram',
    description: 'Leads que vieram do Instagram',
    filters: { search: '', tags: ['tag-9'], tag_logic: 'any' },
    count: 0,
    created_at: '2026-04-21T11:00:00Z'
  },
  {
    id: 'seg-3',
    name: 'Propostas em Aberto',
    description: 'Cards na etapa Proposta Enviada',
    filters: { search: '', tags: [], tag_logic: 'any', stage_id: 'stage-3' },
    count: 0,
    created_at: '2026-04-22T09:00:00Z'
  },
  {
    id: 'seg-4',
    name: 'Follow-ups atrasados',
    description: 'Leads com próxima ação vencida',
    filters: { search: '', tags: [], tag_logic: 'any', overdue_only: true },
    count: 0,
    created_at: '2026-04-23T08:00:00Z'
  }
];

export const MOCK_PIPELINES: Pipeline[] = [
  { id: 'pipe-1', name: 'Comercial', description: 'Funil principal de vendas', isActive: true },
  { id: 'pipe-2', name: 'Pós-venda', description: 'Atendimento após fechamento', isActive: true },
  { id: 'pipe-3', name: 'Suporte', description: 'Chamados e tickets técnicos', isActive: true },
  { id: 'pipe-4', name: 'Renovação', description: 'Ciclo de renovação de contratos', isActive: true },
];

export const MOCK_STAGES: PipelineStage[] = [
  // COMERCIAL
  { id: 'stage-1', pipeline_id: 'pipe-1', name: 'Lead Recebido', order: 0, color: '#3b82f6' },
  { id: 'stage-2', pipeline_id: 'pipe-1', name: 'Primeiro Contato', order: 1, color: '#8b5cf6' },
  { id: 'stage-3', pipeline_id: 'pipe-1', name: 'Proposta Enviada', order: 2, color: '#f59e0b' },
  { id: 'stage-4', pipeline_id: 'pipe-1', name: 'Em Negociação', order: 3, color: '#ec4899' },
  { id: 'stage-5', pipeline_id: 'pipe-1', name: 'Fechamento', order: 4, color: '#10b981' },
  
  // PÓS-VENDA
  { id: 'stage-6', pipeline_id: 'pipe-2', name: 'Onboarding', order: 0, color: '#3b82f6' },
  { id: 'stage-7', pipeline_id: 'pipe-2', name: 'Implementação', order: 1, color: '#8b5cf6' },
  { id: 'stage-8', pipeline_id: 'pipe-2', name: 'Treinamento', order: 2, color: '#f59e0b' },
  { id: 'stage-9', pipeline_id: 'pipe-2', name: 'Go-Live', order: 3, color: '#10b981' },

  // SUPORTE
  { id: 'stage-10', pipeline_id: 'pipe-3', name: 'Novo Chamado', order: 0, color: '#ef4444' },
  { id: 'stage-11', pipeline_id: 'pipe-3', name: 'Em Análise', order: 1, color: '#f97316' },
  { id: 'stage-12', pipeline_id: 'pipe-3', name: 'Aguardando Cliente', order: 2, color: '#3b82f6' },
  { id: 'stage-13', pipeline_id: 'pipe-3', name: 'Concluído', order: 3, color: '#10b981' },

  // RENOVAÇÃO
  { id: 'stage-14', pipeline_id: 'pipe-4', name: 'Triagem Renovação', order: 0, color: '#6366f1' },
  { id: 'stage-15', pipeline_id: 'pipe-4', name: 'Proposta Renovada', order: 1, color: '#a855f7' },
  { id: 'stage-16', pipeline_id: 'pipe-4', name: 'Aguardando Assinatura', order: 2, color: '#eab308' },
  { id: 'stage-17', pipeline_id: 'pipe-4', name: 'Renovado', order: 3, color: '#22c55e' },
];

export const MOCK_SOURCES: { id: LeadSource; label: string }[] = [
  { id: 'organic', label: 'Orgânico' },
  { id: 'ads', label: 'Anúncios' },
  { id: 'referral', label: 'Indicação' },
  { id: 'event', label: 'Evento' },
  { id: 'outbound', label: 'Outbound' },
];

export const MOCK_LOSS_REASONS: LossReason[] = [
  { id: 'price', label: 'Preço elevado' },
  { id: 'competitor', label: 'Fechou com concorrente' },
  { id: 'budget', label: 'Sem orçamento no momento' },
  { id: 'no_fit', label: 'Sem aderência técnica' },
];

export const MOCK_FOLLOW_UPS: FollowUp[] = [
  { id: 'fup-1', title: 'Retornar ligação sobre proposta', due_date: '2026-05-02T09:00:00Z', type: 'callback', note: 'Falar com financeiro', completed: false },
  { id: 'fup-2', title: 'Agendar demo com diretoria', due_date: '2026-05-05T15:00:00Z', type: 'meeting', note: 'Preparar slides', completed: false },
];

