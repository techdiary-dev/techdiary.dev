"use client";

import { DIRECTORY_NAME } from "@/backend/models/domain-models";
import { useToggle } from "@/hooks/use-toggle";
import { IServerFile } from "@/models/AppImage.model";
import getFileUrl from "@/utils/getFileUrl";
import React, { createContext, useContext, useRef, useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import ImageDropzoneWithCropper from "../ImageDropzoneWithCropper";
import { useTranslation } from "@/i18n/use-translation";

interface MarkdownEditorContextType {
  openImageUploader: (cursorPosition: number) => void;
  insertImageAtPosition: (
    imageUrl: string,
    alt: string,
    position: number
  ) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  currentValue: string;
  setValue: (value: string) => void;
}

const MarkdownEditorContext = createContext<MarkdownEditorContextType | null>(
  null
);

interface MarkdownEditorProviderProps {
  children: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditorProvider({
  children,
  value,
  onChange,
}: MarkdownEditorProviderProps) {
  const { _t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isImageUploaderOpen, toggleImageUploader] = useToggle();
  const [pendingCursorPosition, setPendingCursorPosition] = useState(0);

  const openImageUploader = (cursorPosition: number) => {
    setPendingCursorPosition(cursorPosition);
    toggleImageUploader.open();
  };

  const insertImageAtPosition = (
    imageUrl: string,
    alt: string,
    position: number
  ) => {
    const imageMarkdown = `![${alt}](${imageUrl})`;
    const newValue =
      value.substring(0, position) + imageMarkdown + value.substring(position);

    onChange(newValue);

    // Focus and position cursor after the inserted image
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = position + imageMarkdown.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleImageUploadComplete = (file: IServerFile) => {
    // Generate image URL from the uploaded file using your existing utility
    const imageUrl = getFileUrl(file);
    const alt = "Uploaded image";

    insertImageAtPosition(imageUrl, alt, pendingCursorPosition);
    toggleImageUploader.close();
  };

  const contextValue: MarkdownEditorContextType = {
    openImageUploader,
    insertImageAtPosition,
    textareaRef,
    currentValue: value,
    setValue: onChange,
  };

  return (
    <MarkdownEditorContext.Provider value={contextValue}>
      {children}

      <Dialog
        open={isImageUploaderOpen}
        onOpenChange={toggleImageUploader.toggle}
      >
        <DialogContent className="md:min-w-[650px] min-h-[120px] pt-10">
          <ImageDropzoneWithCropper
            enableCropper
            label={_t("Upload Image for Article Content")}
            onUploadComplete={handleImageUploadComplete}
            onFileDeleteComplete={() => toggleImageUploader.close()}
            uploadDirectory={DIRECTORY_NAME.ARTICLE_CONTENT}
          />
        </DialogContent>
      </Dialog>
    </MarkdownEditorContext.Provider>
  );
}

export function useMarkdownEditorContext() {
  const context = useContext(MarkdownEditorContext);
  if (!context) {
    throw new Error(
      "useMarkdownEditorContext must be used within a MarkdownEditorProvider"
    );
  }
  return context;
}
