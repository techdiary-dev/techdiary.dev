import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";

interface SortableArticleItemProps {
  id: string;
  title: string;
  onRemove: () => void;
}

export function SortableArticleItem({
  id,
  title,
  onRemove,
}: SortableArticleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center bg-background dark:bg-card p-3 rounded-md border border-border"
    >
      <button
        {...attributes}
        {...listeners}
        className="mr-2 cursor-grab text-muted-foreground hover:text-foreground focus:outline-none"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>
      <span className="flex-1 truncate text-foreground">{title}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="ml-2 text-muted-foreground hover:text-destructive"
        aria-label="Remove article from series"
      >
        <X size={16} />
      </Button>
    </div>
  );
}
