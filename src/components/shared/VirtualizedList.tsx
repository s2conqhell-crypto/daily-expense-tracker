'use client';

import { useRef, memo, type ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedListProps {
  items: unknown[];
  renderItem: (item: unknown, index: number) => ReactNode;
  estimateSize?: number;
  overscan?: number;
  className?: string;
}

export const VirtualizedList = memo(function VirtualizedList({
  items,
  renderItem,
  estimateSize = 72,
  overscan = 5,
  className = '',
}: VirtualizedListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      className={`overflow-y-auto overscroll-contain ${className}`}
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
});
