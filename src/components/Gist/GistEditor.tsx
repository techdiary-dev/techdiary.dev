"use client";

import { createGist, updateGist } from "@/backend/services/gist.actions";
import {
  CreateGistInputType,
  UpdateGistInputType,
} from "@/backend/services/inputs/gist.input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { actionPromisify } from "@/lib/utils";
import {
  DragHandleDots2Icon,
  PlusIcon,
  TrashIcon,
  EyeOpenIcon,
  LockClosedIcon,
  ArrowLeftIcon,
} from "@radix-ui/react-icons";
import { LineChartIcon } from "lucide-react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Gist } from "@/backend/models/domain-models";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface GistFile {
  _key: string;
  id?: string;
  filename: string;
  content: string;
  language?: string;
  _action?: "create" | "update" | "delete";
}

interface GistEditorProps {
  gist?: Gist | null;
  onSuccess?: (gistId: string) => void;
}

function makeKey() {
  return crypto.randomUUID();
}

function toEditorFiles(gist: Gist | null | undefined): GistFile[] {
  if (gist?.files?.length) {
    return gist.files.map((f) => ({ ...f, _key: f.id ?? makeKey() }));
  }
  return [{ _key: makeKey(), filename: "", content: "", language: "" }];
}

interface SortableFileItemProps {
  file: GistFile;
  total: number;
  onUpdate: (key: string, field: keyof GistFile, value: string) => void;
  onRemove: (key: string) => void;
}

function SortableFileItem({ file, total, onUpdate, onRemove }: SortableFileItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: file._key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg overflow-hidden"
    >
      {/* File header bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border-b">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0 p-0.5"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <DragHandleDots2Icon className="w-4 h-4" />
        </button>

        <Input
          value={file.filename}
          onChange={(e) => onUpdate(file._key, "filename", e.target.value)}
          placeholder="filename.js"
          required
          className="h-7 text-sm font-mono bg-transparent border-0 shadow-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
        />

        {total > 1 && (
          <button
            type="button"
            onClick={() => onRemove(file._key)}
            title="Remove file"
            className="shrink-0 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      <Textarea
        value={file.content}
        onChange={(e) => onUpdate(file._key, "content", e.target.value)}
        placeholder="Enter file content..."
        rows={12}
        required
        className="font-mono text-sm resize-none rounded-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
      />
    </div>
  );
}

export default function GistEditor({ gist, onSuccess }: GistEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(gist?.title || "");
  const [description, setDescription] = useState(gist?.description || "");
  const [isPublic, setIsPublic] = useState(gist?.is_public ?? true);
  const [files, setFiles] = useState<GistFile[]>(() => toEditorFiles(gist));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const createMutation = useMutation({
    mutationFn: (data: CreateGistInputType) => actionPromisify(createGist(data)),
    onSuccess: (data) => {
      toast.success("Gist created!");
      queryClient.invalidateQueries({ queryKey: ["gists"] });
      onSuccess?.(data.id);
      if (!onSuccess) router.push(`/gists/${data.id}`);
    },
    onError: () => toast.error("Failed to create gist"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGistInputType }) =>
      actionPromisify(updateGist(id, data)),
    onSuccess: (data) => {
      toast.success("Gist updated!");
      queryClient.invalidateQueries({ queryKey: ["gists"] });
      queryClient.invalidateQueries({ queryKey: ["gist", gist?.id] });
      onSuccess?.(data.id);
    },
    onError: () => toast.error("Failed to update gist"),
  });

  const visibleFiles = files.filter((f) => f._action !== "delete");

  const addFile = (position: "top" | "bottom" = "bottom") => {
    const newFile: GistFile = { _key: makeKey(), filename: "", content: "", language: "" };
    setFiles((prev) =>
      position === "top" ? [newFile, ...prev] : [...prev, newFile]
    );
  };

  const removeFile = (key: string) => {
    if (visibleFiles.length === 1) {
      toast.error("At least one file is required");
      return;
    }
    setFiles((prev) => {
      const file = prev.find((f) => f._key === key);
      if (!file) return prev;
      if (file.id) {
        return prev.map((f) =>
          f._key === key ? { ...f, _action: "delete" as const } : f
        );
      }
      return prev.filter((f) => f._key !== key);
    });
  };

  const updateFile = (key: string, field: keyof GistFile, value: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f._key !== key) return f;
        const updated = { ...f, [field]: value };
        if (gist && updated.id && !updated._action) updated._action = "update";
        return updated;
      })
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFiles((prev) => {
        const visible = prev.filter((f) => f._action !== "delete");
        const deleted = prev.filter((f) => f._action === "delete");
        const oldIndex = visible.findIndex((f) => f._key === active.id);
        const newIndex = visible.findIndex((f) => f._key === over.id);
        return [...arrayMove(visible, oldIndex, newIndex), ...deleted];
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (visibleFiles.some((f) => !f.filename.trim() || !f.content.trim())) {
      toast.error("All files must have a filename and content");
      return;
    }

    const base = {
      title: title.trim(),
      description: description.trim() || undefined,
      is_public: isPublic,
    };

    if (gist) {
      const filePayload: UpdateGistInputType["files"] = [
        ...files
          .filter((f) => f._action === "delete" && f.id)
          .map((f) => ({ _action: "delete" as const, id: f.id! })),
        ...visibleFiles.map((f) => ({
          id: f.id,
          _action: f._action as "create" | "update" | undefined,
          filename: f.filename.trim(),
          content: f.content.trim(),
          language: f.language?.trim() || undefined,
        })),
      ];
      updateMutation.mutate({ id: gist.id, data: { ...base, files: filePayload } });
    } else {
      createMutation.mutate({
        ...base,
        files: visibleFiles.map((f) => ({
          filename: f.filename.trim(),
          content: f.content.trim(),
          language: f.language?.trim() || undefined,
        })),
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const AddFileButton = ({ position }: { position: "top" | "bottom" }) => (
    <button
      type="button"
      onClick={() => addFile(position)}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <PlusIcon className="w-3.5 h-3.5" />
      Add file
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {gist && (
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/gists/${gist.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Back to gist
          </Link>
          {isPublic ? (
            <Link
              href={`/dashboard/analytics/gist/${gist.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              Analytics
            </Link>
          ) : null}
        </div>
      )}

      {/* Meta section */}
      <div className="space-y-4">
        <div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Gist title…"
            required
            className="w-full text-2xl font-bold bg-transparent border-0 outline-none placeholder:text-muted-foreground/40 focus:ring-0"
          />
        </div>
        <div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description…"
            className="w-full text-sm bg-transparent border-0 outline-none text-muted-foreground placeholder:text-muted-foreground/40 focus:ring-0"
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="is_public"
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
          <Label htmlFor="is_public" className="flex items-center gap-1.5 cursor-pointer select-none">
            {isPublic ? (
              <><EyeOpenIcon className="w-3.5 h-3.5" />Public</>
            ) : (
              <><LockClosedIcon className="w-3.5 h-3.5" />Private</>
            )}
          </Label>
        </div>
      </div>

      <Separator />

      {/* Files section */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {visibleFiles.length} {visibleFiles.length === 1 ? "file" : "files"}
          </span>
          <AddFileButton position="top" />
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visibleFiles.map((f) => f._key)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {visibleFiles.map((file) => (
                <SortableFileItem
                  key={file._key}
                  file={file}
                  total={visibleFiles.length}
                  onUpdate={updateFile}
                  onRemove={removeFile}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="flex items-center justify-between pt-2">
          <AddFileButton position="bottom" />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => gist ? router.push(`/gists/${gist.id}`) : router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? "Saving…" : gist ? "Update gist" : "Create gist"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
