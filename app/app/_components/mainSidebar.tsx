"use client";

import React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import DropdownUser from "./dropdownUser";
import { SessionUser } from "@/lib/_types";

type Props = {
  user: SessionUser;
  logout: () => Promise<void>;
};

export default function MainSidebar(props: Props) {
  return (
    <Sidebar
      className="
      p-4
      bg-sidebar
      "
    >
      <SidebarHeader>
        <h1
          className="
          font-bold text-2xl
          "
        >
          AI Quiz Maker
        </h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quizzes</SidebarGroupLabel>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Link href="/app/student/quiz">Ver quizzes</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownUser user={props.user} logout={props.logout} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
