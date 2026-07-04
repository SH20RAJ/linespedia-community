"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/lib/store";
import { useUser, useHexclaveApp } from "@hexclave/next";
import { useQuery } from "@tanstack/react-query";
import { Search, PenTool, Sparkles, User, Settings, LogOut, BookMarked, Bell, FileText, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navigation() {
  const pathname = usePathname();
  const hexclaveApp = useHexclaveApp();
  const hexclaveUser = useUser();
  const { setCmdKOpen } = useUIStore();

  // Fetch db user profile info (username, displayName, etc.)
  const { data: meResult } = useQuery({
    queryKey: ["me", hexclaveUser?.id],
    queryFn: async () => {
      if (!hexclaveUser) return null;
      const res = await fetch("/api/v1/users/me");
      if (!res.ok) return null;
      const json = await res.json() as any;
      return json.data;
    },
    enabled: !!hexclaveUser,
  });

  const dbUser = meResult;

  const navigationItems = [
    { name: "Explore", href: "/explore", icon: Sparkles },
    { name: "Create", href: "/create", icon: PenTool },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left section: Logo & Nav items */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-mono text-base font-bold tracking-tight">
              linespedia
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 transition-colors hover:text-foreground/80 ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right section: Actions & Profile */}
        <div className="flex items-center gap-4">
          {/* Search Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCmdKOpen(true)}
            className="relative h-9 w-9 p-0 md:w-40 md:justify-start md:px-3 md:py-2"
          >
            <Search className="h-4 w-4 md:mr-2 opacity-70" />
            <span className="hidden md:inline-flex text-xs text-muted-foreground">Search...</span>
            <kbd className="pointer-events-none absolute right-1.5 hidden h-5 select-none items-center gap-1 border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {hexclaveUser ? (
            <div className="flex items-center gap-3">
              {/* Notifications Icon */}
              <Link href="/notifications" className="relative p-1 text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
                {/* Optional notification badge could go here */}
              </Link>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={dbUser?.avatar || ""} alt={dbUser?.username || "user"} />
                      <AvatarFallback className="text-xs">
                        {dbUser?.username?.slice(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                } />
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{dbUser?.displayName || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          @{dbUser?.username || "username"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={
                    <Link href={dbUser ? `/profile/${dbUser.username}` : "#"} className="cursor-pointer w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  } />
                  <DropdownMenuItem render={
                    <Link href="/saved" className="cursor-pointer w-full">
                      <BookMarked className="mr-2 h-4 w-4" />
                      <span>Saved</span>
                    </Link>
                  } />
                  <DropdownMenuItem render={
                    <Link href="/drafts" className="cursor-pointer w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Drafts</span>
                    </Link>
                  } />
                  <DropdownMenuItem render={
                    <Link href="/settings" className="cursor-pointer w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  } />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await hexclaveApp.redirectToSignOut();
                    }}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await hexclaveApp.redirectToSignIn();
                }}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  await hexclaveApp.redirectToSignUp();
                }}
              >
                Sign Up
              </Button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <Sheet>
            <SheetTrigger render={
              <Button variant="ghost" size="sm" className="p-0 h-9 w-9 md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            } />
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-6">
                <Link href="/" className="font-semibold mb-2">Home</Link>
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground text-sm py-1.5"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
