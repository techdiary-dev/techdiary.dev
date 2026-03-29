"use client";

import { deleteGist } from "@/backend/services/gist.actions";
import { useAppConfirm } from "@/components/app-confirm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { actionPromisify, formattedTime } from "@/lib/utils";
import getFileUrl from "@/utils/getFileUrl";
import {
  Pencil1Icon,
  TrashIcon,
  CopyIcon,
  CheckIcon,
  EyeOpenIcon,
  LockClosedIcon,
  Link2Icon,
  FileIcon,
} from "@radix-ui/react-icons";
import { ImageIcon } from "lucide-react";
import GistCodeImageDialog from "@/components/Gist/GistCodeImageDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Gist, GistFile } from "@/backend/models/domain-models";
import Markdown from "@/lib/markdown/Markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface GistViewerProps {
  gist: Gist;
  isOwner?: boolean;
  showActions?: boolean;
}

function FileExtBadge({ filename }: { filename: string }) {
  const ext = filename.split(".").pop();
  if (!ext || ext === filename) return null;
  return (
    <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
      .{ext}
    </span>
  );
}

function CopyButton({
  onClick,
  title,
  icon,
}: {
  onClick: () => void;
  title: string;
  icon: "copy" | "link";
}) {
  const [copied, setCopied] = useState(false);

  const handle = () => {
    onClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      title={title}
      onClick={handle}
      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {copied ? (
        <CheckIcon className="w-3.5 h-3.5 text-green-500" />
      ) : icon === "copy" ? (
        <CopyIcon className="w-3.5 h-3.5" />
      ) : (
        <Link2Icon className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

export default function GistViewer({
  gist,
  isOwner = false,
  showActions = true,
}: GistViewerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const appConfirm = useAppConfirm();
  const [imageExportFile, setImageExportFile] = useState<GistFile | null>(
    null
  );

  const renderFileContent = (file: GistFile) => {
    const ext = file.filename ? file.filename.split(".").pop() : undefined;
    const lang = file.language?.trim() || ext;

    if (lang === "md" || lang === "markdown") {
      return (
        <div className="px-5 py-4 prose prose-sm dark:prose-invert max-w-none">
          <Markdown content={file.content} />
        </div>
      );
    }

    return (
      <SyntaxHighlighter
        language={lang ?? "text"}
        style={vscDarkPlus}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: "13px", lineHeight: "1.6" }}
        wrapLines
      >
        {file.content}
      </SyntaxHighlighter>
    );
  };

  const deleteMutation = useMutation({
    mutationFn: (gistId: string) => actionPromisify(deleteGist(gistId)),
    onSuccess: () => {
      toast.success("Gist deleted");
      queryClient.invalidateQueries({ queryKey: ["gists"] });
      router.push("/gists");
    },
    onError: () => toast.error("Failed to delete gist"),
  });

  const handleDelete = () => {
    appConfirm.show({
      title: "Delete Gist",
      children:
        "Are you sure you want to delete this gist? This action cannot be undone.",
      labels: { confirm: "Delete", cancel: "Cancel" },
      onConfirm() {
        deleteMutation.mutate(gist.id);
      },
    });
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">
                {gist.title}
              </h1>
              <Badge
                variant={gist.is_public ? "secondary" : "outline"}
                className="shrink-0"
              >
                {gist.is_public ? (
                  <>
                    <EyeOpenIcon className="w-3 h-3 mr-1" />
                    Public
                  </>
                ) : (
                  <>
                    <LockClosedIcon className="w-3 h-3 mr-1" />
                    Private
                  </>
                )}
              </Badge>
            </div>
            {gist.description && (
              <p className="text-muted-foreground">{gist.description}</p>
            )}
          </div>

          {showActions && isOwner && (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/gists/${gist.id}/edit`)}
                className="gap-1.5"
              >
                <Pencil1Icon className="w-3.5 h-3.5" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="gap-1.5 text-destructive hover:text-destructive"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
          {gist.owner && (
            <>
              <div className="flex items-center gap-1.5">
                <Avatar className="w-5 h-5">
                  <AvatarImage
                    src={
                      gist.owner.profile_photo
                        ? getFileUrl(gist.owner.profile_photo)
                        : undefined
                    }
                    alt={gist.owner.name}
                  />
                  <AvatarFallback className="text-[10px]">
                    {gist.owner.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">
                  {gist.owner.name}
                </span>
              </div>
              <span>·</span>
            </>
          )}
          <span>{formattedTime(gist.created_at)}</span>
          {gist.files?.length && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <FileIcon className="w-3.5 h-3.5" />
                {gist.files.length} {gist.files.length === 1 ? "file" : "files"}
              </span>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Files */}
      {gist.files && gist.files.length > 0 ? (
        <div className="space-y-4">
          {gist.files.map((file) => (
            <div
              key={file.id}
              id={file.filename}
              className="border rounded-lg overflow-hidden"
            >
              {/* File header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b">
                <div className="flex items-center gap-2 min-w-0">
                  <FileIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="font-mono text-sm font-medium truncate">
                    {file.filename}
                  </span>
                  <FileExtBadge filename={file.filename} />
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    title="Export as image (Carbon-style)"
                    onClick={() => setImageExportFile(file)}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <CopyButton
                    title="Copy content"
                    icon="copy"
                    onClick={() => copyText(file.content)}
                  />
                  <CopyButton
                    title="Copy link to file"
                    icon="link"
                    onClick={() =>
                      copyText(
                        `${window.location.origin}/gists/${gist.id}#${file.filename}`,
                      )
                    }
                  />
                </div>
              </div>

              {/* File content */}
              <div className="overflow-x-auto">
                {renderFileContent(file)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No files in this gist
        </div>
      )}

      <GistCodeImageDialog
        open={imageExportFile !== null}
        onOpenChange={(open) => {
          if (!open) setImageExportFile(null);
        }}
        filename={imageExportFile?.filename ?? ""}
        content={imageExportFile?.content ?? ""}
        language={imageExportFile?.language}
      />
    </div>
  );
}
