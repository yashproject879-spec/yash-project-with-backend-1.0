import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

const MinimalHomePage = () => {
  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden relative" style={{ backgroundColor: '#F7F2DE' }}>
      {/* Background image removed */}

      {/* Minimal Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b" style={{ backgroundColor: '#F7F2DE/95', borderColor: '#6F0914/10' }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-serif text-xl font-bold" style={{ color: '#6F0914' }}>
              Stallion & Co.
            </div>
            <button 
              onClick={() => navigate('/virtual-fitting')}
              className="text-sm font-medium transition-all duration-300 hover:underline hover:underline-offset-4"
              style={{ color: '#6F0914' }}
            >
              Consultation
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Screen */}
      <div className="min-h-screen flex items-center justify-center relative pt-16">
        <div className="max-w-4xl mx-auto px-8 text-center">
          
          {/* Headline First */}
          <div className="space-y-6 mb-12">
            <h1 className="font-serif text-5xl lg:text-7xl font-bold leading-tight" style={{ color: '#6F0914' }}>
              Your Perfect
              <br />
              <span style={{ color: '#2D3748' }}>Fit Starts Here</span>
            </h1>
          </div>
          
          {/* Static Trouser Image - After Headline */}
          <div className="relative flex justify-center items-center mb-8">
            <div className="relative">
              {/* Main Trouser Image - Static */}
              <div 
                className="relative cursor-pointer select-none"
                onClick={() => navigate('/measurements')}
              >
                <div className="relative w-80 h-96 lg:w-96 lg:h-[500px] overflow-hidden rounded-2xl mx-auto" style={{ backgroundColor: '#F7F2DE', border: '1px solid #6F0914/10' }}>
                  {/* Static Trouser Image */}
                  <img
                    src="https://i.imgur.com/WHiM5fP.png"
                    alt="Premium Trousers"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            {/* Fabric Quality Indicator */}
            <div className="absolute top-4 right-4 backdrop-blur-sm rounded-xl p-4 shadow-xl" style={{ backgroundColor: '#F7F2DE/95' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: '#6F0914' }}>Premium Wool</div>
              <div className="flex space-x-1">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D4AF37' }} />
                ))}
              </div>
              <div className="text-xs mt-1" style={{ color: '#6B7280' }}>Italian Mills</div>
            </div>
          </div>
          
          {/* Description and CTA - After Image */}
          <div className="space-y-8 max-w-2xl mx-auto">
            <p className="font-sans text-lg lg:text-xl leading-relaxed" style={{ color: '#4A5568' }}>
              Cut to your proportions.
              <br />
              Designed for an old-money silhouette.
            </p>
            
            {/* Primary CTA */}
            <div className="pt-4">
              <Button
                onClick={() => navigate('/measurements')}
                className="group relative px-10 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-none"
                style={{ 
                  backgroundColor: '#6F0914',
                  color: '#F7F2DE'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#5A0710';
                  e.target.style.boxShadow = '0 25px 50px -12px rgba(111, 9, 20, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#6F0914';
                  e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }}
                data-testid="start-custom-fit-btn"
              >
                <span className="relative z-10">Start Your Custom Fit</span>
              </Button>
              
              <div className="mt-4 text-sm" style={{ color: '#6B7280' }}>
                7-step measurement process • 2-3 weeks delivery
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator (Subtle) */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-30">
          <div className="w-1 h-16 bg-gradient-to-b from-transparent to-transparent" style={{ background: `linear-gradient(to bottom, transparent, #6F0914, transparent)` }} />
        </div>
      </div>
    </div>
  );
};

export default MinimalHomePage;
