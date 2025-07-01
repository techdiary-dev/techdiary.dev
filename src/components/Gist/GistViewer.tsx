"use client";

import { deleteGist } from "@/backend/services/gist.actions";
import { useAppConfirm } from "@/components/app-confirm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { actionPromisify, formattedTime } from "@/lib/utils";
import getFileUrl from "@/utils/getFileUrl";
import {
  DotsHorizontalIcon,
  Pencil1Icon,
  TrashIcon,
  CopyIcon,
  EyeOpenIcon,
  LockClosedIcon,
} from "@radix-ui/react-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Gist, GistFile } from "@/backend/models/domain-models";
import Markdown from "@/lib/markdown/Markdown";

interface GistViewerProps {
  gist: Gist;
  isOwner?: boolean;
  showActions?: boolean;
}

export default function GistViewer({
  gist,
  isOwner = false,
  showActions = true,
}: GistViewerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const appConfirm = useAppConfirm();

  const renderFileContent = (file: GistFile) => {
    const ext = file.filename ? file.filename.split(".").pop() : "md";

    if (ext === "md") {
      return file.content;
    }

    return `\`\`\`${ext} \n${file.content}\n\`\`\``;
  };

  const deleteMutation = useMutation({
    mutationFn: (gistId: string) => actionPromisify(deleteGist(gistId)),
    onSuccess: () => {
      toast.success("Gist deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["gists"] });
      router.push("/gists");
    },
    onError: (error) => {
      toast.error("Failed to delete gist");
      console.error(error);
    },
  });

  const handleDelete = () => {
    appConfirm.show({
      title: "Delete Gist",
      children:
        "Are you sure you want to delete this gist? This action cannot be undone.",
      labels: {
        confirm: "Delete",
        cancel: "Cancel",
      },
      onConfirm() {
        deleteMutation.mutate(gist.id);
      },
    });
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const copyFileUrl = (filename: string) => {
    const url = `${window.location.origin}/gists/${gist.id}#${filename}`;
    copyToClipboard(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{gist.title}</CardTitle>
                <Badge variant={gist.is_public ? "default" : "secondary"}>
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

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {gist.owner && (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage
                        src={
                          gist.owner.profile_photo
                            ? getFileUrl(gist.owner.profile_photo)
                            : undefined
                        }
                        alt={gist.owner.name}
                      />
                      <AvatarFallback>
                        {gist.owner.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{gist.owner.name}</span>
                  </div>
                )}
                <span>Created {formattedTime(gist.created_at)}</span>
                {gist.updated_at !== gist.created_at && (
                  <span>Updated {formattedTime(gist.updated_at)}</span>
                )}
              </div>
            </div>

            {showActions && isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <DotsHorizontalIcon className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => router.push(`/gists/${gist.id}/edit`)}
                  >
                    <Pencil1Icon className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {gist.files && gist.files.length > 0 ? (
            <div className="space-y-6">
              {gist.files.map((file) => (
                <div
                  key={file.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="flex items-center justify-between py-3 px-4 bg-muted/50 border-b">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{file.filename}</h3>
                      {file.language && (
                        <Badge variant="outline" className="text-xs">
                          {file.language}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(file.content)}
                      >
                        <CopyIcon className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyFileUrl(file.filename)}
                      >
                        <CopyIcon className="w-4 h-4 mr-1" />
                        Copy URL
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <Markdown content={renderFileContent(file)} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No files in this gist</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
