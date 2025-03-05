"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/sidemenu";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Shield,
  Award,
  Settings,
  Menu,
  Swords,
  Calendar,
  Medal,
} from "lucide-react";
import { ModeToggle } from "./ui/modetoggle";

export default function MenuHeader() {
  const path = usePathname();

  const links: {
    title: string;
    href: string;
    icon: React.ReactNode;
    variant: "default" | "ghost";
    label?: string;
  }[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: <Home className="h-4 w-4" />,
      variant: path === "/" ? "default" : "ghost",
    },
    {
      title: "Clan Members",
      href: "/members",
      icon: <Users className="h-4 w-4" />,
      variant: path.startsWith("/members") ? "default" : "ghost",
    },
    {
      title: "Clan Wars",
      href: "/wars",
      icon: <Swords className="h-4 w-4" />,
      variant: path.startsWith("/wars") ? "default" : "ghost",
    },
    {
      title: "War League",
      href: "/warleague/league-info",
      icon: <Medal className="h-4 w-4" />,
      variant: path.startsWith("/warleague") ? "default" : "ghost",
    },
    {
      title: "Events",
      href: "/events",
      icon: <Calendar className="h-4 w-4" />,
      variant: path.startsWith("/events") ? "default" : "ghost",
    },
    {
      title: "Clan Capital",
      href: "/capital",
      icon: <Shield className="h-4 w-4" />,
      variant: path.startsWith("/capital") ? "default" : "ghost",
    },
    {
      title: "Achievements",
      href: "/achievements",
      icon: <Award className="h-4 w-4" />,
      variant: path.startsWith("/achievements") ? "default" : "ghost",
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />,
      variant: path.startsWith("/settings") ? "default" : "ghost",
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="container flex items-center justify-between h-14 px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-4 font-bold text-xl flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              <span>War Boiz</span>
            </div>
            <div className="px-3">
              <h2 className="text-xs font-semibold text-muted-foreground pb-2">
                MENU
              </h2>
              <SidebarNav links={links} className="grid" />
            </div>
          </SheetContent>
        </Sheet>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-4 text-sm font-medium"></ul>
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
