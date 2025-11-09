import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white',
        secondary: 'border-transparent bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white',
        destructive: 'border-transparent bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        outline: 'border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white',
        success: 'border-transparent bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
        warning: 'border-transparent bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
        green: 'border-transparent bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
        blue: 'border-transparent bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        orange: 'border-transparent bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
        red: 'border-transparent bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
