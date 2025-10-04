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
  
  // Get product selection from sessionStorage
  const [productSelection, setProductSelection] = useState(null);
  
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

  const [images, setImages] = useState({
    front_view: null,
    side_view: null,
    reference_fit: null
  });

  const [uploadedImages, setUploadedImages] = useState({
    front_view: '',
    side_view: '',
    reference_fit: ''
  });

  useEffect(() => {
    // Load product selection from sessionStorage
    const stored = sessionStorage.getItem('productSelection');
    if (stored) {
      const selection = JSON.parse(stored);
      setProductSelection(selection);
      setOrderDetails(prev => ({ 
        ...prev, 
        fabric_choice: selection.fabric || '',
        quantity: selection.quantity || 1 
      }));
    }
  }, []);

  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleMeasurementChange = (field, value) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };

  const handleOrderDetailsChange = (field, value) => {
    setOrderDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file, imageType) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('image_type', imageType);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.status === 'success') {
        const fileUrl = `${process.env.REACT_APP_BACKEND_URL}${response.data.file_url}`;
        setUploadedImages(prev => ({
          ...prev,
          [imageType]: fileUrl
        }));
        toast.success(`${imageType.replace('_', ' ')} photo uploaded successfully!`);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleImageChange = (imageType, file) => {
    setImages(prev => ({ ...prev, [imageType]: file }));
    if (file) {
      handleImageUpload(file, imageType);
    }
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!customerInfo.first_name || !customerInfo.last_name || !customerInfo.email) {
        toast.error('Please fill in all required customer information fields');
        return false;
      }
      const emailRegex = /^[^@]+@[^@]+\\.[^@]+$/;
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
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitOrder = async () => {
    if (!validateStep(2)) return;
    
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
        quantity: orderDetails.quantity,
        images: {
          front_view: uploadedImages.front_view,
          side_view: uploadedImages.side_view,
          reference_fit: uploadedImages.reference_fit
        }
      };
      
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/measurements`,
        submissionData
      );
      
      if (response.data.status === 'success') {
        setSubmissionId(response.data.submission_id);
        setCurrentStep(4);
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
      const orderResponse = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/create-payment-order`,
        {
          submission_id: submissionId,
          quantity: orderDetails.quantity
        }
      );
      
      const { order_id, amount, currency, key } = orderResponse.data;
      
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'Stallion & Co.',
        description: 'Premium Tailored Trousers',
        order_id: order_id,
        handler: async function (response) {
          try {
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
          color: '#7f1d1d'
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
          <Card className="luxury-card w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-maroon-600">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-text-dark font-semibold">First Name *</Label>
                  <Input
                    id="firstName"
                    data-testid="first-name-input"
                    value={customerInfo.first_name}
                    onChange={(e) => handleCustomerInfoChange('first_name', e.target.value)}
                    placeholder="Enter your first name"
                    className="measurement-input"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-text-dark font-semibold">Last Name *</Label>
                  <Input
                    id="lastName"
                    data-testid="last-name-input"
                    value={customerInfo.last_name}
                    onChange={(e) => handleCustomerInfoChange('last_name', e.target.value)}
                    placeholder="Enter your last name"
                    className="measurement-input"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email" className="text-text-dark font-semibold">Email Address *</Label>
                <Input
                  id="email"
                  data-testid="email-input"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  className="measurement-input"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-text-dark font-semibold">Phone Number</Label>
                  <Input
                    id="phone"
                    data-testid="phone-input"
                    value={customerInfo.phone}
                    onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                    placeholder="+91 9876543210"
                    className="measurement-input"
                  />
                </div>
                <div>
                  <Label htmlFor="age" className="text-text-dark font-semibold">Age</Label>
                  <Input
                    id="age"
                    data-testid="age-input"
                    type="number"
                    min="18"
                    max="120"
                    value={customerInfo.age}
                    onChange={(e) => handleCustomerInfoChange('age', e.target.value)}
                    placeholder="25"
                    className="measurement-input"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bodyType" className="text-text-dark font-semibold">Body Type (Optional)</Label>
                <Select value={customerInfo.body_type} onValueChange={(value) => handleCustomerInfoChange('body_type', value)}>
                  <SelectTrigger data-testid="body-type-select" className="measurement-input">
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
                <Label htmlFor="specialConsiderations" className="text-text-dark font-semibold">Special Fitting Considerations</Label>
                <Textarea
                  id="specialConsiderations"
                  data-testid="special-considerations-input"
                  value={customerInfo.special_considerations}
                  onChange={(e) => handleCustomerInfoChange('special_considerations', e.target.value)}
                  placeholder="Any special requirements or preferences..."
                  className="measurement-input"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );
      
      case 2:
        return (
          <Card className="luxury-card w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-maroon-600">Measurements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height" className="text-text-dark font-semibold">Height (cm) *</Label>
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
                    className="measurement-input"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="weight" className="text-text-dark font-semibold">Weight (kg) *</Label>
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
                    className="measurement-input"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="waist" className="text-text-dark font-semibold">Waist (cm)</Label>
                  <Input
                    id="waist"
                    data-testid="waist-input"
                    type="number"
                    step="0.1"
                    value={measurements.waist}
                    onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                    placeholder="32"
                    className="measurement-input"
                  />
                </div>
                <div>
                  <Label htmlFor="hipSeat" className="text-text-dark font-semibold">Hip/Seat (cm)</Label>
                  <Input
                    id="hipSeat"
                    data-testid="hip-seat-input"
                    type="number"
                    step="0.1"
                    value={measurements.hip_seat}
                    onChange={(e) => handleMeasurementChange('hip_seat', e.target.value)}
                    placeholder="36"
                    className="measurement-input"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="thigh" className="text-text-dark font-semibold">Thigh (cm)</Label>
                  <Input
                    id="thigh"
                    data-testid="thigh-input"
                    type="number"
                    step="0.1"
                    value={measurements.thigh}
                    onChange={(e) => handleMeasurementChange('thigh', e.target.value)}
                    placeholder="24"
                    className="measurement-input"
                  />
                </div>
                <div>
                  <Label htmlFor="crothRise" className="text-text-dark font-semibold">Crotch Rise (cm)</Label>
                  <Input
                    id="crothRise"
                    data-testid="crotch-rise-input"
                    type="number"
                    step="0.1"
                    value={measurements.crotch_rise}
                    onChange={(e) => handleMeasurementChange('crotch_rise', e.target.value)}
                    placeholder="28"
                    className="measurement-input"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="outseam" className="text-text-dark font-semibold">Outseam (cm)</Label>
                  <Input
                    id="outseam"
                    data-testid="outseam-input"
                    type="number"
                    step="0.1"
                    value={measurements.outseam}
                    onChange={(e) => handleMeasurementChange('outseam', e.target.value)}
                    placeholder="110"
                    className="measurement-input"
                  />
                </div>
                <div>
                  <Label htmlFor="bottomOpening" className="text-text-dark font-semibold">Bottom Opening (cm)</Label>
                  <Input
                    id="bottomOpening"
                    data-testid="bottom-opening-input"
                    type="number"
                    step="0.1"
                    value={measurements.bottom_opening}
                    onChange={(e) => handleMeasurementChange('bottom_opening', e.target.value)}
                    placeholder="18"
                    className="measurement-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 3:
        return (
          <Card className="luxury-card w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-maroon-600">Photo Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-cream p-4 rounded-lg border border-beige-300">
                <h4 className="font-semibold text-maroon-600 mb-2">📸 Help Us Create Your Perfect Fit</h4>
                <p className="text-text-dark text-sm">
                  Upload photos to help our tailors understand your body type and preferred fit. All photos are secure and will be used only for tailoring purposes.
                </p>
              </div>

              {/* Front View Photo */}
              <div className="space-y-2">
                <Label className="text-text-dark font-semibold">Front View Photo (Recommended)</Label>
                <div className="border-2 border-dashed border-beige-300 rounded-lg p-6 text-center">
                  {uploadedImages.front_view ? (
                    <div className="space-y-2">
                      <img 
                        src={uploadedImages.front_view} 
                        alt="Front view" 
                        className="w-24 h-32 object-cover mx-auto rounded-lg"
                      />
                      <p className="text-green-600 text-sm">✅ Front view uploaded</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('front-view-input').click()}
                        className="text-xs"
                      >
                        Replace Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-16 h-20 bg-stone-200 rounded-lg mx-auto flex items-center justify-center">
                        <span className="text-2xl">📸</span>
                      </div>
                      <p className="text-text-light">Stand straight, arms at sides</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('front-view-input').click()}
                      >
                        Upload Front View
                      </Button>
                    </div>
                  )}
                  <input
                    id="front-view-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange('front_view', e.target.files[0])}
                  />
                </div>
              </div>

              {/* Side View Photo */}
              <div className="space-y-2">
                <Label className="text-text-dark font-semibold">Side View Photo (Recommended)</Label>
                <div className="border-2 border-dashed border-beige-300 rounded-lg p-6 text-center">
                  {uploadedImages.side_view ? (
                    <div className="space-y-2">
                      <img 
                        src={uploadedImages.side_view} 
                        alt="Side view" 
                        className="w-24 h-32 object-cover mx-auto rounded-lg"
                      />
                      <p className="text-green-600 text-sm">✅ Side view uploaded</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('side-view-input').click()}
                        className="text-xs"
                      >
                        Replace Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-16 h-20 bg-stone-200 rounded-lg mx-auto flex items-center justify-center">
                        <span className="text-2xl">📸</span>
                      </div>
                      <p className="text-text-light">Profile view, natural stance</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('side-view-input').click()}
                      >
                        Upload Side View
                      </Button>
                    </div>
                  )}
                  <input
                    id="side-view-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange('side_view', e.target.files[0])}
                  />
                </div>
              </div>

              {/* Reference Fit Photo */}
              <div className="space-y-2">
                <Label className="text-text-dark font-semibold">Reference Fit Photo (Optional)</Label>
                <div className="border-2 border-dashed border-beige-300 rounded-lg p-6 text-center">
                  {uploadedImages.reference_fit ? (
                    <div className="space-y-2">
                      <img 
                        src={uploadedImages.reference_fit} 
                        alt="Reference fit" 
                        className="w-24 h-32 object-cover mx-auto rounded-lg"
                      />
                      <p className="text-green-600 text-sm">✅ Reference fit uploaded</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('reference-fit-input').click()}
                        className="text-xs"
                      >
                        Replace Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-16 h-20 bg-stone-200 rounded-lg mx-auto flex items-center justify-center">
                        <span className="text-2xl">👕</span>
                      </div>
                      <p className="text-text-light">Photo of a garment you love the fit of</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('reference-fit-input').click()}
                      >
                        Upload Reference
                      </Button>
                    </div>
                  )}
                  <input
                    id="reference-fit-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange('reference_fit', e.target.files[0])}
                  />
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-lg text-sm text-text-light">
                <p className="mb-2"><strong>Photography Tips:</strong></p>
                <ul className="space-y-1 text-xs">
                  <li>• Good lighting (natural light works best)</li>
                  <li>• Wear well-fitted clothing</li>
                  <li>• Stand 6-8 feet from the camera</li>
                  <li>• Keep arms relaxed at your sides</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );
      
      case 4:
        return (
          <Card className="luxury-card w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-maroon-600">Order Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {productSelection && (
                <div className="bg-cream p-4 rounded-lg border border-beige-300">
                  <h4 className="font-semibold text-maroon-600 mb-2">Selected Product</h4>
                  <p className="text-text-dark">Fabric: {productSelection.fabric}</p>
                  <p className="text-text-dark">Price: ₹{productSelection.price}</p>
                  <p className="text-text-dark">Quantity: {productSelection.quantity}</p>
                </div>
              )}
              
              <div>
                <Label htmlFor="stylePreferences" className="text-text-dark font-semibold">Style Preferences</Label>
                <Textarea
                  id="stylePreferences"
                  data-testid="style-preferences-input"
                  value={orderDetails.style_preferences}
                  onChange={(e) => handleOrderDetailsChange('style_preferences', e.target.value)}
                  placeholder="Slim fit, tapered legs, flat front, etc..."
                  className="measurement-input"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="notes" className="text-text-dark font-semibold">Additional Notes</Label>
                <Textarea
                  id="notes"
                  data-testid="notes-input"
                  value={orderDetails.notes}
                  onChange={(e) => handleOrderDetailsChange('notes', e.target.value)}
                  placeholder="Any special requests or instructions..."
                  className="measurement-input"
                  rows={3}
                />
              </div>
              
              <div className="bg-stone-50 p-6 rounded-xl">
                <h3 className="font-serif font-semibold text-maroon-600 mb-4">Order Summary</h3>
                <div className="space-y-2 text-text-dark">
                  <div className="flex justify-between">
                    <span>Premium Tailored Trousers × {orderDetails.quantity}</span>
                    <span>₹{(productSelection?.totalPrice || 450 * orderDetails.quantity).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount</span>
                      <span data-testid="total-amount" className="text-accent-gold">₹{(productSelection?.totalPrice || 450 * orderDetails.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 5:
        return (
          <Card className="luxury-card w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-maroon-600">Payment & Confirmation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Order Submitted Successfully!</h3>
                <p className="text-green-700">
                  Your measurements have been recorded. Complete payment to confirm your order.
                </p>
                {submissionId && (
                  <div className="mt-3">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium" data-testid="order-id-badge">
                      Order ID: {submissionId.slice(0, 8)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="bg-stone-50 p-6 rounded-xl">
                <h3 className="font-serif font-semibold text-maroon-600 mb-4">Final Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span data-testid="customer-name" className="font-medium">{customerInfo.first_name} {customerInfo.last_name}</span>
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
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-bold text-xl">
                      <span>Total:</span>
                      <span data-testid="final-total" className="text-accent-gold">₹{(productSelection?.totalPrice || 450 * orderDetails.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button
                  data-testid="pay-now-btn"
                  onClick={initiatePayment}
                  disabled={isLoading}
                  className="btn-primary px-8 py-4 text-lg"
                  size="lg"
                >
                  {isLoading ? 'Processing...' : 'Pay Now'}
                </Button>
                
                <p className="text-xs text-text-light mt-3">
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
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-beige-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 p-2 hover:bg-stone-100 rounded-full transition-colors"
                data-testid="back-home-btn"
              >
                <svg className="w-6 h-6 text-maroon-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="font-serif text-2xl lg:text-3xl font-bold text-maroon-600">
                Stallion & Co.
              </h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <React.Fragment key={step}>
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold
                  transition-all duration-300
                  ${
                    currentStep >= step
                      ? 'bg-maroon-600 text-white'
                      : 'bg-stone-200 text-stone-500'
                  }
                `} data-testid={`step-${step}-indicator`}>
                  {step}
                </div>
                {step < 5 && (
                  <div className={`
                    w-16 h-2 transition-all duration-300 rounded-full
                    ${
                      currentStep > step
                        ? 'bg-maroon-600'
                        : 'bg-stone-200'
                    }
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold text-maroon-600 mb-3" data-testid="step-title">
            {currentStep === 1 && 'Personal Information'}
            {currentStep === 2 && 'Measurements'}
            {currentStep === 3 && 'Photo Upload'}
            {currentStep === 4 && 'Order Preferences'}
            {currentStep === 5 && 'Payment & Confirmation'}
          </h1>
          <p className="text-xl text-text-light">
            {currentStep === 1 && 'Tell us about yourself'}
            {currentStep === 2 && 'Provide your precise measurements'}
            {currentStep === 3 && 'Upload your photos for better fitting'}
            {currentStep === 4 && 'Customize your order'}
            {currentStep === 5 && 'Complete your order'}
          </p>
        </div>

        {renderStepContent()}

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex justify-between mt-8 max-w-2xl mx-auto">
            <Button
              data-testid="prev-step-btn"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-secondary px-6 py-3"
            >
              Previous
            </Button>
            
            {currentStep === 4 ? (
              <Button
                data-testid="submit-order-btn"
                onClick={submitOrder}
                disabled={isLoading}
                className="btn-primary px-6 py-3"
              >
                {isLoading ? 'Submitting...' : 'Submit Order'}
              </Button>
            ) : (
              <Button
                data-testid="next-step-btn"
                onClick={nextStep}
                className="btn-primary px-6 py-3"
              >
                Next Step
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeasurementFlow;