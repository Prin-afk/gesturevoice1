// src/components/ConfirmAlertModal.js
import React, { useEffect, useState } from "react";

export default function ConfirmAlertModal({ open, recognizedText, onCancel, onConfirm }) {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (!open) return;
    setCount(5);
    const t = setInterval(() => setCount(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [open]);

  useEffect(() => {
    if (open && count <= 0) {
      onConfirm();
    }
  }, [count, open, onConfirm]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 w-96 text-center">
        <h3 className="text-lg font-bold mb-2">Send emergency alert?</h3>
        <p className="mb-4">Detected: <strong>{recognizedText || "—"}</strong></p>
        <p className="mb-4">Message will be sent in <strong>{count}</strong> seconds unless you cancel.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="px-4 py-2 bg-red-500 text-white rounded">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-green-600 text-white rounded">Send Now</button>
        </div>
      </div>
    </div>
  );
}
