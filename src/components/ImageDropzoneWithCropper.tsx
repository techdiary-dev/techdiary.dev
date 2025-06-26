"use client";

import clsx from "clsx";
import { Cropper, CropperRef } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";

import {
  ColumnSpacingIcon,
  RowSpacingIcon,
  SymbolIcon,
} from "@radix-ui/react-icons";

import { useServerFile } from "@/hooks/use-file-upload";
import { Loader, TrashIcon, UploadIcon } from "lucide-react";
import React, { useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { DIRECTORY_NAME, IServerFile } from "@/backend/models/domain-models";
import { useToggle } from "@/hooks/use-toggle";
import getFileUrl from "@/utils/getFileUrl";

interface DropzoneWithCropperProps {
  prefillFile?: IServerFile | null;
  disabled?: boolean;
  label?: string;
  Icon?: React.ReactNode;
  enableCropper?: boolean;
  uploadDirectory?: DIRECTORY_NAME;
  uploadUniqueFileName?: boolean;
  onUploadComplete?: (serverFile: IServerFile) => void;
  onFileDeleteComplete?: () => void;
  aspectRatio?: number;
}

const ImageDropzoneWithCropper: React.FC<DropzoneWithCropperProps> = ({
  disabled,
  label,
  Icon,
  uploadDirectory,
  enableCropper = false,
  uploadUniqueFileName = true,
  onUploadComplete,
  onFileDeleteComplete,
  prefillFile,
  aspectRatio,
}) => {
  const { uploadFile, uploading, deleteFile, deleting } = useServerFile();
  const cropperRef = useRef<CropperRef>(null);
  const [modalOpen, modelHandler] = useToggle(false);
  const [base64, setBase64] = React.useState<string | null>(null);

  const handleDeleteFile = () => {
    if (
      confirm(
        "Are you sure you want to delete this file? This action cannot be undone."
      )
    ) {
      deleteFile([prefillFile?.key!]).then(() => {
        onFileDeleteComplete?.();
      });
    }
  };

  // Image editing functions
  const getImageBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const flip = (horizontal: boolean, vertical: boolean) => {
    if (cropperRef.current) {
      console.log(cropperRef.current);
      cropperRef.current?.flipImage(horizontal, vertical);
    }
  };
  const rotate = (angle: number) => {
    if (cropperRef.current) {
      console.log(cropperRef.current);
      cropperRef.current?.rotateImage(angle);
    }
  };

  const { getRootProps, getInputProps, isDragReject, isFileDialogActive } =
    useDropzone({
      maxFiles: 1,
      disabled,
      accept: { "image/*": [".*"] },
      async onDrop(acceptedFiles) {
        if (acceptedFiles.length > 0) {
          const base64 = (await getImageBase64(acceptedFiles[0])) as string;
          setBase64(base64);
          if (enableCropper) {
            modelHandler.open();
          } else {
            uploadFile({
              files: [acceptedFiles[0]],
              directory: uploadDirectory ?? DIRECTORY_NAME.UNCATEGORIES,
              generateUniqueFileName: uploadUniqueFileName,
            }).then((res) => {
              onUploadComplete?.({
                provider: "r2",
                key: res.data?.keys[0]!,
              });
            });
          }
        }
      },
    });

  return (
    <>
      <Dialog open={modalOpen} onOpenChange={modelHandler.close}>
        <DialogContent className="w-[500px]">
          <DialogHeader>
            {/* <DialogTitle>Are you absolutely sure?</DialogTitle> */}
          </DialogHeader>

          <div className="relative w-full ">
            {/* <LoadingOverlay visible={uploading} className="absolute" /> */}
            <div className="h-[350px] relative  w-[450px]">
              <Cropper
                ref={cropperRef}
                src={base64}
                className="max-w-full"
                stencilProps={{ grid: true, aspectRatio }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center my-2 gap-1">
                <button
                  onClick={() => flip(true, false)}
                  className="w-10 h-10 grid rounded-md bg-muted place-items-center"
                >
                  <ColumnSpacingIcon />
                </button>
                <button
                  onClick={() => flip(false, true)}
                  className="w-10 h-10 grid rounded-md bg-muted place-items-center"
                >
                  <RowSpacingIcon />
                </button>
                <button
                  onClick={() => rotate(90)}
                  className="w-10 h-10 grid rounded-md bg-muted place-items-center"
                >
                  <SymbolIcon />
                </button>
              </div>

              <Button
                variant={"outline"}
                disabled={uploading}
                onClick={() => {
                  const canvas = cropperRef.current?.getCanvas();
                  if (canvas) {
                    const form = new FormData();
                    canvas.toBlob((blob) => {
                      if (blob) {
                        form.append("file", blob);
                        uploadFile({
                          files: [blob as any],
                          directory:
                            uploadDirectory ?? DIRECTORY_NAME.UNCATEGORIES,
                          generateUniqueFileName: uploadUniqueFileName,
                        })
                          .then((files) => {
                            onUploadComplete?.({
                              provider: "r2",
                              key: files?.data?.keys[0]!,
                            });
                            modelHandler.close();
                          })
                          .catch((err) => {
                            console.log(err);
                            alert("Error uploading file");
                          });
                      }
                    }, "image/jpeg");
                  }
                }}
              >
                {uploading ? (
                  <Loader size="sm" className="animate-spin" />
                ) : (
                  <UploadIcon className="w-5 h-5 text-zinc-400" />
                )}
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Dropzone */}
      {!prefillFile && (
        <div
          {...getRootProps()}
          style={{
            aspectRatio: `${aspectRatio}`,
          }}
          className={clsx(
            "grid w-full h-full p-4 border border-dotted rounded-md border-gray-400 cursor-pointer",
            {
              "bg-green-100": isFileDialogActive,
              "bg-primary": isDragReject,
              "cursor-not-allowed": disabled,
            }
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader size="sm" className="animate-spin size-4" />
              <p className="text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              {Icon ?? <UploadIcon className="size-5 text-muted-foreground" />}
              <p className="text-muted-foreground">
                {label || "Drop file here"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Prefilled file */}
      {prefillFile && (
        <div
          className="relative w-full h-full overflow-hidden bg-primary rounded-md"
          style={{
            aspectRatio: `${aspectRatio}`,
          }}
        >
          <img
            src={getFileUrl(prefillFile)}
            alt="Prefilled file"
            className="object-cover w-full h-full"
          />
          {onFileDeleteComplete && (
            <button
              type="button"
              className="absolute p-2 grid rounded-md bg-destructive bottom-2 right-2 place-items-center"
              onClick={handleDeleteFile}
            >
              {deleting ? (
                <Loader color="white" size="sm" className="animate-spin" />
              ) : (
                <TrashIcon className="w-5 h-5 text-destructive-foreground" />
              )}
            </button>
          )}
          {deleting ? "Deleting..." : "Delete"}
        </div>
      )}
    </>
  );
};

export default ImageDropzoneWithCropper;
