"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Users,
  Mail,
  Settings,
  Building2,
  FileText,
  ClipboardCheck,
  ScrollText,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Role = "LEARNER" | "ORG_ADMIN" | "SUPER_ADMIN";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItemsByRole: Record<Role, NavItem[]> = {
  LEARNER: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Modules", href: "/dashboard", icon: BookOpen },
    { label: "Certificate", href: "/certificate", icon: Award },
  ],
  ORG_ADMIN: [
    { label: "Dashboard", href: "/org/dashboard", icon: LayoutDashboard },
    { label: "Learners", href: "/org/learners", icon: Users },
    { label: "Invites", href: "/org/invites", icon: Mail },
    { label: "Settings", href: "/org/settings", icon: Settings },
  ],
  SUPER_ADMIN: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Organizations", href: "/admin/organizations", icon: Building2 },
    { label: "Content", href: "/admin/content", icon: FileText },
    { label: "Assessment", href: "/admin/assessment", icon: ClipboardCheck },
    { label: "Certificates", href: "/admin/certificates", icon: Award },
    { label: "Audit Log", href: "/admin/audit-log", icon: ScrollText },
  ],
};

interface SidebarProps {
  role: Role;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  userName?: string;
  className?: string;
}

export function Sidebar({
  role,
  collapsed = false,
  onToggleCollapse,
  userName,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const items = navItemsByRole[role];

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-full flex-col border-r border-[var(--border)] bg-white transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          className
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-3">
          <Logo collapsed={collapsed} />
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className={cn("hidden lg:flex", collapsed && "mx-auto")}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/"));

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#737852]/10 text-[#737852]"
                    : "text-[#675D4F] hover:bg-[#737852]/5 hover:text-[#737852]"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-[#737852]" : "text-[#675D4F]"
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-[var(--border)] p-3">
          {userName && !collapsed && (
            <p className="mb-2 truncate text-sm font-medium text-[#002060]">
              {userName}
            </p>
          )}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full text-[#675D4F] hover:text-red-600"
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Sign Out
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full justify-start gap-2 text-[#675D4F] hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
