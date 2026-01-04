import React, { useState, useMemo, useEffect } from 'react';
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
  ChevronDown,
  Eye,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type Issue = Tables<'issues'>;

const typeIcons = {
  maintenance: Wrench,
  safety: AlertTriangle,
  cleanliness: Building,
  noise: Lightbulb,
  accessibility: Building,
  other: Lightbulb,
};

const typeColors = {
  maintenance: 'bg-purple-500/10 text-purple-600',
  safety: 'bg-red-500/10 text-red-600',
  cleanliness: 'bg-blue-500/10 text-blue-600',
  noise: 'bg-amber-500/10 text-amber-600',
  accessibility: 'bg-green-500/10 text-green-600',
  other: 'bg-gray-500/10 text-gray-600',
};

const statusColors = {
  'pending': 'bg-info text-info-foreground',
  'in_progress': 'bg-warning text-warning-foreground',
  'resolved': 'bg-success text-success-foreground',
  'closed': 'bg-muted text-muted-foreground',
};

const priorityColors = {
  low: 'border-l-muted-foreground/30',
  medium: 'border-l-info',
  high: 'border-l-warning',
  critical: 'border-l-destructive',
};

export const MyReports: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [issueToDelete, setIssueToDelete] = useState<Issue | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndIssues = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data, error } = await supabase
          .from('issues')
          .select('*')
          .eq('reporter_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          toast.error('Failed to load reports');
        } else {
          setIssues(data || []);
        }
      }
      setLoading(false);
    };

    fetchUserAndIssues();
  }, []);

  // Real-time subscription for issue changes
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('issues-realtime')
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'issues',
        },
        (payload) => {
          setIssues((prev) => prev.filter((issue) => issue.id !== payload.old.id));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'issues',
          filter: `reporter_id=eq.${userId}`,
        },
        (payload) => {
          setIssues((prev) => [payload.new as Issue, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'issues',
        },
        (payload) => {
          setIssues((prev) =>
            prev.map((issue) =>
              issue.id === payload.new.id ? (payload.new as Issue) : issue
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleDeleteIssue = async () => {
    if (issueToDelete) {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', issueToDelete.id);
      
      if (error) {
        toast.error('Failed to delete report');
      } else {
        toast.success('Report deleted successfully');
        setIssues(issues.filter(i => i.id !== issueToDelete.id));
      }
      setIssueToDelete(null);
    }
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch = 
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
      const matchesType = typeFilter === 'all' || issue.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [issues, searchQuery, statusFilter, typeFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-muted-foreground">Loading reports...</div>
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
        <h1 className="text-3xl font-bold text-foreground">My Reports</h1>
        <p className="mt-1 text-muted-foreground">
          Track and manage all your submitted issues
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="mr-2 h-4 w-4" />
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
              <SelectTrigger className="w-full sm:w-40">
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
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredIssues.length} of {issues.length} reports
        </p>
      </div>

      {/* Issues List */}
      {filteredIssues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">No Reports Found</h3>
            <p className="mb-4 text-center text-muted-foreground">
              {issues.length === 0 
                ? "You haven't submitted any reports yet."
                : "No reports match your current filters."}
            </p>
            <Button onClick={() => navigate('/report')}>Submit Your First Report</Button>
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
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
                        </div>
                        <Badge className={`shrink-0 ${statusColors[issue.status]}`}>
                          {issue.status.replace('-', ' ')}
                        </Badge>
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
                        <Badge variant="outline" className="capitalize">{issue.priority}</Badge>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIssueToDelete(issue);
                        }}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
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
        <DialogContent className="max-w-2xl">
          {selectedIssue && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {(() => {
                    const TypeIcon = typeIcons[selectedIssue.type];
                    return (
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${typeColors[selectedIssue.type]}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                    );
                  })()}
                  <div>
                    <DialogTitle>{selectedIssue.title}</DialogTitle>
                    <DialogDescription>
                      Submitted on {formatDate(selectedIssue.created_at)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={statusColors[selectedIssue.status]}>
                    {selectedIssue.status.replace('_', ' ')}
                  </Badge>
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

              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!issueToDelete} onOpenChange={() => setIssueToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{issueToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteIssue}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyReports;
