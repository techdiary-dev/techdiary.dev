"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/use-translation";
import { useSession } from "@/store/session.atom";
import Link from "next/link";
import React from "react";
interface Props {
  article_id: string;
  article_author_id: string;
}

const EditArticleButton: React.FC<Props> = ({
  article_id,
  article_author_id,
}) => {
  const { _t } = useTranslation();
  const session = useSession();

  if (
    !session?.session?.user_id ||
    session.session.user_id !== article_author_id
  ) {
    return null;
  }

  return (
    <Button size={"sm"} variant={"secondary"} asChild className=" py-[2px]">
      <Link href={`/dashboard/articles/${article_id}`}>{_t("Edit")}</Link>
    </Button>
  );
};

export default EditArticleButton;
