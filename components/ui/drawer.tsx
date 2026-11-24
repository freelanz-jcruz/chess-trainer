'use client';
import type * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { cn } from '@/lib/utils';

// shadcn/ui (MIT): hoja inferior (bottom sheet) y panel lateral derecho (`side="right"`, con `direction="right"` en Drawer).
function Drawer(props: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger(props: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerClose(props: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  overlayClassName,
  side = 'bottom',
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & { overlayClassName?: string; side?: 'bottom' | 'right' }) {
  return (
    <DrawerPrimitive.Portal data-slot="drawer-portal">
      <DrawerOverlay className={overlayClassName} />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          'fixed z-50 flex flex-col border-border bg-popover text-popover-foreground',
          side === 'bottom' && 'inset-x-0 bottom-0 mt-24 max-h-[80vh] rounded-t-xl border-t pb-[env(safe-area-inset-bottom)]',
          side === 'right' &&
            'inset-y-0 right-0 w-[85vw] max-w-sm rounded-none border-l pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)]',
          className,
        )}
        {...props}
      >
        {side === 'bottom' && <div aria-hidden className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/40" />}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="drawer-header" className={cn('flex flex-col gap-1 px-4 pt-3 pb-2', className)} {...props} />;
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return <DrawerPrimitive.Title data-slot="drawer-title" className={cn('text-base font-semibold', className)} {...props} />;
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger };
