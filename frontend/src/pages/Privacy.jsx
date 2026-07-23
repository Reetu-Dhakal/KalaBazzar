import usePageTitle from '../hooks/usePageTitle';

export default function Privacy() {
  usePageTitle('Privacy Policy');
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-heading font-bold mb-2">Privacy Policy</h1>
      <p className="text-text-secondary mb-8">Last updated: July 2026</p>

      <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
        <section>
          <h2 className="text-xl font-heading font-semibold text-text mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly, such as your name, email address, phone number, and shipping address when you create an account or place an order. We also collect information about your browsing activity, including products viewed and purchased.</p>
        </section>
        <section>
          <h2 className="text-xl font-heading font-semibold text-text mb-3">2. How We Use Your Information</h2>
          <p>We use your information to process orders, communicate with you about your purchases, improve our services, and send relevant recommendations. We do not sell your personal information to third parties.</p>
        </section>
        <section>
          <h2 className="text-xl font-heading font-semibold text-text mb-3">3. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information. All payment transactions are encrypted and processed through secure gateways. We do not store full payment card details on our servers.</p>
        </section>
        <section>
          <h2 className="text-xl font-heading font-semibold text-text mb-3">4. Cookies</h2>
          <p>We use essential cookies for authentication and session management. Analytics cookies help us understand how you interact with our site. You can control cookie preferences through your browser settings.</p>
        </section>
        <section>
          <h2 className="text-xl font-heading font-semibold text-text mb-3">5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information at any time. You can manage your account settings or contact us to exercise these rights.</p>
        </section>
        <section>
          <h2 className="text-xl font-heading font-semibold text-text mb-3">6. Contact</h2>
          <p>If you have questions about this privacy policy, please contact us at privacy@kalabazaar.com or through our Contact page.</p>
        </section>
      </div>
    </div>
  );
}
