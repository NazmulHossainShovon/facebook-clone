'use client';

import {
  PricingHeader,
  PricingPlans,
  FAQSection,
  PricingCTA,
} from '../../../components/charts/pricing';

export default function ChartsPricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PricingHeader />
        <PricingPlans />
        <FAQSection />
        <PricingCTA />
      </div>
    </div>
  );
}