'use client';

import { FileText, Settings, BookOpen, Activity } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

// Navigation items
const navigationItems = [
  {
    title: 'New Extraction',
    url: '/',
    icon: FileText,
  },
  {
    title: 'Examples',
    url: '/examples',
    icon: BookOpen,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

// Resource items
const resourceItems = [
  {
    title: 'Console',
    url: '/console',
    icon: Activity,
  },
  {
    title: 'Documentation',
    url: '/docs',
    icon: BookOpen,
  },
  {
    title: 'Contact Support',
    url: '/support',
    icon: FileText,
    external: true,
  },
];



export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="sidebar" className="border-r">
      <SidebarHeader className="p-2">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-blue-600" />
          <span className="text-sm font-semibold">PDF Extractor</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs">Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      href={item.url}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


      </SidebarContent>

      <SidebarFooter className="p-2 border-t">
        <div className="mt-2 flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-xs font-medium text-white">PD</span>
          </div>
          <div className="text-xs">
            <div className="font-medium">PDF Extractor</div>
            <div className="text-muted-foreground">Ready to extract</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}