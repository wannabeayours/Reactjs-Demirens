import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * WarningDialog
 * Generic warning/confirmation dialog to reduce repeated markup.
 *
 * Props:
 * - open: boolean
 * - onOpenChange: (open:boolean) => void
 * - title: string | ReactNode
 * - description?: string | ReactNode
 * - children?: ReactNode (optional extra content above actions)
 * - confirmText?: string (default "Confirm")
 * - cancelText?: string (default "Cancel")
 * - onConfirm?: () => void
 * - onCancel?: () => void
 * - confirmDisabled?: boolean
 * - loading?: boolean
 * - icon?: ReactNode (default AlertTriangle)
 * - contentClassName?: string (override DialogContent sizing)
 * - confirmClassName?: string (style confirm button)
 * - cancelVariant?: string (shadcn button variant, default "outline")
 */
const WarningDialog = ({
  open,
  onOpenChange,
  title = "Warning",
  description,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  confirmDisabled = false,
  loading = false,
  icon = <AlertTriangle className="h-5 w-5 text-orange-500" />,
  contentClassName = "max-w-[95vw] sm:max-w-md mx-4",
  confirmClassName = "bg-orange-600 hover:bg-orange-700",
  cancelVariant = "outline",
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClassName}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        {children}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant={cancelVariant}
            onClick={() => {
              onCancel?.();
              onOpenChange?.(false);
            }}
            className="px-6"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={confirmClassName}
            disabled={confirmDisabled || loading}
          >
            {loading ? "Please wait..." : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WarningDialog;