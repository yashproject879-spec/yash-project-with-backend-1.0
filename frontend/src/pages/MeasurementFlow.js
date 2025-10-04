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

const MeasurementFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  
  // Form state
  const [customerInfo, setCustomerInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    age: '',
    body_type: '',
    special_considerations: ''
  });
  
  const [measurements, setMeasurements] = useState({
    height: '',
    weight: '',
    waist: '',
    hip_seat: '',
    thigh: '',
    crotch_rise: '',
    outseam: '',
    bottom_opening: '',
    unit: 'cm'
  });
  
  const [orderDetails, setOrderDetails] = useState({
    fabric_choice: '',
    style_preferences: '',
    notes: '',
    quantity: 1
  });

  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleMeasurementChange = (field, value) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };

  const handleOrderDetailsChange = (field, value) => {
    setOrderDetails(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!customerInfo.first_name || !customerInfo.last_name || !customerInfo.email) {
        toast.error('Please fill in all required customer information fields');
        return false;
      }
      // Email validation
      const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
      if (!emailRegex.test(customerInfo.email)) {
        toast.error('Please enter a valid email address');
        return false;
      }
    }
    
    if (step === 2) {
      if (!measurements.height || !measurements.weight) {
        toast.error('Height and weight are required measurements');
        return false;
      }
      if (parseFloat(measurements.height) < 100 || parseFloat(measurements.height) > 250) {
        toast.error('Height must be between 100-250 cm');
        return false;
      }
      if (parseFloat(measurements.weight) < 30 || parseFloat(measurements.weight) > 300) {
        toast.error('Weight must be between 30-300 kg');
        return false;
      }
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitOrder = async () => {
    if (!validateStep(2)) return; // Validate measurements again
    
    setIsLoading(true);
    
    try {
      const submissionData = {
        customer_info: {
          ...customerInfo,
          age: customerInfo.age ? parseInt(customerInfo.age) : null
        },
        measurements: {
          ...measurements,
          height: parseFloat(measurements.height),
          weight: parseFloat(measurements.weight),
          waist: measurements.waist ? parseFloat(measurements.waist) : null,
          hip_seat: measurements.hip_seat ? parseFloat(measurements.hip_seat) : null,
          thigh: measurements.thigh ? parseFloat(measurements.thigh) : null,
          crotch_rise: measurements.crotch_rise ? parseFloat(measurements.crotch_rise) : null,
          outseam: measurements.outseam ? parseFloat(measurements.outseam) : null,
          bottom_opening: measurements.bottom_opening ? parseFloat(measurements.bottom_opening) : null
        },
        fabric_choice: orderDetails.fabric_choice,
        style_preferences: orderDetails.style_preferences,
        notes: orderDetails.notes,
        quantity: orderDetails.quantity
      };
      
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/measurements`,
        submissionData
      );
      
      if (response.data.status === 'success') {
        setSubmissionId(response.data.submission_id);
        setCurrentStep(4); // Move to payment step
        toast.success('Measurements submitted successfully!');
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit measurements. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const initiatePayment = async () => {
    if (!submissionId) {
      toast.error('No submission found. Please start over.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create payment order
      const orderResponse = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/create-payment-order`,
        {
          submission_id: submissionId,
          quantity: orderDetails.quantity
        }
      );
      
      const { order_id, amount, currency, key } = orderResponse.data;
      
      // Initialize Razorpay
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'Stallion & Co.',
        description: 'Premium Tailored Trousers',
        order_id: order_id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              `${process.env.REACT_APP_BACKEND_URL}/api/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                submission_id: submissionId
              }
            );
            
            if (verifyResponse.data.status === 'success') {
              toast.success('Payment successful! Order confirmed.');
              // Redirect to success page or order status
              setTimeout(() => {
                navigate('/');
              }, 2000);
            }
            
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: `${customerInfo.first_name} ${customerInfo.last_name}`,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        theme: {
          color: '#4F46E5'
        },
        modal: {
          ondismiss: function() {
            toast.warning('Payment cancelled');
          }
        }
      };
      
      if (window.Razorpay) {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        toast.error('Payment system not loaded. Please refresh the page.');
      }
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-indigo-600" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" data-testid="first-name-label">First Name *</Label>
                  <Input
                    id="firstName"
                    data-testid="first-name-input"
                    value={customerInfo.first_name}
                    onChange={(e) => handleCustomerInfoChange('first_name', e.target.value)}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" data-testid="last-name-label">Last Name *</Label>
                  <Input
                    id="lastName"
                    data-testid="last-name-input"
                    value={customerInfo.last_name}
                    onChange={(e) => handleCustomerInfoChange('last_name', e.target.value)}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email" data-testid="email-label">Email Address *</Label>
                <Input
                  id="email"
                  data-testid="email-input"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" data-testid="phone-label">Phone Number</Label>
                  <Input
                    id="phone"
                    data-testid="phone-input"
                    value={customerInfo.phone}
                    onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <Label htmlFor="age" data-testid="age-label">Age</Label>
                  <Input
                    id="age"
                    data-testid="age-input"
                    type="number"
                    min="18"
                    max="120"
                    value={customerInfo.age}
                    onChange={(e) => handleCustomerInfoChange('age', e.target.value)}
                    placeholder="25"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bodyType" data-testid="body-type-label">Body Type (Optional)</Label>
                <Select value={customerInfo.body_type} onValueChange={(value) => handleCustomerInfoChange('body_type', value)}>
                  <SelectTrigger data-testid="body-type-select">
                    <SelectValue placeholder="Select your body type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slim">Slim</SelectItem>
                    <SelectItem value="athletic">Athletic</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="broad">Broad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="specialConsiderations" data-testid="special-considerations-label">Special Fitting Considerations</Label>
                <Textarea
                  id="specialConsiderations"
                  data-testid="special-considerations-input"
                  value={customerInfo.special_considerations}
                  onChange={(e) => handleCustomerInfoChange('special_considerations', e.target.value)}
                  placeholder="Any special requirements or preferences..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );
      
      case 2:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Ruler className="h-5 w-5 text-indigo-600" />
                <span>Measurements</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height" data-testid="height-label">Height (cm) *</Label>
                  <Input
                    id="height"
                    data-testid="height-input"
                    type="number"
                    step="0.1"
                    min="100"
                    max="250"
                    value={measurements.height}
                    onChange={(e) => handleMeasurementChange('height', e.target.value)}
                    placeholder="175"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="weight" data-testid="weight-label">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    data-testid="weight-input"
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    value={measurements.weight}
                    onChange={(e) => handleMeasurementChange('weight', e.target.value)}
                    placeholder="70"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="waist" data-testid="waist-label">Waist (cm)</Label>
                  <Input
                    id="waist"
                    data-testid="waist-input"
                    type="number"
                    step="0.1"
                    value={measurements.waist}
                    onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                    placeholder="32"
                  />
                </div>
                <div>
                  <Label htmlFor="hipSeat" data-testid="hip-seat-label">Hip/Seat (cm)</Label>
                  <Input
                    id="hipSeat"
                    data-testid="hip-seat-input"
                    type="number"
                    step="0.1"
                    value={measurements.hip_seat}
                    onChange={(e) => handleMeasurementChange('hip_seat', e.target.value)}
                    placeholder="36"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="thigh" data-testid="thigh-label">Thigh (cm)</Label>
                  <Input
                    id="thigh"
                    data-testid="thigh-input"
                    type="number"
                    step="0.1"
                    value={measurements.thigh}
                    onChange={(e) => handleMeasurementChange('thigh', e.target.value)}
                    placeholder="24"
                  />
                </div>
                <div>
                  <Label htmlFor="crothRise" data-testid="crotch-rise-label">Crotch Rise (cm)</Label>
                  <Input
                    id="crothRise"
                    data-testid="crotch-rise-input"
                    type="number"
                    step="0.1"
                    value={measurements.crotch_rise}
                    onChange={(e) => handleMeasurementChange('crotch_rise', e.target.value)}
                    placeholder="28"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="outseam" data-testid="outseam-label">Outseam (cm)</Label>
                  <Input
                    id="outseam"
                    data-testid="outseam-input"
                    type="number"
                    step="0.1"
                    value={measurements.outseam}
                    onChange={(e) => handleMeasurementChange('outseam', e.target.value)}
                    placeholder="110"
                  />
                </div>
                <div>
                  <Label htmlFor="bottomOpening" data-testid="bottom-opening-label">Bottom Opening (cm)</Label>
                  <Input
                    id="bottomOpening"
                    data-testid="bottom-opening-input"
                    type="number"
                    step="0.1"
                    value={measurements.bottom_opening}
                    onChange={(e) => handleMeasurementChange('bottom_opening', e.target.value)}
                    placeholder="18"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 3:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Order Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="quantity" data-testid="quantity-label">Quantity</Label>
                <Select value={orderDetails.quantity.toString()} onValueChange={(value) => handleOrderDetailsChange('quantity', parseInt(value))}>
                  <SelectTrigger data-testid="quantity-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num} trouser{num > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="fabric" data-testid="fabric-label">Fabric Choice</Label>
                <Select value={orderDetails.fabric_choice} onValueChange={(value) => handleOrderDetailsChange('fabric_choice', value)}>
                  <SelectTrigger data-testid="fabric-select">
                    <SelectValue placeholder="Select fabric type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wool">Premium Wool</SelectItem>
                    <SelectItem value="cotton">Cotton Blend</SelectItem>
                    <SelectItem value="linen">Linen</SelectItem>
                    <SelectItem value="silk">Silk Blend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="stylePreferences" data-testid="style-preferences-label">Style Preferences</Label>
                <Textarea
                  id="stylePreferences"
                  data-testid="style-preferences-input"
                  value={orderDetails.style_preferences}
                  onChange={(e) => handleOrderDetailsChange('style_preferences', e.target.value)}
                  placeholder="Slim fit, tapered legs, flat front, etc..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="notes" data-testid="notes-label">Additional Notes</Label>
                <Textarea
                  id="notes"
                  data-testid="notes-input"
                  value={orderDetails.notes}
                  onChange={(e) => handleOrderDetailsChange('notes', e.target.value)}
                  placeholder="Any special requests or instructions..."
                  rows={3}
                />
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">Order Summary</h3>
                <div className="space-y-1 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Premium Tailored Trousers × {orderDetails.quantity}</span>
                    <span>₹{(450 * orderDetails.quantity).toLocaleString()}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span>Total Amount</span>
                    <span data-testid="total-amount">₹{(450 * orderDetails.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 4:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <span>Payment & Confirmation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Order Submitted Successfully!</h3>
                <p className="text-green-700 text-sm">
                  Your measurements have been recorded. Complete payment to confirm your order.
                </p>
                {submissionId && (
                  <div className="mt-2">
                    <Badge variant="secondary" data-testid="order-id-badge">
                      Order ID: {submissionId.slice(0, 8)}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">Final Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span data-testid="customer-name">{customerInfo.first_name} {customerInfo.last_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span data-testid="customer-email">{customerInfo.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Product:</span>
                    <span>Premium Tailored Trousers</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span data-testid="order-quantity">{orderDetails.quantity}</span>
                  </div>
                  {orderDetails.fabric_choice && (
                    <div className="flex justify-between">
                      <span>Fabric:</span>
                      <span data-testid="fabric-choice">{orderDetails.fabric_choice}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span data-testid="final-total">₹{(450 * orderDetails.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button
                  data-testid="pay-now-btn"
                  onClick={initiatePayment}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  {isLoading ? 'Processing...' : 'Pay Now'}
                </Button>
                
                <p className="text-xs text-slate-500 mt-2">
                  Secure payment powered by Razorpay
                </p>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="backdrop-blur-sm bg-white/70 border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                data-testid="back-home-btn"
                variant="ghost" 
                onClick={() => navigate('/')} 
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <Scissors className="h-8 w-8 text-indigo-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Stallion & Co.
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300
                  ${
                    currentStep >= step
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }
                `} data-testid={`step-${step}-indicator`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`
                    w-16 h-1 transition-all duration-300
                    ${
                      currentStep > step
                        ? 'bg-indigo-600'
                        : 'bg-slate-200'
                    }
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2" data-testid="step-title">
            {currentStep === 1 && 'Personal Information'}
            {currentStep === 2 && 'Measurements'}
            {currentStep === 3 && 'Order Preferences'}
            {currentStep === 4 && 'Payment & Confirmation'}
          </h1>
          <p className="text-slate-600">
            {currentStep === 1 && 'Tell us about yourself'}
            {currentStep === 2 && 'Provide your precise measurements'}
            {currentStep === 3 && 'Customize your order'}
            {currentStep === 4 && 'Complete your order'}
          </p>
        </div>

        {renderStepContent()}

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex justify-between mt-8 max-w-2xl mx-auto">
            <Button
              data-testid="prev-step-btn"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2"
            >
              Previous
            </Button>
            
            {currentStep === 3 ? (
              <Button
                data-testid="submit-order-btn"
                onClick={submitOrder}
                disabled={isLoading}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-2"
              >
                {isLoading ? 'Submitting...' : 'Submit Order'}
              </Button>
            ) : (
              <Button
                data-testid="next-step-btn"
                onClick={nextStep}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-2"
              >
                Next Step
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
};

export default MeasurementFlow;