import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';

interface LoadMoreProps {
  href: string;
  label?: string;
}

export function LoadMore({ href, label = 'Show more' }: LoadMoreProps) {
  return (
    <div className="flex justify-center py-8">
      <Link href={href} className={buttonClasses('outline', 'md')}>
        {label}
      </Link>
    </div>
  );
}
