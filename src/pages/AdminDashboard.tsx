import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getIssues, updateIssue, addComment, getStatistics, Issue, createNotification, getUsers } from '@/lib/data';

const typeIcons = {
  infrastructure: Building,
  harassment: AlertTriangle,
  technical: Wrench,
  suggestion: Lightbulb,
};

const typeColors = {
  infrastructure: 'bg-blue-500/10 text-blue-600',
  harassment: 'bg-red-500/10 text-red-600',
  technical: 'bg-purple-500/10 text-purple-600',
  suggestion: 'bg-amber-500/10 text-amber-600',
};

const statusColors = {
  'new': 'bg-info text-info-foreground',
  'in-progress': 'bg-warning text-warning-foreground',
  'under-review': 'bg-primary text-primary-foreground',
  'resolved': 'bg-success text-success-foreground',
  'closed': 'bg-muted text-muted-foreground',
};

const priorityColors = {
  low: 'border-l-muted-foreground/30',
  medium: 'border-l-info',
  high: 'border-l-warning',
  urgent: 'border-l-destructive',
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);

  const issues = getIssues();
  const stats = getStatistics();
  const users = getUsers();

  const filteredIssues = useMemo(() => {
    return issues
      .filter((issue) => {
        const matchesSearch = 
          issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          issue.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          issue.reporterName.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
        const matchesType = typeFilter === 'all' || issue.type === typeFilter;
        const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesType && matchesPriority;
      })
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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

  const handleStatusChange = (issueId: string, newStatus: Issue['status']) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    updateIssue(issueId, { status: newStatus });
    
    createNotification({
      userId: issue.reporterId,
      title: 'Issue Status Updated',
      message: `Your issue "${issue.title}" status has been changed to ${newStatus.replace('-', ' ')}.`,
      type: newStatus === 'resolved' ? 'success' : 'info',
      link: '/my-reports',
    });

    toast({
      title: 'Status Updated',
      description: `Issue status changed to ${newStatus.replace('-', ' ')}.`,
    });

    if (selectedIssue?.id === issueId) {
      setSelectedIssue({ ...selectedIssue, status: newStatus });
    }
  };

  const handleAddComment = () => {
    if (!selectedIssue || !user || !newComment.trim()) return;

    const comment = addComment(selectedIssue.id, {
      issueId: selectedIssue.id,
      userId: user.id,
      userName: user.name,
      content: newComment,
      isInternal: isInternalComment,
    });

    if (comment && !isInternalComment) {
      createNotification({
        userId: selectedIssue.reporterId,
        title: 'New Comment on Your Issue',
        message: `An administrator commented on "${selectedIssue.title}".`,
        type: 'info',
        link: '/my-reports',
      });
    }

    toast({
      title: 'Comment Added',
      description: isInternalComment ? 'Internal note added.' : 'Comment sent to reporter.',
    });

    setNewComment('');
    setSelectedIssue({ 
      ...selectedIssue, 
      comments: [...selectedIssue.comments, comment!] 
    });
  };

  if (user?.role !== 'admin') {
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
                <p className="text-2xl font-bold text-foreground">{stats.new}</p>
                <p className="text-sm text-muted-foreground">New</p>
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
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
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
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
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
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
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
            const TypeIcon = typeIcons[issue.type];
            return (
              <Card 
                key={issue.id}
                className={`cursor-pointer border-l-4 transition-all hover:shadow-card-hover ${priorityColors[issue.priority]}`}
                onClick={() => setSelectedIssue(issue)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${typeColors[issue.type]}`}>
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
                          <Badge className={statusColors[issue.status]}>
                            {issue.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {issue.reporterName}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {issue.location.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(issue.createdAt)}
                        </div>
                        {issue.comments.length > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {issue.comments.length}
                          </div>
                        )}
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
                    const TypeIcon = typeIcons[selectedIssue.type];
                    return (
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeColors[selectedIssue.type]}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                    );
                  })()}
                  <div className="min-w-0">
                    <DialogTitle className="line-clamp-2">{selectedIssue.title}</DialogTitle>
                    <DialogDescription>
                      Reported by {selectedIssue.reporterName} on {formatDate(selectedIssue.createdAt)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="details" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="comments">
                    Comments ({selectedIssue.comments.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Select
                      value={selectedIssue.status}
                      onValueChange={(value) => handleStatusChange(selectedIssue.id, value as Issue['status'])}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="under-review">Under Review</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="outline" className="capitalize">{selectedIssue.priority} priority</Badge>
                    <Badge variant="outline" className="capitalize">{selectedIssue.type}</Badge>
                    {selectedIssue.isAnonymous && (
                      <Badge variant="secondary">Anonymous</Badge>
                    )}
                  </div>

                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="mb-2 font-medium text-foreground">Description</h4>
                    <p className="whitespace-pre-wrap text-muted-foreground">{selectedIssue.description}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-border p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">Location</span>
                      </div>
                      <p className="mt-1 font-medium text-foreground">{selectedIssue.location.name}</p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Last Updated</span>
                      </div>
                      <p className="mt-1 font-medium text-foreground">{formatDate(selectedIssue.updatedAt)}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="space-y-4">
                  {selectedIssue.comments.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      No comments yet
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedIssue.comments.map((comment) => (
                        <div 
                          key={comment.id} 
                          className={`rounded-lg border p-4 ${comment.isInternal ? 'border-warning/50 bg-warning/5' : 'border-border'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{comment.userName}</span>
                              {comment.isInternal && (
                                <Badge variant="outline" className="text-xs">Internal</Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="mt-2 text-muted-foreground">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3 border-t border-border pt-4">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isInternalComment}
                          onChange={(e) => setIsInternalComment(e.target.checked)}
                          className="rounded border-border"
                        />
                        Internal note (not visible to reporter)
                      </label>
                      <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                        Add Comment
                      </Button>
                    </div>
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
