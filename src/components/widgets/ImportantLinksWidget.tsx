"use client";

import { useTranslation } from "@/i18n/use-translation";
import Link from "next/link";
import React from "react";

const ImportantLinksWidget = () => {
  const { _t } = useTranslation();
  return (
    <div className="flex flex-col space-y-2">
      <Link
        href="/pages/privacy"
        className="text-dark flex items-center space-x-1 text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>

        <span>{_t("Privacy Policy")}</span>
      </Link>

      <Link
        href="/pages/terms-and-conditions"
        className="text-dark flex items-center space-x-1 text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
        <span>{_t("Terms and conditions")}</span>
      </Link>
    </div>
  );
};

export default ImportantLinksWidget;
