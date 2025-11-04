'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/button';

const ChartsHome = () => {
  const chartCategories = [
    {
      title: '3D Charts',
      description: 'Stunning three-dimensional visualizations not available in Google Sheets',
      charts: ['3D Scatter', '3D Surface', '3D Mesh', '3D Contour', '3D Volume'],
      icon: '🎯',
      color: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Statistical Charts',
      description: 'Advanced statistical visualizations for data analysis',
      charts: ['Violin Plot', 'Contour Plot', 'Heatmap', 'Density Map', '2D Histogram'],
      icon: '📊',
      color: 'from-green-500 to-teal-600'
    },
    {
      title: 'Scientific Charts',
      description: 'Specialized charts for scientific and research applications',
      charts: ['Surface Plot', 'Isosurface', 'Volume Plot', 'Mesh Plot', 'Point Cloud'],
      icon: '🔬',
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Financial Charts',
      description: 'Professional charts for financial data analysis',
      charts: ['Candlestick', 'OHLC', 'Waterfall', 'Funnel', 'Gauge'],
      icon: '💹',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      title: 'Geographical Charts',
      description: 'Interactive maps and geographical visualizations',
      charts: ['Choropleth Map', 'Scatter Geo', 'Mapbox', 'Density Map'],
      icon: '🗺️',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Specialty Charts',
      description: 'Unique and specialized visualization types',
      charts: ['Sunburst', 'Treemap', 'Sankey', 'Parallel Coordinates', 'Icicle'],
      icon: '✨',
      color: 'from-red-500 to-pink-600'
    }
  ];

  const features = [
    {
      title: 'Direct Google Sheets Integration',
      description: 'Simply paste your Google Sheets link and instantly access your data',
      icon: '🔗'
    },
    {
      title: 'Custom Cell Ranges',
      description: 'Select specific data ranges for precise chart generation',
      icon: '📋'
    },
    {
      title: 'Advanced Chart Types',
      description: 'Access 60+ chart types not available in Google Sheets',
      icon: '📈'
    },
    {
      title: 'Full Customization',
      description: 'Customize colors, labels, styling, and interactive features',
      icon: '🎨'
    },
    {
      title: 'High-Performance Rendering',
      description: 'WebGL-powered charts for smooth performance with large datasets',
      icon: '⚡'
    },
    {
      title: 'Export & Share',
      description: 'Download charts in multiple formats or share interactive versions',
      icon: '💾'
    }
  ];

  const steps = [
    {
      step: '1',
      title: 'Paste Google Sheet URL',
      description: 'Copy and paste your Google Sheets link into our interface'
    },
    {
      step: '2',
      title: 'Select Chart Type',
      description: 'Choose from 60+ advanced chart types across multiple categories'
    },
    {
      step: '3',
      title: 'Define Data Ranges',
      description: 'Specify cell ranges for your data source and customize options'
    },
    {
      step: '4',
      title: 'Generate & Customize',
      description: 'Create your chart and fine-tune styling and interactive features'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
              Advanced Charts for{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Google Sheets
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform your Google Sheets data into stunning 3D visualizations, statistical charts, 
              and scientific plots that go far beyond what&apos;s possible in spreadsheets alone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/charts/chart-app">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl transform hover:scale-105 transition-all duration-200">
                  Start Creating Charts
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm"
              >
                View Examples
              </Button>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-400/20 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Choose Our Chart Platform?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Create professional-grade visualizations with features and chart types 
              that traditional spreadsheet applications simply can&apos;t provide.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Categories */}
      <div className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Chart Types Not Available in Google Sheets
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Explore our extensive collection of advanced chart types, from 3D visualizations 
              to specialized statistical and scientific plots.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {chartCategories.map((category, index) => (
              <div key={index} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
                <div className="p-8">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">{category.icon}</span>
                    <h3 className="text-2xl font-bold text-slate-900">
                      {category.title}
                    </h3>
                  </div>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="space-y-2">
                    {category.charts.map((chart, chartIndex) => (
                      <div key={chartIndex} className="flex items-center">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.color} mr-3`}></div>
                        <span className="text-slate-700">{chart}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get from spreadsheet to stunning visualization in just four simple steps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {step.step}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-16 w-full h-0.5 bg-gradient-to-r from-cyan-200 to-blue-200"></div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Data?
          </h2>
          <p className="text-xl text-slate-200 mb-8 leading-relaxed">
            Stop limiting yourself to basic charts. Create professional, interactive 
            visualizations that tell your data&apos;s story like never before.
          </p>
          <Link href="/charts/chart-app">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-12 py-4 text-xl font-semibold rounded-xl shadow-xl transform hover:scale-105 transition-all duration-200">
              Start Creating Now
            </Button>
          </Link>
          <p className="text-slate-300 mt-4 text-sm">
            No signup required • Works with any Google Sheet • Free to use
          </p>
        </div>
        
        {/* Background decorations */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-400/10 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
};

export default ChartsHome;
