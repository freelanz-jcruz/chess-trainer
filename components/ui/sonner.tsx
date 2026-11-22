'use client';
import type * as React from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useProgress } from '@/lib/progress/store';

// shadcn/ui (MIT), con el tema de la app en lugar de next-themes.
function Toaster(props: ToasterProps) {
  const { progress } = useProgress();
  return (
    <Sonner
      theme={progress.settings.theme === 'light' ? 'light' : 'dark'}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          fontFamily: 'inherit',
        } as React.CSSProperties
      }
      toastOptions={{
        // Los estilos de Sonner no van en capas: hace falta «!» para que las clases ganen.
        classNames: { actionButton: '!bg-primary !text-primary-foreground !font-medium' },
      }}
      {...props}
    />
  );
}

export { Toaster };
