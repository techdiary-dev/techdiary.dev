"use client";

import { Cropper, CropperRef } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";

import {
  ColumnSpacingIcon,
  RowSpacingIcon,
  SymbolIcon,
} from "@radix-ui/react-icons";

import { DIRECTORY_NAME, IServerFile } from "@/backend/models/domain-models";
import { useServerFile } from "@/hooks/use-file-upload";
import { Loader, UploadIcon } from "lucide-react";
import React, { useRef } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";

interface ImageCropperModalProps {
  source: string | null | undefined;
  open: boolean;
  onCloseModal?: () => void;
  uploadDirectory?: DIRECTORY_NAME;
  uploadUniqueFileName?: boolean;
  onUploadComplete?: (serverFile: IServerFile) => void;
  aspectRatio?: number;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  uploadDirectory,
  uploadUniqueFileName = true,
  onUploadComplete,
  source,
  aspectRatio = 1,
  open,
  onCloseModal,
}) => {
  const { uploadFile, uploading } = useServerFile();
  const cropperRef = useRef<CropperRef>(null);

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

  return (
    <>
      <Dialog open={open} onOpenChange={onCloseModal}>
        <DialogContent className="w-[500px]">
          <DialogHeader>
            {/* <DialogTitle>Are you absolutely sure?</DialogTitle> */}
          </DialogHeader>

          <div className="relative w-full ">
            <div className="h-[350px] relative  w-[450px]">
              <Cropper
                ref={cropperRef}
                src={source}
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
                            onCloseModal?.();
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
    </>
  );
};

export default ImageCropperModal;
