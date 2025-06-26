import { searchUnsplash } from "@/backend/services/unsplash.action";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useTranslation } from "@/i18n/use-translation";
import { actionPromisify } from "@/lib/utils";
import { UploadIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import ImageCropperModal from "./ImageCropperModal";
import { useToggle } from "@/hooks/use-toggle";
import { DIRECTORY_NAME, IServerFile } from "@/backend/models/domain-models";

interface IProp {
  onUploadComplete: (url: IServerFile) => void;
  aspectRatio: number;
  uploadDirectory: DIRECTORY_NAME;
}

const UnsplashImageGallery: React.FC<IProp> = ({
  onUploadComplete,
  aspectRatio,
  uploadDirectory,
}) => {
  const { _t } = useTranslation();
  const [q, setQ] = useState("programming");
  const [selectedURL, setSelectedURL] = useState("");
  const [cropperOpened, cropperModalHandle] = useToggle();
  const debouncedSearchQuery = useDebouncedCallback((searchTerm: string) => {
    setQ(searchTerm);
  }, 500);

  const query = useQuery({
    queryKey: ["unsplash", q],
    queryFn: () => actionPromisify(searchUnsplash(q)),
    enabled: !!q,
  });

  return (
    <>
      <ImageCropperModal
        open={cropperOpened}
        onCloseModal={cropperModalHandle.close}
        source={selectedURL}
        aspectRatio={aspectRatio}
        uploadDirectory={uploadDirectory}
        onUploadComplete={onUploadComplete}
      />

      <div className="relative">
        <div className="flex flex-col gap-3 mb-4">
          <p>{_t("Pick cover from unsplash")}</p>
          <Input
            placeholder="Search for an image"
            onChange={(e) => debouncedSearchQuery(e.target.value)}
          />
        </div>
        <div className="max-h-120 overflow-y-auto">
          {query.isPending && (
            <div className="grid place-content-center h-20">
              <Loader className="animate-spin" />
            </div>
          )}
          <div className="max-w-full gap-5 columns-2 sm:gap-8 lg:columns-3 [&>img:not(:first-child)]:mt-8">
            {query.data?.results?.map((image) => (
              <div
                key={image.id}
                onClick={() => {
                  setSelectedURL(image.urls.regular);
                  cropperModalHandle.open();
                }}
                className="relative mb-6 rounded-lg overflow-hidden group cursor-pointer"
              >
                <img src={image.urls.regular} alt={image.description!} />
                <div className="bg-black/45 opacity-0 absolute top-0 right-0 bottom-0 left-0 transition-all duration-300 group-hover:opacity-100 flex items-center justify-center">
                  <UploadIcon className="w-10 h-10 z-50 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UnsplashImageGallery;
