import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/Button';

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

const sections = [
  {
    title: 'Acceptance of Terms',
    content: `By accessing or using KalaBazzar, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.`,
  },
  {
    title: 'Account Terms',
    content: `To use certain features, you must create an account. You are responsible for:
- Maintaining the confidentiality of your password
- All activities that occur under your account
- Providing accurate and complete information
- Notifying us of any unauthorized use

You must be at least 18 years old to create an account.`,
  },
  {
    title: 'Products & Orders',
    content: `All products listed on KalaBazzar are handcrafted by verified artisans. While we strive for accuracy in product descriptions and images:
- Colors may vary slightly due to monitor differences
- Dimensions are approximate and may have minor variations
- We reserve the right to limit order quantities
- Product availability is subject to change without notice

Prices are listed in Nepalese Rupees (NPR) and include applicable taxes unless stated otherwise.`,
  },
  {
    title: 'Payments',
    content: `We accept payments via:
- Cash on Delivery (COD)
- Khalti digital wallet
- eSewa digital wallet

All online payments are processed securely. You agree to pay all charges incurred through your account, including any applicable taxes and shipping fees.`,
  },
  {
    title: 'Shipping',
    content: `We ship to addresses within Nepal. Shipping times are estimates and not guaranteed. We are not responsible for delays caused by:
- Incorrect or incomplete shipping addresses
- Customs processing
- Natural disasters or unforeseen circumstances
- Carrier delays

Risk of loss and title for items pass to you upon delivery.`,
  },
  {
    title: 'Returns & Refunds',
    content: `We offer a 7-day return policy for most items. To be eligible for a return:
- Item must be unused and in original packaging
- Item must be in the same condition as received
- Custom-made items are not eligible for returns
- Proof of purchase is required

Refunds are processed within 3-5 business days after inspection of returned items.`,
  },
  {
    title: 'Intellectual Property',
    content: `All content on KalaBazzar, including text, graphics, logos, and software, is the property of KalaBazzar or its content suppliers and is protected by intellectual property laws.

Artisans retain ownership of their product designs and craft techniques. By listing on KalaBazzar, artisans grant us a license to display and market their products on our platform.`,
  },
  {
    title: 'Limitation of Liability',
    content: `KalaBazzar shall not be liable for:
- Indirect, incidental, or consequential damages
- Loss of profits, data, or business opportunities
- Product quality issues (which are the artisan's responsibility)
- Third-party actions or content

Our total liability shall not exceed the amount paid for the specific transaction giving rise to the claim.`,
  },
  {
    title: 'Governing Law',
    content: `These Terms of Service are governed by and construed in accordance with the laws of Nepal. Any disputes shall be resolved in the courts of Kathmandu, Nepal.`,
  },
  {
    title: 'Contact',
    content: `If you have any questions about these Terms, please contact us:

Email: support@kalabazzar.com
Phone: +977-1-4567890
Address: Kathmandu, Nepal`,
  },
];

export default function Terms() {
  usePageTitle();

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
              Terms of Service
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-primary-foreground/80"
            >
              Last Updated: January 2025
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Back Link */}
            <motion.div variants={fadeInUp} className="mb-8">
              <Button asChild variant="ghost" size="sm">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </motion.div>

            {/* Introduction */}
            <motion.div variants={fadeInUp} className="mb-10">
              <p className="text-muted-foreground leading-relaxed">
                Welcome to KalaBazzar. These Terms of Service govern your use of
                our platform and services. Please read them carefully before
                using our platform.
              </p>
            </motion.div>

            {/* Sections */}
            <div className="space-y-10">
              {sections.map((section) => (
                <motion.div key={section.title} variants={fadeInUp}>
                  <h2 className="text-xl font-heading font-semibold text-foreground mb-3">
                    {section.title}
                  </h2>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
