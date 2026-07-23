import { useState } from 'react';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';

export default function CancelOrderModal({ isOpen, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    await onConfirm(reason || 'Cancelled by customer');
    setSubmitting(false);
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-heading font-semibold">Cancel Order</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>
        <p className="text-sm text-text-secondary mb-4">Are you sure you want to cancel this order? This action cannot be undone.</p>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Reason (optional)</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Tell us why you're cancelling..." maxLength={500} />
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={submitting}>Keep Order</Button>
          <Button variant="danger" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Cancelling...' : 'Yes, Cancel Order'}</Button>
        </div>
      </div>
    </div>
  );
}
