import { Deal, Stage, Pipeline } from '@/packages/shared/src/types/crm';

// Mock database in memory
const org_id = 'org-123';
const pipeline_id = 'pipe-123';

let mockPipeline: Pipeline = { 
  id: pipeline_id, 
  org_id, 
  name: 'CRM Kanban', 
  is_default: true 
};

let mockStages: Stage[] = [
  { id: 'stage-1', org_id, pipeline_id, name: 'Lead Recebido', order: 0, color: '#3b82f6' },
  { id: 'stage-2', org_id, pipeline_id, name: 'Primeiro Contato', order: 1, color: '#8b5cf6' },
  { id: 'stage-3', org_id, pipeline_id, name: 'Proposta Enviada', order: 2, color: '#f59e0b' },
  { id: 'stage-4', org_id, pipeline_id, name: 'Em Negociação', order: 3, color: '#ec4899' },
  { id: 'stage-5', org_id, pipeline_id, name: 'Fechamento', order: 4, color: '#10b981' },
];

let mockDeals: any[] = [
  { 
    id: 'deal-1', org_id, stage_id: 'stage-2', title: 'Consultoria de Software', value: 15000, currency: 'BRL', status: 'open', 
    leads: { name: 'Tech Solutions Ltd', email: 'contato@techsolutions.com' }, 
    tags: [{ id: 't1', name: 'Importante', color: '#ef4444' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expected_closing_date: '2026-05-05T10:00:00Z'
  },
  { 
    id: 'deal-2', org_id, stage_id: 'stage-4', title: 'Licença Enterprise SaaS', value: 48000, currency: 'BRL', status: 'open', 
    leads: { name: 'Brasil Global Corp' }, 
    tags: [{ id: 't2', name: 'SaaS', color: '#3b82f6' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: 'deal-3', org_id, stage_id: 'stage-1', title: 'Suporte Anual Premier', value: 5500, currency: 'BRL', status: 'open', 
    leads: { name: 'Innovate S.A.' }, 
    tags: [{ id: 't3', name: 'Recorrente', color: '#10b981' }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export async function getPipelineData(_userId: string, _pipelineId?: string) {
  return {
    pipeline: mockPipeline,
    stages: mockStages,
    deals: mockDeals.filter(d => d.status === 'open')
  };
}

export async function updateDealStage(_userId: string, dealId: string, stageId: string) {
  const dealIndex = mockDeals.findIndex(d => d.id === dealId);
  if (dealIndex !== -1) {
    mockDeals[dealIndex] = {
      ...mockDeals[dealIndex],
      stage_id: stageId,
      updated_at: new Date().toISOString()
    };
  }
  return mockDeals[dealIndex];
}

export async function markDealResult(_userId: string, dealId: string, status: 'won' | 'lost') {
  const dealIndex = mockDeals.findIndex(d => d.id === dealId);
  if (dealIndex !== -1) {
    mockDeals[dealIndex] = {
      ...mockDeals[dealIndex],
      status,
      updated_at: new Date().toISOString()
    };
  }
  return mockDeals[dealIndex];
}
