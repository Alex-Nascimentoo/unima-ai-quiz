import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import MainSidebar from "./_components/mainSidebar";
import AdminSidebar from "./_components/adminSidebar";
import { getSessionUser } from "@/lib/session";
import { logout } from "@/services/auth";

export default async function Layout({ children }) {
  const user = await getSessionUser();

  return (
    <>
      <SidebarProvider>
        {user.role === "admin" && <AdminSidebar user={user} logout={logout} />}

        {user.role === "user" && <MainSidebar user={user} logout={logout} />}

        <main className="w-full">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </>
  );
}
