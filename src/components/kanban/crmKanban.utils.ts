import { KanbanCard, PipelineStage, KanbanFilters, SegmentFilters } from './crmKanban.types';

/**
 * Apply filters to cards
 */
export const applyFilters = (cards: KanbanCard[], filters: KanbanFilters | SegmentFilters) => {
  const segmentFilters = filters as SegmentFilters;
  const tagLogic = segmentFilters.tag_logic || 'any';

  return cards.filter(card => {
    // 1. Text Search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        card.title.toLowerCase().includes(searchLower) ||
        card.lead.name.toLowerCase().includes(searchLower) ||
        (card.lead.email && card.lead.email.toLowerCase().includes(searchLower)) ||
        (card.lead.phone && card.lead.phone.includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // 2. Tags Logic
    if (filters.tags && filters.tags.length > 0) {
      const cardTagIds = card.tags.map(t => t.id);
      
      if (tagLogic === 'all') {
        const hasAllTags = filters.tags.every(id => cardTagIds.includes(id));
        if (!hasAllTags) return false;
      } else if (tagLogic === 'not') {
        const hasAnyBlockedTag = filters.tags.some(id => cardTagIds.includes(id));
        if (hasAnyBlockedTag) return false;
      } else { // 'any'
        const hasAnyTag = filters.tags.some(id => cardTagIds.includes(id));
        if (!hasAnyTag) return false;
      }
    }

    // 3. Responsible
    if (filters.responsible_id && filters.responsible_id !== 'all' && card.responsible?.id !== filters.responsible_id) {
      return false;
    }

    // 4. Source
    if (filters.source && card.lead.source !== filters.source) {
      return false;
    }

    // 5. Status
    if (filters.status && card.status !== filters.status) {
      return false;
    }

    // 6. Value Range
    if (filters.min_value !== undefined && card.value < filters.min_value) return false;
    if (filters.max_value !== undefined && card.value > filters.max_value) return false;

    // 7. Overdue
    if (filters.overdue_only) {
      if (!card.next_action) return false;
      const isOverdue = new Date(card.next_action) < new Date();
      if (!isOverdue) return false;
    }

    // 8. Stage (Specific for segments)
    if (segmentFilters.stage_id && card.stage_id !== segmentFilters.stage_id) {
      return false;
    }

    // 9. No Activity (Specific for segments)
    if (segmentFilters.no_activity) {
      if (card.activities && card.activities.length > 0) return false;
    }

    return true;
  });
};

/**
 * Filter cards by stage
 */
export const filterCardsByStage = (cards: KanbanCard[], stageId: string) => {
  return cards.filter(card => card.stage_id === stageId && card.status === 'open');
};

/**
 * Calculate total value for a list of cards
 */
export const calculateStageTotal = (cards: KanbanCard[]) => {
  return cards.reduce((sum, card) => sum + card.value, 0);
};

/**
 * Format currency specifically for Kanban
 */
export function formatKanbanCurrency(value: number, currency: string = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(value);
}
