'use client';

import Link from 'next/link';

export default function BloxFruitsDPSComparatorLanding() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#f3f4f6' /* bf-sand */ }}
    >
      {/* Header */}
      <header
        className="py-4"
        style={{ backgroundColor: '#1e40af' /* bf-sea */ }}
      ></header>

      {/* Hero Section */}
      <section
        className="py-16"
        style={{
          background:
            'linear-gradient(to bottom, #1e40af 0%, #e0f2fe 100%)' /* bf-sea to bf-wave */,
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Blox Fruits DPS Comparator
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Compare the damage output of different Blox Fruits builds and
            optimize your gameplay
          </p>
          <Link
            href="/dps-comparator/app"
            className="inline-block font-bold py-3 px-8 rounded-full text-lg transition duration-300 shadow-lg"
            style={{
              backgroundColor: '#f59e0b' /* bf-fruit */,
              color: '#1e40af' /* bf-sea */,
            }}
          >
            Start Comparing Builds
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2
            className="text-3xl font-bold text-center mb-12"
            style={{ color: '#1e40af' /* bf-sea */ }}
          >
            Power Up Your Blox Fruits Experience
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div
              className="rounded-lg shadow-md text-center p-6"
              style={{ backgroundColor: '#e0f2fe' /* bf-wave */ }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 m-auto"
                style={{ backgroundColor: '#f59e0b' /* bf-fruit */ }}
              >
                <span className="text-2xl">📊</span>
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: '#1e40af' /* bf-sea */ }}
              >
                Accurate Calculations
              </h3>
              <p className="text-gray-700">
                Our DPS calculator uses the latest game mechanics to provide
                precise damage calculations
              </p>
            </div>
            <div
              className="rounded-lg shadow-md text-center p-6"
              style={{ backgroundColor: '#e0f2fe' /* bf-wave */ }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 m-auto"
                style={{ backgroundColor: '#dc2626' /* bf-treasure */ }}
              >
                <span className="text-2xl">⚔️</span>
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: '#1e40af' /* bf-sea */ }}
              >
                Build Optimization
              </h3>
              <p className="text-gray-700">
                Compare multiple builds to find the optimal setup for your
                playstyle
              </p>
            </div>
            <div
              className="rounded-lg shadow-md text-center p-6"
              style={{ backgroundColor: '#e0f2fe' /* bf-wave */ }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 m-auto"
                style={{ backgroundColor: '#059669' /* bf-island */ }}
              >
                <span className="text-2xl">🎮</span>
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: '#1e40af' /* bf-sea */ }}
              >
                Game Updates
              </h3>
              <p className="text-gray-700">
                Regular updates to match new game patches and mechanics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        className="py-16"
        style={{ backgroundColor: '#e0f2fe' /* bf-wave */ }}
      >
        <div className="container mx-auto px-4">
          <h2
            className="text-3xl font-bold text-center mb-12"
            style={{ color: '#1e40af' /* bf-sea */ }}
          >
            How to Use the DPS Comparator
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center mb-10">
              <div className="md:w-1/3 mb-4 md:mb-0 flex justify-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
                  style={{ backgroundColor: '#f59e0b' /* bf-fruit */ }}
                >
                  1
                </div>
              </div>
              <div className="md:w-2/3 text-center md:text-left">
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: '#1e40af' /* bf-sea */ }}
                >
                  Enter Your Build Details
                </h3>
                <p className="text-gray-700">
                  Input your character's level, stats, and equipped items for
                  each build you want to compare
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center mb-10">
              <div className="md:w-1/3 mb-4 md:mb-0 flex justify-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
                  style={{ backgroundColor: '#059669' /* bf-island */ }}
                >
                  2
                </div>
              </div>
              <div className="md:w-2/3 text-center md:text-left">
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: '#1e40af' /* bf-sea */ }}
                >
                  Calculate DPS
                </h3>
                <p className="text-gray-700">
                  Our algorithm calculates the DPS for each build based on your
                  inputs
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/3 mb-4 md:mb-0 flex justify-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
                  style={{ backgroundColor: '#dc2626' /* bf-treasure */ }}
                >
                  3
                </div>
              </div>
              <div className="md:w-2/3 text-center md:text-left">
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: '#1e40af' /* bf-sea */ }}
                >
                  Analyze Results
                </h3>
                <p className="text-gray-700">
                  Compare the results to determine which build performs better
                  for your needs
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-16"
        style={{ backgroundColor: '#1e40af' /* bf-sea */ }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Optimize Your Builds?
          </h2>
          <p
            className="text-xl mb-8 max-w-2xl mx-auto"
            style={{ color: '#e0f2fe' /* bf-wave */ }}
          >
            Join thousands of Blox Fruits players who use our DPS comparator to
            enhance their gameplay
          </p>
          <Link
            href="/dps-comparator/app"
            className="inline-block font-bold py-3 px-8 rounded-full text-lg transition duration-300 shadow-lg"
            style={{
              backgroundColor: '#f59e0b' /* bf-fruit */,
              color: '#1e40af' /* bf-sea */,
            }}
          >
            Start Comparing Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>
            © {new Date().getFullYear()} Blox Fruits DPS Comparator. This is an
            unofficial tool and is not affiliated with Blox Fruits or OP Games.
          </p>
          <p className="mt-2 text-gray-400">For entertainment purposes only.</p>
        </div>
      </footer>
    </div>
  );
}
