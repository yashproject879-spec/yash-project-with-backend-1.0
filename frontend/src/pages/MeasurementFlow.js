import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MeasurementFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [productSelection, setProductSelection] = useState(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    // Customer Details
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    bodyType: '',
    specialConsiderations: '',
    
    // Measurements
    height: '',
    weight: '',
    outseam: '',
    waist: '',
    hipSeat: '',
    thigh: '',
    crotchRise: '',
    bottomOpening: '',
    
    // Additional notes
    notes: ''
  });

  useEffect(() => {
    // Check if product selection exists, if not create a default one
    const savedSelection = sessionStorage.getItem('productSelection');
    if (savedSelection) {
      setProductSelection(JSON.parse(savedSelection));
    } else {
      // Set default product selection for Premium Tailored Trousers
      const defaultSelection = {
        fabric: 'Premium Wool',
        price: 450,
        quantity: 1,
        totalPrice: 450
      };
      setProductSelection(defaultSelection);
      sessionStorage.setItem('productSelection', JSON.stringify(defaultSelection));
    }
  }, []);

  const totalSteps = 7;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const submissionData = {
        customer_info: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          age: formData.age ? parseInt(formData.age) : null,
          body_type: formData.bodyType,
          special_considerations: formData.specialConsiderations
        },
        measurements: {
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          outseam: formData.outseam ? parseFloat(formData.outseam) : null,
          waist: formData.waist ? parseFloat(formData.waist) : null,
          hip_seat: formData.hipSeat ? parseFloat(formData.hipSeat) : null,
          thigh: formData.thigh ? parseFloat(formData.thigh) : null,
          crotch_rise: formData.crotchRise ? parseFloat(formData.crotchRise) : null,
          bottom_opening: formData.bottomOpening ? parseFloat(formData.bottomOpening) : null,
          unit: 'cm'
        },
        fabric_choice: productSelection?.fabric,
        notes: formData.notes,
        session_id: `session_${Date.now()}`
      };

      const response = await axios.post(`${API}/measurements`, submissionData);
      
      if (response.data.status === 'success') {
        toast.success('Measurements submitted successfully!');
        // Store submission ID for payment
        sessionStorage.setItem('measurementSubmissionId', response.data.submission_id);
        // Navigate to payment (simulated for now)
        setTimeout(() => {
          toast.success('Order placed successfully! You will receive a confirmation email shortly.');
          navigate('/');
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error submitting measurements:', error);
      toast.error('Failed to submit measurements. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="luxury-card max-w-2xl mx-auto" data-testid="client-details-form">
            <CardHeader>
              <CardTitle className="font-serif text-3xl text-maroon-600 text-center">
                Client Details
              </CardTitle>
              <p className="text-center text-text-light">
                Please provide your personal information for a perfect fit
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName" className="text-maroon-600 font-semibold">First Name *</Label>
                  <Input
                    id="firstName"
                    data-testid="first-name-input"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="measurement-input"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-maroon-600 font-semibold">Last Name *</Label>
                  <Input
                    id="lastName"
                    data-testid="last-name-input"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="measurement-input"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email" className="text-maroon-600 font-semibold">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  data-testid="email-input"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="measurement-input"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone" className="text-maroon-600 font-semibold">Phone Number</Label>
                  <Input
                    id="phone"
                    data-testid="phone-input"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="measurement-input"
                  />
                </div>
                <div>
                  <Label htmlFor="age" className="text-maroon-600 font-semibold">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    data-testid="age-input"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="measurement-input"
                    min="18"
                    max="120"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="bodyType" className="text-maroon-600 font-semibold">Body Type</Label>
                  <Select onValueChange={(value) => handleInputChange('bodyType', value)}>
                    <SelectTrigger data-testid="body-type-select">
                      <SelectValue placeholder="Select body type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slim">Slim</SelectItem>
                      <SelectItem value="athletic">Athletic</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="specialConsiderations" className="text-maroon-600 font-semibold">Special Considerations</Label>
                <Textarea
                  id="specialConsiderations"
                  data-testid="special-considerations-input"
                  value={formData.specialConsiderations}
                  onChange={(e) => handleInputChange('specialConsiderations', e.target.value)}
                  placeholder="Any specific fit preferences or considerations..."
                  className="measurement-input min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="luxury-card max-w-2xl mx-auto" data-testid="basic-measurements-form">
            <CardHeader>
              <CardTitle className="font-serif text-3xl text-maroon-600 text-center">
                Basic Measurements
              </CardTitle>
              <p className="text-center text-text-light">
                Height and weight for initial fitting calculations
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  <Label htmlFor="height" className="text-maroon-600 font-semibold text-lg mb-4 block">
                    Height (cm) *
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    data-testid="height-input"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="measurement-input text-center text-2xl h-16"
                    placeholder="175"
                    min="100"
                    max="250"
                    required
                  />
                  <p className="text-sm text-text-light mt-2">Stand straight against a wall</p>
                </div>
                
                <div className="text-center">
                  <Label htmlFor="weight" className="text-maroon-600 font-semibold text-lg mb-4 block">
                    Weight (kg) *
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    data-testid="weight-input"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="measurement-input text-center text-2xl h-16"
                    placeholder="70"
                    min="30"
                    max="300"
                    required
                  />
                  <p className="text-sm text-text-light mt-2">Morning weight preferred</p>
                </div>
              </div>
              
              <div className="bg-maroon-50 p-6 rounded-lg">
                <h4 className="font-semibold text-maroon-600 mb-3">Measurement Tips:</h4>
                <ul className="space-y-2 text-sm text-text-dark">
                  <li>• Measure in your undergarments for accuracy</li>
                  <li>• Use a measuring tape, not a ruler</li>
                  <li>• Stand naturally, don't suck in your stomach</li>
                  <li>• Have someone help you measure</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="luxury-card max-w-2xl mx-auto" data-testid="outseam-measurement-form">
            <CardHeader>
              <CardTitle className="font-serif text-3xl text-maroon-600 text-center">
                Outseam (Length)
              </CardTitle>
              <p className="text-center text-text-light">
                The outer leg measurement from waist to desired length
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-center">
                <div className="mb-8">
                  <img
                    src="https://images.unsplash.com/photo-1506629905607-d13b02a0d7b4?w=300&h=400&fit=crop"
                    alt="Outseam measurement guide"
                    className="mx-auto rounded-lg shadow-md w-64 h-80 object-cover"
                  />
                </div>
                
                <Label htmlFor="outseam" className="text-maroon-600 font-semibold text-lg mb-4 block">
                  Outseam (cm)
                </Label>
                <Input
                  id="outseam"
                  type="number"
                  data-testid="outseam-input"
                  value={formData.outseam}
                  onChange={(e) => handleInputChange('outseam', e.target.value)}
                  className="measurement-input text-center text-2xl h-16 max-w-sm mx-auto"
                  placeholder="105"
                  min="50"
                  max="150"
                />
              </div>
              
              <div className="bg-beige-50 p-6 rounded-lg">
                <h4 className="font-semibold text-maroon-600 mb-3">How to Measure:</h4>
                <p className="text-text-dark text-sm leading-relaxed">
                  Place the measuring tape at the waistband and measure down the outside of your leg 
                  to where you want the trouser hem to fall. This is typically at the top of your shoe.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="luxury-card max-w-2xl mx-auto" data-testid="waist-measurement-form">
            <CardHeader>
              <CardTitle className="font-serif text-3xl text-maroon-600 text-center">
                Waist Measurement
              </CardTitle>
              <p className="text-center text-text-light">
                Natural waistline measurement for perfect fit
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-center">
                <div className="mb-8">
                  <img
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop"
                    alt="Waist measurement guide"
                    className="mx-auto rounded-lg shadow-md w-64 h-80 object-cover"
                  />
                </div>
                
                <Label htmlFor="waist" className="text-maroon-600 font-semibold text-lg mb-4 block">
                  Waist (cm)
                </Label>
                <Input
                  id="waist"
                  type="number"
                  data-testid="waist-input"
                  value={formData.waist}
                  onChange={(e) => handleInputChange('waist', e.target.value)}
                  className="measurement-input text-center text-2xl h-16 max-w-sm mx-auto"
                  placeholder="85"
                  min="50"
                  max="150"
                />
              </div>
              
              <div className="bg-beige-50 p-6 rounded-lg">
                <h4 className="font-semibold text-maroon-600 mb-3">How to Measure:</h4>
                <p className="text-text-dark text-sm leading-relaxed">
                  Measure around your natural waistline, which is typically the narrowest part of your torso, 
                  usually just above your hip bones. Keep the tape snug but not tight.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="luxury-card max-w-2xl mx-auto" data-testid="hip-seat-measurement-form">
            <CardHeader>
              <CardTitle className="font-serif text-3xl text-maroon-600 text-center">
                Hip/Seat Measurement
              </CardTitle>
              <p className="text-center text-text-light">
                Fullest part of your hips for comfortable seating
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-center">
                <div className="mb-8">
                  <img
                    src="https://images.unsplash.com/photo-1594736797933-d0601ba2fe65?w=300&h=400&fit=crop"
                    alt="Hip measurement guide"
                    className="mx-auto rounded-lg shadow-md w-64 h-80 object-cover"
                  />
                </div>
                
                <Label htmlFor="hipSeat" className="text-maroon-600 font-semibold text-lg mb-4 block">
                  Hip/Seat (cm)
                </Label>
                <Input
                  id="hipSeat"
                  type="number"
                  data-testid="hip-seat-input"
                  value={formData.hipSeat}
                  onChange={(e) => handleInputChange('hipSeat', e.target.value)}
                  className="measurement-input text-center text-2xl h-16 max-w-sm mx-auto"
                  placeholder="95"
                  min="60"
                  max="180"
                />
              </div>
              
              <div className="bg-beige-50 p-6 rounded-lg">
                <h4 className="font-semibold text-maroon-600 mb-3">How to Measure:</h4>
                <p className="text-text-dark text-sm leading-relaxed">
                  Measure around the fullest part of your hips and seat, typically about 7-9 inches 
                  below your waistline. This ensures comfortable fit when sitting.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card className="luxury-card max-w-2xl mx-auto" data-testid="thigh-crotch-measurement-form">
            <CardHeader>
              <CardTitle className="font-serif text-3xl text-maroon-600 text-center">
                Thigh & Crotch Rise
              </CardTitle>
              <p className="text-center text-text-light">
                Thigh circumference and rise measurements
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  <Label htmlFor="thigh" className="text-maroon-600 font-semibold text-lg mb-4 block">
                    Thigh (cm)
                  </Label>
                  <Input
                    id="thigh"
                    type="number"
                    data-testid="thigh-input"
                    value={formData.thigh}
                    onChange={(e) => handleInputChange('thigh', e.target.value)}
                    className="measurement-input text-center text-xl h-14"
                    placeholder="60"
                    min="30"
                    max="100"
                  />
                  <p className="text-sm text-text-light mt-2">Largest part of thigh</p>
                </div>
                
                <div className="text-center">
                  <Label htmlFor="crotchRise" className="text-maroon-600 font-semibold text-lg mb-4 block">
                    Crotch Rise (cm)
                  </Label>
                  <Input
                    id="crotchRise"
                    type="number"
                    data-testid="crotch-rise-input"
                    value={formData.crotchRise}
                    onChange={(e) => handleInputChange('crotchRise', e.target.value)}
                    className="measurement-input text-center text-xl h-14"
                    placeholder="28"
                    min="15"
                    max="50"
                  />
                  <p className="text-sm text-text-light mt-2">Waist to crotch</p>
                </div>
              </div>
              
              <div className="bg-beige-50 p-6 rounded-lg">
                <h4 className="font-semibold text-maroon-600 mb-3">Measurement Guide:</h4>
                <div className="space-y-2 text-sm text-text-dark">
                  <p><strong>Thigh:</strong> Measure around the largest part of your thigh, typically near the top.</p>
                  <p><strong>Crotch Rise:</strong> Sit on a chair and measure from your waistline down to the chair seat.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 7:
        return (
          <Card className="luxury-card max-w-2xl mx-auto" data-testid="final-measurements-form">
            <CardHeader>
              <CardTitle className="font-serif text-3xl text-maroon-600 text-center">
                Final Details
              </CardTitle>
              <p className="text-center text-text-light">
                Bottom opening and any additional notes
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-center">
                <Label htmlFor="bottomOpening" className="text-maroon-600 font-semibold text-lg mb-4 block">
                  Bottom Opening/Hem (cm)
                </Label>
                <Input
                  id="bottomOpening"
                  type="number"
                  data-testid="bottom-opening-input"
                  value={formData.bottomOpening}
                  onChange={(e) => handleInputChange('bottomOpening', e.target.value)}
                  className="measurement-input text-center text-2xl h-16 max-w-sm mx-auto"
                  placeholder="18"
                  min="10"
                  max="40"
                />
                <p className="text-sm text-text-light mt-2">Desired trouser hem width</p>
              </div>
              
              <div>
                <Label htmlFor="notes" className="text-maroon-600 font-semibold text-lg mb-4 block">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  data-testid="additional-notes-input"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any specific styling preferences, alterations, or special requests..."
                  className="measurement-input min-h-[120px]"
                />
              </div>
              
              {productSelection && (
                <div className="bg-maroon-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-maroon-600 mb-3">Order Summary:</h4>
                  <div className="space-y-2 text-text-dark">
                    <p><strong>Product:</strong> Premium Tailored Trousers</p>
                    <p><strong>Fabric:</strong> {productSelection.fabric}</p>
                    <p><strong>Quantity:</strong> {productSelection.quantity}</p>
                    <p className="text-xl font-bold text-accent-gold">
                      <strong>Total: ₹{productSelection.totalPrice}</strong>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email;
      case 2:
        return formData.height && formData.weight;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F2DE' }}>
      {/* Navigation */}
      <nav className="backdrop-blur-md border-b" style={{ backgroundColor: '#F7F2DE/95', borderColor: '#6F0914/20' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 p-2 rounded-full transition-all duration-300"
                style={{ color: '#6F0914' }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#6F0914/10';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="font-serif text-2xl lg:text-3xl font-bold" style={{ color: '#6F0914' }}>
                Stallion & Co.
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="font-semibold" style={{ color: '#6F0914' }}>
                Step {currentStep} of {totalSteps}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <div style={{ backgroundColor: '#F7F2DE', borderBottom: '1px solid #6F0914/10' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="w-full rounded-full h-2" style={{ backgroundColor: '#6F0914/10' }}>
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: '#6F0914'
              }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm" style={{ color: '#6B7280' }}>
            <span>Client Details</span>
            <span>Basic Info</span>
            <span>Outseam</span>
            <span>Waist</span>
            <span>Hip/Seat</span>
            <span>Thigh/Rise</span>
            <span>Final</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 px-6 lg:px-8">
        {renderStep()}
        
        {/* Navigation Buttons */}
        <div className="max-w-2xl mx-auto mt-8 flex justify-between">
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={currentStep === 1}
            className="px-8 py-3 border-2 transition-all duration-300"
            style={{
              borderColor: '#6F0914',
              color: '#6F0914',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.backgroundColor = '#6F0914';
                e.target.style.color = '#F7F2DE';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.target.disabled) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#6F0914';
              }
            }}
            data-testid="previous-step-btn"
          >
            Previous
          </Button>
          
          {currentStep === totalSteps ? (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid() || isLoading}
              className="px-8 py-3 transition-all duration-300"
              style={{ 
                backgroundColor: '#6F0914',
                color: '#F7F2DE'
              }}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  e.target.style.backgroundColor = '#5A0710';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.disabled) {
                  e.target.style.backgroundColor = '#6F0914';
                }
              }}
              data-testid="submit-measurements-btn"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="loading-spinner"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Order'
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="px-8 py-3 transition-all duration-300"
              style={{ 
                backgroundColor: '#6F0914',
                color: '#F7F2DE'
              }}
              onMouseEnter={(e) => {
                if (!e.target.disabled) {
                  e.target.style.backgroundColor = '#5A0710';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.disabled) {
                  e.target.style.backgroundColor = '#6F0914';
                }
              }}
              data-testid="next-step-btn"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeasurementFlow;
