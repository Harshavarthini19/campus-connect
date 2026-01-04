import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Settings, LogOut, User, Menu, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Notification = Tables<'notifications'>;

export const Header: React.FC = () => {
  const { user, profile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) {
        setNotifications(data);
      }
    };
    
    fetchNotifications();
  }, [user]);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border glass-effect">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden font-semibold text-foreground sm:inline-block">
            Campus Reporter
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link 
            to="/dashboard" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link 
            to="/report" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Report Issue
          </Link>
          <Link 
            to="/my-reports" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            My Reports
          </Link>
          {isAdmin && (
            <Link 
              to="/admin" 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                    variant="destructive"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} new</Badge>
                )}
              </div>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <DropdownMenuItem 
                    key={notif.id} 
                    className={`flex flex-col items-start gap-1 px-4 py-3 ${!notif.read ? 'bg-primary/5' : ''}`}
                  >
                    <span className="font-medium">{notif.title}</span>
                    <span className="text-xs text-muted-foreground">{notif.message}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5 md:hidden" />
                <Settings className="hidden h-5 w-5 md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-4 py-2">
                <p className="font-medium">{profile?.name || user?.email}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard')} className="md:hidden">
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/report')} className="md:hidden">
                Report Issue
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/my-reports')} className="md:hidden">
                My Reports
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate('/admin')} className="md:hidden">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
