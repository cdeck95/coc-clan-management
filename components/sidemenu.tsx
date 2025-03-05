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
  Award,
  Settings,
  Swords,
  Calendar,
  Medal,
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
