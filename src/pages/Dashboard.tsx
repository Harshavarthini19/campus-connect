import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Plus,
  ArrowRight,
  TrendingUp,
  Building,
  Wrench,
  MessageSquare,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const statusColors: Record<string, string> = {
  'pending': 'bg-info text-info-foreground',
  'in_progress': 'bg-warning text-warning-foreground',
  'resolved': 'bg-success text-success-foreground',
  'closed': 'bg-muted text-muted-foreground',
};

const priorityColors: Record<string, string> = {
  low: 'border-muted-foreground/30',
  medium: 'border-info',
  high: 'border-warning',
  critical: 'border-destructive',
};

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export const Dashboard: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    byType: {},
    byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchIssues = async () => {
      let query = supabase.from('issues').select('*');
      
      if (!isAdmin) {
        query = query.eq('reporter_id', user.id);
      }
      
      const { data, error } = await query.order('updated_at', { ascending: false });
      
      if (!error && data) {
        setIssues(data);
        
        // Calculate stats
        const newStats: Stats = {
          total: data.length,
          pending: data.filter(i => i.status === 'pending').length,
          inProgress: data.filter(i => i.status === 'in_progress').length,
          resolved: data.filter(i => i.status === 'resolved').length,
          byType: {},
          byPriority: {
            low: data.filter(i => i.priority === 'low').length,
            medium: data.filter(i => i.priority === 'medium').length,
            high: data.filter(i => i.priority === 'high').length,
            critical: data.filter(i => i.priority === 'critical').length,
          },
        };
        
        data.forEach(issue => {
          newStats.byType[issue.type] = (newStats.byType[issue.type] || 0) + 1;
        });
        
        setStats(newStats);
      }
      setLoading(false);
    };

    fetchIssues();
  }, [user, isAdmin]);

  const recentIssues = issues.slice(0, 5);

  const statCards = [
    {
      title: 'Total Reports',
      value: stats.total,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending',
      value: stats.pending + stats.inProgress,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Critical',
      value: stats.byPriority.critical || 0,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's what's happening with your campus reports
          </p>
        </div>
        <Button size="lg" asChild>
          <Link to="/report">
            <Plus className="mr-2 h-5 w-5" />
            New Report
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card 
            key={index}
            className="overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks at your fingertips</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/report">
                <Building className="mr-3 h-4 w-4 text-muted-foreground" />
                Report Infrastructure Issue
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/report">
                <Wrench className="mr-3 h-4 w-4 text-muted-foreground" />
                Report Technical Problem
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/report">
                <Lightbulb className="mr-3 h-4 w-4 text-muted-foreground" />
                Submit a Suggestion
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/my-reports">
                <FileText className="mr-3 h-4 w-4 text-muted-foreground" />
                View All My Reports
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates on your reports</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/my-reports">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No reports yet</p>
                <Button variant="link" asChild>
                  <Link to="/report">Submit your first report</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentIssues.map((issue) => {
                  const TypeIcon = typeIcons[issue.type] || Lightbulb;
                  return (
                    <div
                      key={issue.id}
                      className={`flex items-start gap-4 rounded-lg border-l-4 bg-muted/30 p-4 ${priorityColors[issue.priority] || ''}`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background">
                        <TypeIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-foreground line-clamp-1">{issue.title}</p>
                          <Badge className={`shrink-0 ${statusColors[issue.status] || ''}`}>
                            {issue.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                          {issue.location}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Updated {formatDate(issue.updated_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Issue Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Reports by Category</CardTitle>
          <CardDescription>Distribution of your submitted issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { type: 'maintenance', label: 'Maintenance', icon: Wrench },
              { type: 'safety', label: 'Safety', icon: AlertTriangle },
              { type: 'cleanliness', label: 'Cleanliness', icon: Building },
              { type: 'other', label: 'Other', icon: Lightbulb },
            ].map((item) => (
              <div
                key={item.type}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.byType[item.type] || 0}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
