import Markdown from "@/lib/markdown/Markdown";

const Page = () => {
  return (
    <Markdown
      content={`
        {% youtube id="hOHKltAiKXQ" /%}
    `}
    />
  );
};

export default Page;
