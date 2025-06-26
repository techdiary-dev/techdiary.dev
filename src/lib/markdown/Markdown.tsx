"use client";

import React from "react";
import { markdocParser } from "./markdoc-parser";

interface Props {
  content: string;
}

const Markdown: React.FC<Props> = ({ content }) => {
  return <>{markdocParser(content)}</>;
};

export default Markdown;
