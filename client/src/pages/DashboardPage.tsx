import { useDashboard } from '@/hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RT } from 'recharts';
import { FolderKanban, ListTodo, AlertTriangle, Clock } from 'lucide-react';

const COLORS = ['#71717a', '#6366f1', '#10b981'];

export function DashboardPage() {
  const { data: d, isLoading, error } = useDashboard();
  if (isLoading) return <div className="space-y-6 p-6 max-w-7xl mx-auto"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i=><Skeleton key={i} className="h-32 rounded-xl"/>)}</div></div>;
  if (error || !d) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-red-400">Failed to load dashboard</p></div>;

  const pie = [{name:'Todo',value:d.tasksByStatus.Todo},{name:'In Progress',value:d.tasksByStatus['In Progress']},{name:'Done',value:d.tasksByStatus.Done}];
  const bar = [{name:'Todo',count:d.tasksByStatus.Todo,fill:'#71717a'},{name:'In Progress',count:d.tasksByStatus['In Progress'],fill:'#6366f1'},{name:'Done',count:d.tasksByStatus.Done,fill:'#10b981'}];
  const stats = [
    {t:'Total Projects',v:d.totalProjects,icon:FolderKanban,g:'from-indigo-500 to-violet-600',s:'shadow-indigo-500/20'},
    {t:'Tasks Assigned',v:d.totalTasksAssigned,icon:ListTodo,g:'from-blue-500 to-cyan-500',s:'shadow-blue-500/20'},
    {t:'Completed',v:d.tasksByStatus.Done,icon:Clock,g:'from-emerald-500 to-teal-500',s:'shadow-emerald-500/20'},
    {t:'Overdue',v:d.overdueTasks.length,icon:AlertTriangle,g:'from-red-500 to-pink-500',s:'shadow-red-500/20'},
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1><p className="text-muted-foreground mt-1">Overview of your tasks and projects</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s=>(
          <Card key={s.t} className="border-border/40 bg-card/50 backdrop-blur-sm group hover:border-border/60 transition-all">
            <CardContent className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{s.t}</p><p className="text-3xl font-bold mt-1">{s.v}</p></div><div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.g} shadow-lg ${s.s} transition-transform group-hover:scale-110`}><s.icon className="h-5 w-5 text-white"/></div></div></CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/40 bg-card/50"><CardHeader><CardTitle className="text-lg">Task Distribution</CardTitle></CardHeader><CardContent>{d.totalTasksAssigned===0?<div className="flex items-center justify-center h-64 text-muted-foreground">No tasks yet</div>:<div className="h-64 flex items-center"><ResponsiveContainer width="50%" height="100%"><PieChart><Pie data={pie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">{pie.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}</Pie></PieChart></ResponsiveContainer><div className="flex flex-col gap-3">{pie.map((e,i)=><div key={e.name} className="flex items-center gap-2.5"><div className="h-3 w-3 rounded-full" style={{backgroundColor:COLORS[i]}}/><span className="text-sm text-muted-foreground">{e.name}</span><span className="text-sm font-semibold ml-auto">{e.value}</span></div>)}</div></div>}</CardContent></Card>
        <Card className="border-border/40 bg-card/50"><CardHeader><CardTitle className="text-lg">Status Breakdown</CardTitle></CardHeader><CardContent>{d.totalTasksAssigned===0?<div className="flex items-center justify-center h-64 text-muted-foreground">No tasks yet</div>:<ResponsiveContainer width="100%" height={256}><BarChart data={bar}><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#a1a1aa',fontSize:12}}/><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill:'#a1a1aa',fontSize:12}}/><RT contentStyle={{backgroundColor:'#1c1c22',border:'1px solid #27272a',borderRadius:'8px'}}/><Bar dataKey="count" radius={[6,6,0,0]} barSize={48}>{bar.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Bar></BarChart></ResponsiveContainer>}</CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/40 bg-card/50"><CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400"/>Overdue Tasks</CardTitle></CardHeader><CardContent>{d.overdueTasks.length===0?<p className="text-sm text-muted-foreground text-center py-8">🎉 No overdue tasks!</p>:<div className="overflow-auto max-h-80"><Table><TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Project</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{d.overdueTasks.map(t=><TableRow key={t.taskId}><TableCell className="font-medium">{t.title}</TableCell><TableCell className="text-muted-foreground">{t.projectName}</TableCell><TableCell className="text-red-400">{new Date(t.dueDate).toLocaleDateString()}</TableCell><TableCell><StatusBadge status={t.status}/></TableCell></TableRow>)}</TableBody></Table></div>}</CardContent></Card>
        <Card className="border-border/40 bg-card/50"><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Clock className="h-4 w-4 text-indigo-400"/>Recent Activity</CardTitle></CardHeader><CardContent>{d.recentActivity.length===0?<p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>:<div className="space-y-3 max-h-80 overflow-auto">{d.recentActivity.map(a=><div key={a.taskId} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{a.title}</p><p className="text-xs text-muted-foreground">{a.projectName} · {new Date(a.updatedAt).toLocaleDateString()}</p></div><StatusBadge status={a.status}/></div>)}</div>}</CardContent></Card>
      </div>
    </div>
  );
}
