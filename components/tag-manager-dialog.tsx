"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Tag } from "@/lib/types";

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

export function TagManagerDialog({
  open,
  onOpenChange,
  tags,
  onRename,
  onRecolor,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: Tag[];
  onRename: (tagId: string, name: string) => void;
  onRecolor: (tagId: string, color: string) => void;
  onDelete: (tagId: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage tags</DialogTitle>
          <DialogDescription>Rename, recolor, or delete tags.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {tags.length === 0 && <p className="text-sm text-muted-foreground">No tags yet.</p>}
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-2 rounded-md border p-2">
              <div className="flex items-center gap-1">
                {TAG_COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "size-4 shrink-0 rounded-full border-2",
                      tag.color === color ? "border-foreground" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => onRecolor(tag.id, color)}
                    aria-label={`Set color ${color}`}
                  />
                ))}
              </div>

              {editingId === tag.id ? (
                <Input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={() => {
                    if (draftName.trim()) onRename(tag.id, draftName.trim());
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                  className="h-7 flex-1"
                />
              ) : (
                <button
                  type="button"
                  className="flex-1 truncate text-left text-sm"
                  onClick={() => {
                    setEditingId(tag.id);
                    setDraftName(tag.name);
                  }}
                >
                  {tag.name}
                </button>
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => onDelete(tag.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
