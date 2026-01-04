import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Building, 
  Wrench, 
  AlertTriangle, 
  Lightbulb,
  MapPin,
  Clock,
  MessageSquare,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Issue = Tables<'issues'>;

const typeIcons: Record<string, React.ElementType> = {
  maintenance: Wrench,
  safety: AlertTriangle,
  cleanliness: Building,
  noise: Lightbulb,
  accessibility: Building,
  other: Lightbulb,
};

const typeColors: Record<string, string> = {
  maintenance: 'bg-purple-500/10 text-purple-600',
  safety: 'bg-red-500/10 text-red-600',
  cleanliness: 'bg-blue-500/10 text-blue-600',
  noise: 'bg-amber-500/10 text-amber-600',
  accessibility: 'bg-green-500/10 text-green-600',
  other: 'bg-gray-500/10 text-gray-600',
};

const statusColors: Record<string, string> = {
  'pending': 'bg-info text-info-foreground',
  'in_progress': 'bg-warning text-warning-foreground',
  'resolved': 'bg-success text-success-foreground',
  'closed': 'bg-muted text-muted-foreground',
};

const priorityColors: Record<string, string> = {
  low: 'border-l-muted-foreground/30',
  medium: 'border-l-info',
  high: 'border-l-warning',
  critical: 'border-l-destructive',
};

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  userCount: number;
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [newComment, setNewComment] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, inProgress: 0, resolved: 0, userCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch issues
      const { data: issuesData } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (issuesData) {
        setIssues(issuesData);
        setStats({
          total: issuesData.length,
          pending: issuesData.filter(i => i.status === 'pending').length,
          inProgress: issuesData.filter(i => i.status === 'in_progress').length,
          resolved: issuesData.filter(i => i.status === 'resolved').length,
          userCount: 0, // We'll get this from profiles
        });
      }

      // Fetch user count
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (count !== null) {
        setStats(prev => ({ ...prev, userCount: count }));
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredIssues = useMemo(() => {
    return issues
      .filter((issue) => {
        const matchesSearch = 
          issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          issue.location.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
        const matchesType = typeFilter === 'all' || issue.type === typeFilter;
        const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesType && matchesPriority;
      })
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [issues, searchQuery, statusFilter, typeFilter, priorityFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    const { error } = await supabase
      .from('issues')
      .update({ status: newStatus as any })
      .eq('id', issueId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
      return;
    }

    setIssues(issues.map(i => i.id === issueId ? { ...i, status: newStatus as any } : i));
    
    toast({
      title: 'Status Updated',
      description: `Issue status changed to ${newStatus.replace('_', ' ')}.`,
    });

    if (selectedIssue?.id === issueId) {
      setSelectedIssue({ ...selectedIssue, status: newStatus as any });
    }
  };

  const handleAddComment = async () => {
    if (!selectedIssue || !user || !newComment.trim()) return;

    const { error } = await supabase.from('comments').insert({
      issue_id: selectedIssue.id,
      user_id: user.id,
      content: newComment,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Comment Added',
      description: 'Your comment has been added.',
    });

    setNewComment('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <XCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
            <h2 className="mb-2 text-xl font-semibold text-foreground">Access Denied</h2>
            <p className="mb-4 text-muted-foreground">
              You don't have permission to access the admin dashboard.
            </p>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Manage and resolve campus issues
        </p>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.userCount}</p>
                <p className="text-sm text-muted-foreground">Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search issues..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="cleanliness">Cleanliness</SelectItem>
                  <SelectItem value="noise">Noise</SelectItem>
                  <SelectItem value="accessibility">Accessibility</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredIssues.length} of {issues.length} issues
        </p>
      </div>

      {filteredIssues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckCircle2 className="mb-4 h-16 w-16 text-success" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">All Caught Up!</h3>
            <p className="text-muted-foreground">No issues match your current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredIssues.map((issue) => {
            const TypeIcon = typeIcons[issue.type] || Lightbulb;
            return (
              <Card 
                key={issue.id}
                className={`cursor-pointer border-l-4 transition-all hover:shadow-card-hover ${priorityColors[issue.priority] || ''}`}
                onClick={() => setSelectedIssue(issue)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${typeColors[issue.type] || ''}`}>
                      <TypeIcon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground line-clamp-1">{issue.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{issue.description}</p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Badge variant="outline" className="capitalize">{issue.priority}</Badge>
                          <Badge className={statusColors[issue.status] || ''}>
                            {issue.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {issue.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(issue.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Issue Detail Dialog */}
      <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {selectedIssue && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  {(() => {
                    const TypeIcon = typeIcons[selectedIssue.type] || Lightbulb;
                    return (
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeColors[selectedIssue.type] || ''}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                    );
                  })()}
                  <div className="min-w-0">
                    <DialogTitle className="line-clamp-2">{selectedIssue.title}</DialogTitle>
                    <DialogDescription>
                      Created on {formatDate(selectedIssue.created_at)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="details" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Select
                      value={selectedIssue.status}
                      onValueChange={(value) => handleStatusChange(selectedIssue.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="outline" className="capitalize">{selectedIssue.priority} priority</Badge>
                    <Badge variant="outline" className="capitalize">{selectedIssue.type}</Badge>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="mb-2 font-medium text-foreground">Description</h4>
                    <p className="text-muted-foreground">{selectedIssue.description}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-border p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">Location</span>
                      </div>
                      <p className="mt-1 font-medium text-foreground">{selectedIssue.location}</p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Last Updated</span>
                      </div>
                      <p className="mt-1 font-medium text-foreground">{formatDate(selectedIssue.updated_at)}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="space-y-4">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Add Comment
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
