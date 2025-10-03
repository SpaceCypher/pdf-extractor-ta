'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { UserMenu } from '@/components/auth/user-menu';

export function Header() {
  return (
    <header className="flex h-16 items-center gap-4 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex items-center gap-2 flex-1">
        <span className="text-muted-foreground">Dashboard</span>
        <span className="text-muted-foreground">/</span>
        <span>Extraction</span>
      </div>
      <UserMenu />
    </header>
  );
}