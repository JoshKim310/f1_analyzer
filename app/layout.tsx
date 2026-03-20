import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/shadcn/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "F1 Analyzer",
  description: "F1 race analytics dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
      className="dark"
      style={{
        ["--header-height" as string]: "72px",
      }} >
        <Header />
        <SidebarProvider className="flex-1 min-h-0">
          <AppSidebar/>
          <main className="flex-1 min-h-0 flex flex-col overflow-auto">
            <SidebarTrigger/>
            {children}
          </main>
        </SidebarProvider>
        <Footer />
      </body>
    </html>
  );
}
