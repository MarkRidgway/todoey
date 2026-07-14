"use client";

import { format, isPast } from "date-fns";
import { CalendarDays, Flag, MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_LABELS } from "@/components/status-badge";
import { TagBadge } from "@/components/tag-badge";
import { cn } from "@/lib/utils";
import type { TodoWithTags } from "@/lib/types";
import type { Status } from "@/lib/generated/prisma/client";

export function TodoListItem({
  todo,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleUrgent,
  onToggleImportant,
}: {
  todo: TodoWithTags;
  onEdit: (todo: TodoWithTags) => void;
  onDelete: (todo: TodoWithTags) => void;
  onStatusChange: (status: Status) => void;
  onToggleUrgent: () => void;
  onToggleImportant: () => void;
}) {
  const overdue = todo.dueDate ? isPast(todo.dueDate) && todo.status !== "DONE" : false;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card px-3 py-2.5">
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

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{todo.title}</p>
        {todo.description && (
          <p className="truncate text-xs text-muted-foreground">{todo.description}</p>
        )}
      </div>

      {todo.tags.length > 0 && (
        <div className="hidden flex-wrap gap-1 sm:flex">
          {todo.tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}

      {todo.dueDate && (
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground",
            overdue && "text-destructive"
          )}
        >
          <CalendarDays className="size-3" />
          {format(todo.dueDate, "MMM d")}
        </span>
      )}

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
    </div>
  );
}
