import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LocalAuthModal } from "@/components/local-auth-modal";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const { user: localUser, isAuthenticated: localIsAuthenticated } = useLocalAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Combined authentication state - prioritize Replit auth for admin access
  const currentUser = user || localUser;
  const isUserAuthenticated = isAuthenticated || localIsAuthenticated;

  const getDashboardLink = () => {
    const userRole = (currentUser as any)?.role;
    switch (userRole) {
      case 'admin':
        return '/admin-dashboard';
      case 'technician':
        return '/technician-dashboard';
      case 'customer':
        return '/customer-dashboard';
      default:
        return '/';
    }
  };

  const NavLinks = () => (
    <>
      <Link href="/">
        <Button variant="ghost" className="text-neutral hover:text-primary">Home</Button>
      </Link>
      <Link href="/solar-solutions">
        <Button variant="ghost" className="text-neutral hover:text-primary">Solar Solutions</Button>
      </Link>
      <Link href="/services">
        <Button variant="ghost" className="text-neutral hover:text-primary">Services</Button>
      </Link>
      <Link href="/products">
        <Button variant="ghost" className="text-neutral hover:text-primary">Products</Button>
      </Link>
      <Link href="/projects">
        <Button variant="ghost" className="text-neutral hover:text-primary">Projects</Button>
      </Link>
      <Link href="/contact">
        <Button variant="ghost" className="text-neutral hover:text-primary">Contact</Button>
      </Link>
      {isUserAuthenticated && (
        <Link href={getDashboardLink()}>
          <Button variant="ghost" className="text-neutral hover:text-primary">Dashboard</Button>
        </Link>
      )}
    </>
  );

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <i className="fas fa-solar-panel text-primary text-2xl mr-2"></i>
              <span className="text-xl font-bold text-dark">ElectroCare</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-8">
                <NavLinks />
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {isUserAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">Welcome back</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={(currentUser as any)?.profileImageUrl || ""} alt={(currentUser as any)?.firstName || ""} />
                        <AvatarFallback className="bg-primary text-white">
                          {(currentUser as any)?.firstName?.charAt(0)?.toUpperCase() || (currentUser as any)?.email?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {(currentUser as any)?.firstName ? `${(currentUser as any).firstName} ${(currentUser as any).lastName || ''}`.trim() : (currentUser as any)?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {(currentUser as any)?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {(currentUser as any)?.role || 'customer'}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <i className="fas fa-user-cog mr-2 h-4 w-4"></i>
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    // Use proper logout for current session type
                    window.location.href = '/';
                  }}>
                    <i className="fas fa-sign-out-alt mr-2 h-4 w-4"></i>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAuthModal(true)}
                  className="text-neutral hover:text-primary"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
          
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <i className="fas fa-bars text-xl"></i>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-4">
                  <NavLinks />
                  {isUserAuthenticated ? (
                    <>
                      <div className="pt-4 border-t">
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={(currentUser as any)?.profileImageUrl || ""} alt={(currentUser as any)?.firstName || ""} />
                            <AvatarFallback className="bg-primary text-white">
                              {(currentUser as any)?.firstName?.charAt(0)?.toUpperCase() || (currentUser as any)?.email?.charAt(0)?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {(currentUser as any)?.firstName ? `${(currentUser as any).firstName} ${(currentUser as any).lastName || ''}`.trim() : (currentUser as any)?.email}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">{(currentUser as any)?.role || 'customer'}</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            if (isAuthenticated) {
                              window.location.href = '/api/logout';
                            } else {
                              window.location.href = '/api/local-auth/logout';
                            }
                          }}
                        >
                          <i className="fas fa-sign-out-alt mr-2"></i>
                          Log out
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAuthModal(true)}
                        className="w-full"
                      >
                        Login
                      </Button>
                      <Button 
                        onClick={() => setShowAuthModal(true)}
                        className="w-full"
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <LocalAuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal} 
        onSuccess={() => {
          // Refresh user data after successful login
          window.location.reload();
        }}
      />
    </nav>
  );
}
