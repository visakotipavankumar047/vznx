'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CheckSquare,
  Package,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from './Button';
import { useTheme } from 'next-themes';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/items', label: 'Items', icon: Package },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/teams', label: 'Teams', icon: Users },
];

const SidebarNav = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme } = useTheme();
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 z-40"
    >
      <div className="flex items-center justify-between">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                  theme === 'dark' ? 'from-primary to-primary/80' : 'from-primary to-primary/80'
                }`}
              />
              <span className="text-lg font-bold text-gray-900 dark:text-white">VZNX</span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="absolute -right-4 top-8">
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
          <Link key={item.label} href={item.href}>
            <Button variant={isActive ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
              <item.icon className="h-5 w-5" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </Link>
        );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Settings className="h-5 w-5" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <HelpCircle className="h-5 w-5" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
              >
                Help
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.aside>
  );
};

export default SidebarNav;