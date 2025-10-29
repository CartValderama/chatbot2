"use client";

import * as React from "react";
import {
  IconDashboard,
  IconHelp,
  IconInnerShadowTop,
  IconSearch,
  IconSettings,
  IconFileText,
  IconMedicineSyrup,
  IconPlayerRecord,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/dashboard/nav-documents";
import { NavMain } from "@/components/dashboard/nav-main";
import { NavUser } from "@/components/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Dr. Smith",
    email: "doctor@healthcare.com",
    avatar: "/avatars/doctor.jpg",
  },
  navMain: [
    {
      title: "Overview",
      url: "#",
      icon: IconDashboard,
      view: "dashboard" as const,
    },
    {
      title: "Manage Prescriptions",
      url: "#",
      icon: IconFileText,
      view: "manage-prescriptions" as const,
    },
    {
      title: "Health Records",
      url: "#",
      icon: IconPlayerRecord,
      view: "health-records" as const,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Manage Medicines",
      url: "#",
      icon: IconMedicineSyrup,
      view: "manage-medicines" as const,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string;
    email: string;
    avatar: string;
  };
  onNavigate?: (
    view: "dashboard" | "manage-prescriptions" | "health-records" | "manage-medicines"
  ) => void;
}

export function AppSidebar({ user, onNavigate, ...props }: AppSidebarProps) {
  const displayUser = user || data.user;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/doctor-dashboard">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">HealthCare</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} onNavigate={onNavigate} />
        <NavDocuments items={data.documents} onNavigate={onNavigate} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={displayUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
