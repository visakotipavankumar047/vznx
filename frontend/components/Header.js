'use client';

import { Search, Bell } from 'lucide-react';
import Image from 'next/image';
import { Button } from './Button';
import { Input } from './Input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/DropdownMenu';

const Header = () => {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-900/60 bg-slate-950/80 px-4 sm:px-6 md:px-8 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-125">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Search..." className="pl-8 bg-slate-900/80 text-slate-100 placeholder:text-slate-500" />
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-slate-300" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Image
                src="https://pbs.twimg.com/profile_images/1780044485541699584/p78MCn3B_400x400.jpg"
                alt="User avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
