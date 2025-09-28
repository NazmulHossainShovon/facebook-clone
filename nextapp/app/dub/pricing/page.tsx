import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  const pricingPlans = [
    {
      name: 'Basic Plan',
      price: '$4',
      period: '/month',
      minutes: '15 minutes',
      description: 'Perfect for individuals getting started with video dubbing',
      features: [
        '15 minutes of video dubbing per month',
        'Access to standard voice options',
        'Email support',
        'Basic export options'
      ],
      cta: 'Get Started',
      mostPopular: false
    },
    {
      name: 'Pro Plan',
      price: '$10',
      period: '/month',
      minutes: '50 minutes',
      description: 'Ideal for creators and professionals',
      features: [
        '50 minutes of video dubbing per month',
        'Access to premium voices',
        'Priority email support',
        'Advanced export options',
        'Early access to new features'
      ],
      cta: 'Get Pro',
      mostPopular: true
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
            Choose the plan that works best for your video dubbing needs. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                plan.mostPopular 
                  ? 'ring-2 ring-indigo-500 ring-offset-2 transform scale-105' 
                  : 'border border-gray-200'
              }`}
            >
              {plan.mostPopular && (
                <div className="bg-indigo-500 text-white text-center py-2">
                  <span className="font-semibold">Most Popular</span>
                </div>
              )}
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>
                <div className="mb-4">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600"> {plan.period}</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg 
                        className="h-5 w-5 text-green-500 mr-2 mt-0.5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.mostPopular 
                      ? 'bg-indigo-600 hover:bg-indigo-700' 
                      : 'bg-gray-800 hover:bg-gray-900'
                  }`}
                >
                  <Link href="/signup" className="w-full">
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-lg text-gray-900 mb-2">What counts as a minute?</h4>
              <p className="text-gray-600">
                One minute refers to one minute of video content that you want dubbed. 
                For example, if you have a 10-minute video, it will count as 10 minutes toward your plan.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-lg text-gray-900 mb-2">Can I switch plans?</h4>
              <p className="text-gray-600">
                Yes! You can upgrade, downgrade, or cancel your subscription at any time. 
                Changes take effect immediately.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-lg text-gray-900 mb-2">Do unused minutes roll over?</h4>
              <p className="text-gray-600">
                No, unused minutes do not roll over to the next billing cycle. 
                Minutes reset at the beginning of each month.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}