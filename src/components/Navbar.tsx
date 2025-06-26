'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { useState, useEffect } from 'react';


export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);
  
  // Don't render until we know the session status to avoid hydration mismatch
  if (status === "loading") {
    return (
      <nav className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl text-primary font-bold flex flex-row gap-2 items-center">
              <img src="/logo-ico.png" className="h-8"/>
              recalls
            </Link>
            <div className="flex items-center gap-6">
              {/* Loading skeleton */}
              <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
              <div className="h-9 w-24 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl text-primary font-bold flex flex-row gap-2 items-center">
              <img src="/logo-ico.png" className="h-8"/>
              <span className="hidden sm:inline">recalls</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {session ? (
                <>
                  <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/sets" className="text-sm font-medium hover:text-primary transition-colors">
                    Explore
                  </Link>
                  <Button variant="default" onClick={() => router.push('/sets/new')}>Create Set</Button>
                  <NotificationsDropdown />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        {session.user?.image ? (
                          <img
                            src={session.user.image}
                            alt={session.user.name || 'User'}
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push('/settings')}>
                        <Link href="/settings">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => signOut()}>
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              {session && (
                <NotificationsDropdown />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Side Menu */}
        <div 
          className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-background border-l shadow-2xl transform transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/" className="flex items-center gap-2">
                <img src="/logo-ico.png" className="h-8"/>
                <span className="text-xl font-bold text-primary">recalls</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close mobile menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 p-6 space-y-6">
              {session ? (
                <>
                  <div className="space-y-1">
                    <Link 
                      href="/dashboard" 
                      className="block font-medium hover:text-primary transition-colors py-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/sets" 
                      className="block font-medium hover:text-primary transition-colors py-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Explore
                    </Link>
                  </div>
                  
                  <Button 
                    variant="default" 
                    className="w-full h-12 text-base" 
                    onClick={() => {
                      router.push('/sets/new');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Create Set
                  </Button>
                  
                  <div className="space-y-2 pt-6 border-t">
                    <div className="flex items-center gap-3 pb-4">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{session.user?.name || 'User'}</p>
                        <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                      </div>
                    </div>
                    
                    <Link 
                      href="/settings" 
                      className="block font-medium hover:text-primary transition-colors py-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left font-medium hover:text-primary transition-colors py-3"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-6">Sign in to access your account</p>
                    <Button asChild className="w-full h-12 text-base">
                      <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 