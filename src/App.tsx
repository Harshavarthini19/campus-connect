import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";
import MyReports from "./pages/MyReports";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/install" element={<Install />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/report" element={<ReportIssue />} />
              <Route path="/my-reports" element={<MyReports />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
