import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-accent text-accent-foreground border border-border',
        primary: 'bg-primary text-primary-foreground border border-primary',
        secondary: 'bg-secondary text-secondary-foreground border border-secondary',
        success: 'bg-green-50 text-green-700 border border-green-200',
        warning: 'bg-amber-50 text-amber-700 border border-amber-200',
        destructive: 'bg-red-50 text-red-700 border border-red-200',
        outline: 'border border-border bg-transparent text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
