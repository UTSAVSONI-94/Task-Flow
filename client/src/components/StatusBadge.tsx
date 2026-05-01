import { Badge } from '@/components/ui/badge';
import type { TaskStatus } from '@/types';

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  'Todo': { label: 'Todo', className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20' },
  'In Progress': { label: 'In Progress', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' },
  'Done': { label: 'Done', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const config = statusConfig[status] || statusConfig['Todo'];
  return (
    <Badge variant="outline" className={config.className}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
        status === 'Done' ? 'bg-emerald-400' : status === 'In Progress' ? 'bg-blue-400' : 'bg-zinc-400'
      }`} />
      {config.label}
    </Badge>
  );
}
