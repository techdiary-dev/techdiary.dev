import BaseLayout from "@/components/layout/BaseLayout";
import Markdown from "@/lib/markdown/Markdown";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import matter from "gray-matter";

interface Props {
  params: Promise<{ slug: string }>;
}

interface PageData {
  content: string;
  title: string;
}

async function getPageData(slug: string): Promise<PageData | null> {
  "use cache";
  const filePath = join(process.cwd(), "src/content", `${slug}.md`);
  if (!existsSync(filePath)) return null;
  const raw = readFileSync(filePath, "utf-8");
  const { content, data } = matter(raw);
  const title =
    typeof data.title === "string" && data.title
      ? data.title
      : slug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
  return { content, title };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageData(slug);
  return { title: page?.title ?? slug };
}

const StaticMarkdownPage = async ({ params }: Props) => {
  const { slug } = await params;
  const page = await getPageData(slug);

  if (!page) notFound();

  return (
    <BaseLayout>
      <div className="max-w-3xl mx-auto my-10 px-4">
        <div className="content-typography">
          <Markdown content={page.content} />
        </div>
      </div>
    </BaseLayout>
  );
};

export default StaticMarkdownPage;
