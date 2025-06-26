import { blur } from "@cloudinary/url-gen/actions/effect";
import Image from "next/image";

import { Cloudinary } from "@cloudinary/url-gen";
import React from "react";
import { IServerFile } from "@/backend/models/domain-models";

interface AppImageProps {
  alt?: string;
  sizes?: string;
  width?: number | `${number}` | undefined;
  height?: number | `${number}` | undefined;
  imageSource?: IServerFile;
}

const AppImage: React.FC<AppImageProps> = ({
  imageSource,
  alt,
  sizes,
  height,
  width,
}) => {
  let _imageUrl = "";
  let _blurredImageUrl = "/thumbnail-placeholder.png";
  if (imageSource?.provider === "cloudinary") {
    const cld = new Cloudinary({
      cloud: { cloudName: "techdiary-dev" },
    });
    _imageUrl = cld
      .image(imageSource?.key)
      .quality("auto")
      .format("auto")
      .toURL();
    _blurredImageUrl = cld
      .image(imageSource?.key)
      .quality("auto")
      .format("auto")
      .effect(blur(100000))
      .toURL();
  }

  if (imageSource?.provider === "r2") {
    _imageUrl = `https://cdn.techdiary.dev/${imageSource.key}`;
  }

  return (
    <Image
      alt={alt || ""}
      src={_imageUrl}
      sizes={sizes}
      height={height}
      width={width}
      placeholder="blur"
      loading="lazy"
      className="w-full"
      blurDataURL={_blurredImageUrl}
    />
  );
};

export default AppImage;
