import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { KanbanCard as KanbanCardType } from './crmKanban.types';
import { filterCardsByStage } from './crmKanban.utils';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { useCRMKanban } from './CRMKanbanContext';

export function KanbanBoard() {
  const { 
    stages: allStages, 
    cards: allDeals, 
    selectedPipelineId,
    moveCard, 
    setSelectedCard, 
    setIsModalOpen, 
    setPreselectedStageId 
  } = useCRMKanban();
  const [activeDeal, setActiveDeal] = useState<KanbanCardType | null>(null);

  const stages = allStages.filter(s => s.pipeline_id === selectedPipelineId);
  const stageIds = stages.map(s => s.id);
  const deals = allDeals.filter(d => stageIds.includes(d.stage_id));

  const onDealClick = (deal: KanbanCardType) => {
    setSelectedCard(deal);
  };

  const onAddClick = (stageId: string) => {
    setPreselectedStageId(stageId);
    setIsModalOpen(true);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const deal = deals.find((d) => d.id === active.id);
    if (deal) setActiveDeal(deal);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Logic for sorting or moving between columns visually could go here
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id as string;
    const overId = over.id as string;

    // Check if over is a stage or a deal
    let stageId = overId;
    const targetDeal = deals.find(d => d.id === overId);
    if (targetDeal) {
      stageId = targetDeal.stage_id;
    }

    const sourceDeal = deals.find(d => d.id === dealId);
    if (sourceDeal && sourceDeal.stage_id !== stageId) {
      moveCard(dealId, stageId);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 pb-6 min-h-full items-start px-2 lg:px-0">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            deals={filterCardsByStage(deals, stage.id)}
            onDealClick={onDealClick}
            onAddClick={() => onAddClick?.(stage.id)}
          />
        ))}
        {/* Spacer for scroll end */}
        <div className="w-10 shrink-0" />
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}>
        {activeDeal ? <KanbanCard deal={activeDeal} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
