"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ViewSwitcher, type ViewId } from "@/components/view-switcher";
import { TodoFormDialog } from "@/components/todo-form-dialog";
import { TagManagerDialog } from "@/components/tag-manager-dialog";
import { ListView } from "@/components/views/list-view";
import { KanbanBoard } from "@/components/views/kanban/kanban-board";
import { GridView } from "@/components/views/grid/grid-view";
import { EisenhowerMatrix } from "@/components/views/matrix/eisenhower-matrix";
import {
  createTodo,
  deleteTodo,
  setTodoQuadrant,
  setTodoStatus,
  updateTodo,
} from "@/actions/todo-actions";
import { createTag, deleteTag, updateTag } from "@/actions/tag-actions";
import type { Tag, TodoWithTags } from "@/lib/types";
import type { Status } from "@/lib/generated/prisma/client";
import type { TodoInput } from "@/lib/validation";

export function TodoApp({
  listKey,
  initialTodos,
  initialTags,
  enabledViews,
}: {
  listKey: string;
  initialTodos: TodoWithTags[];
  initialTags: Tag[];
  enabledViews: ViewId[];
}) {
  const [todos, setTodos] = useState(initialTodos);
  const [tags, setTags] = useState(initialTags);
  const [view, setView] = useState<ViewId>(enabledViews[0] ?? "list");
  const [, startTransition] = useTransition();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoWithTags | null>(null);
  const [formInstance, setFormInstance] = useState(0);
  const [deletingTodo, setDeletingTodo] = useState<TodoWithTags | null>(null);
  const [tagManagerOpen, setTagManagerOpen] = useState(false);

  function openCreateDialog() {
    setEditingTodo(null);
    setFormInstance((n) => n + 1);
    setFormOpen(true);
  }

  function openEditDialog(todo: TodoWithTags) {
    setEditingTodo(todo);
    setFormInstance((n) => n + 1);
    setFormOpen(true);
  }

  async function handleFormSubmit(input: TodoInput) {
    if (editingTodo) {
      try {
        const updated = await updateTodo(listKey, editingTodo.id, input);
        setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      } catch {
        toast.error("Failed to update todo");
      }
    } else {
      try {
        const created = await createTodo(listKey, input);
        setTodos((prev) => [created, ...prev]);
      } catch {
        toast.error("Failed to create todo");
      }
    }
  }

  function handleStatusChange(id: string, status: Status) {
    const previous = todos;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    startTransition(() => {
      setTodoStatus(listKey, id, status).catch(() => {
        setTodos(previous);
        toast.error("Failed to update status");
      });
    });
  }

  function handleQuadrantChange(id: string, urgent: boolean, important: boolean) {
    const previous = todos;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, urgent, important } : t)));
    startTransition(() => {
      setTodoQuadrant(listKey, id, urgent, important).catch(() => {
        setTodos(previous);
        toast.error("Failed to update todo");
      });
    });
  }

  function handleToggleUrgent(todo: TodoWithTags) {
    handleQuadrantChange(todo.id, !todo.urgent, todo.important);
  }

  function handleToggleImportant(todo: TodoWithTags) {
    handleQuadrantChange(todo.id, todo.urgent, !todo.important);
  }

  async function confirmDelete() {
    if (!deletingTodo) return;
    const previous = todos;
    const id = deletingTodo.id;
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setDeletingTodo(null);
    try {
      await deleteTodo(listKey, id);
    } catch {
      setTodos(previous);
      toast.error("Failed to delete todo");
    }
  }

  async function handleCreateTag(name: string, color: string): Promise<Tag | null> {
    try {
      const tag = await createTag(listKey, { name, color });
      setTags((prev) => [...prev, tag]);
      return tag;
    } catch {
      toast.error("Failed to create tag");
      return null;
    }
  }

  async function handleRenameTag(tagId: string, name: string) {
    const previous = tags;
    setTags((prev) => prev.map((t) => (t.id === tagId ? { ...t, name } : t)));
    const existing = tags.find((t) => t.id === tagId);
    if (!existing) return;
    try {
      await updateTag(listKey, tagId, { name, color: existing.color });
    } catch {
      setTags(previous);
      toast.error("Failed to rename tag");
    }
  }

  async function handleRecolorTag(tagId: string, color: string) {
    const previous = tags;
    setTags((prev) => prev.map((t) => (t.id === tagId ? { ...t, color } : t)));
    const existing = tags.find((t) => t.id === tagId);
    if (!existing) return;
    try {
      await updateTag(listKey, tagId, { name: existing.name, color });
    } catch {
      setTags(previous);
      toast.error("Failed to recolor tag");
    }
  }

  async function handleDeleteTag(tagId: string) {
    const previousTags = tags;
    const previousTodos = todos;
    setTags((prev) => prev.filter((t) => t.id !== tagId));
    setTodos((prev) => prev.map((t) => ({ ...t, tags: t.tags.filter((tag) => tag.id !== tagId) })));
    try {
      await deleteTag(listKey, tagId);
    } catch {
      setTags(previousTags);
      setTodos(previousTodos);
      toast.error("Failed to delete tag");
    }
  }

  const viewProps = {
    todos,
    onEdit: openEditDialog,
    onDelete: (todo: TodoWithTags) => setDeletingTodo(todo),
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Todoey</h1>
          <p className="text-sm text-muted-foreground">
            {todos.length} {todos.length === 1 ? "todo" : "todos"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setTagManagerOpen(true)}>
            <Tags className="size-4" /> Manage tags
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="size-4" /> New todo
          </Button>
        </div>
      </div>

      <ViewSwitcher view={view} onViewChange={setView} enabledViews={enabledViews} />

      {view === "list" && (
        <ListView
          {...viewProps}
          tags={tags}
          onStatusChange={handleStatusChange}
          onToggleUrgent={handleToggleUrgent}
          onToggleImportant={handleToggleImportant}
        />
      )}
      {view === "kanban" && (
        <KanbanBoard
          {...viewProps}
          onStatusChange={handleStatusChange}
          onToggleUrgent={handleToggleUrgent}
          onToggleImportant={handleToggleImportant}
        />
      )}
      {view === "grid" && (
        <GridView
          {...viewProps}
          tags={tags}
          onStatusChange={handleStatusChange}
          onToggleUrgent={handleToggleUrgent}
          onToggleImportant={handleToggleImportant}
        />
      )}
      {view === "matrix" && <EisenhowerMatrix {...viewProps} onQuadrantChange={handleQuadrantChange} />}

      <TodoFormDialog
        key={formInstance}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialTodo={editingTodo}
        tags={tags}
        onCreateTag={handleCreateTag}
        onSubmit={handleFormSubmit}
      />

      <TagManagerDialog
        open={tagManagerOpen}
        onOpenChange={setTagManagerOpen}
        tags={tags}
        onRename={handleRenameTag}
        onRecolor={handleRecolorTag}
        onDelete={handleDeleteTag}
      />

      <Dialog open={!!deletingTodo} onOpenChange={(open) => !open && setDeletingTodo(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete todo?</DialogTitle>
            <DialogDescription>
              This will permanently delete &ldquo;{deletingTodo?.title}&rdquo;. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTodo(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
