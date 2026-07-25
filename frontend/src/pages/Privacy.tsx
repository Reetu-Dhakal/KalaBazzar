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
    title: 'Information We Collect',
    content: `We collect information you provide directly to us, including:
- Account information (name, email, phone number)
- Payment and transaction information
- Shipping addresses
- Product reviews and communications
- Device and browser information for security purposes`,
  },
  {
    title: 'How We Use Your Information',
    content: `We use the information we collect to:
- Process and fulfill your orders
- Communicate with you about orders, products, and services
- Personalize your shopping experience
- Improve our platform and services
- Send marketing communications (with your consent)
- Detect and prevent fraud or unauthorized access`,
  },
  {
    title: 'Information Sharing',
    content: `We may share your information with:
- Sellers (to fulfill your orders)
- Payment processors (for secure transactions)
- Shipping partners (for delivery)
- Legal authorities (when required by law)
- Service providers who assist in our operations

We do not sell your personal information to third parties.`,
  },
  {
    title: 'Data Security',
    content: `We implement appropriate security measures to protect your personal information, including:
- Encryption of sensitive data in transit
- Secure storage of payment information
- Regular security assessments
- Limited access to personal information by authorized personnel`,
  },
  {
    title: 'Cookies',
    content: `We use cookies and similar technologies to:
- Maintain your session and preferences
- Analyze platform usage
- Improve security
- Provide personalized content

You can control cookie settings through your browser preferences.`,
  },
  {
    title: 'Your Rights',
    content: `You have the right to:
- Access and review your personal information
- Update or correct your information
- Delete your account and associated data
- Opt out of marketing communications
- Request a copy of your data

To exercise these rights, please contact us at support@kalabazzar.com.`,
  },
  {
    title: "Children's Privacy",
    content: `KalaBazzar is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.`,
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.`,
  },
  {
    title: 'Contact Us',
    content: `If you have any questions about this Privacy Policy, please contact us:

Email: support@kalabazzar.com
Phone: +977-1-4567890
Address: Kathmandu, Nepal`,
  },
];

export default function Privacy() {
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
              Privacy Policy
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
                At KalaBazzar, we are committed to protecting your privacy. This
                Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our platform.
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
