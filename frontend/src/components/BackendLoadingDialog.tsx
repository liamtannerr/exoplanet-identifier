import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

export function BackendLoadingDialog() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [takingLonger, setTakingLonger] = useState(false);

  useEffect(() => {
    // Avoid flashing the popup when the backend is already awake.
    const showTimer = window.setTimeout(() => setVisible(true), 1000);
    const slowTimer = window.setTimeout(() => setTakingLonger(true), 60000);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(slowTimer);
    };
  }, []);

  return (
    <Dialog open={visible && !dismissed} onOpenChange={open => { if (!open) setDismissed(true); }}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <Loader2 className="animate-spin text-blue-400" size={28} aria-hidden="true" />
        <DialogHeader>
          <DialogTitle>Waking up the universe</DialogTitle>
          <DialogDescription className="text-gray-300" aria-live="polite">
            {takingLonger
              ? "Sorry, this is taking longer than expected. We're still connecting—thanks for your patience!"
              : "Sorry for the wait! Our server is waking up. This should take less than a minute, and your planets will appear automatically once it's ready."}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
