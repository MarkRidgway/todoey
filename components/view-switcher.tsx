"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const VIEWS = [
  { id: "list", label: "List" },
  { id: "kanban", label: "Kanban" },
  { id: "grid", label: "Grid" },
  { id: "matrix", label: "Matrix" },
] as const;

export type ViewId = (typeof VIEWS)[number]["id"];

export function ViewSwitcher({
  view,
  onViewChange,
  enabledViews,
}: {
  view: ViewId;
  onViewChange: (view: ViewId) => void;
  enabledViews: ViewId[];
}) {
  const visibleViews = VIEWS.filter((v) => enabledViews.includes(v.id));
  return (
    <Tabs value={view} onValueChange={(v) => onViewChange(v as ViewId)}>
      <TabsList>
        {visibleViews.map((v) => (
          <TabsTrigger key={v.id} value={v.id}>
            {v.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
