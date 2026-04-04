import BaseLayout from "@/components/layout/BaseLayout";
import Markdown from "@/lib/markdown/Markdown";
import { Metadata } from "next";
import { readFileSync } from "fs";
import { join } from "path";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "TechDiary Terms and Conditions",
};

async function getTermsContent(): Promise<string> {
  "use cache";
  return readFileSync(
    join(process.cwd(), "src/content/terms-and-conditions.md"),
    "utf-8"
  );
}

const TermsAndConditionsPage = async () => {
  const content = await getTermsContent();

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

export default TermsAndConditionsPage;
