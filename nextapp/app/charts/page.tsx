'use client';

import ChartCategoriesSection from 'components/charts/ChartCategoriesSection';
import CTASection from 'components/charts/CTASection';
import FeaturesSection from 'components/charts/FeaturesSection';
import HeroSection from 'components/charts/HeroSection';
import HowItWorksSection from 'components/charts/HowItWorksSection';
import React from 'react';

const ChartsHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <HeroSection />
      <FeaturesSection />
      <ChartCategoriesSection />
      <HowItWorksSection />
      <CTASection />
    </div>
  );
};

export default ChartsHome;
