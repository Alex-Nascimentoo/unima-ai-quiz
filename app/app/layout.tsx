import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import MainSidebar from "./_components/mainSidebar";

export default function Layout({ children }) {
  return (
    <>
      <SidebarProvider>
        <MainSidebar />
        <main>
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </>
  );
}
