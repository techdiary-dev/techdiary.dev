"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useTranslation } from "@/i18n/use-translation";
import { homeSidebarOpenAtom } from "@/store/home-sidebar.atom";
import { useAtom } from "jotai";
import { BookmarkIcon, HomeIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
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
    link: "/tags/nodejs",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782240/static-assets/tag-icons/kvyqqabeipmca7utxf8e.svg",
    label: "ts",
    link: "/tags/typescript",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782237/static-assets/tag-icons/na8zbg5d1tuxt5yp6kay.svg",
    label: "js",
    link: "/tags/javascript",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782235/static-assets/tag-icons/tritkwhlognysckvztmw.svg",
    label: "java",
    link: "/tags/java",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782237/static-assets/tag-icons/w9zqspigpdgdmglbjo1g.svg",
    label: "python",
    link: "/tags/python",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782233/static-assets/tag-icons/zydwlue3nnnbeyyl8pum.svg",
    label: "dart",
    link: "/tags/dart",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782235/static-assets/tag-icons/qcbazadpuxskoaacu6mn.svg",
    label: "go",
    link: "/tags/go",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782237/static-assets/tag-icons/akx8gxzfgqdyvcffpadi.svg",
    label: "php",
    link: "/tags/php",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782239/static-assets/tag-icons/uruwktd4r0g7chwf7f3g.svg",
    label: "ruby",
    link: "/tags/ruby",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782235/static-assets/tag-icons/ivz6wh9hmtynuug99gcl.svg",
    label: "html",
    link: "/tags/html",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782233/static-assets/tag-icons/qap8jcvbl5dvjbktnnxo.svg",
    label: "css",
    link: "/tags/css",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782236/static-assets/tag-icons/hcddvgvejmha0hr8emkz.svg",
    label: "laravel",
    link: "/tags/laravel",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782235/static-assets/tag-icons/wtxrrpsfqguomzqjavam.svg",
    label: "graphql",
    link: "/tags/graphql",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782239/static-assets/tag-icons/erfbu54l2mquphszheck.svg",
    label: "react",
    link: "/tags/reactjs",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782240/static-assets/tag-icons/rh7xfiz28bxklfzymftd.svg",
    label: "vue",
    link: "/tags/vue",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782240/static-assets/tag-icons/wsunggfipja7edqsybg5.svg",
    label: "svelte",
    link: "/tags/svelte",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782232/static-assets/tag-icons/xbazdwl9wpdqi1naqtib.svg",
    label: "angular",
    link: "/tags/angular",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782233/static-assets/tag-icons/jb9r6xjy7yi1gkeqqvnh.svg",
    label: "flutter",
    link: "/tags/flutter",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782237/static-assets/tag-icons/odut7ffl8spzdkbhceeu.svg",
    label: "kubernetes",
    link: "/tags/kubernetes",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782233/static-assets/tag-icons/kow5csrider7v1eizt1q.svg",
    label: "docker",
    link: "/tags/docker",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782233/static-assets/tag-icons/jkepqds7ziutsnle1e4a.svg",
    label: "aws",
    link: "/tags/aws",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782234/static-assets/tag-icons/vvx5vhoos8jgkutp48ll.svg",
    label: "git",
    link: "/tags/git",
  },
  {
    icon: "https://res.cloudinary.com/techdiary-dev/image/upload/v1620782234/static-assets/tag-icons/hwsbp19pfifwr367xtoh.svg",
    label: "github",
    link: "/tags/github",
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
            <Link
              href={tag.link}
              className="flex items-center gap-2 text-forground-muted"
              key={index}
            >
              <Image
                src={tag.icon}
                width={20}
                height={20}
                sizes="20px"
                alt={tag?.label}
              />
              <p className="text-forground-muted">{tag?.label}</p>
            </Link>
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
