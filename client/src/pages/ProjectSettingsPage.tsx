import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProject, useUpdateProject, useDeleteProject, useAddMember, useUpdateMemberRole, useRemoveMember } from '@/hooks/useProjects';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, UserPlus, Trash2, Shield, Users } from 'lucide-react';
import type { User } from '@/types';

function getInitials(name: string) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }

export function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: project, isLoading } = useProject(id!);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const addMember = useAddMember();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [email, setEmail] = useState('');
  const [memberRole, setMemberRole] = useState('Member');
  const [error, setError] = useState('');
  const [memberError, setMemberError] = useState('');
  const [inited, setInited] = useState(false);

  if (isLoading) return <div className="p-6 max-w-3xl mx-auto"><Skeleton className="h-96 rounded-xl" /></div>;
  if (!project) return <div className="text-center py-20"><p className="text-red-400">Project not found</p></div>;

  if (!inited) { setName(project.name); setDesc(project.description || ''); setInited(true); }

  const members = project.members.map(m => {
    const u = m.userId as User;
    return { _id: String(u._id || m.userId), name: u.name || 'Unknown', email: u.email || '', role: m.role };
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try { await updateProject.mutateAsync({ id: id!, data: { name, description: desc } }); setError(''); } catch (err: any) { setError(err.response?.data?.message || 'Update failed'); }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault(); setMemberError('');
    try { await addMember.mutateAsync({ projectId: id!, data: { email, role: memberRole } }); setEmail(''); } catch (err: any) { setMemberError(err.response?.data?.message || 'Failed to add member'); }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try { await updateRole.mutateAsync({ projectId: id!, userId, role }); } catch {}
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    try { await removeMember.mutateAsync({ projectId: id!, userId }); } catch {}
  };

  const handleDeleteProject = async () => {
    if (!confirm('Permanently delete this project and all its tasks?')) return;
    await deleteProject.mutateAsync(id!);
    navigate('/projects');
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/projects/${id}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold">Project Settings</h1><p className="text-sm text-muted-foreground">{project.name}</p></div>
      </div>

      {/* Edit Project */}
      <Card className="border-border/40 bg-card/50">
        <CardHeader><CardTitle>General</CardTitle><CardDescription>Update project details</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>}
            <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} required minLength={3} maxLength={100} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={desc} onChange={e => setDesc(e.target.value)} maxLength={500} rows={3} className="resize-none" /></div>
            <Button type="submit" disabled={updateProject.isPending} className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white">{updateProject.isPending ? 'Saving...' : 'Save Changes'}</Button>
          </form>
        </CardContent>
      </Card>

      {/* Members */}
      <Card className="border-border/40 bg-card/50">
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Members ({members.length})</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
            <Input placeholder="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="flex-1" />
            <Select value={memberRole} onValueChange={setMemberRole}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Member">Member</SelectItem><SelectItem value="Admin">Admin</SelectItem></SelectContent></Select>
            <Button type="submit" disabled={addMember.isPending} className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white"><UserPlus className="h-4 w-4 mr-1.5" />Add</Button>
          </form>
          {memberError && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{memberError}</div>}
          <Separator />
          <div className="space-y-2">
            {members.map(m => (
              <div key={m._id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-gradient-to-br from-indigo-500 to-violet-600 text-white">{getInitials(m.name)}</AvatarFallback></Avatar>
                  <div><p className="text-sm font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.email}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={m.role} onValueChange={v => handleRoleChange(m._id, v)}>
                    <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Admin"><div className="flex items-center gap-1"><Shield className="h-3 w-3" />Admin</div></SelectItem><SelectItem value="Member">Member</SelectItem></SelectContent>
                  </Select>
                  {String(m._id) !== String(user?._id) && <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => handleRemove(m._id)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20 bg-card/50">
        <CardHeader><CardTitle className="text-red-400">Danger Zone</CardTitle><CardDescription>Irreversible actions</CardDescription></CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDeleteProject} disabled={deleteProject.isPending}><Trash2 className="h-4 w-4 mr-2" />{deleteProject.isPending ? 'Deleting...' : 'Delete Project'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
