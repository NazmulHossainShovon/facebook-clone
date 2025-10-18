import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Terms and conditions for using our SaaS applications',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
              <p className="text-gray-600 mb-4">
                Welcome to our SaaS platform. These terms and conditions outline the rules and regulations for the use of our services.
              </p>
              <p className="text-gray-600">
                By accessing this website and using our services, we assume you accept these terms and conditions. Do not continue to use our services if you do not agree to all the terms stated here.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Subscription Services</h2>
              <h3 className="text-xl font-medium text-gray-700 mb-3">2.1 Subscription Types</h3>
              <p className="text-gray-600 mb-4">
                Our platform offers various subscription plans with different features and pricing. These plans are subject to change with prior notice to users.
              </p>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">2.2 Billing and Payment</h3>
              <p className="text-gray-600 mb-4">
                All subscription fees must be paid in advance. Your subscription will be automatically renewed at the end of each billing period unless you cancel it.
              </p>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">2.3 Subscription Changes</h3>
              <p className="text-gray-600">
                We reserve the right to modify subscription plans, including features and pricing, with 30 days' prior notice to subscribers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. One-Time Payment Services</h2>
              <p className="text-gray-600 mb-4">
                For one-time payment services, full payment is required at the time of purchase. One-time payments are non-refundable unless otherwise specified.
              </p>
              <p className="text-gray-600">
                One-time purchases may include access to premium features, additional storage, or other value-added services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. User Accounts</h2>
              <p className="text-gray-600 mb-4">
                You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.
              </p>
              <p className="text-gray-600">
                You agree to accept responsibility for all activities that occur under your account or password.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Intellectual Property</h2>
              <p className="text-gray-600 mb-4">
                Unless otherwise stated, our company and/or its licensors own the intellectual property rights for all material on our platform.
              </p>
              <p className="text-gray-600">
                All intellectual property rights are reserved. You may access this from our platform for your own personal use subject to restrictions set in these terms and conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Limitations of Liability</h2>
              <p className="text-gray-600">
                In no event shall our company, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Termination</h2>
              <p className="text-gray-600">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Governing Law</h2>
              <p className="text-gray-600">
                These terms shall be governed and construed in accordance with the laws of your jurisdiction, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Changes to These Terms</h2>
              <p className="text-gray-600">
                We reserve the right to modify or replace these terms at any time. What constitutes a material change will be determined at our sole discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Contact Us</h2>
              <p className="text-gray-600">
                If you have any questions about these Terms and Conditions, please contact us at{' '}
                <a href="mailto:shovon2228@gmail.com" className="text-blue-600 hover:underline">
                  shovon2228@gmail.com
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-10 flex justify-center">
            <Link 
              href="/" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}