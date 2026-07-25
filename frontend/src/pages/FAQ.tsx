import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, Search, MessageSquare } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    title: 'Orders & Shipping',
    items: [
      {
        question: 'How do I place an order?',
        answer:
          'Simply browse our shop, add items to your cart, and proceed to checkout. You can pay via COD, Khalti, or eSewa. After placing an order, you will receive a confirmation email with your order details.',
      },
      {
        question: 'How long does shipping take?',
        answer:
          'Standard shipping within Nepal typically takes 3-7 business days depending on your location. Express shipping is available for faster delivery. Remote areas may take slightly longer.',
      },
      {
        question: 'Do you ship internationally?',
        answer:
          'Currently, we only ship within Nepal. We are working on expanding our shipping to international destinations in the future.',
      },
      {
        question: 'Can I track my order?',
        answer:
          'Yes! Once your order is shipped, you will receive a tracking number via email. You can also track your order status from your Orders page in your account.',
      },
      {
        question: 'What if my order is delayed?',
        answer:
          'If your order is taking longer than expected, please check your tracking information first. If there are issues, contact our support team and we will investigate immediately.',
      },
    ],
  },
  {
    title: 'Payments',
    items: [
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept Cash on Delivery (COD), Khalti digital wallet, and eSewa. All online payments are processed securely.',
      },
      {
        question: 'Is COD available everywhere?',
        answer:
          'COD is available in most areas within Nepal. Some remote locations may only support online payment methods.',
      },
      {
        question: 'Are there any extra charges for online payment?',
        answer:
          'No, there are no additional charges for online payments via Khalti or eSewa. You only pay the listed product price plus shipping.',
      },
      {
        question: 'Can I get a refund if I paid online?',
        answer:
          'Yes, refunds for online payments are processed back to your original payment method within 5-7 business days after the refund is approved.',
      },
    ],
  },
  {
    title: 'Returns & Refunds',
    items: [
      {
        question: 'What is your return policy?',
        answer:
          'We offer a 7-day return policy for most items. Products must be unused, in original packaging, and in the same condition as received. Custom-made items are not eligible for returns.',
      },
      {
        question: 'How do I initiate a return?',
        answer:
          'Go to your Orders page, select the order containing the item you want to return, and click "Request Return." Follow the instructions and we will process your request.',
      },
      {
        question: 'When will I receive my refund?',
        answer:
          'Refunds are processed within 3-5 business days after we receive and inspect the returned item. The refund will be credited to your original payment method.',
      },
      {
        question: 'What if I receive a damaged item?',
        answer:
          'If you receive a damaged item, please contact us within 48 hours with photos of the damage. We will arrange a replacement or full refund immediately.',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        question: 'How do I create an account?',
        answer:
          'Click the "Register" button on the top right corner of the page. Fill in your details including name, email, and password. You will receive a verification email to confirm your account.',
      },
      {
        question: 'I forgot my password. What should I do?',
        answer:
          'Click "Forgot Password" on the login page, enter your email address, and we will send you a password reset link. The link expires after 1 hour.',
      },
      {
        question: 'How do I update my profile information?',
        answer:
          'Go to your Profile page after logging in. You can edit your name, phone number, and manage your saved addresses.',
      },
      {
        question: 'Can I have multiple shipping addresses?',
        answer:
          'Yes! You can save multiple addresses in your profile and select the appropriate one during checkout.',
      },
    ],
  },
  {
    title: 'Seller Questions',
    items: [
      {
        question: 'How do I become a seller on KalaBazzar?',
        answer:
          'Click "Become an Artisan" and fill out the seller application form. You will need to provide information about your craft, experience, and verification documents. Our team will review your application within 3-5 business days.',
      },
      {
        question: 'What are the fees for selling on KalaBazzar?',
        answer:
          'KalaBazzar charges a small commission on each sale. There are no listing fees or monthly charges. You only pay when you make a sale.',
      },
      {
        question: 'How do I receive payments for my sales?',
        answer:
          'Payments are processed through our secure system. You can set up your bank account or digital wallet details in your seller settings. Payouts are made on a regular schedule.',
      },
      {
        question: 'Can I offer custom orders?',
        answer:
          'Yes! You can enable custom orders in your product listings and specify customization options. Customers can then request personalized versions of your products.',
      },
    ],
  },
];

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-foreground pr-4">{item.question}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
          {item.answer}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  usePageTitle();
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return faqData;

    const query = searchQuery.toLowerCase();
    return faqData
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.question.toLowerCase().includes(query) ||
            item.answer.toLowerCase().includes(query),
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-heading text-primary-foreground"
            >
              Frequently Asked Questions
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-primary-foreground/80"
            >
              Find answers to common questions about shopping on KalaBazzar
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Search + FAQ Content */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Search Bar */}
            <motion.div variants={fadeInUp} className="mb-10">
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </motion.div>

            {/* FAQ Categories */}
            <div className="space-y-8">
              {filteredData.map((category) => (
                <motion.div key={category.title} variants={fadeInUp}>
                  <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                    {category.title}
                  </h2>
                  <div className="space-y-3">
                    {category.items.map((item) => {
                      const key = `${category.title}-${item.question}`;
                      return (
                        <AccordionItem
                          key={key}
                          item={item}
                          isOpen={openItems.has(key)}
                          onToggle={() => toggleItem(key)}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              ))}

              {filteredData.length === 0 && (
                <motion.div variants={fadeInUp} className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No questions found matching "{searchQuery}"
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-lg mx-auto"
          >
            <motion.div variants={fadeInUp}>
              <Card>
                <CardContent className="p-8">
                  <MessageSquare className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-heading text-foreground mb-2">
                    Still have questions?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Our support team is here to help. Reach out and we will get
                    back to you as soon as possible.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button asChild>
                      <Link to="/contact">Contact Support</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <a href="mailto:support@kalabazzar.com">Email Us</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
