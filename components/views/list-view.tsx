"use client";

import { useMemo, useState } from "react";
import { FilterBar, STATUS_FILTERS, type StatusFilterId } from "@/components/filter-bar";
import { TodoListItem } from "@/components/todo-list-item";
import type { Tag, TodoWithTags } from "@/lib/types";
import type { Status } from "@/lib/generated/prisma/client";

export function ListView({
  todos,
  tags,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleUrgent,
  onToggleImportant,
}: {
  todos: TodoWithTags[];
  tags: Tag[];
  onEdit: (todo: TodoWithTags) => void;
  onDelete: (todo: TodoWithTags) => void;
  onStatusChange: (id: string, status: Status) => void;
  onToggleUrgent: (todo: TodoWithTags) => void;
  onToggleImportant: (todo: TodoWithTags) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilterId>("DEFAULT");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const allowedStatuses: readonly Status[] = STATUS_FILTERS.find((f) => f.id === statusFilter)!.statuses;
    return todos.filter((todo) => {
      if (!allowedStatuses.includes(todo.status)) return false;
      if (selectedTagIds.length > 0 && !selectedTagIds.every((id) => todo.tags.some((t) => t.id === id))) {
        return false;
      }
      return true;
    });
  }, [todos, statusFilter, selectedTagIds]);

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]));
  }

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        tags={tags}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        selectedTagIds={selectedTagIds}
        onToggleTag={toggleTag}
      />

      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No todos match the current filters.</p>
        )}
        {filtered.map((todo) => (
          <TodoListItem
            key={todo.id}
            todo={todo}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={(status) => onStatusChange(todo.id, status)}
            onToggleUrgent={() => onToggleUrgent(todo)}
            onToggleImportant={() => onToggleImportant(todo)}
          />
        ))}
      </div>
    </div>
  );
}
