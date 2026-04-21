import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import MainSidebar from "./_components/mainSidebar";
import AdminSidebar from "./_components/adminSidebar";
import { getSessionUser } from "@/lib/session";

export default async function Layout({ children }) {
  const user = await getSessionUser();

  return (
    <>
      <SidebarProvider>
        {user.role === "admin" && <AdminSidebar />}

        {user.role === "user" && <MainSidebar />}

        <main className="w-full">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </>
  );
}
