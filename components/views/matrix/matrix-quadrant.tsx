"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TodoCard } from "@/components/todo-card";
import { cn } from "@/lib/utils";
import type { Quadrant } from "@/lib/quadrant";
import type { TodoWithTags } from "@/lib/types";

function DraggableTodoCard({
  todo,
  onEdit,
  onDelete,
}: {
  todo: TodoWithTags;
  onEdit: (todo: TodoWithTags) => void;
  onDelete: (todo: TodoWithTags) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: todo.id });

  return (
    <TodoCard
      ref={setNodeRef}
      todo={todo}
      onEdit={onEdit}
      onDelete={onDelete}
      dragAttributes={attributes}
      dragListeners={listeners}
      isDragging={isDragging}
      style={{ transform: CSS.Translate.toString(transform) }}
    />
  );
}

export function MatrixQuadrant({
  quadrant,
  title,
  hint,
  todos,
  onEdit,
  onDelete,
}: {
  quadrant: Quadrant;
  title: string;
  hint: string;
  todos: TodoWithTags[];
  onEdit: (todo: TodoWithTags) => void;
  onDelete: (todo: TodoWithTags) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: quadrant });

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-2">
      <div className="px-1">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>

      <ScrollArea className="h-[calc((100vh-20rem)/2)]">
        <div
          ref={setNodeRef}
          className={cn(
            "flex min-h-full flex-col gap-2 rounded-md p-1 transition-colors",
            isOver && "bg-accent/50"
          )}
        >
          {todos.map((todo) => (
            <DraggableTodoCard key={todo.id} todo={todo} onEdit={onEdit} onDelete={onDelete} />
          ))}
          {todos.length === 0 && (
            <p className="py-6 text-center text-xs text-muted-foreground">Drop here</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
