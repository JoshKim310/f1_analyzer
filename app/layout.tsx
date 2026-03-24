import type { Metadata } from "next";
import "./globals.css";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/shadcn/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getNextRaceInfo } from "@/services/nextRace";

export const metadata: Metadata = {
  title: "F1 Analyzer",
  description: "F1 race analytics dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nextRace = await getNextRaceInfo();
  return (
    <html lang="en">
      <body 
      className="dark min-h-svh flex flex-col"
      style={{
        ["--header-height" as string]: "72px",
      }} >
        <Header nextRace={nextRace} />
        <SidebarProvider className="flex-1 min-h-0">
          <AppSidebar/>
          <SidebarInset>
            <main className="flex-1 min-h-0 flex flex-col overflow-auto">
              <SidebarTrigger/>
              {children}
            </main>
            <Footer />
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
