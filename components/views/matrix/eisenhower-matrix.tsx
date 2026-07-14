"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { MatrixQuadrant } from "./matrix-quadrant";
import { TodoCard } from "@/components/todo-card";
import { QUADRANTS, fromQuadrant, toQuadrant, type Quadrant } from "@/lib/quadrant";
import type { TodoWithTags } from "@/lib/types";

export function EisenhowerMatrix({
  todos,
  onEdit,
  onDelete,
  onQuadrantChange,
}: {
  todos: TodoWithTags[];
  onEdit: (todo: TodoWithTags) => void;
  onDelete: (todo: TodoWithTags) => void;
  onQuadrantChange: (id: string, urgent: boolean, important: boolean) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor)
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<Quadrant, TodoWithTags[]>();
    for (const q of QUADRANTS) map.set(q.id, []);
    for (const todo of todos) map.get(toQuadrant(todo.urgent, todo.important))?.push(todo);
    return map;
  }, [todos]);

  const activeTodo = activeId ? todos.find((t) => t.id === activeId) ?? null : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeTodoId = String(active.id);
    const targetQuadrant = QUADRANTS.find((q) => q.id === over.id)?.id;
    if (!targetQuadrant) return;

    const activeTodoItem = todos.find((t) => t.id === activeTodoId);
    if (!activeTodoItem) return;

    const currentQuadrant = toQuadrant(activeTodoItem.urgent, activeTodoItem.important);
    if (currentQuadrant === targetQuadrant) return;

    const { urgent, important } = fromQuadrant(targetQuadrant);
    onQuadrantChange(activeTodoId, urgent, important);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {QUADRANTS.map((q) => (
          <MatrixQuadrant
            key={q.id}
            quadrant={q.id}
            title={q.title}
            hint={q.hint}
            todos={grouped.get(q.id) ?? []}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTodo && (
          <TodoCard todo={activeTodo} onEdit={onEdit} onDelete={onDelete} className="w-72" />
        )}
      </DragOverlay>
    </DndContext>
  );
}
