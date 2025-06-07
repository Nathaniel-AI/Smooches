import { useState, useEffect } from 'react';
import { Switch, Route, Link, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth-simple";
import { 
  Home as HomeIcon, 
  Radio as RadioIcon, 
  Video, 
  Users,
  DollarSign,
  Scissors,
  LogOut
} from "lucide-react";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import Profile from "@/pages/profile";
import Live from "@/pages/live";
import Radio from "@/pages/radio";
import MonetizationDashboard from "@/pages/monetization";
import ClipsPage from "@/pages/clips";
import ClipPage from "@/pages/clip";
import AuthPage from "@/pages/auth-page";
import LandingPage from "@/pages/landing-page";
import CreateContentPage from "@/pages/create-content";
import { Header } from "@/components/header";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import { AuthProvider } from "@/hooks/use-auth-simple";
import { ProtectedRoute, RoleProtectedRoute } from "@/lib/protected-route";
import SmoochesFeed from "@/components/SmoochesFeed";

function Navigation() {
  const { user } = useAuth();
  
  // Only show navigation when user is logged in
  if (!user) {
    return null;
  }
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 px-4 flex justify-around items-center z-50">
      <Link href="/">
        <div className="flex flex-col items-center p-2 text-sm text-muted-foreground hover:text-primary">
          <HomeIcon className="w-6 h-6" />
          <span>For You</span>
        </div>
      </Link>
      <Link href="/live">
        <div className="flex flex-col items-center p-2 text-sm text-muted-foreground hover:text-primary">
          <Video className="w-6 h-6" />
          <span>Live</span>
        </div>
      </Link>
      <Link href="/feed">
        <div className="flex flex-col items-center p-2 text-sm text-muted-foreground hover:text-primary">
          <Users className="w-6 h-6" />
          <span>Feed</span>
        </div>
      </Link>
      <Link href="/radio">
        <div className="flex flex-col items-center p-2 text-sm text-muted-foreground hover:text-primary">
          <RadioIcon className="w-6 h-6" />
          <span>Radio</span>
        </div>
      </Link>
      <Link href="/clips">
        <div className="flex flex-col items-center p-2 text-sm text-muted-foreground hover:text-primary">
          <Scissors className="w-6 h-6" />
          <span>Clips</span>
        </div>
      </Link>
      {(user.role === "creator" || user.role === "admin") && (
        <Link href="/monetization">
          <div className="flex flex-col items-center p-2 text-sm text-muted-foreground hover:text-primary">
            <DollarSign className="w-6 h-6" />
            <span>Earnings</span>
          </div>
        </Link>
      )}
      <Link href={`/profile/${user.id}`}>
        <div className="flex flex-col items-center p-2 text-sm text-muted-foreground hover:text-primary">
          <Users className="w-6 h-6" />
          <span>Profile</span>
        </div>
      </Link>
    </nav>
  );
}

function Router() {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // More explicit check for first-time users
    const completed = localStorage.getItem('onboardingComplete');
    return completed === null || completed !== 'true';
  });
  const authContext = useAuth();
  const currentUser = authContext.user;

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setShowOnboarding(false);
  };

  // Only show onboarding if user is logged in but hasn't completed onboarding
  if (showOnboarding && currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      </div>
    );
  }
  
  // If not authenticated, show landing page or auth page
  if (!currentUser) {
    return (
      <div className="min-h-screen">
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <Route path="/" component={LandingPage} />
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </div>
    );
  }
  
  // If authenticated, show the full application
  return (
    <div className="pb-20 pt-16">
      <Header />
      <Switch>
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/profile/:id" component={Profile} />
        <ProtectedRoute path="/live" component={Live} />
        <ProtectedRoute path="/radio" component={Radio} />
        <RoleProtectedRoute path="/monetization" component={MonetizationDashboard} role="creator" />
        <ProtectedRoute path="/clips" component={ClipsPage} />
        <ProtectedRoute path="/clips/:id" component={ClipPage} />
        <ProtectedRoute path="/create" component={CreateContentPage} />
        <ProtectedRoute path="/feed" component={() => <div className="p-4"><SmoochesFeed /></div>} />
        <Route path="/auth">
          <Redirect to="/" />
        </Route>
        <Route component={NotFound} />
      </Switch>
      <Navigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="dark min-h-screen bg-background text-foreground">
          <Router />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;