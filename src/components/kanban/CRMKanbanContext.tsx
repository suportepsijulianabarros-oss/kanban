import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { 
  KanbanCard, 
  PipelineStage, 
  Pipeline,
  Tag, 
  ResponsibleUser, 
  SourceOption, 
  KanbanFilters,
  SegmentFilters,
  LeadSegment,
  Activity,
  DealStatus,
  FollowUp
} from './crmKanban.types';
import { 
  MOCK_STAGES, 
  MOCK_CARDS, 
  MOCK_TAGS, 
  MOCK_RESPONSIBLES, 
  MOCK_SOURCES,
  MOCK_PIPELINES,
  MOCK_SEGMENTS
} from './crmKanban.mock';
import { applyFilters } from './crmKanban.utils';

interface CRMKanbanContextType {
  // Data
  pipelines: Pipeline[];
  stages: PipelineStage[];
  pipelineStages: PipelineStage[];
  cards: KanbanCard[];
  pipelineCards: KanbanCard[];
  tags: Tag[];
  responsibles: ResponsibleUser[];
  sources: SourceOption[];
  segments: LeadSegment[];
  
  // UI State
  selectedPipelineId: string;
  selectedPipeline: Pipeline;
  activeSegmentId: string | null;
  filters: KanbanFilters;
  activeTab: string;
  selectedCard: KanbanCard | null;
  isModalOpen: boolean;
  editingCard: KanbanCard | null;
  preselectedStageId: string | undefined;
  
  // Actions
  setPipelines: React.Dispatch<React.SetStateAction<Pipeline[]>>;
  setSelectedPipelineId: (id: string) => void;
  setStages: React.Dispatch<React.SetStateAction<PipelineStage[]>>;
  setCards: React.Dispatch<React.SetStateAction<KanbanCard[]>>;
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  setFilters: React.Dispatch<React.SetStateAction<KanbanFilters>>;
  setActiveTab: (tab: string) => void;
  setSelectedCard: (card: KanbanCard | null) => void;
  setIsModalOpen: (open: boolean) => void;
  setEditingCard: (card: KanbanCard | null) => void;
  setPreselectedStageId: (id: string | undefined) => void;
  setSources: React.Dispatch<React.SetStateAction<SourceOption[]>>;
  setSegments: React.Dispatch<React.SetStateAction<LeadSegment[]>>;
  setActiveSegmentId: (id: string | null) => void;
  
  selectedLeadIds: string[];
  
  // Helpers
  toggleLeadSelection: (id: string) => void;
  selectAllLeads: (ids: string[]) => void;
  clearLeadSelection: () => void;
  addTags: (tags: Tag[]) => void;
  addPipeline: (data: { name: string, description: string, stageNames: string[] }) => void;
  updatePipeline: (id: string, data: Partial<Pipeline>) => void;
  deletePipeline: (id: string) => void;
  addSegment: (data: Omit<LeadSegment, 'id' | 'count' | 'created_at'>) => void;
  deleteSegment: (id: string) => void;
  applySegment: (segment: LeadSegment) => void;
  saveCard: (data: Partial<KanbanCard>) => void;
  bulkAddCards: (cards: KanbanCard[]) => void;
  bulkUpdateCards: (ids: string[], data: Partial<KanbanCard>) => void;
  moveCard: (cardId: string, stageId: string) => void;
  markCardResult: (cardId: string, status: DealStatus, details?: any) => void;
  addActivity: (cardId: string, activity: Omit<Activity, 'id' | 'date'>) => void;
  updateCardTags: (cardId: string, tags: Tag[]) => void;
  addFollowUp: (cardId: string, followUp: Omit<FollowUp, 'id' | 'completed'>) => void;
  completeFollowUp: (cardId: string, followUpId: string) => void;
  updateCard: (cardId: string, data: Partial<KanbanCard>) => void;
}

const CRMKanbanContext = createContext<CRMKanbanContextType | undefined>(undefined);

export function CRMKanbanProvider({ children }: { children: ReactNode }) {
  const [pipelines, setPipelines] = useState<Pipeline[]>(MOCK_PIPELINES);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(MOCK_PIPELINES[0].id);
  const [stages, setStages] = useState<PipelineStage[]>(MOCK_STAGES);
  const [cards, setCards] = useState<KanbanCard[]>(MOCK_CARDS);
  const [tags, setTags] = useState<Tag[]>(MOCK_TAGS);
  const [responsibles] = useState<ResponsibleUser[]>(MOCK_RESPONSIBLES);
  const [sources, setSources] = useState<SourceOption[]>(MOCK_SOURCES);
  const [segments, setSegments] = useState<LeadSegment[]>(MOCK_SEGMENTS);
  
  const [activeTab, setActiveTab] = useState('pipeline');
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  const [preselectedStageId, setPreselectedStageId] = useState<string | undefined>(undefined);
  
  const [filters, setFilters] = useState<KanbanFilters>({
    search: '',
    tags: [],
    responsible_id: 'all',
  });

  const selectedPipeline = useMemo(() => 
    pipelines.find(p => p.id === selectedPipelineId) || pipelines[0]
  , [pipelines, selectedPipelineId]);

  const pipelineStages = useMemo(() => 
    stages.filter(s => s.pipeline_id === selectedPipelineId)
  , [stages, selectedPipelineId]);

  const pipelineCards = useMemo(() => {
    const stageIds = pipelineStages.map(s => s.id);
    return cards.filter(c => stageIds.includes(c.stage_id));
  }, [cards, pipelineStages]);

  const selectedCard = useMemo(() => 
    cards.find(c => c.id === selectedCardId) || null
  , [cards, selectedCardId]);

  const setSelectedCard = (card: KanbanCard | null) => {
    setSelectedCardId(card ? card.id : null);
  };

  const addPipeline = ({ name, description, stageNames }: { name: string, description: string, stageNames: string[] }) => {
    const newPipelineId = `pipe-${Date.now()}`;
    const newPipeline: Pipeline = {
      id: newPipelineId,
      name,
      description,
      isActive: true
    };

    const newStages: PipelineStage[] = stageNames.map((stageName, index) => ({
      id: `stage-${Date.now()}-${index}`,
      pipeline_id: newPipelineId,
      name: stageName,
      order: index,
      color: ['#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981'][index % 5]
    }));

    setPipelines(prev => [...prev, newPipeline]);
    setStages(prev => [...prev, ...newStages]);
    setSelectedPipelineId(newPipelineId);
  };

  const updatePipeline = (id: string, data: Partial<Pipeline>) => {
    setPipelines(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deletePipeline = (id: string) => {
    if (pipelines.length <= 1) {
      alert("Não é possível excluir o único pipeline existente.");
      return;
    }
    
    const stagesToDelete = stages.filter(s => s.pipeline_id === id).map(s => s.id);
    setPipelines(prev => prev.filter(p => p.id !== id));
    setStages(prev => prev.filter(s => s.pipeline_id !== id));
    setCards(prev => prev.filter(c => !stagesToDelete.includes(c.stage_id)));
    
    if (selectedPipelineId === id) {
      const nextPipe = pipelines.find(p => p.id !== id);
      if (nextPipe) setSelectedPipelineId(nextPipe.id);
    }
  };

  const addSegment = (data: Omit<LeadSegment, 'id' | 'count' | 'created_at'>) => {
    const newSegment: LeadSegment = {
      ...data,
      id: `seg-${Date.now()}`,
      count: 0, // Should be calculated but for now it's dynamic
      created_at: new Date().toISOString()
    };
    setSegments(prev => [...prev, newSegment]);
  };

  const deleteSegment = (id: string) => {
    setSegments(prev => prev.filter(s => s.id !== id));
    if (activeSegmentId === id) setActiveSegmentId(null);
  };

  const applySegment = (segment: LeadSegment) => {
    setFilters(segment.filters);
    setActiveSegmentId(segment.id);
  };

  const toggleLeadSelection = (id: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllLeads = (ids: string[]) => {
    setSelectedLeadIds(ids);
  };

  const clearLeadSelection = () => {
    setSelectedLeadIds([]);
  };

  const addTags = (newTags: Tag[]) => {
    setTags(prev => {
      const existingNames = new Set(prev.map(t => t.name.toLowerCase()));
      const filteredNewTags = newTags.filter(t => !existingNames.has(t.name.toLowerCase()));
      return [...prev, ...filteredNewTags];
    });
  };

  const saveCard = (data: Partial<KanbanCard>) => {
    if (editingCard) {
      setCards(prev => prev.map(c => 
        c.id === editingCard.id ? { ...c, ...data } as KanbanCard : c
      ));
      setEditingCard(null);
    } else {
      const newCard: KanbanCard = {
        id: `card-${Date.now()}`,
        title: data.title || 'Nova Oportunidade',
        value: data.value || 0,
        currency: 'BRL',
        stage_id: data.stage_id || pipelineStages[0].id,
        tags: data.tags || [],
        responsible: data.responsible || responsibles[0],
        lead: {
          ...data.lead!,
          id: `lead-${Date.now()}`,
          status: 'new'
        },
        status: 'open',
        created_at: new Date().toISOString(),
        activities: [
          {
            id: `act-init-${Date.now()}`,
            type: 'note',
            description: 'Oportunidade criada no sistema.',
            date: new Date().toISOString()
          }
        ],
        notes: data.notes || ''
      };
      setCards(prev => [newCard, ...prev]);
    }
    setIsModalOpen(false);
  };

  const bulkAddCards = (newCards: KanbanCard[]) => {
    setCards(prev => [...newCards, ...prev]);
  };

  const bulkUpdateCards = (ids: string[], data: Partial<KanbanCard>) => {
    setCards(prev => prev.map(card => 
      ids.includes(card.id) ? { ...card, ...data } as KanbanCard : card
    ));
    clearLeadSelection();
  };

  const moveCard = (cardId: string, stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    const moveActivity: Activity = {
      id: `act-move-${Date.now()}`,
      type: 'stage_change',
      description: `Etapa alterada para: ${stage?.name || 'Nova Etapa'}`,
      date: new Date().toISOString()
    };

    setCards(prev => prev.map(card => 
      card.id === cardId ? { 
        ...card, 
        stage_id: stageId,
        activities: [...(card.activities || []), moveActivity],
        last_activity: moveActivity
      } : card
    ));
  };

  const markCardResult = (cardId: string, status: DealStatus, details?: any) => {
    const isReopening = status === 'open';
    let description = '';
    
    if (isReopening) {
      description = 'Oportunidade reaberta para negociação.';
    } else {
      description = status === 'won' 
        ? `Parabéns! Oportunidade marcada como GANHA. ${details?.note || ''}` 
        : `Oportunidade marcada como PERDIDA. Motivo: ${details?.reason || 'Não informado'}. ${details?.note || ''}`;
    }

    const resultActivity: Activity = {
      id: `act-result-${Date.now()}`,
      type: status as any,
      description,
      date: new Date().toISOString()
    };

    setCards(prev => prev.map(card => 
      card.id === cardId ? { 
        ...card, 
        status,
        value: details?.value || card.value,
        loss_reason: details?.reason,
        competitor: details?.competitor,
        closed_at: status !== 'open' ? (details?.closed_at || new Date().toISOString()) : undefined,
        activities: [...(card.activities || []), resultActivity],
        last_activity: resultActivity
      } : card
    ));
  };

  const addActivity = (cardId: string, activity: Omit<Activity, 'id' | 'date'>) => {
    const newActivity: Activity = {
      ...activity,
      id: `act-${Date.now()}`,
      date: new Date().toISOString(),
    };

    setCards(prev => prev.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          last_activity: newActivity,
          activities: [newActivity, ...(card.activities || [])]
        };
      }
      return card;
    }));
  };

  const updateCardTags = (cardId: string, newTags: Tag[]) => {
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, tags: newTags } : card
    ));
  };

  const addFollowUp = (cardId: string, followUp: Omit<FollowUp, 'id' | 'completed'>) => {
    const newFollowUp: FollowUp = {
      ...followUp,
      id: `fu-${Date.now()}`,
      completed: false
    };

    const followUpActivity: Activity = {
      id: `act-fu-${Date.now()}`,
      type: 'follow_up',
      description: `Agendado: ${followUp.title}`,
      date: new Date().toISOString()
    };

    setCards(prev => prev.map(card => {
      if (card.id === cardId) {
        const updatedFollowUps = [...(card.follow_ups || []), newFollowUp];
        return {
          ...card,
          follow_ups: updatedFollowUps,
          next_action: updatedFollowUps.filter(f => !f.completed).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]?.due_date,
          activities: [...(card.activities || []), followUpActivity],
          last_activity: followUpActivity
        };
      }
      return card;
    }));
  };

  const completeFollowUp = (cardId: string, followUpId: string) => {
    setCards(prev => prev.map(card => {
      if (card.id === cardId) {
        const updatedFollowUps = (card.follow_ups || []).map(f => 
          f.id === followUpId ? { ...f, completed: true, completed_at: new Date().toISOString() } : f
        );
        const completedTask = updatedFollowUps.find(f => f.id === followUpId);
        
        const completeActivity: Activity = {
          id: `act-fuc-${Date.now()}`,
          type: 'task',
          description: `Concluído: ${completedTask?.title}`,
          date: new Date().toISOString()
        };

        return {
          ...card,
          follow_ups: updatedFollowUps,
          next_action: updatedFollowUps.filter(f => !f.completed).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]?.due_date,
          activities: [...(card.activities || []), completeActivity],
          last_activity: completeActivity
        };
      }
      return card;
    }));
  };

  const updateCard = (cardId: string, data: Partial<KanbanCard>) => {
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, ...data } as KanbanCard : c
    ));
  };

  const enrichedSegments = useMemo(() => {
    return segments.map(segment => ({
      ...segment,
      count: applyFilters(cards, segment.filters).length
    }));
  }, [segments, cards]);

  const value = useMemo(() => ({
    pipelines,
    selectedPipelineId,
    selectedPipeline,
    stages,
    pipelineStages,
    cards,
    pipelineCards,
    tags,
    responsibles,
    sources,
    segments: enrichedSegments,
    filters,
    activeTab,
    activeSegmentId,
    selectedLeadIds,
    selectedCard,
    isModalOpen,
    editingCard,
    preselectedStageId,
    setPipelines,
    setSelectedPipelineId,
    setStages,
    setCards,
    setTags,
    setFilters,
    setActiveTab,
    setSelectedCard,
    setIsModalOpen,
    setEditingCard,
    setPreselectedStageId,
    setSources,
    setSegments,
    setActiveSegmentId,
    toggleLeadSelection,
    selectAllLeads,
    clearLeadSelection,
    addTags,
    addPipeline,
    updatePipeline,
    deletePipeline,
    addSegment,
    deleteSegment,
    applySegment,
    saveCard,
    bulkAddCards,
    bulkUpdateCards,
    moveCard,
    markCardResult,
    addActivity,
    updateCardTags,
    addFollowUp,
    completeFollowUp,
    updateCard,
  }), [pipelines, selectedPipelineId, selectedPipeline, stages, pipelineStages, cards, pipelineCards, tags, responsibles, sources, segments, filters, activeTab, activeSegmentId, selectedLeadIds, selectedCard, isModalOpen, editingCard, preselectedStageId]);

  return (
    <CRMKanbanContext.Provider value={value}>
      {children}
    </CRMKanbanContext.Provider>
  );
}

export function useCRMKanban() {
  const context = useContext(CRMKanbanContext);
  if (context === undefined) {
    throw new Error('useCRMKanban must be used within a CRMKanbanProvider');
  }
  return context;
}
