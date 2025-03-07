"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/sidemenu";
import { usePathname } from "next/navigation";
import { Home, Users, Shield, Menu, Swords, Ban, Trophy } from "lucide-react";
import { ModeToggle } from "./ui/modetoggle";
import { useState } from "react";

export default function MenuHeader() {
  const path = usePathname();
  // Add state to manage the sheet open/close state
  const [open, setOpen] = useState(false);

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
      title: "Members",
      href: "/members",
      icon: <Users className="h-4 w-4" />,
      variant: path.startsWith("/members") ? "default" : "ghost",
    },
    {
      title: "War",
      href: "/war",
      icon: <Swords className="h-4 w-4" />,
      variant:
        path === "/war" || path.startsWith("/war/") ? "default" : "ghost",
    },
    {
      title: "Clan War League",
      href: "/warleague",
      icon: <Trophy className="h-4 w-4" />,
      variant: path.startsWith("/warleague") ? "default" : "ghost",
    },
    {
      title: "Banned",
      href: "/banned",
      icon: <Ban className="h-4 w-4" />,
      variant: path.startsWith("/banned") ? "default" : "ghost",
    },
  ];

  // Function to close the sheet
  const closeSheet = () => {
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="container flex items-center justify-between h-14 px-4 md:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
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
              {/* Pass the closeSheet function to SidebarNav */}
              <SidebarNav
                links={links}
                className="grid"
                onLinkClick={closeSheet}
              />
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
