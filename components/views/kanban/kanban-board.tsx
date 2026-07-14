"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { TodoCard } from "@/components/todo-card";
import type { TodoWithTags } from "@/lib/types";
import type { Status } from "@/lib/generated/prisma/client";

export const STATUS_COLUMNS: { value: Status; label: string }[] = [
  { value: "TODO", label: "Todo" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

export function KanbanBoard({
  todos,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleUrgent,
  onToggleImportant,
}: {
  todos: TodoWithTags[];
  onEdit: (todo: TodoWithTags) => void;
  onDelete: (todo: TodoWithTags) => void;
  onStatusChange: (id: string, status: Status) => void;
  onToggleUrgent: (todo: TodoWithTags) => void;
  onToggleImportant: (todo: TodoWithTags) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const columns = useMemo(() => {
    const map = new Map<Status, TodoWithTags[]>();
    for (const col of STATUS_COLUMNS) map.set(col.value, []);
    for (const todo of todos) map.get(todo.status)?.push(todo);
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
    const overId = String(over.id);

    const isOverColumn = STATUS_COLUMNS.some((c) => c.value === overId);
    const targetStatus = isOverColumn ? (overId as Status) : todos.find((t) => t.id === overId)?.status;
    if (!targetStatus) return;

    const activeTodoItem = todos.find((t) => t.id === activeTodoId);
    if (!activeTodoItem || activeTodoItem.status === targetStatus) return;

    onStatusChange(activeTodoId, targetStatus);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATUS_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.value}
            status={col.value}
            label={col.label}
            todos={columns.get(col.value) ?? []}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleUrgent={onToggleUrgent}
            onToggleImportant={onToggleImportant}
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
