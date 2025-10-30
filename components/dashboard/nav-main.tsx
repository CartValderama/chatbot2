"use client";

import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
  onNavigate,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    view?: "dashboard" | "manage-prescriptions" | "manage-reminders" | "health-records" | "manage-medicines" | "manage-doctors";
  }[];
  onNavigate?: (
    view: "dashboard" | "manage-prescriptions" | "manage-reminders" | "health-records" | "manage-medicines" | "manage-doctors"
  ) => void;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={(e) => {
                  if (item.view && onNavigate) {
                    e.preventDefault();
                    onNavigate(item.view);
                  }
                }}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
