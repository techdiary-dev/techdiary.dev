import BaseLayout from "@/components/layout/BaseLayout";
import Markdown from "@/lib/markdown/Markdown";
import { Metadata } from "next";
import { readFileSync } from "fs";
import { join } from "path";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "TechDiary Privacy Policy",
};

async function getPrivacyContent(): Promise<string> {
  "use cache";
  return readFileSync(
    join(process.cwd(), "src/content/privacy.md"),
    "utf-8"
  );
}

const PrivacyPage = async () => {
  const content = await getPrivacyContent();

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

export default PrivacyPage;
