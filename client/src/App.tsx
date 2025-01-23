import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Home from "@/pages/home";
import Project from "@/pages/project";
import Discover from "@/pages/discover";
import Channels from "@/pages/channels";
import Profile from "@/pages/profile";
import { useUser } from "@/hooks/use-user";
import Navbar from "@/components/layout/navbar";
import { ThemeProvider } from "@/components/theme/theme-provider";

function Router() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/project/:id" component={Project} />
        <Route path="/discover" component={Discover} />
        <Route path="/channels" component={Channels} />
        <Route path="/profile" component={Profile} />
        <Route path="/users/:id" component={Profile} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <Router />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;