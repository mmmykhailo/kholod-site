import { marked } from "marked";

export type RichTextBlockProps = {
  __component: "shared.rich-text";
  id: number;
  body: string;
};

export default function RichTextBlock({
  block,
}: {
  block: RichTextBlockProps;
}) {
  return (
    <div
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: marked.parse(block.body) }}
    />
  );
}
