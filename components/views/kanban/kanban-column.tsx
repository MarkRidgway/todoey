"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TodoCard } from "@/components/todo-card";
import { cn } from "@/lib/utils";
import type { TodoWithTags } from "@/lib/types";
import type { Status } from "@/lib/generated/prisma/client";

function SortableTodoCard({
  todo,
  onEdit,
  onDelete,
  onToggleUrgent,
  onToggleImportant,
}: {
  todo: TodoWithTags;
  onEdit: (todo: TodoWithTags) => void;
  onDelete: (todo: TodoWithTags) => void;
  onToggleUrgent: (todo: TodoWithTags) => void;
  onToggleImportant: (todo: TodoWithTags) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
  });

  return (
    <TodoCard
      ref={setNodeRef}
      todo={todo}
      onEdit={onEdit}
      onDelete={onDelete}
      onToggleUrgent={() => onToggleUrgent(todo)}
      onToggleImportant={() => onToggleImportant(todo)}
      dragAttributes={attributes}
      dragListeners={listeners}
      isDragging={isDragging}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    />
  );
}

export function KanbanColumn({
  status,
  label,
  todos,
  onEdit,
  onDelete,
  onToggleUrgent,
  onToggleImportant,
}: {
  status: Status;
  label: string;
  todos: TodoWithTags[];
  onEdit: (todo: TodoWithTags) => void;
  onDelete: (todo: TodoWithTags) => void;
  onToggleUrgent: (todo: TodoWithTags) => void;
  onToggleImportant: (todo: TodoWithTags) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium">{label}</h3>
        <span className="text-xs text-muted-foreground">{todos.length}</span>
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div
          ref={setNodeRef}
          className={cn(
            "flex min-h-full flex-col gap-2 rounded-md p-1 transition-colors",
            isOver && "bg-accent/50"
          )}
        >
          <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {todos.map((todo) => (
              <SortableTodoCard
                key={todo.id}
                todo={todo}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleUrgent={onToggleUrgent}
                onToggleImportant={onToggleImportant}
              />
            ))}
          </SortableContext>
          {todos.length === 0 && (
            <p className="py-6 text-center text-xs text-muted-foreground">Drop here</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
