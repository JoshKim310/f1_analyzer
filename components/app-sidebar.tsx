"use client"
import { DriverIcon } from "@/public/DriverIcon"
import { Bot, Calendar, ChartLine, House, User2, Warehouse } from "lucide-react"
import { usePathname } from "next/navigation"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarLink, SidebarMenu } from "./shadcn/sidebar";

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <Sidebar className="top-[var(--header-height)] bottom-0 h-auto">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarLink link="/" active={isActive("/")} icon={House} label="Dashboard" />
            <SidebarLink link="/race-calendar" active={isActive("/race-calendar")} icon={Calendar} label="Race Calendar"/>
            <SidebarLink link="/drivers" active={isActive("/drivers")} icon={DriverIcon} label="Drivers"/>
            <SidebarLink link="/constructors" active={isActive("/constructors")} icon={Warehouse} label="Constructors"/>
            <SidebarLink link="/race-analysis" active={isActive("/race-analysis")} icon={ChartLine} label="Race Analysis"/>
            <SidebarLink link="/ai-analytics" active={isActive("/ai-analytics")} icon={Bot} label="AI Analytics"/>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarLink link="/profile" active={isActive("/profile")} icon={User2} label="Username"/>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}