// import { DIRECTORY_NAME } from "@/backend/domain-models";
import { DIRECTORY_NAME } from "@/backend/models/domain-models";
import { generateRandomString } from "@/lib/utils";
import { useState } from "react";

export const useServerFile = () => {
  // loading states
  const [uploading, setUploading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const uploadFile = async (param: {
    files: FileList | File[];
    directory: DIRECTORY_NAME;
    generateUniqueFileName?: boolean;
  }) => {
    // loader
    setUploading(true);

    // post files to server
    const keys = Array.from(param.files).map((file) => {
      return param.generateUniqueFileName
        ? `${param.directory}/${generateRandomString(30)}${file?.name ? `-${file?.name}` : ""}`
        : `${param.directory}/${file.name}`;
    });

    const signApi = await fetch(`/api/storage/sign`, {
      method: "POST",
      body: JSON.stringify({ keys }),
    });
    const signResponse = (await signApi.json()) as any;

    const putResponses = await Promise.all(
      signResponse.data.signedUrls.map((signedUrl: string, index: number) =>
        fetch(signedUrl, {
          method: "PUT",
          body: param.files[index],
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      )
    );

    setUploading(false);

    if (!putResponses) {
      return {
        success: false,
        error: "Failed to upload file",
        data: null,
      };
    }

    return {
      success: true,
      error: null,
      data: { keys },
    };
  };

  // delete files from server
  const deleteFile = async (keys: string[], cb?: () => void) => {
    setDeleting(true);

    fetch(`/api/storage/delete`, {
      method: "POST",
      body: JSON.stringify({ keys }),
    })
      .then(() => {
        setDeleting(false);
      })
      .finally(cb);
  };

  return {
    uploadFile,
    uploading,
    deleting,
    deleteFile,
  };
};
