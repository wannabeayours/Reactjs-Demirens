import React, { useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

function AdminModal({ isVisible, onClose, modalTitle, children }) {
  const closeModal = useCallback((e) => {
    if (e.target.id === "wrapper") onClose();
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-50"
      id="wrapper"
      onClick={closeModal}
    >
      <div className="w-[600px] relative">
        <Card>
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-black"
          >
            <X className="w-5 h-5" />
          </Button>

          <CardHeader>
            <CardTitle>{modalTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div>{children}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminModal;
