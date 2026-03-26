import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { LogOut, Search, Trees } from "lucide-react";
import { useState } from "react";
import type { Page } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUserProfile } from "../hooks/useQueries";

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isAdmin: boolean;
}

export default function Header({
  currentPage,
  onNavigate,
  isAdmin,
}: HeaderProps) {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const [search, setSearch] = useState("");

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="sticky top-0 z-40 bg-header border-b border-border shadow-xs">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 shrink-0"
          data-ocid="nav.link"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Trees className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">FamTree</span>
        </button>

        {/* Search */}
        <div className="flex-1 max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memories..."
            className="pl-9 rounded-full bg-background border-border text-sm"
            data-ocid="header.search_input"
          />
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-1 ml-2">
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              currentPage === "home"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
            data-ocid="nav.home.link"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate("albums")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              currentPage === "albums"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
            data-ocid="nav.albums.link"
          >
            Albums
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => onNavigate("admin")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                currentPage === "admin"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
              data-ocid="nav.admin.link"
            >
              Settings
            </button>
          )}
        </nav>

        {/* User area */}
        <div className="ml-auto flex items-center gap-3">
          {identity ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full hover:bg-secondary px-2 py-1 transition-colors"
                  data-ocid="header.user.button"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground hidden sm:block">
                    {profile?.name ?? "User"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-popover border-border"
              >
                <DropdownMenuItem
                  onClick={clear}
                  className="text-destructive focus:text-destructive gap-2"
                  data-ocid="header.logout.button"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="bg-primary text-primary-foreground rounded-full px-5 hover:bg-primary/90"
              data-ocid="header.login.button"
            >
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
