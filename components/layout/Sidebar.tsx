"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  Users,
  Library,
  Settings,
  PlusCircle,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "New Sermon Prep",
    href: "/prep",
    icon: Sparkles,
    highlight: true,
  },
  {
    title: "My Sermons",
    href: "/sermons/my",
    icon: BookOpen,
  },
  {
    title: "Community",
    href: "/community",
    icon: Users,
  },
  {
    title: "External Sources",
    href: "/sources",
    icon: Library,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "bg-seu-red-light text-seu-red hover:bg-seu-red-light hover:text-seu-red",
                    item.highlight && !isActive && "text-seu-red hover:text-seu-red"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                  {item.highlight && (
                    <PlusCircle className="h-3 w-3 ml-auto" />
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground text-center">
          exAIgesis v1.0
        </p>
        <p className="text-xs text-muted-foreground text-center">
          Southeastern University
        </p>
      </div>
    </div>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
