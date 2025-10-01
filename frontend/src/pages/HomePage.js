import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const HomePage = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const heroImages = [
    'https://images.unsplash.com/photo-1696889450800-e94ec7a32206',
    'https://images.unsplash.com/photo-1619470148547-0adbfc64b595',
    'https://images.pexels.com/photos/15878091/pexels-photo-15878091.jpeg',
    'https://images.pexels.com/photos/6539160/pexels-photo-6539160.jpeg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-beige-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="font-serif text-2xl lg:text-3xl font-bold text-maroon-600">
                Stallion & Co.
              </h1>
            </div>
            
            {/* Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('shop')}
                className="text-text-dark hover:text-maroon-600 font-medium transition-colors"
              >
                Shop
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-text-dark hover:text-maroon-600 font-medium transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('guide')}
                className="text-text-dark hover:text-maroon-600 font-medium transition-colors"
              >
                Measurement Guide
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-text-dark hover:text-maroon-600 font-medium transition-colors"
              >
                Contact
              </button>
            </div>
            
            {/* CTA */}
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/virtual-fitting')}
                variant="outline"
                className="hidden sm:inline-flex border-maroon-600 text-maroon-600 hover:bg-maroon-600 hover:text-white"
              >
                Book Virtual Fitting
              </Button>
              <div className="w-6 h-6 cursor-pointer">
                <svg className="w-full h-full text-maroon-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image Carousel */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`Luxury trousers ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ))}
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <h1 className="font-serif text-5xl lg:text-7xl font-bold mb-6 leading-tight slide-up">
            Your Perfect Fit
            <br />
            <span className="text-accent-gold">Starts Here</span>
          </h1>
          <p className="text-xl lg:text-2xl mb-8 opacity-90 font-light fade-in">
            Handcrafted luxury trousers tailored to perfection.
            <br />
            Experience the art of bespoke tailoring.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center scale-in">
            <Button 
              onClick={() => navigate('/product')}
              size="lg"
              className="bg-maroon-600 hover:bg-maroon-700 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all hover:scale-105"
            >
              Explore Collection
            </Button>
            <Button 
              onClick={() => navigate('/virtual-fitting')}
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-maroon-600 px-8 py-4 text-lg font-semibold rounded-lg transition-all"
            >
              Book Consultation
            </Button>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Shop Section */}
      <section id="shop" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-maroon-600 mb-6">
              Premium Collection
            </h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">
              Each piece is meticulously crafted using the finest fabrics and traditional tailoring techniques,
              ensuring an impeccable fit that embodies timeless elegance.
            </p>
          </div>
          
          {/* Product Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <Card className="luxury-card p-8">
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-serif text-3xl font-bold text-maroon-600 mb-3">
                      Premium Tailored Trousers
                    </h3>
                    <p className="text-text-light text-lg leading-relaxed">
                      Our signature trousers represent the pinnacle of sartorial excellence. 
                      Crafted from the world's finest fabrics and tailored to your exact measurements, 
                      each pair is a testament to our commitment to perfection.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-maroon-600 text-lg">Available Fabrics:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {['Premium Wool', 'Egyptian Cotton', 'Italian Linen', 'Silk Blend'].map((fabric) => (
                        <div key={fabric} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-accent-gold rounded-full"></div>
                          <span className="text-text-dark font-medium">{fabric}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-serif text-2xl font-bold text-maroon-600">₹450</span>
                      <span className="text-text-light">Starting price</span>
                    </div>
                    <Button 
                      onClick={() => navigate('/product')}
                      className="w-full bg-maroon-600 hover:bg-maroon-700 text-white py-3 text-lg font-semibold rounded-lg transition-all hover:scale-105"
                    >
                      View Details & Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="relative">
                <img
                  src={heroImages[0]}
                  alt="Premium Tailored Trousers"
                  className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent-gold/20 rounded-full blur-xl"></div>
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-maroon-600/20 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-4xl lg:text-5xl font-bold text-maroon-600 mb-8">
                Crafting Excellence
                <br />
                Since Inception
              </h2>
              <div className="space-y-6 text-lg text-text-dark leading-relaxed">
                <p>
                  At Stallion & Co., we believe that true luxury lies in the perfect marriage of 
                  traditional craftsmanship and contemporary style. Our master tailors bring decades 
                  of experience to every stitch, creating garments that are not just clothing, but 
                  expressions of your personal style.
                </p>
                <p>
                  Each pair of trousers undergoes a meticulous process of measurement, cutting, and 
                  hand-finishing that ensures an impeccable fit. We source only the finest fabrics 
                  from renowned mills around the world, guaranteeing both comfort and durability.
                </p>
                <p>
                  Our commitment to excellence extends beyond the garment itself. From your initial 
                  consultation to the final fitting, we provide a personalized service that reflects 
                  our dedication to your complete satisfaction.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card className="luxury-card p-6 text-center">
                  <CardContent>
                    <div className="w-12 h-12 bg-maroon-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-maroon-600 mb-2">Perfect Fit</h3>
                    <p className="text-text-light text-sm">7-point measurement system for precision</p>
                  </CardContent>
                </Card>
                
                <Card className="luxury-card p-6 text-center">
                  <CardContent>
                    <div className="w-12 h-12 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                      </svg>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-maroon-600 mb-2">Premium Fabrics</h3>
                    <p className="text-text-light text-sm">Sourced from the world's finest mills</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6 mt-12">
                <Card className="luxury-card p-6 text-center">
                  <CardContent>
                    <div className="w-12 h-12 bg-maroon-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-maroon-600 mb-2">Handcrafted</h3>
                    <p className="text-text-light text-sm">Traditional techniques by master tailors</p>
                  </CardContent>
                </Card>
                
                <Card className="luxury-card p-6 text-center">
                  <CardContent>
                    <div className="w-12 h-12 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-maroon-600 mb-2">Lifetime Quality</h3>
                    <p className="text-text-light text-sm">Built to last with our quality guarantee</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-maroon-600">
        <div className="max-w-4xl mx-auto text-center px-6 lg:px-8">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Experience
            <br />
            Luxury Tailoring?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Begin your journey to the perfect fit. Our master tailors are ready to create 
            a garment that's uniquely yours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/product')}
              size="lg"
              className="bg-white text-maroon-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg transition-all hover:scale-105"
            >
              Start Your Order
            </Button>
            <Button 
              onClick={() => navigate('/virtual-fitting')}
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-maroon-600 px-8 py-4 text-lg font-semibold rounded-lg transition-all"
            >
              Book Virtual Fitting
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-text-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="font-serif text-2xl font-bold mb-6">Stallion & Co.</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Crafting luxury garments with timeless elegance and uncompromising quality. 
                Your perfect fit awaits.
              </p>
              <div className="flex space-x-4">
                {/* Social Icons */}
                <div className="w-10 h-10 bg-maroon-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-maroon-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 bg-maroon-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-maroon-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-6">Services</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Bespoke Tailoring</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Virtual Consultations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Measurement Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Alterations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-6">Contact</h4>
              <div className="space-y-3 text-gray-300">
                <p>Email: hello@stallionandco.com</p>
                <p>Phone: +91 98765 43210</p>
                <p>Address: Luxury Tailoring District<br />Mumbai, India</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Stallion & Co. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
