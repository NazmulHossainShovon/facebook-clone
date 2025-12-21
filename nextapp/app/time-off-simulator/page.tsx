'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { Store } from '../lib/store';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Calendar, Users, BarChart3, Plus, Eye } from 'lucide-react';

const TimeOffSimulatorLanding = () => {
  const {
    state: { userInfo },
  } = useContext(Store);

  const features = [
    {
      icon: Users,
      title: 'Team Management',
      description: 'Create and manage teams with multiple members',
      action: 'Manage Teams',
      href: '/time-off-simulator/app/add-team',
    },
    {
      icon: Calendar,
      title: 'Time Off Planning',
      description: 'Simulate and plan employee time off requests',
      action: 'Plan Time Off',
      href: '/time-off-simulator/app',
    },
    {
      icon: BarChart3,
      title: 'Coverage Visualization',
      description: 'Visualize team coverage and identify staffing gaps',
      action: 'View Coverage',
      href: '/time-off-simulator/app/team-coverage',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Create a Team',
      description: 'Start by creating a new team and adding team members',
    },
    {
      number: '2',
      title: 'Plan Time Off',
      description: 'Simulate time off requests for your team members',
    },
    {
      number: '3',
      title: 'Analyze Coverage',
      description:
        'View detailed coverage reports and identify gaps in staffing',
    },
    {
      number: '4',
      title: 'Optimize Schedules',
      description:
        'Use insights to optimize team schedules and ensure coverage',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center text-center">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Team Coverage Simulator
              </h1>
              <p className="text-slate-600 mt-2">
                Plan time off and visualize team coverage effortlessly
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Never Miss a Staffing Gap Again
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Simulate your team's time off requests and instantly visualize
            coverage across your organization. Identify potential staffing gaps
            and make informed scheduling decisions.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/time-off-simulator/app/add-team"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-all ease-in duration-150 flex items-center gap-2"
            >
              <Plus size={20} />
              Create a Team
            </Link>
            <Link
              href="/time-off-simulator/app/team-coverage"
              className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold px-8 py-3 rounded-lg transition-all ease-in duration-150 flex items-center gap-2"
            >
              <Eye size={20} />
              View Coverage
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <h3 className="text-2xl font-bold text-slate-900 mb-12 text-center">
            Key Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 border border-slate-200"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 mb-4">
                    <IconComponent className="text-blue-600" size={24} />
                  </div>
                  <h4 className="text-xl font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-slate-600 mb-6">{feature.description}</p>
                  <Link
                    href={feature.href}
                    className="inline-block text-blue-600 hover:text-blue-700 font-semibold text-sm"
                  >
                    {feature.action} →
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-20">
          <h3 className="text-2xl font-bold text-slate-900 mb-12 text-center">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold mb-4">
                    {step.number}
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-slate-300 transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-white rounded-lg shadow-md p-12 border border-slate-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-600 text-white">
                  ✓
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">
                  Real-time Coverage Insights
                </h4>
                <p className="text-slate-600 mt-1">
                  Get instant visibility into team availability and staffing
                  levels
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-600 text-white">
                  ✓
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">
                  Proactive Gap Identification
                </h4>
                <p className="text-slate-600 mt-1">
                  Identify critical coverage gaps before they impact operations
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-600 text-white">
                  ✓
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">
                  Better Resource Planning
                </h4>
                <p className="text-slate-600 mt-1">
                  Make data-driven decisions about staffing and scheduling
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-600 text-white">
                  ✓
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">
                  Easy Scenario Testing
                </h4>
                <p className="text-slate-600 mt-1">
                  Simulate different time off scenarios and compare outcomes
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Create your first team and start visualizing coverage today. No
              setup required.
            </p>
            <Link
              href="/time-off-simulator/app/add-team"
              className="inline-block bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-lg transition-all ease-in duration-150"
            >
              Create Your Team Now
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>
            © 2024 Team Coverage Simulator. Helping teams plan better
            schedules.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TimeOffSimulatorLanding;
