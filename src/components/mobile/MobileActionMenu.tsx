'use client';
import { memo, useState } from 'react';
import { MoreVertical, Pencil, Trash2, Copy, Star, Share2, Play, Pause, SkipForward, CheckCircle2, Archive, RotateCcw } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

export interface ActionItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  destructive?: boolean;
  onClick: () => void;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  edit: <Pencil className="h-[18px] w-[18px]" />,
  delete: <Trash2 className="h-[18px] w-[18px]" />,
  duplicate: <Copy className="h-[18px] w-[18px]" />,
  favorite: <Star className="h-[18px] w-[18px]" />,
  unfavorite: <Star className="h-[18px] w-[18px]" />,
  share: <Share2 className="h-[18px] w-[18px]" />,
  pause: <Pause className="h-[18px] w-[18px]" />,
  resume: <Play className="h-[18px] w-[18px]" />,
  'skip-next': <SkipForward className="h-[18px] w-[18px]" />,
  complete: <CheckCircle2 className="h-[18px] w-[18px]" />,
  archive: <Archive className="h-[18px] w-[18px]" />,
  'run-now': <RotateCcw className="h-[18px] w-[18px]" />,
};

const ACTION_COLORS: Record<string, string> = {
  edit: '#7c5cff',
  delete: '#ff5a7a',
  duplicate: '#3b82f6',
  favorite: '#ffb020',
  unfavorite: '#6b7b8d',
  share: '#00d09c',
  pause: '#ffb020',
  resume: '#00d09c',
  'skip-next': '#8b5cf6',
  complete: '#00d09c',
  archive: '#6b7b8d',
  'run-now': '#7c5cff',
};

interface MobileActionMenuProps {
  actions: ActionItem[];
}

export const MobileActionMenu = memo(function MobileActionMenu({ actions }: MobileActionMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="flex h-11 w-11 items-center justify-center rounded-xl text-[#6b7b8d] hover:bg-white/5 active:scale-90 transition-all -mr-2"
          aria-label="More actions"
        >
          <MoreVertical className="h-[18px] w-[18px]" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="bg-[#09090b] border-t border-white/[0.06] px-4 pt-5 shadow-2xl shadow-black/40"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
      >
        <div className="m-dialog-handle" />
        <div className="space-y-1 mt-4">
          {actions.map((action) => {
            const icon = action.icon || ACTION_ICONS[action.key];
            const color = action.color || ACTION_COLORS[action.key] || '#7c5cff';
            return (
              <SheetClose asChild key={action.key}>
                <button
                  onClick={() => { setTimeout(() => action.onClick(), 300); }}
                  className={`flex w-full items-center gap-3.5 rounded-[14px] px-3.5 py-3.5 text-white hover:bg-white/5 active:scale-[0.98] transition-all ${action.destructive ? 'text-[#ff5a7a]' : ''}`}
                >
                  {icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-[12px] shrink-0" style={{ backgroundColor: color + '15' }}>
                      <span style={{ color }}>{icon}</span>
                    </div>
                  )}
                  <span className="text-[14px] font-medium">{action.label}</span>
                </button>
              </SheetClose>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
});

export function buildDefaultActions(params: {
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  onShare?: () => void;
  extra?: ActionItem[];
}): ActionItem[] {
  const items: ActionItem[] = [];
  if (params.onEdit) items.push({ key: 'edit', label: 'Edit', onClick: params.onEdit });
  if (params.onDuplicate) items.push({ key: 'duplicate', label: 'Duplicate', onClick: params.onDuplicate });
  if (params.onToggleFavorite) {
    items.push({
      key: 'favorite',
      label: params.isFavorite ? 'Remove from Favorites' : 'Mark as Favorite',
      onClick: params.onToggleFavorite,
      color: params.isFavorite ? '#ffb020' : '#6b7b8d',
    });
  }
  if (params.onShare) items.push({ key: 'share', label: 'Share', onClick: params.onShare });
  if (params.onDelete) items.push({ key: 'delete', label: 'Delete', destructive: true, onClick: params.onDelete });
  if (params.extra) items.push(...params.extra);
  return items;
}
