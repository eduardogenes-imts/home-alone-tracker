'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { AlertTriangle, Trash2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-rose-100 dark:bg-rose-950/50',
    iconColor: 'text-rose-600 dark:text-rose-400',
    buttonVariant: 'destructive' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100 dark:bg-amber-950/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    buttonVariant: 'default' as const,
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100 dark:bg-blue-950/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    buttonVariant: 'default' as const,
  },
};

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const isProcessing = loading || isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn('p-3 rounded-full', config.iconBg)}>
              <Icon className={cn('h-5 w-5', config.iconColor)} aria-hidden="true" />
            </div>
            <div className="flex-1 pt-1">
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-2">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processando...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook helper para facilitar uso
export function useConfirmDialog() {
  const [state, setState] = React.useState<{
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ConfirmDialogVariant;
    onConfirm: () => void | Promise<void>;
  }>({
    open: false,
    title: '',
    onConfirm: () => {},
  });

  const confirm = React.useCallback(
    (options: Omit<typeof state, 'open'>): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({
          ...options,
          open: true,
          onConfirm: async () => {
            await options.onConfirm?.();
            resolve(true);
          },
        });
      });
    },
    []
  );

  const handleOpenChange = React.useCallback((open: boolean) => {
    setState((prev) => ({ ...prev, open }));
  }, []);

  const dialogProps: ConfirmDialogProps = {
    ...state,
    onOpenChange: handleOpenChange,
  };

  return { confirm, dialogProps, ConfirmDialog };
}

export { ConfirmDialog };
