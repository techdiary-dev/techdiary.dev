"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTranslation } from "@/i18n/use-translation";
import { homeSidebarOpenAtom } from "@/store/home-sidebar.atom";
import { useAtom } from "jotai";
import { BookmarkIcon, HomeIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const HomeLeftSidebar = () => {
  const [open, setOpen] = useAtom(homeSidebarOpenAtom);
  return (
    <>
      <Sidebar />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left">
          <div className="p-3">
            <Sidebar />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default HomeLeftSidebar;

const tags = [
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782237/static-assets/tag-icons/nbws9ynczmavj86ontfz.svg",
    label: "nodejs",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782240/static-assets/tag-icons/kvyqqabeipmca7utxf8e.svg",
    label: "ts",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782237/static-assets/tag-icons/na8zbg5d1tuxt5yp6kay.svg",
    label: "js",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782235/static-assets/tag-icons/tritkwhlognysckvztmw.svg",
    label: "java",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782237/static-assets/tag-icons/w9zqspigpdgdmglbjo1g.svg",
    label: "python",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782233/static-assets/tag-icons/zydwlue3nnnbeyyl8pum.svg",
    label: "dart",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782235/static-assets/tag-icons/qcbazadpuxskoaacu6mn.svg",
    label: "go",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782237/static-assets/tag-icons/akx8gxzfgqdyvcffpadi.svg",
    label: "php",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782239/static-assets/tag-icons/uruwktd4r0g7chwf7f3g.svg",
    label: "ruby",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782235/static-assets/tag-icons/ivz6wh9hmtynuug99gcl.svg",
    label: "html",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782233/static-assets/tag-icons/qap8jcvbl5dvjbktnnxo.svg",
    label: "css",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782236/static-assets/tag-icons/hcddvgvejmha0hr8emkz.svg",
    label: "laravel",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782235/static-assets/tag-icons/wtxrrpsfqguomzqjavam.svg",
    label: "graphql",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782239/static-assets/tag-icons/erfbu54l2mquphszheck.svg",
    label: "react",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782240/static-assets/tag-icons/rh7xfiz28bxklfzymftd.svg",
    label: "vue",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782240/static-assets/tag-icons/wsunggfipja7edqsybg5.svg",
    label: "svelte",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782232/static-assets/tag-icons/xbazdwl9wpdqi1naqtib.svg",
    label: "angular",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782233/static-assets/tag-icons/jb9r6xjy7yi1gkeqqvnh.svg",
    label: "flutter",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782237/static-assets/tag-icons/odut7ffl8spzdkbhceeu.svg",
    label: "kubernetes",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782233/static-assets/tag-icons/kow5csrider7v1eizt1q.svg",
    label: "docker",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782233/static-assets/tag-icons/jkepqds7ziutsnle1e4a.svg",
    label: "aws",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782234/static-assets/tag-icons/vvx5vhoos8jgkutp48ll.svg",
    label: "git",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782234/static-assets/tag-icons/hwsbp19pfifwr367xtoh.svg",
    label: "github",
  },
];

const Sidebar = () => {
  const { _t } = useTranslation();
  const [count, setCount] = useState(10);

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-2 mt-4 flex flex-col gap-4">
        <Link href={"/"} className="flex items-center gap-2 text-foreground">
          <HomeIcon size={18} />
          <span className="text-sm">{_t("Home")}</span>
        </Link>
        <Link
          href={"/dashboard/bookmarks"}
          className="flex items-center gap-2 text-foreground"
        >
          <BookmarkIcon size={18} />
          <span className="text-sm">{_t("Bookmarks")}</span>
        </Link>
        <Link
          href={"/dashboard/articles/new"}
          className="flex items-center gap-2 text-foreground"
        >
          <PlusIcon size={18} />
          <span className="text-sm">{_t("New diary")}</span>
        </Link>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
          {_t("Top tags")}
        </h3>

        <div className="flex flex-col gap-2">
          {tags.slice(0, count).map((tag, index) => (
            <div className="flex items-center gap-2" key={index}>
              <img
                src={tag.icon}
                width={20}
                height={20}
                sizes="20px"
                alt={tag?.label}
              />
              <p className="text-forground-muted">{tag?.label}</p>
            </div>
          ))}
        </div>

        {count === 10 && (
          <button
            className="mt-2 text-sm"
            onClick={() => setCount(tags.length)}
          >
            {_t("All tags")}
            ...
          </button>
        )}
      </div>
    </div>
  );
};
