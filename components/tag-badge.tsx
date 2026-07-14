import { Badge } from "@/components/ui/badge";
import type { Tag } from "@/lib/types";
import { cn } from "@/lib/utils";

function getContrastTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1a1a1a" : "#ffffff";
}

export function TagBadge({
  tag,
  className,
  onClick,
}: {
  tag: Tag;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Badge
      className={cn(onClick && "cursor-pointer", className)}
      style={{ backgroundColor: tag.color, color: getContrastTextColor(tag.color) }}
      onClick={onClick}
    >
      {tag.name}
    </Badge>
  );
}
