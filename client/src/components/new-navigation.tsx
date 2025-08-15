import { useState } from "react";
import { Link } from "wouter";
import { useSimpleAuth } from "@/hooks/useSimpleAuth";
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
import { PureAuthModal } from "@/components/pure-auth-modal";

export default function NewNavigation() {
  const { user, logoutMutation } = useSimpleAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const getDashboardLink = () => {
    switch (user?.role) {
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
      {user && (
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
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLinks />
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user.firstName} />
                      <AvatarFallback className="bg-primary text-white">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()}>Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => logoutMutation.mutate()}
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
              >
                Login / Register
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <i className="fas fa-bars text-xl"></i>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0">
                <div className="flex flex-col h-full bg-white">
                  <div className="px-6 py-4 border-b">
                    <div className="flex items-center">
                      <i className="fas fa-solar-panel text-primary text-2xl mr-2"></i>
                      <span className="text-xl font-bold text-dark">ElectroCare</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {user && (
                      <div className="px-6 py-4 border-b">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="" alt={user.firstName} />
                            <AvatarFallback className="bg-primary text-white">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="px-6 py-4 space-y-2">
                      <Link href="/">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => setIsOpen(false)}>
                          Home
                        </Button>
                      </Link>
                      <Link href="/solar-solutions">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => setIsOpen(false)}>
                          Solar Solutions
                        </Button>
                      </Link>
                      <Link href="/services">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => setIsOpen(false)}>
                          Services
                        </Button>
                      </Link>
                      <Link href="/products">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => setIsOpen(false)}>
                          Products
                        </Button>
                      </Link>
                      <Link href="/projects">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => setIsOpen(false)}>
                          Projects
                        </Button>
                      </Link>
                      <Link href="/contact">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => setIsOpen(false)}>
                          Contact
                        </Button>
                      </Link>
                      {user && (
                        <>
                          <Link href={getDashboardLink()}>
                            <Button variant="ghost" className="w-full justify-start" onClick={() => setIsOpen(false)}>
                              Dashboard
                            </Button>
                          </Link>
                          <Link href="/profile">
                            <Button variant="ghost" className="w-full justify-start" onClick={() => setIsOpen(false)}>
                              Profile
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t">
                    {user ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          logoutMutation.mutate();
                          setIsOpen(false);
                        }}
                      >
                        Log out
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                        onClick={() => {
                          setShowAuthModal(true);
                          setIsOpen(false);
                        }}
                      >
                        Login / Register
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <PureAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </nav>
  );
}