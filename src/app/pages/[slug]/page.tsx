import BaseLayout from "@/components/layout/BaseLayout";
import Markdown from "@/lib/markdown/Markdown";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

const PAGE_TITLES: Record<string, string> = {
  privacy: "Privacy Policy",
  "terms-and-conditions": "Terms and Conditions",
};

async function getPageContent(slug: string): Promise<string | null> {
  "use cache";
  const filePath = join(process.cwd(), "src/content", `${slug}.md`);
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, "utf-8");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = PAGE_TITLES[slug] ?? slug;
  return { title };
}

const StaticMarkdownPage = async ({ params }: Props) => {
  const { slug } = await params;
  const content = await getPageContent(slug);

  if (!content) notFound();

  return (
    <BaseLayout>
      <div className="max-w-3xl mx-auto my-10 px-4">
        <div className="content-typography">
          <Markdown content={content} />
        </div>
      </div>
    </BaseLayout>
  );
};

export default StaticMarkdownPage;
