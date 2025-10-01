import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const ProductPage = () => {
  const navigate = useNavigate();
  const [selectedFabric, setSelectedFabric] = useState('Premium Wool');
  const [selectedImages, setSelectedImages] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const productImages = [
    'https://images.unsplash.com/photo-1696889450800-e94ec7a32206',
    'https://images.unsplash.com/photo-1619470148547-0adbfc64b595',
    'https://images.pexels.com/photos/15878091/pexels-photo-15878091.jpeg',
    'https://images.pexels.com/photos/6539160/pexels-photo-6539160.jpeg'
  ];
  
  const fabrics = [
    {
      name: 'Premium Wool',
      description: 'Luxurious 100% wool from renowned Scottish mills',
      price: 450,
      features: ['Wrinkle resistant', 'Temperature regulating', 'Durable']
    },
    {
      name: 'Egyptian Cotton',
      description: 'Finest Egyptian cotton with exceptional breathability',
      price: 380,
      features: ['Ultra-soft', 'Breathable', 'Easy care']
    },
    {
      name: 'Italian Linen',
      description: 'Premium Italian linen perfect for warm weather',
      price: 420,
      features: ['Lightweight', 'Natural cooling', 'Elegant drape']
    },
    {
      name: 'Silk Blend',
      description: 'Luxurious silk blend with subtle sheen',
      price: 580,
      features: ['Lustrous finish', 'Comfortable', 'Premium quality']
    }
  ];
  
  const selectedFabricData = fabrics.find(f => f.name === selectedFabric);
  const totalPrice = selectedFabricData.price * quantity;

  const handleProceedToMeasurements = () => {
    // Store product selection in sessionStorage for the measurement flow
    const productSelection = {
      fabric: selectedFabric,
      price: selectedFabricData.price,
      quantity: quantity,
      totalPrice: totalPrice
    };
    
    sessionStorage.setItem('productSelection', JSON.stringify(productSelection));
    toast.success('Product selected! Proceeding to measurements.');
    navigate('/measurements');
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-beige-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-maroon-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="font-serif text-2xl lg:text-3xl font-bold text-maroon-600">
                Stallion & Co.
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/virtual-fitting')}
                variant="outline"
                className="border-maroon-600 text-maroon-600 hover:bg-maroon-600 hover:text-white"
              >
                Virtual Fitting
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={productImages[selectedImages]}
                alt="Premium Tailored Trousers"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImages(index)}
                  className={`aspect-square bg-white rounded-lg overflow-hidden shadow-md transition-all hover:scale-105 ${
                    selectedImages === index ? 'ring-4 ring-maroon-600' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`Trouser view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div>
              <Badge className="mb-4 bg-accent-gold text-white px-3 py-1">
                Premium Collection
              </Badge>
              <h1 className="font-serif text-4xl lg:text-5xl font-bold text-maroon-600 mb-4">
                Premium Tailored Trousers
              </h1>
              <p className="text-xl text-text-light leading-relaxed">
                Experience the pinnacle of sartorial excellence with our handcrafted trousers. 
                Each pair is meticulously tailored to your exact measurements using traditional 
                techniques and the world's finest fabrics.
              </p>
            </div>

            {/* Fabric Selection */}
            <div>
              <h3 className="font-serif text-2xl font-bold text-maroon-600 mb-6">Select Fabric</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fabrics.map((fabric) => (
                  <Card
                    key={fabric.name}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      selectedFabric === fabric.name
                        ? 'ring-4 ring-maroon-600 bg-maroon-50'
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedFabric(fabric.name)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-lg text-maroon-600">{fabric.name}</h4>
                        <span className="font-bold text-xl text-accent-gold">₹{fabric.price}</span>
                      </div>
                      <p className="text-sm text-text-light mb-4">{fabric.description}</p>
                      <div className="space-y-1">
                        {fabric.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-accent-gold rounded-full"></div>
                            <span className="text-sm text-text-dark">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Selected Fabric Details */}
            <Card className="luxury-card">
              <CardContent className="p-6">
                <h4 className="font-serif text-xl font-bold text-maroon-600 mb-4">Selected: {selectedFabric}</h4>
                <p className="text-text-light mb-4">{selectedFabricData.description}</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="font-bold text-2xl text-maroon-600">₹{selectedFabricData.price}</div>
                    <div className="text-sm text-text-light">Base Price</div>
                  </div>
                  <div>
                    <div className="font-bold text-2xl text-accent-gold">7-Point</div>
                    <div className="text-sm text-text-light">Measurements</div>
                  </div>
                  <div>
                    <div className="font-bold text-2xl text-maroon-600">2-3 Weeks</div>
                    <div className="text-sm text-text-light">Delivery</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quantity and Price */}
            <div className="flex items-center justify-between p-6 bg-white rounded-xl shadow-lg">
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-lg text-maroon-600">Quantity:</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-maroon-600 text-white rounded-full flex items-center justify-center hover:bg-maroon-700 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-xl">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 bg-maroon-600 text-white rounded-full flex items-center justify-center hover:bg-maroon-700 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-text-light">Total Price</div>
                <div className="font-serif text-3xl font-bold text-accent-gold">₹{totalPrice}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleProceedToMeasurements}
                className="w-full bg-maroon-600 hover:bg-maroon-700 text-white py-4 text-lg font-semibold rounded-lg transition-all hover:scale-105"
                size="lg"
              >
                Proceed to Measurements
              </Button>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => navigate('/virtual-fitting')}
                  variant="outline"
                  className="border-maroon-600 text-maroon-600 hover:bg-maroon-600 hover:text-white py-3 font-semibold rounded-lg transition-all"
                >
                  Book Virtual Fitting
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="border-gray-300 text-text-dark hover:bg-gray-100 py-3 font-semibold rounded-lg transition-all"
                >
                  Back to Home
                </Button>
              </div>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg text-maroon-600">What's Included</h4>
                <ul className="space-y-2">
                  {[
                    'Personal measurement consultation',
                    'Premium fabric selection',
                    'Expert tailoring & fitting',
                    'Quality assurance check',
                    'Complimentary alterations',
                    'Lifetime care guide'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-accent-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-text-dark">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-lg text-maroon-600">Care Instructions</h4>
                <ul className="space-y-2">
                  {[
                    'Professional dry cleaning recommended',
                    'Store on quality hangers',
                    'Steam to remove wrinkles',
                    'Avoid direct sunlight storage',
                    'Regular brushing maintains fabric',
                    'Follow fabric-specific guidelines'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-maroon-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-text-dark text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
