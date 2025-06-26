import { IServerFile } from "@/models/AppImage.model";
import { Cloudinary } from "@cloudinary/url-gen";
import { blur } from "@cloudinary/url-gen/actions/effect";

const getFileUrl = (fileSource?: IServerFile | null) => {
  const cld = new Cloudinary({
    cloud: { cloudName: "techdiary-dev" },
  });

  let _imageUrl = "";
  let _blurredImageUrl = "/thumbnail-placeholder.png";

  if (fileSource?.provider === "cloudinary") {
    _imageUrl = cld
      .image(fileSource?.key)
      .quality("auto")
      .format("auto")
      .toURL();
    _blurredImageUrl = cld
      .image(fileSource?.key)
      .quality("auto")
      .format("auto")
      .effect(blur(100000))
      .toURL();
  } else if (fileSource?.provider === "r2") {
    return `https://cdn.techdiary.dev/${fileSource?.key}`;
  } else {
    _imageUrl = fileSource?.key || "";
  }

  return _imageUrl;
};

export default getFileUrl;
