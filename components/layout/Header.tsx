"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SEULogo } from "@/components/brand/SEULogo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Menu, Settings, LogOut, User } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  // Get user initials for avatar fallback
  const initials = profile?.displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo */}
        <Link href="/dashboard" className="mr-6">
          <SEULogo size="sm" showText={true} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 flex-1">
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-seu-red ${
              pathname === "/dashboard" ? "text-seu-red" : "text-muted-foreground"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/prep"
            className={`text-sm font-medium transition-colors hover:text-seu-red ${
              pathname?.startsWith("/prep") ? "text-seu-red" : "text-muted-foreground"
            }`}
          >
            Sermon Prep
          </Link>
          <Link
            href="/sermons"
            className={`text-sm font-medium transition-colors hover:text-seu-red ${
              pathname?.startsWith("/sermons") ? "text-seu-red" : "text-muted-foreground"
            }`}
          >
            Sermons
          </Link>
          <Link
            href="/community"
            className={`text-sm font-medium transition-colors hover:text-seu-red ${
              pathname === "/community" ? "text-seu-red" : "text-muted-foreground"
            }`}
          >
            Community
          </Link>
          <Link
            href="/sources"
            className={`text-sm font-medium transition-colors hover:text-seu-red ${
              pathname?.startsWith("/sources") ? "text-seu-red" : "text-muted-foreground"
            }`}
          >
            Sources
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4 ml-auto">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.photoURL || undefined} alt={profile?.displayName || "User"} />
                    <AvatarFallback className="bg-seu-red text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.displayName || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-seu-red hover:bg-seu-red-hover">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
