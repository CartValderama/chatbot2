"use client";

import { type Icon } from "@tabler/icons-react";

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
    icon: Icon;
    view?: "dashboard" | "manage-prescriptions" | "health-records" | "manage-medicines";
  }[];
  onNavigate?: (
    view: "dashboard" | "manage-prescriptions" | "health-records" | "manage-medicines"
  ) => void;
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>
        Manage the list of available medicines.
      </SidebarGroupLabel>
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
