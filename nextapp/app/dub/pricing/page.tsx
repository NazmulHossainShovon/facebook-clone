import PlanCard from './components/PlanCard';
import FAQSection from './components/FAQSection';

export default function PricingPage() {
  const pricingPlans = [
    {
      name: 'Basic Plan',
      price: '$3',
      period: '',
      minutes: '15 minutes',
      description: 'Perfect for individuals getting started with video dubbing',
      features: [
        '15 minutes of video dubbing',
        'Access to standard voice options',
        'Download option',
      ],
      cta: 'Get Started',
      mostPopular: true,
    },
  ];

  const faqs = [
    {
      question: 'What counts as a minute?',
      answer: 'One minute refers to one minute of video content that you want dubbed. For example, if you have a 10-minute video, it will count as 10 minutes toward your plan.'
    },
    {
      question: 'Can I switch plans?',
      answer: 'Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect immediately.'
    },
    {
      question: 'Do unused minutes roll over?',
      answer: 'No, unused minutes do not roll over to the next billing cycle. Minutes reset at the beginning of each month.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works best for your video dubbing needs. No
            hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <PlanCard
              key={index}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              minutes={plan.minutes}
              description={plan.description}
              features={plan.features}
              cta={plan.cta}
              mostPopular={plan.mostPopular}
            />
          ))}
        </div>

        <FAQSection faqs={faqs} />
      </div>
    </div>
  );
}
