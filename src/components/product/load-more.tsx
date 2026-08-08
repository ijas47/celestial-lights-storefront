import Link from 'next/link';

interface LoadMoreProps {
  href: string;
  label?: string;
}

export function LoadMore({ href, label = 'Load more' }: LoadMoreProps) {
  return (
    <div className="flex justify-center py-12">
      <Link href={href} className="rule-link">
        {label}
      </Link>
    </div>
  );
}
