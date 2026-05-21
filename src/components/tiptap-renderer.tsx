interface TipTapRendererProps {
  content: string;
  className?: string;
}

export const TipTapRenderer = ({
  content,
  className = "",
}: TipTapRendererProps) => {
  if (!content) return null;

  return (
    <div
      className={`tiptap-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
