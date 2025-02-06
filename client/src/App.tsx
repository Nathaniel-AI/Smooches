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
  DollarSign
} from "lucide-react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Live from "@/pages/live";
import Radio from "@/pages/radio";
import MonetizationDashboard from "@/pages/monetization";

function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 px-4 flex justify-around items-center z-50">
      <Link href="/">
        <a className="flex flex-col items-center p-2 text-sm text-muted-foreground hover:text-primary">
          <HomeIcon className="w-6 h-6" />
          <span>For You</span>
        </a>
      </Link>
      <Link href="/live">
        <a className="flex flex-col items-center p-2 text-sm text-muted-foreground hover:text-primary">
          <Video className="w-6 h-6" />
          <span>Live</span>
        </a>
      </Link>
      <Link href="/radio">
        <a className="flex flex-col items-center p-2 text-sm text-muted-foreground hover:text-primary">
          <RadioIcon className="w-6 h-6" />
          <span>Radio</span>
        </a>
      </Link>
      <Link href="/monetization">
        <a className="flex flex-col items-center p-2 text-sm text-muted-foreground hover:text-primary">
          <DollarSign className="w-6 h-6" />
          <span>Earnings</span>
        </a>
      </Link>
      <Link href="/profile/1">
        <a className="flex flex-col items-center p-2 text-sm text-muted-foreground hover:text-primary">
          <Users className="w-6 h-6" />
          <span>Profile</span>
        </a>
      </Link>
    </nav>
  );
}

function Router() {
  return (
    <div className="pb-20">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/profile/:id" component={Profile} />
        <Route path="/live" component={Live} />
        <Route path="/radio" component={Radio} />
        <Route path="/monetization" component={MonetizationDashboard} />
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