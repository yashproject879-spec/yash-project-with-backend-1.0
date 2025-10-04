import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Scissors, Star, Users, Award } from 'lucide-react';

const MinimalHomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="backdrop-blur-sm bg-white/70 border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Scissors className="h-8 w-8 text-indigo-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Stallion & Co.
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <span className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">About</span>
              <span className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Services</span>
              <span className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Contact</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Luxury Tailoring
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Redefined
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Experience bespoke craftsmanship with precision measurements and premium fabrics. 
              Every stitch tells a story of excellence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                data-testid="start-measurements-btn"
                onClick={() => navigate('/measurements')} 
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                Start Your Journey
              </Button>
              
              <Button 
                data-testid="virtual-fitting-btn"
                onClick={() => navigate('/virtual-fitting')} 
                variant="outline" 
                className="border-2 border-slate-300 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 px-8 py-4 text-lg rounded-full transition-all duration-300 hover:bg-white/50"
                size="lg"
              >
                Virtual Consultation
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Why Choose Stallion & Co?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Decades of craftsmanship meets modern precision
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Premium Quality</h3>
                <p className="text-slate-600 leading-relaxed">
                  Finest fabrics sourced globally, crafted with meticulous attention to detail by master tailors.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Personal Service</h3>
                <p className="text-slate-600 leading-relaxed">
                  One-on-one consultations to understand your style preferences and perfect fit requirements.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Perfect Fit</h3>
                <p className="text-slate-600 leading-relaxed">
                  Precision measurements and multiple fittings ensure every garment fits like a second skin.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Experience True Luxury?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Begin your bespoke journey today with our precision measurement system.
          </p>
          
          <Button 
            data-testid="get-started-btn"
            onClick={() => navigate('/measurements')} 
            className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            size="lg"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Scissors className="h-6 w-6 text-indigo-400" />
              <span className="text-xl font-bold text-white">Stallion & Co.</span>
            </div>
            
            <div className="text-slate-400 text-center md:text-right">
              <p>&copy; 2024 Stallion & Co. All rights reserved.</p>
              <p className="text-sm mt-1">Crafting excellence since inception</p>
            </div>
          </div>
          
          <Separator className="my-8 bg-slate-700" />
          
          <div className="text-center text-slate-400 text-sm">
            <p>Luxury Tailoring • Bespoke Craftsmanship • Premium Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MinimalHomePage;