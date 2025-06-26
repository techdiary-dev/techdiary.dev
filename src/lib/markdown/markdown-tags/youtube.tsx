"use client";

import React from "react";

interface Props {
  id: string;
}

export const YoutubeTag: React.FC<Props> = ({ id }) => {
  return (
    <iframe
      width="560"
      height="315"
      src={`https://www.youtube.com/embed/${id}`}
      title="YouTube video player"
      frameBorder={0}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    ></iframe>
  );
};

export const YoutubeTagConfig = {
  render: "Youtube",
  attributes: {
    id: {
      type: String,
    },
  },
};
