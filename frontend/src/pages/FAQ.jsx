import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const faqs = [
  { q: 'How do I place an order?', a: 'Browse our shop, add items to your cart, and proceed to checkout. Fill in your shipping details, choose a payment method, and confirm your order.' },
  { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery (COD), Khalti, and eSewa. All payments are processed securely.' },
  { q: 'How long does shipping take?', a: 'Standard delivery takes 3-7 business days within Nepal. Free shipping is available on orders over Rs. 2,000.' },
  { q: 'Can I cancel my order?', a: 'Yes, you can cancel your order within 24 hours of placing it or before it is shipped. Visit your Orders page to cancel.' },
  { q: 'How do I return a product?', a: 'If you receive a damaged or incorrect item, contact us within 48 hours of delivery. We will arrange a replacement or refund.' },
  { q: 'Are the products authentic?', a: 'Absolutely. Every artisan and seller is personally verified by our team to ensure authentic Nepali craftsmanship.' },
  { q: 'How do I become a seller?', a: 'Click "Become a Seller" from your profile menu, fill out the application form with your craft story and details, and submit for review.' },
  { q: 'How long does seller verification take?', a: 'Our team reviews applications within 3-5 business days. You will be notified once your application is approved or if more information is needed.' },
  { q: 'Can I track my order?', a: 'Yes, you can track your order status from the Orders page. You will also receive email updates when your order status changes.' },
  { q: 'How do I contact support?', a: 'Visit our Contact page to send us a message, or email us at hello@kalabazaar.com. We typically respond within 24 hours.' },
];

export default function FAQ() {
  usePageTitle('Frequently Asked Questions');
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-heading font-bold text-center mb-2">Frequently Asked Questions</h1>
      <p className="text-text-secondary text-center mb-10">Everything you need to know about Kala Bazaar</p>

      <div className="space-y-2">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border rounded-lg overflow-hidden">
            <button onClick={() => setOpenIdx(openIdx === idx ? null : idx)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
              <span className="font-medium text-sm">{faq.q}</span>
              <ChevronDown size={18} className={`transition-transform flex-shrink-0 ${openIdx === idx ? 'rotate-180' : ''}`} />
            </button>
            {openIdx === idx && (
              <div className="px-5 pb-4">
                <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
