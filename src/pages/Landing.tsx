import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Shield, AlertTriangle, MessageSquare, BarChart3, MapPin, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  {
    icon: AlertTriangle,
    title: 'Report Issues Instantly',
    description: 'Submit infrastructure faults, technical problems, or suggestions with multimedia evidence.',
  },
  {
    icon: MapPin,
    title: 'Location-Based Tracking',
    description: 'GPS integration with interactive campus maps showing issue clusters and hotspots.',
  },
  {
    icon: Clock,
    title: 'Real-Time Updates',
    description: 'Live status tracking and notifications keep you informed every step of the way.',
  },
  {
    icon: Shield,
    title: 'Anonymous Reporting',
    description: 'Privacy-conscious reporting with optional anonymous submission for sensitive issues.',
  },
  {
    icon: BarChart3,
    title: 'Smart Prioritization',
    description: 'AI-powered priority sorting ensures urgent issues get immediate attention.',
  },
  {
    icon: MessageSquare,
    title: 'Direct Communication',
    description: 'Two-way messaging between reporters and administrators for efficient resolution.',
  },
];

const stats = [
  { value: '500+', label: 'Issues Resolved' },
  { value: '24h', label: 'Avg Response Time' },
  { value: '95%', label: 'Satisfaction Rate' },
  { value: '1000+', label: 'Active Users' },
];

export const Landing: React.FC = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border glass-effect">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Campus Reporter</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="container px-4 py-20 md:px-6 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Trusted by 1000+ campus members
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Report Campus Issues
              <span className="block text-primary">Get Them Resolved</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              A student-driven platform for reporting infrastructure faults, technical problems, 
              or suggestions. Track issues in real-time and make your campus better.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="xl" variant="hero" asChild>
                <Link to="/auth?mode=signup">
                  Start Reporting
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="hero-outline" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30">
        <div className="container px-4 py-12 md:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-20 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive tools for effective campus issue management
          </p>
        </div>
        
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-20 md:px-6">
        <div className="overflow-hidden rounded-2xl gradient-primary p-8 text-center md:p-16">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl">
            Ready to Make a Difference?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
            Join hundreds of campus members who are actively improving our university environment.
          </p>
          <Button size="xl" variant="secondary" asChild>
            <Link to="/auth?mode=signup">
              Create Your Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container px-4 py-8 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Campus Reporter</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Campus Issue Reporter. Making our campus better, together.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
