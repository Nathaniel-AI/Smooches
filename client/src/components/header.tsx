import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth-simple";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOut, UserCircle, Settings, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background to-transparent p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="text-2xl">💋</div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-wide">
              SMOOCHES
            </span>
          </div>
        </Link>
        
        {user && (
          <div className="flex items-center gap-4">
            {user.role === "creator" && (
              <div className="hidden sm:flex items-center gap-1 text-primary">
                <Crown size={16} />
                <span className="text-sm font-medium">Creator</span>
              </div>
            )}
            {user.role === "admin" && (
              <div className="hidden sm:flex items-center gap-1 text-primary">
                <Crown size={16} />
                <span className="text-sm font-medium">Admin</span>
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} alt={user.displayName} />
                    <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href={`/profile/${user.id}`}>
                  <DropdownMenuItem>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}