'use client';

import Link from 'next/link';
import { Home, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';

interface TrendingTag {
  tag: string;
  count: number;
}

interface SidebarNavProps {
  trendingTags: TrendingTag[];
  filterLabels: string[];
  handleTrendingTagClick: (tag: string) => void;
  className?: string;
}

export function SidebarNav({
  trendingTags,
  filterLabels,
  handleTrendingTagClick,
  className,
}: SidebarNavProps) {
  const isHomeActive = true;

  return (
    <Card className={cn('rounded-xl p-4 shadow-none', className)}>
      <nav className="flex flex-col gap-4 text-sm font-medium">
        <div className="flex flex-col gap-1">
          <Link
            href="/sets"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
              isHomeActive
                ? 'bg-muted'
                : 'text-muted-foreground'
            )}
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all"
          >
            <TrendingUp className="h-4 w-4" />
            Popular
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="px-3 text-sm font-semibold tracking-tight text-muted-foreground">
            Filter by tags
          </h2>
          <div className="flex flex-col gap-1">
            {trendingTags.length > 0 ? (
              trendingTags.map((trendingTag) => (
                <button
                  key={trendingTag.tag}
                  onClick={() => handleTrendingTagClick(trendingTag.tag)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all',
                    filterLabels.includes(trendingTag.tag)
                      ? 'bg-muted'
                      : 'text-muted-foreground'
                  )}
                >
                  <span className="font-mono text-muted-foreground">#</span>
                  <span className="truncate">{trendingTag.tag}</span>
                </button>
              ))
            ) : (
              <p className="px-3 text-sm text-muted-foreground">
                No trending tags.
              </p>
            )}
          </div>
        </div>
      </nav>
    </Card>
  );
} 