"use client";

import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TagBadge } from "@/components/tag-badge";
import { cn } from "@/lib/utils";
import type { Tag } from "@/lib/types";
import type { Status } from "@/lib/generated/prisma/client";

export const STATUS_FILTERS = [
  { id: "DEFAULT", label: "Default", statuses: ["TODO", "IN_PROGRESS"], className: "bg-muted text-muted-foreground" },
  {
    id: "IN_PROGRESS",
    label: "In Progress",
    statuses: ["IN_PROGRESS"],
    className: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  {
    id: "DONE",
    label: "Completed",
    statuses: ["DONE"],
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
] as const satisfies { id: string; label: string; statuses: Status[]; className: string }[];

export type StatusFilterId = (typeof STATUS_FILTERS)[number]["id"];

export function FilterBar({
  tags,
  statusFilter,
  onStatusFilterChange,
  selectedTagIds,
  onToggleTag,
}: {
  tags: Tag[];
  statusFilter: StatusFilterId;
  onStatusFilterChange: (status: StatusFilterId) => void;
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
}) {
  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_FILTERS.map((filter) => (
          <Badge
            key={filter.id}
            className={cn("cursor-pointer", filter.className, statusFilter !== filter.id && "opacity-40")}
            onClick={() => onStatusFilterChange(filter.id)}
          >
            {filter.label}
          </Badge>
        ))}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="size-3.5" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {tags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={selectedTagIds.includes(tag.id)}
                  onCheckedChange={() => onToggleTag(tag.id)}
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedTags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} onClick={() => onToggleTag(tag.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
