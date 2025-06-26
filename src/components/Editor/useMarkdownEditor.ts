import { DIRECTORY_NAME } from "@/backend/models/domain-models";
import { useServerFile } from "@/hooks/use-file-upload";
import getFileUrl from "@/utils/getFileUrl";
import { useCallback, useEffect } from "react";
import { useMarkdownEditorContext } from "./MarkdownEditorProvider";

type MarkdownCommand =
  | "heading"
  | "bold"
  | "italic"
  | "link"
  | "bold"
  | "code"
  | "upload-image";

interface Options {
  value?: string;
  ref?: React.RefObject<HTMLTextAreaElement | null>;
  onChange?: (value: string) => void;
}

export function useMarkdownEditor(options?: Options) {
  const textareaRef = options?.ref;
  const editorContext = useMarkdownEditorContext();
  const { uploadFile, uploading } = useServerFile();

  // Helper function to check if a file is an image
  const isImageFile = useCallback((file: File) => {
    return file.type.startsWith("image/");
  }, []);

  // Helper function to handle direct image upload
  const handleDirectImageUpload = useCallback(
    async (files: FileList | File[], cursorPosition: number) => {
      const imageFiles = Array.from(files).filter(isImageFile);

      if (imageFiles.length === 0) return;

      try {
        // Insert placeholder markdown immediately for UX
        const placeholderMarkdown = `![Uploading...](uploading)`;
        editorContext.insertImageAtPosition(
          "uploading",
          "Uploading...",
          cursorPosition
        );

        // Convert File to Blob to remove .name property (matches upload button behavior)
        const file = imageFiles[0];
        const blob = new Blob([file], { type: file.type });
        
        // Upload the blob (without .name property like upload button does)
        const uploadResult = await uploadFile({
          files: [blob as any],
          directory: DIRECTORY_NAME.ARTICLE_CONTENT,
          generateUniqueFileName: true,
        });

        if (uploadResult.success && uploadResult.data?.keys[0]) {
          // Create the server file object
          const serverFile = {
            provider: "r2" as const,
            key: uploadResult.data.keys[0],
          };

          // Generate the final image URL
          const imageUrl = getFileUrl(serverFile);

          // Replace the placeholder with the actual image
          setTimeout(() => {
            if (textareaRef?.current && options?.onChange) {
              const currentValue = textareaRef.current.value;
              const updatedValue = currentValue.replace(
                placeholderMarkdown,
                `\n![Uploaded image](${imageUrl})\n`
              );
              options.onChange(updatedValue);
            }
          }, 100);
        } else {
          // Replace placeholder with error message on failure
          setTimeout(() => {
            if (textareaRef?.current && options?.onChange) {
              const currentValue = textareaRef.current.value;
              const updatedValue = currentValue.replace(
                placeholderMarkdown,
                `\n![Upload failed](error)\n`
              );
              options.onChange(updatedValue);
            }
          }, 100);
        }
      } catch (error) {
        console.error("Image upload failed:", error);
        // Replace placeholder with error message
        setTimeout(() => {
          if (textareaRef?.current && options?.onChange) {
            const currentValue = textareaRef.current.value;
            const updatedValue = currentValue.replace(
              `![Uploading...](uploading)`,
              `\n![Upload failed](error)\n`
            );
            options.onChange(updatedValue);
          }
        }, 100);
      }
    },
    [isImageFile, uploadFile, editorContext, textareaRef, options]
  );

  // Updated helper function for handling image files (now uses direct upload)
  const handleImageFiles = useCallback(
    (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter(isImageFile);

      if (imageFiles.length > 0 && textareaRef?.current) {
        const cursorPosition = textareaRef.current.selectionStart;
        handleDirectImageUpload(files, cursorPosition);
      }
    },
    [textareaRef, isImageFile, handleDirectImageUpload]
  );

  const executeCommand = useCallback(
    (command: MarkdownCommand) => {
      if (!textareaRef?.current) return;
      const { selectionStart, selectionEnd } = textareaRef.current;
      const selectedText = textareaRef.current.value.substring(
        selectionStart,
        selectionEnd
      );
      let updatedValue = textareaRef.current.value;
      let newCursorPos = selectionStart;

      switch (command) {
        case "heading":
          const headingText = `## ${selectedText}`;
          updatedValue =
            updatedValue.substring(0, selectionStart) +
            headingText +
            updatedValue.substring(selectionEnd);
          newCursorPos = selectionStart + headingText.length;
          break;
        case "bold":
          const boldText = `**${selectedText}**`;
          updatedValue =
            updatedValue.substring(0, selectionStart) +
            boldText +
            updatedValue.substring(selectionEnd);
          newCursorPos = selectionStart + (selectedText ? boldText.length : 2);
          break;
        case "italic":
          const italicText = `*${selectedText}*`;
          updatedValue =
            updatedValue.substring(0, selectionStart) +
            italicText +
            updatedValue.substring(selectionEnd);
          newCursorPos =
            selectionStart + (selectedText ? italicText.length : 1);
          break;
        case "link":
          const linkText = selectedText
            ? `[${selectedText}](url)`
            : `[link text](url)`;
          updatedValue =
            updatedValue.substring(0, selectionStart) +
            linkText +
            updatedValue.substring(selectionEnd);
          newCursorPos = selectionStart + linkText.length;
          break;
        case "upload-image":
          // Open the image uploader modal at current cursor position (for manual upload button)
          editorContext.openImageUploader(selectionStart);
          return; // Don't update text immediately, wait for upload
      }

      if (options?.onChange) {
        options.onChange(updatedValue);
      }

      // Use setTimeout to ensure the value is updated before setting cursor position
      setTimeout(() => {
        if (textareaRef?.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    },
    [textareaRef, editorContext, options]
  );

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        !textareaRef?.current ||
        document.activeElement !== textareaRef.current
      )
        return;

      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            executeCommand("bold");
            break;
          case "i":
            e.preventDefault();
            executeCommand("italic");
            break;
          case "h":
            e.preventDefault();
            executeCommand("heading");
            break;
          case "k":
            e.preventDefault();
            executeCommand("link");
            break;
          case "u":
            e.preventDefault();
            executeCommand("upload-image");
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [executeCommand, textareaRef]);

  // Drag and drop functionality
  useEffect(() => {
    const textarea = textareaRef?.current;
    if (!textarea) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Add visual feedback for drag over
      textarea.classList.add("border-primary", "bg-primary/5");
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Remove visual feedback when drag leaves
      textarea.classList.remove("border-primary", "bg-primary/5");
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Remove visual feedback
      textarea.classList.remove("border-primary", "bg-primary/5");

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleImageFiles(files);
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const files = e.clipboardData?.files;
      if (files && files.length > 0) {
        const hasImages = Array.from(files).some(isImageFile);
        if (hasImages) {
          e.preventDefault(); // Prevent default paste behavior for images
          handleImageFiles(files);
        }
      }
    };

    // Add event listeners
    textarea.addEventListener("dragover", handleDragOver);
    textarea.addEventListener("dragenter", handleDragEnter);
    textarea.addEventListener("dragleave", handleDragLeave);
    textarea.addEventListener("drop", handleDrop);
    textarea.addEventListener("paste", handlePaste);

    // Cleanup
    return () => {
      textarea.removeEventListener("dragover", handleDragOver);
      textarea.removeEventListener("dragenter", handleDragEnter);
      textarea.removeEventListener("dragleave", handleDragLeave);
      textarea.removeEventListener("drop", handleDrop);
      textarea.removeEventListener("paste", handlePaste);
    };
  }, [textareaRef, handleImageFiles, isImageFile]);

  if (!textareaRef) return;

  return { executeCommand, isUploading: uploading };
}
