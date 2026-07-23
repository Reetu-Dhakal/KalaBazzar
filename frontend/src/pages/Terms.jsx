import usePageTitle from '../hooks/usePageTitle';

export default function Terms() {
  usePageTitle('Terms of Service');
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-heading font-bold mb-2">Terms of Service</h1>
      <p className="text-text-secondary mb-8">Last updated: July 2026</p>

      <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
        <section>
          <h2 className="text-xl font-heading font-semibold text-text mb-3">1. Acceptance of Terms</h2>
          <p>By accessing and using Kala Bazaar, you agree to be bound by these terms. If you do not agree, please do not use our platform.</p>
        </section>
        <section>
          <h2 className="text-xl font-heading font-semibold text-text mb-3">2. Account Registration</h2>
          <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
        </section>
        <section>
          <h2 className="text-xl font-heading font-semibold text-text mb-3">3. Product Listings</h2>
          <p>Sellers are responsible for the accuracy of their product listings, including descriptions, prices, images, and availability. Kala Bazaar reserves the right to remove listings that violate our policies.</p>
        </section>
        <section>
          <h2 className="text-xl font-heading font-semibold text-text mb-3">4. Orders and Payments</h2>
          <p>By placing an order, you agree to pay the listed price plus any applicable shipping charges. Orders are subject to availability and seller confirmation. We reserve the right to cancel any order.</p>
        </section>
        <section>
          <h2 className="text-xl font-heading font-semibold text-text mb-3">5. Shipping and Returns</h2>
          <p>Shipping times are estimates and not guaranteed. Returns are accepted for damaged or incorrect items within 48 hours of delivery. Refunds are processed after the returned item is received and inspected.</p>
        </section>
        <section>
          <h2 className="text-xl font-heading font-semibold text-text mb-3">6. Limitation of Liability</h2>
          <p>Kala Bazaar acts as a marketplace connecting buyers and sellers. We are not liable for disputes between buyers and sellers, product quality issues, or shipping delays beyond our control.</p>
        </section>
        <section>
          <h2 className="text-xl font-heading font-semibold text-text mb-3">7. Changes to Terms</h2>
          <p>We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
        </section>
      </div>
    </div>
  );
}
