import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '@/hooks/useProjects';
import { useTasks, useCreateTask, useUpdateTaskStatus, useDeleteTask, useUpdateTask } from '@/hooks/useTasks';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { Plus, Settings, ArrowLeft, Calendar, Trash2, Edit2 } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority, User, ProjectMember } from '@/types';

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'Todo', label: 'Todo', color: 'border-zinc-500/30' },
  { status: 'In Progress', label: 'In Progress', color: 'border-blue-500/30' },
  { status: 'Done', label: 'Done', color: 'border-emerald-500/30' },
];

function getInitials(name: string) { return name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2); }
function getUserData(u: User | string): { name: string; email: string } {
  if (typeof u === 'string') return { name: 'Unknown', email: '' };
  return { name: u.name, email: u.email };
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: project, isLoading: pLoading } = useProject(id!);
  const { data: tasks, isLoading: tLoading } = useTasks(id!);
  const createTask = useCreateTask();
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: '', description: '', assigneeId: '', priority: 'Medium' as TaskPriority, dueDate: '' });
  const [error, setError] = useState('');

  const myRole = project?.members.find(m => {
    const uid = typeof m.userId === 'string' ? m.userId : String((m.userId as User)._id);
    return uid === String(user?._id);
  })?.role;
  const isAdmin = myRole === 'Admin';

  const members = project?.members.map(m => {
    const u = m.userId as User;
    return { _id: String(u._id || m.userId), name: u.name || 'Unknown', email: u.email || '', role: m.role };
  }) || [];

  const openCreate = () => {
    setEditingTask(null);
    setForm({ title: '', description: '', assigneeId: members[0]?._id || '', priority: 'Medium', dueDate: '' });
    setError('');
    setShowModal(true);
  };
  const openEdit = (t: Task) => {
    setEditingTask(t);
    const aId = typeof t.assigneeId === 'string' ? t.assigneeId : (t.assigneeId as User)._id;
    setForm({ title: t.title, description: t.description || '', assigneeId: aId, priority: t.priority, dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '' });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      const payload: any = { title: form.title, description: form.description, assigneeId: form.assigneeId, priority: form.priority, dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null };
      if (editingTask) { await updateTask.mutateAsync({ projectId: id!, taskId: editingTask._id, data: payload }); }
      else { await createTask.mutateAsync({ projectId: id!, data: { ...payload, status: 'Todo' } }); }
      setShowModal(false);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to save task'); }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try { await updateStatus.mutateAsync({ projectId: id!, taskId, status }); } catch {}
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    try { await deleteTask.mutateAsync({ projectId: id!, taskId }); } catch {}
  };

  if (pLoading || tLoading) return <div className="p-6 max-w-7xl mx-auto space-y-6"><Skeleton className="h-12 w-64"/><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i=><Skeleton key={i} className="h-96 rounded-xl"/>)}</div></div>;
  if (!project) return <div className="text-center py-20"><p className="text-red-400">Project not found</p></div>;

  const tasksByStatus: Record<TaskStatus, Task[]> = { 'Todo': [], 'In Progress': [], 'Done': [] };
  (tasks || []).forEach(t => { if (tasksByStatus[t.status]) tasksByStatus[t.status].push(t); });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/projects"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4"/></Button></Link>
          <div><h1 className="text-2xl font-bold">{project.name}</h1>{project.description && <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {members.slice(0, 5).map(m => (
              <Avatar key={m._id} className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-500 to-violet-600 text-white">{getInitials(m.name)}</AvatarFallback>
              </Avatar>
            ))}
            {members.length > 5 && <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border-2 border-background text-xs font-medium">+{members.length-5}</div>}
          </div>
          {isAdmin && <Link to={`/projects/${id}/settings`}><Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-1.5"/>Settings</Button></Link>}
          {isAdmin && <Button onClick={openCreate} size="sm" className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white"><Plus className="h-4 w-4 mr-1.5"/>Add Task</Button>}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(col => (
          <div key={col.status} className={`rounded-xl border ${col.color} bg-card/30 backdrop-blur-sm`}>
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <div className="flex items-center gap-2">
                <StatusBadge status={col.status}/>
                <span className="text-sm text-muted-foreground">({tasksByStatus[col.status].length})</span>
              </div>
            </div>
            <div className="p-3 space-y-3 min-h-[200px] max-h-[70vh] overflow-y-auto">
              {tasksByStatus[col.status].length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No tasks</p>
              ) : tasksByStatus[col.status].map(task => {
                const assignee = getUserData(task.assigneeId);
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
                const isMyTask = (typeof task.assigneeId === 'string' ? task.assigneeId : (task.assigneeId as User)._id) === user?._id;
                return (
                  <Card key={task._id} className="border-border/30 bg-background/60 hover:border-border/50 transition-all group">
                    <CardContent className="p-3 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-sm leading-snug flex-1">{task.title}</p>
                        {isAdmin && (
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={()=>openEdit(task)}><Edit2 className="h-3 w-3"/></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={()=>handleDelete(task._id)}><Trash2 className="h-3 w-3"/></Button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <PriorityBadge priority={task.priority}/>
                        {task.dueDate && <span className={`text-xs flex items-center gap-1 ${isOverdue?'text-red-400':'text-muted-foreground'}`}><Calendar className="h-3 w-3"/>{new Date(task.dueDate).toLocaleDateString()}</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-5 w-5"><AvatarFallback className="text-[9px] bg-gradient-to-br from-indigo-500 to-violet-600 text-white">{getInitials(assignee.name)}</AvatarFallback></Avatar>
                          <span className="text-xs text-muted-foreground">{assignee.name}</span>
                        </div>
                        {(isAdmin || isMyTask) && task.status !== 'Done' && (
                          <Select value={task.status} onValueChange={(v) => handleStatusChange(task._id, v as TaskStatus)}>
                            <SelectTrigger className="h-6 w-auto text-xs border-none bg-muted/50 px-2"><SelectValue/></SelectTrigger>
                            <SelectContent>{COLUMNS.map(c=><SelectItem key={c.status} value={c.status} className="text-xs">{c.label}</SelectItem>)}</SelectContent>
                          </Select>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingTask ? 'Edit Task' : 'Create Task'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>}
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required minLength={3} maxLength={100}/></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} className="resize-none"/></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Assignee</Label><Select value={form.assigneeId} onValueChange={v=>setForm({...form,assigneeId:v})}><SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger><SelectContent>{members.map(m=><SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Priority</Label><Select value={form.priority} onValueChange={v=>setForm({...form,priority:v as TaskPriority})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Due Date (optional)</Label><Input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></div>
            <div className="flex gap-3"><Button type="button" variant="outline" onClick={()=>setShowModal(false)} className="flex-1">Cancel</Button><Button type="submit" disabled={createTask.isPending||updateTask.isPending} className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 text-white">{editingTask?'Save Changes':'Create Task'}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
