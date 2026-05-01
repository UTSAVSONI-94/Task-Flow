import { Link } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, FolderKanban, Users, ListTodo } from 'lucide-react';
import type { Project, User } from '@/types';

function ProjectCard({ project }: { project: Project }) {
  const tc = project.taskCounts || {};
  const total = (tc.Todo || 0) + (tc['In Progress'] || 0) + (tc.Done || 0);
  const done = tc.Done || 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Link to={`/projects/${project._id}`}>
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group h-full">
        <CardContent className="p-5 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-400 group-hover:from-indigo-500/30 group-hover:to-violet-500/30 transition-colors">
              <FolderKanban className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {project.members.length}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg mb-1 group-hover:text-indigo-400 transition-colors">{project.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{project.description || 'No description'}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><ListTodo className="h-3 w-3" />{total} tasks</span>
              <span>{pct}% done</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ProjectsPage() {
  const { data: projects, isLoading, error } = useProjects();

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Projects</h1><p className="text-muted-foreground mt-1">Manage your team projects</p></div>
        <Link to="/projects/new">
          <Button className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25">
            <Plus className="h-4 w-4 mr-2" />New Project
          </Button>
        </Link>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i=><Skeleton key={i} className="h-48 rounded-xl"/>)}</div>
      ) : error ? (
        <p className="text-red-400 text-center py-12">Failed to load projects</p>
      ) : !projects?.length ? (
        <div className="text-center py-20">
          <FolderKanban className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
          <p className="text-muted-foreground mb-6">Create your first project to get started</p>
          <Link to="/projects/new"><Button className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white"><Plus className="h-4 w-4 mr-2"/>Create Project</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p=><ProjectCard key={p._id} project={p}/>)}
        </div>
      )}
    </div>
  );
}
