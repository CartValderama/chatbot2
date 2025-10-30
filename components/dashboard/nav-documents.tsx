"use client";

import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavDocuments({
  items,
  onNavigate,
}: {
  items: {
    name: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    view?:
      | "dashboard"
      | "manage-prescriptions"
      | "manage-reminders"
      | "health-records"
      | "manage-medicines"
      | "manage-doctors";
  }[];
  onNavigate?: (
    view:
      | "dashboard"
      | "manage-prescriptions"
      | "manage-reminders"
      | "health-records"
      | "manage-medicines"
      | "manage-doctors"
  ) => void;
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Manage Options</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              tooltip={item.name}
              onClick={(e) => {
                if (item.view && onNavigate) {
                  e.preventDefault();
                  onNavigate(item.view);
                }
              }}
            >
              <item.icon />
              <span>{item.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
