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
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NotificationsDropdown } from "@/components/notifications-dropdown";


export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Don't render until we know the session status to avoid hydration mismatch
  if (status === "loading") {
    return (
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl text-primary font-bold flex flex-row gap-2 items-center">
              <img src="/logo-ico.png" className="h-8"/>
              recalls
            </Link>
            <div className="flex items-center gap-6">
              {/* Loading skeleton */}
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl text-primary font-bold flex flex-row gap-2 items-center">
            <img src="/logo-ico.png" className="h-8"/>
            recalls
          </Link>

          <div className="flex items-center gap-6">
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
        </div>
      </div>
    </nav>
  );
} 