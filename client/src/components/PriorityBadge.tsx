import { Badge } from '@/components/ui/badge';
import type { TaskPriority } from '@/types';

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  'Low': { label: 'Low', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  'Medium': { label: 'Medium', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  'High': { label: 'High', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = priorityConfig[priority] || priorityConfig['Medium'];
  return (
    <Badge variant="outline" className={config.className}>
      {priority === 'High' && '↑ '}
      {priority === 'Low' && '↓ '}
      {config.label}
    </Badge>
  );
}
