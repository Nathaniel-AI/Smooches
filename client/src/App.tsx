import { useState, useEffect } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Link } from "wouter";
import { 
  Home as HomeIcon, 
  Radio as RadioIcon, 
  Video, 
  Users,
  DollarSign,
  Scissors
} from "lucide-react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Live from "@/pages/live";
import Radio from "@/pages/radio";
import MonetizationDashboard from "@/pages/monetization";
import ClipsPage from "@/pages/clips";
import ClipPage from "@/pages/clip";
import { Header } from "@/components/header";
import { OnboardingWizard } from "@/components/onboarding/wizard";

function Navigation() {
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
      <Link href="/monetization">
        <div className="flex flex-col items-center p-2 text-sm text-muted-foreground hover:text-primary">
          <DollarSign className="w-6 h-6" />
          <span>Earnings</span>
        </div>
      </Link>
      <Link href="/profile/1">
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

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-background">
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="pb-20 pt-16">
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/profile/:id" component={Profile} />
        <Route path="/live" component={Live} />
        <Route path="/radio" component={Radio} />
        <Route path="/monetization" component={MonetizationDashboard} />
        <Route path="/clips" component={ClipsPage} />
        <Route path="/clips/:id" component={ClipPage} />
        <Route component={NotFound} />
      </Switch>
      <Navigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="dark min-h-screen bg-background text-foreground">
        <Router />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;