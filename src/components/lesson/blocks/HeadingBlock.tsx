interface HeadingBlockProps {
  level: 1 | 2 | 3;
  text: string;
}

export function HeadingBlock({ level, text }: HeadingBlockProps) {
  const baseClass = "font-serif font-bold text-[var(--foreground)]";

  switch (level) {
    case 1:
      return <h1 className={`${baseClass} text-3xl`}>{text}</h1>;
    case 2:
      return <h2 className={`${baseClass} text-2xl`}>{text}</h2>;
    case 3:
      return <h3 className={`${baseClass} text-xl`}>{text}</h3>;
    default:
      return <h2 className={`${baseClass} text-2xl`}>{text}</h2>;
  }
}
