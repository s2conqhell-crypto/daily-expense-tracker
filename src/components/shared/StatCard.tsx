'use client';

import { Card, CardContent, Skeleton } from '@/components/ui';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: { value: number; isUp: boolean };
  color?: string;
  loading?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, color = 'bg-primary', loading }: StatCardProps) {
  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32 mb-1" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-default">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <div className={cn('flex items-center gap-1 text-xs font-medium', trend.isUp ? 'text-emerald-500' : 'text-destructive')}>
                {trend.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', color, 'bg-opacity-10 group-hover:scale-110 transition-transform')}>
            <Icon className={cn('h-5 w-5', color.replace('bg-', 'text-'))} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
