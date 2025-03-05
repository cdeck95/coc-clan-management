"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Shield,
  Swords,
  Ban,
  BarChart3,
  Trophy,
} from "lucide-react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  links: {
    title: string;
    label?: string;
    icon: React.ReactNode;
    variant: "default" | "ghost";
    href: string;
  }[];
}

export function SidebarNav({ className, links, ...props }: SidebarNavProps) {
  return (
    <nav className={cn("grid gap-1", className)} {...props}>
      {links.map((link, index) => (
        <Link key={index} href={link.href}>
          <Button
            variant={link.variant}
            className="w-full justify-start"
            size="sm"
          >
            {link.icon}
            <span className="ml-2">{link.title}</span>
            {link.label && (
              <span className="ml-auto bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-xs">
                {link.label}
              </span>
            )}
          </Button>
        </Link>
      ))}
    </nav>
  );
}

export default function SideMenu() {
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
        path.startsWith("/war") && !path.includes("/warleague")
          ? "default"
          : "ghost",
    },
    {
      title: "Clan War League",
      href: "/warleague/league-info",
      icon: <Trophy className="h-4 w-4" />,
      variant: path.startsWith("/warleague") ? "default" : "ghost",
    },
    {
      title: "Banned",
      href: "/banned",
      icon: <Ban className="h-4 w-4" />,
      variant: path.startsWith("/banned") ? "default" : "ghost",
    },
    {
      title: "Efficiency",
      href: "/efficiency",
      icon: <BarChart3 className="h-4 w-4" />,
      variant: path.startsWith("/efficiency") ? "default" : "ghost",
    },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col bg-background border-r">
      <div className="p-4 font-bold text-xl flex items-center">
        <Shield className="h-5 w-5 mr-2" />
        <span>War Boiz</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3">
          <h2 className="text-xs font-semibold text-muted-foreground pb-2">
            MENU
          </h2>
          <SidebarNav links={links} className="grid" />
        </div>
      </ScrollArea>
    </aside>
  );
}
