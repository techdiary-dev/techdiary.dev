import Navbar from "@/components/Navbar/Navbar";
import React, { PropsWithChildren } from "react";

const GistLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default GistLayout;
