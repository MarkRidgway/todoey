import { Badge } from "@/components/ui/badge";
import type { Status } from "@/lib/generated/prisma/client";

export const STATUS_LABELS: Record<Status, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const STATUS_CLASSES: Record<Status, string> = {
  TODO: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  DONE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

export function StatusBadge({ status }: { status: Status }) {
  return <Badge className={STATUS_CLASSES[status]}>{STATUS_LABELS[status]}</Badge>;
}
