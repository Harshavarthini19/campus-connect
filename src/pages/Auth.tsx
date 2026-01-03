import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Mail, Lock, User, Building, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const departments = [
  'Computer Science',
  'Engineering',
  'Business Administration',
  'Arts & Humanities',
  'Natural Sciences',
  'Social Sciences',
  'Medicine',
  'Law',
  'Education',
  'Other',
];

export const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get('mode') === 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, signup } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    department: '',
    role: 'student' as 'student' | 'staff',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        if (!formData.name || !formData.department) {
          toast({
            title: 'Missing Information',
            description: 'Please fill in all required fields.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        const result = await signup(formData);
        if (result.success) {
          toast({
            title: 'Account Created!',
            description: 'Welcome to Campus Reporter.',
          });
          navigate('/dashboard');
        } else {
          toast({
            title: 'Signup Failed',
            description: result.error,
            variant: 'destructive',
          });
        }
      } else {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          toast({
            title: 'Welcome Back!',
            description: 'You have successfully logged in.',
          });
          navigate('/dashboard');
        } else {
          toast({
            title: 'Login Failed',
            description: result.error,
            variant: 'destructive',
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero p-4">
      <div className="absolute left-4 top-4">
        <Button variant="ghost" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-md animate-scale-in shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">
            {isSignup ? 'Create an Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isSignup
              ? 'Join Campus Reporter to start reporting issues'
              : 'Sign in to your account to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Anderson"
                      className="pl-10"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger>
                      <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={formData.role === 'student' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setFormData({ ...formData, role: 'student' })}
                    >
                      Student
                    </Button>
                    <Button
                      type="button"
                      variant={formData.role === 'staff' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setFormData({ ...formData, role: 'staff' })}
                    >
                      Staff
                    </Button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isSignup && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Demo Accounts:</p>
                <p>Student: john.student@university.edu / password123</p>
                <p>Admin: admin@university.edu / admin123</p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : isSignup ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            {isSignup ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => setIsSignup(false)}
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => setIsSignup(true)}
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
