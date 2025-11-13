'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Package,
  CheckSquare,
  Users,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { Button } from './Button';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/items', label: 'Items', icon: Package },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/teams', label: 'Teams', icon: Users },
];

const SidebarNav = () => {
  const pathname = usePathname();
  const { isLoaded, user } = useUser();

  const avatar = user?.profileImageUrl || '';
  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Administrator';
  const email = user?.primaryEmailAddress?.emailAddress || '';

  const isActive = (href) => pathname === href || (href !== '/' && pathname?.startsWith(href));

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[280px] flex-col border-r border-slate-900/50 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white shadow-2xl shadow-slate-900/80">
      <div className="flex flex-col gap-2 border-b border-slate-900/70 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-600/40 bg-slate-900 text-white">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 7L12 3l8 4v10l-8 4-8-4V7z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Company</p>
            <p className="text-lg font-bold text-white">VZNX</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition ${
              isActive(item.href)
                ? 'border-blue-500/40 bg-blue-500/15 text-white shadow-[inset_0_0_0_1px_rgba(59,130,246,0.35)]'
                : 'border-transparent text-slate-300 hover:border-slate-800 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <item.icon className="h-5 w-5 text-slate-200" />
            <span className="text-base">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-900/60 px-4 pb-6 pt-4">
        <Button variant="ghost" className="w-full justify-start gap-3 text-slate-200 hover:text-white">
          <Settings className="h-4 w-4 text-slate-300" />
          <span className="text-sm">Profile Settings</span>
        </Button>
        <Button variant="ghost" className="mt-1 w-full justify-start gap-3 text-slate-200 hover:text-white">
          <HelpCircle className="h-4 w-4 text-slate-300" />
          <span className="text-sm">Help</span>
        </Button>
      </div>

      <div className="border-t border-slate-900/60 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 overflow-hidden rounded-2xl bg-slate-200">
            {avatar ? (
              <Image src={avatar} alt={displayName} width={44} height={44} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-indigo-500/90 text-white">
                {displayName?.[0] ?? 'A'}
              </div>
            )}
          </div>
          <div className="flex-1 text-sm">
            <p className="font-semibold text-white">{displayName}</p>
            <p className="text-xs text-slate-400">{email}</p>
          </div>
        </div>
        <div className="mt-4">
          <SignOutButton>
            <Button size="sm" variant="outline" className="w-full justify-center text-xs text-white border-white/30 hover:border-white hover:text-white">
              Logout
            </Button>
          </SignOutButton>
        </div>
      </div>
    </aside>
  );
};

export default SidebarNav;
