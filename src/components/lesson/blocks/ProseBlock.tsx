interface ProseBlockProps {
  html: string;
}

export function ProseBlock({ html }: ProseBlockProps) {
  return (
    <div
      className="prose-custom max-w-none text-[var(--foreground)] leading-relaxed [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-[var(--primary)] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[var(--primary)]/80 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--primary)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[var(--muted-foreground)]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
