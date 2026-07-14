"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TagBadge } from "@/components/tag-badge";
import { STATUS_LABELS } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import type { Tag, TodoWithTags } from "@/lib/types";
import type { Status } from "@/lib/generated/prisma/client";
import { TodoInputSchema, type TodoInput } from "@/lib/validation";

const TAG_COLOR_PRESETS = [
  "#3b82f6",
  "#10b981",
  "#ef4444",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#64748b",
];

interface TodoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTodo?: TodoWithTags | null;
  tags: Tag[];
  onCreateTag: (name: string, color: string) => Promise<Tag | null>;
  onSubmit: (input: TodoInput) => Promise<void>;
}

export function TodoFormDialog({
  open,
  onOpenChange,
  initialTodo,
  tags,
  onCreateTag,
  onSubmit,
}: TodoFormDialogProps) {
  const isEdit = !!initialTodo;

  const [title, setTitle] = useState(initialTodo?.title ?? "");
  const [description, setDescription] = useState(initialTodo?.description ?? "");
  const [status, setStatus] = useState<Status>(initialTodo?.status ?? "TODO");
  const [urgent, setUrgent] = useState(initialTodo?.urgent ?? false);
  const [important, setImportant] = useState(initialTodo?.important ?? false);
  const [dueDate, setDueDate] = useState<Date | undefined>(initialTodo?.dueDate ?? undefined);
  const [tagIds, setTagIds] = useState<string[]>(initialTodo?.tags.map((t) => t.id) ?? []);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLOR_PRESETS[0]);
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleTag(tagId: string) {
    setTagIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]));
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) return;
    const tag = await onCreateTag(newTagName.trim(), newTagColor);
    if (tag) {
      setTagIds((prev) => [...prev, tag.id]);
      setNewTagName("");
      setShowNewTagInput(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = TodoInputSchema.safeParse({
      title,
      description,
      status,
      urgent,
      important,
      dueDate: dueDate ?? null,
      tagIds,
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(result.data);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit todo" : "New todo"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Update the details of this todo." : "Add a new todo to your list."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="todo-title">Title</Label>
              <Input
                id="todo-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="todo-description">Description</Label>
              <Textarea
                id="todo-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                  <SelectTrigger>
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
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Due date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn("justify-start font-normal", !dueDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="size-4" />
                      {dueDate ? format(dueDate, "MMM d, yyyy") : "No due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      autoFocus
                    />
                    {dueDate && (
                      <div className="border-t p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => setDueDate(undefined)}
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="todo-urgent"
                  checked={urgent}
                  onCheckedChange={(v) => setUrgent(v === true)}
                />
                <Label htmlFor="todo-urgent">Urgent</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="todo-important"
                  checked={important}
                  onCheckedChange={(v) => setImportant(v === true)}
                />
                <Label htmlFor="todo-important">Important</Label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Tags</Label>
              <div className="flex flex-wrap items-center gap-1.5">
                {tags.map((tag) => (
                  <TagBadge
                    key={tag.id}
                    tag={tag}
                    onClick={() => toggleTag(tag.id)}
                    className={cn(!tagIds.includes(tag.id) && "opacity-40")}
                  />
                ))}
                {!showNewTagInput && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 rounded-full px-2 text-xs"
                    onClick={() => setShowNewTagInput(true)}
                  >
                    <Plus className="size-3" /> New tag
                  </Button>
                )}
              </div>

              {showNewTagInput && (
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="h-8"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateTag();
                      }
                    }}
                  />
                  <div className="flex items-center gap-1">
                    {TAG_COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "size-5 shrink-0 rounded-full border-2",
                          newTagColor === color ? "border-foreground" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewTagColor(color)}
                        aria-label={`Choose color ${color}`}
                      />
                    ))}
                  </div>
                  <Button type="button" size="sm" onClick={handleCreateTag}>
                    Add
                  </Button>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {isEdit ? "Save changes" : "Create todo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
