import { Share2, Facebook, MessageCircle, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function ShareButton({ productName, productId }) {
  const [open, setOpen] = useState(false);
  const url = `${window.location.origin}/product/${productId}`;

  const shareLinks = [
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-600', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500', url: `https://wa.me/?text=${encodeURIComponent(`${productName} - ${url}`)}` },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
      setOpen(false);
    } catch { toast.error('Failed to copy'); }
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors" title="Share">
        <Share2 size={18} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg z-20 py-2 min-w-[160px]">
            {shareLinks.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm transition-colors">
                <div className={`${s.color} text-white p-1 rounded`}><s.icon size={14} /></div>
                {s.name}
              </a>
            ))}
            <button onClick={copyLink} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm w-full text-left transition-colors">
              <div className="bg-gray-600 text-white p-1 rounded"><LinkIcon size={14} /></div>
              Copy Link
            </button>
          </div>
        </>
      )}
    </div>
  );
}
