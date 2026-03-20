"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarLink,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/shadcn/sidebar"
import { DriverIcon } from "@/public/DriverIcon"
import { Bot, Calendar, ChartLine, House, User2, Warehouse } from "lucide-react"

export function AppSidebar() {
  return (
    <Sidebar className="top-[var(--header-height)] bottom-0 h-auto">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarLink icon={House} label="Dashboard"/>
            <SidebarLink icon={Calendar} label="Race Calendar"/>
            <SidebarLink icon={DriverIcon} label="Drivers"/>
            <SidebarLink icon={Warehouse} label="Constructors"/>
            <SidebarLink icon={ChartLine} label="Race Analysis"/>
            <SidebarLink icon={Bot} label="AI Analytics"/>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="text-sm tracking-wider">
              <User2 /> Username
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}