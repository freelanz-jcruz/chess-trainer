'use client';
import { ListOrdered } from 'lucide-react';
import type * as React from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';

/**
 * Información secundaria del panel de un entrenador (lista de jugadas, línea, estadísticas).
 * Con tablero y panel en dos columnas (≥ 820 px) se muestra tal cual; en móvil, para no alargar
 * la página bajo el tablero, queda tras un botón que abre una hoja inferior (Drawer).
 */
export default function PanelExtras({
  title,
  label,
  description,
  children,
}: {
  /** Título de la hoja en móvil. */
  title: string;
  /** Texto del botón que la abre. */
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="hidden gap-3 trainer:grid">{children}</div>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm" className="w-fit trainer:hidden">
            <ListOrdered /> {label}
          </Button>
        </DrawerTrigger>
        {/* Velo suave: el tablero sigue viéndose al tocar una jugada de la lista. */}
        <DrawerContent overlayClassName="bg-black/15">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            {/* Radix pide una descripción; si no hay, queda oculta para lectores de pantalla. */}
            <DrawerDescription className={description ? undefined : 'sr-only'}>{description ?? title}</DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-3 overflow-y-auto px-4 pb-6">{children}</div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
