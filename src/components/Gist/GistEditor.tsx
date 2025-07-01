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
// import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { actionPromisify } from "@/lib/utils";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Gist } from "@/backend/models/domain-models";

interface GistFile {
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

export default function GistEditor({ gist, onSuccess }: GistEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(gist?.title || "");
  const [description, setDescription] = useState(gist?.description || "");
  const [isPublic, setIsPublic] = useState(gist?.is_public ?? true);
  const [files, setFiles] = useState<GistFile[]>(
    gist?.files?.length 
      ? gist.files 
      : [{ filename: "", content: "", language: "" }]
  );

  const createMutation = useMutation({
    mutationFn: (data: CreateGistInputType) =>
      actionPromisify(createGist(data)),
    onSuccess: (data) => {
      toast.success("Gist created successfully!");
      queryClient.invalidateQueries({ queryKey: ["gists"] });
      onSuccess?.(data.id);
      if (!onSuccess) {
        router.push(`/gists/${data.id}`);
      }
    },
    onError: (error) => {
      toast.error("Failed to create gist");
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGistInputType }) =>
      actionPromisify(updateGist(id, data)),
    onSuccess: (data) => {
      toast.success("Gist updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["gists"] });
      queryClient.invalidateQueries({ queryKey: ["gist", gist?.id] });
      onSuccess?.(data.id);
    },
    onError: (error) => {
      toast.error("Failed to update gist");
      console.error(error);
    },
  });

  const addFile = () => {
    const newFile: GistFile = {
      filename: "",
      content: "",
      language: "",
    };
    setFiles([...files, newFile]);
  };

  const removeFile = (index: number) => {
    if (files.length === 1) {
      toast.error("At least one file is required");
      return;
    }

    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const updateFile = (index: number, field: keyof GistFile, value: string) => {
    const newFiles = [...files];
    newFiles[index] = { ...newFiles[index], [field]: value };
    if (gist && newFiles[index].id && !newFiles[index]._action) {
      newFiles[index]._action = "update";
    }
    setFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (files.some((f) => !f.filename.trim() || !f.content.trim())) {
      toast.error("All files must have a filename and content");
      return;
    }

    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      is_public: isPublic,
      files: files.map((f) => ({
        ...f,
        filename: f.filename.trim(),
        content: f.content.trim(),
        language: f.language?.trim() || undefined,
      })),
    };

    if (gist) {
      updateMutation.mutate({ id: gist.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{gist ? "Edit Gist" : "Create New Gist"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Gist title..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Gist description (optional)..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="is_public">Public gist</Label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Files *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFile}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add File
                </Button>
              </div>

              <div className="space-y-6">
                {files.map((file, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`filename-${index}`}>Filename *</Label>
                        <Input
                          id={`filename-${index}`}
                          value={file.filename}
                          onChange={(e) =>
                            updateFile(index, "filename", e.target.value)
                          }
                          placeholder="filename.js"
                          required
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`language-${index}`}>Language</Label>
                        <Input
                          id={`language-${index}`}
                          value={file.language || ""}
                          onChange={(e) =>
                            updateFile(index, "language", e.target.value)
                          }
                          placeholder="javascript"
                        />
                      </div>
                      {files.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`content-${index}`}>Content *</Label>
                      <Textarea
                        id={`content-${index}`}
                        value={file.content}
                        onChange={(e) =>
                          updateFile(index, "content", e.target.value)
                        }
                        placeholder="Enter file content..."
                        rows={15}
                        className="font-mono text-sm"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : gist ? "Update Gist" : "Create Gist"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
