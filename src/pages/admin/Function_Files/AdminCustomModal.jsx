import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

/**
 * AdminCustomModal
 * Generic modal wrapper to reduce repeated header/content markup.
 *
 * Props:
 * - open: boolean
 * - onOpenChange: (open:boolean) => void
 * - title: string | ReactNode
 * - description?: string | ReactNode
 * - children: ReactNode (modal body)
 * - contentClassName?: string (override sizing/styles)
 * - headerClassName?: string
 * - titleClassName?: string
 * - footer?: ReactNode (optional footer/actions)
 */
const AdminCustomModal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  contentClassName = "max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full",
  headerClassName = "",
  titleClassName = "text-xl font-semibold text-gray-900 dark:text-white",
  footer,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClassName}>
        <DialogHeader className={headerClassName}>
          <DialogTitle className={titleClassName}>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {children}
        {footer}
      </DialogContent>
    </Dialog>
  );
};

export default AdminCustomModal;