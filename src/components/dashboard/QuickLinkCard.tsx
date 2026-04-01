import Link from 'next/link';

interface QuickLinkCardProps {
  href: string;
  icon: string;
  title: string;
  description: string;
  external?: boolean;
}

export default function QuickLinkCard({ href, icon, title, description, external }: QuickLinkCardProps) {
  const Comp = external ? 'a' : Link;
  const extraProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <Comp
      href={href}
      {...extraProps}
      className="group bg-surface-container p-6 rounded-xl border border-outline-variant/10 hover:bg-surface-container-high transition-all block"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h4 className="font-headline font-bold text-lg mb-2 text-on-surface">{title}</h4>
      <p className="text-sm text-on-surface-variant">{description}</p>
    </Comp>
  );
}
