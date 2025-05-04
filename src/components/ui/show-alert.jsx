import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function ShowAlert({ open, onHide, message, duration }) {
  const [countdown, setCountdown] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    let timer;
    if (open && duration) {
      setCountdown(duration);
      setIsButtonDisabled(true);
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev > 1) {
            return prev - 1;
          } else {
            clearInterval(timer);
            setIsButtonDisabled(false);
            return 0;
          }
        });
      }, 1000);
    } else if (open && !duration) {
      setIsButtonDisabled(false);
    }

    return () => {
      clearInterval(timer);
    };
  }, [duration, open]);

  const handleOnHide = () => {
    onHide(0);
  };

  const handleContinue = () => {
    onHide(1);
  };

  return (
    <div>
      <AlertDialog open={open} onOpenChange={handleOnHide}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleContinue} disabled={isButtonDisabled}>
              {isButtonDisabled ? `Continue in ${countdown}` : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ShowAlert;