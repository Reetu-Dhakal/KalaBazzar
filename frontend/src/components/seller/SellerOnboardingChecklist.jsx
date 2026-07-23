import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Check, X, ArrowRight } from 'lucide-react';

const STORAGE_KEY = 'kalabazaar_seller_onboarding_dismissed';

const checklistItems = [
  { key: 'profile', label: 'Complete your store profile', link: '/seller/settings', done: false },
  { key: 'product', label: 'Add your first product', link: '/seller/dashboard', done: false },
  { key: 'payout', label: 'Link payout details', link: '/seller/settings', done: false },
];

export default function SellerOnboardingChecklist({ profile, productCount = 0 }) {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');
  const [items, setItems] = useState(checklistItems);

  useEffect(() => {
    if (profile) {
      setItems((prev) =>
        prev.map((item) => {
          if (item.key === 'profile' && profile.storeName && profile.bio) return { ...item, done: true };
          if (item.key === 'product' && productCount > 0) return { ...item, done: true };
          if (item.key === 'payout' && (profile.payoutInfo?.bankName || profile.payoutInfo?.esewaId || profile.payoutInfo?.khaltiId)) return { ...item, done: true };
          return item;
        })
      );
    }
  }, [profile, productCount]);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  };

  if (dismissed) return null;
  if (items.every((i) => i.done)) return null;

  return (
    <Card className="mb-8 border-secondary bg-secondary/5">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-heading font-semibold text-lg">Welcome to Kala Bazaar!</h3>
            <p className="text-sm text-text-secondary">Complete these steps to get your store up and running</p>
          </div>
          <button onClick={handleDismiss} className="p-1 hover:bg-white/50 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between bg-white rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.done ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {item.done ? <Check size={14} className="text-green-600" /> : <span className="text-xs text-gray-400">{items.findIndex((i) => i.key === item.key) + 1}</span>}
                </div>
                <span className={`text-sm ${item.done ? 'text-text-muted line-through' : 'font-medium'}`}>{item.label}</span>
              </div>
              {!item.done && (
                <Link to={item.link}>
                  <Button size="sm" variant="outline"><ArrowRight size={14} className="mr-1" /> Go</Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
