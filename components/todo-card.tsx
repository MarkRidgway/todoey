"use client";

import { forwardRef } from "react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { format, isPast } from "date-fns";
import { CalendarDays, Flag, GripVertical, MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge, STATUS_LABELS } from "@/components/status-badge";
import { TagBadge } from "@/components/tag-badge";
import { cn } from "@/lib/utils";
import type { TodoWithTags } from "@/lib/types";
import type { Status } from "@/lib/generated/prisma/client";

interface TodoCardProps {
  todo: TodoWithTags;
  onEdit: (todo: TodoWithTags) => void;
  onDelete: (todo: TodoWithTags) => void;
  onStatusChange?: (status: Status) => void;
  onToggleUrgent?: () => void;
  onToggleImportant?: () => void;
  dragAttributes?: DraggableAttributes;
  dragListeners?: DraggableSyntheticListeners;
  style?: React.CSSProperties;
  className?: string;
  isDragging?: boolean;
}

export const TodoCard = forwardRef<HTMLDivElement, TodoCardProps>(function TodoCard(
  {
    todo,
    onEdit,
    onDelete,
    onStatusChange,
    onToggleUrgent,
    onToggleImportant,
    dragAttributes,
    dragListeners,
    style,
    className,
    isDragging,
  },
  ref
) {
  const overdue = todo.dueDate ? isPast(todo.dueDate) && todo.status !== "DONE" : false;

  return (
    <Card
      ref={ref}
      style={style}
      className={cn("gap-3 py-3", isDragging && "opacity-50", className)}
    >
      <CardHeader className="px-3">
        <div className="flex items-start gap-2">
          {dragAttributes && dragListeners && (
            <button
              type="button"
              className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
              {...dragAttributes}
              {...dragListeners}
              aria-label="Drag to move"
            >
              <GripVertical className="size-4" />
            </button>
          )}
          <CardTitle className="text-sm leading-snug">{todo.title}</CardTitle>
        </div>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(todo)}>
                <Pencil className="size-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(todo)}>
                <Trash2 className="size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-3">
        {todo.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{todo.description}</p>
        )}

        {todo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {todo.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={todo.status} />
          {todo.dueDate && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs text-muted-foreground",
                overdue && "text-destructive"
              )}
            >
              <CalendarDays className="size-3" />
              {format(todo.dueDate, "MMM d")}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={todo.urgent ? "secondary" : "ghost"}
              size="icon"
              className="size-7"
              title="Toggle urgent"
              onClick={onToggleUrgent}
            >
              <Flag className={cn("size-3.5", todo.urgent && "fill-current")} />
            </Button>
            <Button
              type="button"
              variant={todo.important ? "secondary" : "ghost"}
              size="icon"
              className="size-7"
              title="Toggle important"
              onClick={onToggleImportant}
            >
              <Star className={cn("size-3.5", todo.important && "fill-current")} />
            </Button>
          </div>

          {onStatusChange && (
            <Select value={todo.status} onValueChange={(v) => onStatusChange(v as Status)}>
              <SelectTrigger size="sm" className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
