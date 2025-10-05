import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

const HomePage = () => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const basePrice = 450;
  const totalPrice = basePrice * quantity;

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCustomizeNow = () => {
    // Store selection in sessionStorage for measurement flow
    sessionStorage.setItem('productSelection', JSON.stringify({
      quantity: quantity,
      price: basePrice,
      totalPrice: totalPrice,
      fabric: 'Premium Selection'
    }));
    navigate('/measurements');
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC]">
      {/* Header */}
      <header className="bg-[#141F40] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#F5F5DC]">
                Stallion & Co.
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('product-overview')}
                className="text-[#F5F5DC] hover:underline transition-all duration-300"
              >
                Products
              </button>
              <button 
                onClick={() => scrollToSection('customization')}
                className="text-[#F5F5DC] hover:underline transition-all duration-300"
              >
                Customize
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Section 1: Hero Banner */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#141F40] via-[#2a3a5a] to-[#141F40]">
          {/* Video overlay gradient */}
          <div className="absolute inset-0 bg-[#141F40] bg-opacity-40"></div>
          
          {/* Placeholder for horse video - replace with actual video */}
          <div className="absolute inset-0 flex items-center justify-center text-[#F5F5DC] opacity-20">
            <div className="text-center">
              <div className="w-32 h-32 border-2 border-[#F5F5DC] rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-4xl">🏇</span>
              </div>
              <p className="text-sm">Video Background Placeholder</p>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-[#F5F5DC] mb-6 leading-tight">
            Your Perfect Fit
            <br />Starts Here
          </h1>
          
          <p className="text-xl sm:text-2xl text-[#F5F5DC] mb-12 font-light leading-relaxed max-w-2xl mx-auto">
            Heritage tailoring. A silhouette built for you.
          </p>
          
          <Button 
            onClick={() => scrollToSection('product-overview')}
            className="bg-[#6E0A13] hover:bg-[#141F40] text-[#F5F5DC] px-12 py-4 text-xl font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
            size="lg"
          >
            Start Your Custom Fit
          </Button>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <ChevronDown className="w-8 h-8 text-[#F5F5DC] animate-bounce" />
        </div>
      </section>

      {/* Section 2: Product Overview */}
      <section id="product-overview" className="py-20 bg-[#F5F5DC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Product Image */}
            <div className="relative">
              <div className="aspect-[4/5] bg-gradient-to-br from-[#141F40] to-[#2a3a5a] rounded-lg overflow-hidden shadow-2xl">
                {/* Placeholder for product image */}
                <div className="absolute inset-0 flex items-center justify-center text-[#F5F5DC]">
                  <div className="text-center">
                    <div className="w-24 h-32 border-2 border-[#F5F5DC] rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <span className="text-3xl">👔</span>
                    </div>
                    <p className="text-sm opacity-70">Product Image Placeholder</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right: Product Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl sm:text-5xl font-serif font-bold text-[#6E0A13] mb-4">
                  Bespoke Trousers
                </h2>
                
                <div className="text-3xl font-bold text-[#000000] mb-8">
                  ₹{basePrice.toLocaleString()}
                  {quantity > 1 && (
                    <span className="text-xl font-normal text-[#000000] ml-2">
                      × {quantity} = ₹{totalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <p className="text-lg text-[#000000] leading-relaxed mb-8">
                  Handcrafted with precision, tailored to your exact measurements. 
                  Each piece reflects our commitment to exceptional quality and timeless elegance.
                </p>
              </div>
              
              {/* Quantity Selector */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#000000]">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    variant="outline"
                    size="sm"
                    className="border-[#6E0A13] text-[#6E0A13] hover:bg-[#6E0A13] hover:text-[#F5F5DC]"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-xl font-semibold text-[#000000] min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  
                  <Button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10}
                    variant="outline"
                    size="sm"
                    className="border-[#6E0A13] text-[#6E0A13] hover:bg-[#6E0A13] hover:text-[#F5F5DC]"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={handleCustomizeNow}
                className="bg-[#6E0A13] hover:bg-[#141F40] text-[#F5F5DC] px-8 py-4 text-lg font-semibold rounded-full w-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                size="lg"
              >
                Customize Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: 7-Step Preview */}
      <section id="customization" className="py-20 bg-[#F5F5DC]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-[#6E0A13] mb-8">
            Perfect Fit Process
          </h2>
          
          <p className="text-xl text-[#000000] mb-16 leading-relaxed">
            Our 7-step customization process ensures your trousers fit like they were made just for you.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              { step: '1', title: 'Length (Outseam)', desc: 'Perfect trouser length' },
              { step: '2', title: 'Waist', desc: 'Comfortable waistband fit' },
              { step: '3', title: 'Hip / Seat', desc: 'Optimal hip room' },
              { step: '4', title: 'Thigh', desc: 'Thigh comfort zone' },
              { step: '5', title: 'Crotch / Rise', desc: 'Natural rise height' },
              { step: '6', title: 'Bottom Opening', desc: 'Hem circumference' },
              { step: '7', title: 'Your Details', desc: 'Personal preferences' }
            ].map((item, index) => (
              <Card key={index} className="bg-white border-2 border-[#141F40] hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#6E0A13] text-[#F5F5DC] rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-[#6E0A13] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[#000000] text-sm">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Button
            onClick={handleCustomizeNow}
            className="bg-[#6E0A13] hover:bg-[#141F40] text-[#F5F5DC] px-12 py-4 text-xl font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
            size="lg"
          >
            Begin Customization
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#141F40] text-[#F5F5DC] py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-serif font-bold mb-4">Stallion & Co.</h2>
            <p className="text-lg mb-8">Heritage tailoring. Crafted for perfection.</p>
            
            <div className="border-t border-[#F5F5DC] border-opacity-20 pt-8">
              <p className="text-sm opacity-70">
                &copy; 2024 Stallion & Co. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;