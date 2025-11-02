import { marked } from "marked";

type RichTextBlockProps = {
  __component: "shared.rich-text";
  id: number;
  body: string;
};

type Component = RichTextBlockProps;

function RichTextBlock({ body }: { body: string }) {
  return (
    <div
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: marked.parse(body) }}
    />
  );
}

export default function BlockRenderer({ block }: { block: unknown }) {
  console.log({ block });
  if (!block || typeof block !== "object" || !("__component" in block)) {
    return null;
  }

  const typedBlock = block as Component;

  switch (typedBlock.__component) {
    case "shared.rich-text":
      return <RichTextBlock body={typedBlock.body} />;
    default:
      return null;
  }
}
