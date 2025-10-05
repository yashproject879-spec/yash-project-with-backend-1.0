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
import { ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';

const MeasurementFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  
  // Form state for 7-step process
  const [measurements, setMeasurements] = useState({
    outseam: '', // Step 1: Length
    waist: '',   // Step 2: Waist 
    hip_seat: '', // Step 3: Hip/Seat
    thigh: '',    // Step 4: Thigh
    crotch_rise: '', // Step 5: Crotch/Rise
    bottom_opening: '', // Step 6: Bottom Opening
    unit: 'cm'
  });
  
  const [customerInfo, setCustomerInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    age: '',
    height: '',
    weight: '',
    body_type: '',
    special_considerations: ''
  });
  
  const [orderDetails, setOrderDetails] = useState({
    fabric_choice: '',
    style_preferences: '',
    notes: '',
    quantity: 1
  });

  const [uploadedImages, setUploadedImages] = useState({
    front_view: '',
    side_view: '',
    reference_fit: ''
  });

  useEffect(() => {
    const stored = sessionStorage.getItem('productSelection');
    if (stored) {
      const selection = JSON.parse(stored);
      setOrderDetails(prev => ({ 
        ...prev, 
        fabric_choice: selection.fabric || '',
        quantity: selection.quantity || 1 
      }));
    }
  }, []);

  const handleMeasurementChange = (field, value) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
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

  const validateStep = (step) => {
    if (step === 7) {
      if (!customerInfo.first_name || !customerInfo.last_name || !customerInfo.email) {
        toast.error('Please fill in all required personal information');
        return false;
      }
      const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
      if (!emailRegex.test(customerInfo.email)) {
        toast.error('Please enter a valid email address');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 8));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const submitOrder = async () => {
    if (!validateStep(7)) return;
    
    setIsLoading(true);
    
    try {
      const submissionData = {
        customer_info: {
          ...customerInfo,
          age: customerInfo.age ? parseInt(customerInfo.age) : null,
          height: customerInfo.height ? parseFloat(customerInfo.height) : null,
          weight: customerInfo.weight ? parseFloat(customerInfo.weight) : null
        },
        measurements: {
          height: customerInfo.height ? parseFloat(customerInfo.height) : 175,
          weight: customerInfo.weight ? parseFloat(customerInfo.weight) : 70,
          waist: measurements.waist ? parseFloat(measurements.waist) : null,
          hip_seat: measurements.hip_seat ? parseFloat(measurements.hip_seat) : null,
          thigh: measurements.thigh ? parseFloat(measurements.thigh) : null,
          crotch_rise: measurements.crotch_rise ? parseFloat(measurements.crotch_rise) : null,
          outseam: measurements.outseam ? parseFloat(measurements.outseam) : null,
          bottom_opening: measurements.bottom_opening ? parseFloat(measurements.bottom_opening) : null,
          unit: measurements.unit
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
        setCurrentStep(8);
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
      
      const { order_id, amount, currency, key, is_mock } = orderResponse.data;
      
      // Check if this is a mock payment (for testing)
      if (is_mock || key === 'rzp_test_mock') {
        toast.info('Test mode - Simulating payment success');
        
        try {
          const mockVerifyResponse = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/api/verify-payment`,
            {
              razorpay_order_id: order_id,
              razorpay_payment_id: `pay_mock_${Date.now()}`,
              razorpay_signature: 'mock_signature_for_testing',
              submission_id: submissionId
            }
          );
          
          if (mockVerifyResponse.data.status === 'success') {
            toast.success('🎉 Test payment successful! Order confirmed.');
            setTimeout(() => {
              navigate('/');
            }, 2000);
          }
        } catch (verifyError) {
          console.error('Mock payment verification error:', verifyError);
          toast.error('Test payment verification failed.');
        }
        return;
      }
      
      // Real Razorpay integration
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'Stallion & Co.',
        description: 'Bespoke Trousers',
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
          color: '#6E0A13'
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

  const stepTitles = {
    1: 'Length (Outseam)',
    2: 'Waist (Trouser Waistband)', 
    3: 'Hip / Seat',
    4: 'Thigh',
    5: 'Crotch / Rise (Front Rise)',
    6: 'Bottom Opening / Hem Circumference',
    7: 'Client Details & Lifestyle Info',
    8: 'Payment & Confirmation'
  };

  const expertTips = {
    1: "Measure from your waist to where you want the trouser to end. This determines the overall length of your trousers.",
    2: "Measure around your natural waistline where you prefer to wear your trousers. This should be comfortable, not tight.",
    3: "Measure around the fullest part of your hips and seat area. This ensures proper room through the hip area.",
    4: "Measure around the fullest part of your thigh. This measurement affects comfort when sitting and walking.", 
    5: "This determines how high or low the trouser sits. Measure from the waistband to the crotch seam.",
    6: "Measure the circumference where you want the trouser leg to end. This affects the overall silhouette.",
    7: "Help us understand your lifestyle and preferences for the perfect fit and style recommendations."
  };

  const renderStepContent = () => {
    const commonInputClass = "w-full p-3 border-2 border-[#141F40] rounded-lg focus:border-[#6E0A13] focus:ring-2 focus:ring-[#6E0A13] focus:ring-opacity-20";
    
    switch (currentStep) {
      case 1: // Length (Outseam)
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg text-center">
                <div className="w-16 h-20 bg-[#6E0A13] rounded-lg mx-auto mb-3 flex items-center justify-center text-[#F5F5DC] font-bold">
                  1
                </div>
                <p className="text-sm text-[#000000]">Step 1 Graphic</p>
              </div>
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg text-center">
                <div className="w-16 h-20 bg-[#6E0A13] rounded-lg mx-auto mb-3 flex items-center justify-center text-[#F5F5DC] font-bold">
                  2
                </div>
                <p className="text-sm text-[#000000]">Step 2 Graphic</p>
              </div>
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg text-center">
                <div className="w-16 h-20 bg-[#6E0A13] rounded-lg mx-auto mb-3 flex items-center justify-center text-[#F5F5DC] font-bold">
                  3
                </div>
                <p className="text-sm text-[#000000]">Step 3 Graphic</p>
              </div>
            </div>
            
            <div className="bg-[#141F40] bg-opacity-5 p-6 rounded-lg">
              <div className="aspect-video bg-[#141F40] bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <p className="text-[#000000]">📹 Demo Video Placeholder</p>
              </div>
            </div>
            
            <div>
              <Label className="text-lg font-semibold text-[#000000] mb-2 block">
                Length (Outseam) - cm
              </Label>
              <Input
                type="number"
                step="0.1"
                value={measurements.outseam}
                onChange={(e) => handleMeasurementChange('outseam', e.target.value)}
                placeholder="Enter length in cm (e.g., 110)"
                className={commonInputClass}
              />
            </div>
          </div>
        );
        
      case 2: // Waist
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg text-center">
                <div className="w-16 h-20 bg-[#6E0A13] rounded-lg mx-auto mb-3 flex items-center justify-center text-[#F5F5DC] font-bold">
                  1
                </div>
                <p className="text-sm text-[#000000]">Step 1 Graphic</p>
              </div>
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg text-center">
                <div className="w-16 h-20 bg-[#6E0A13] rounded-lg mx-auto mb-3 flex items-center justify-center text-[#F5F5DC] font-bold">
                  2
                </div>
                <p className="text-sm text-[#000000]">Step 2 Graphic</p>
              </div>
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg text-center">
                <div className="w-16 h-20 bg-[#6E0A13] rounded-lg mx-auto mb-3 flex items-center justify-center text-[#F5F5DC] font-bold">
                  3
                </div>
                <p className="text-sm text-[#000000]">Step 3 Graphic</p>
              </div>
            </div>
            
            <div className="bg-[#141F40] bg-opacity-5 p-6 rounded-lg">
              <div className="aspect-video bg-[#141F40] bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <p className="text-[#000000]">📹 Demo Video Placeholder</p>
              </div>
            </div>
            
            <div>
              <Label className="text-lg font-semibold text-[#000000] mb-2 block">
                Waist (Trouser Waistband) - cm
              </Label>
              <Input
                type="number"
                step="0.1"
                value={measurements.waist}
                onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                placeholder="Enter waist measurement in cm (e.g., 32)"
                className={commonInputClass}
              />
            </div>
          </div>
        );
        
      case 3: // Hip/Seat
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg text-center">
                <div className="w-16 h-20 bg-[#6E0A13] rounded-lg mx-auto mb-3 flex items-center justify-center text-[#F5F5DC] font-bold">
                  1
                </div>
                <p className="text-sm text-[#000000]">Step 1 Graphic</p>
              </div>
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg text-center">
                <div className="w-16 h-20 bg-[#6E0A13] rounded-lg mx-auto mb-3 flex items-center justify-center text-[#F5F5DC] font-bold">
                  2
                </div>
                <p className="text-sm text-[#000000]">Step 2 Graphic</p>
              </div>
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg text-center">
                <div className="w-16 h-20 bg-[#6E0A13] rounded-lg mx-auto mb-3 flex items-center justify-center text-[#F5F5DC] font-bold">
                  3
                </div>
                <p className="text-sm text-[#000000]">Step 3 Graphic</p>
              </div>
            </div>
            
            <div className="bg-[#141F40] bg-opacity-5 p-6 rounded-lg">
              <div className="aspect-video bg-[#141F40] bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <p className="text-[#000000]">📹 Demo Video Placeholder</p>
              </div>
            </div>
            
            <div>
              <Label className="text-lg font-semibold text-[#000000] mb-2 block">
                Hip / Seat - cm
              </Label>
              <Input
                type="number"
                step="0.1"
                value={measurements.hip_seat}
                onChange={(e) => handleMeasurementChange('hip_seat', e.target.value)}
                placeholder="Enter hip/seat measurement in cm (e.g., 38)"
                className={commonInputClass}
              />
            </div>
          </div>
        );
        
      case 4: // Thigh
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg text-center">
                <div className="w-16 h-20 bg-[#6E0A13] rounded-lg mx-auto mb-3 flex items-center justify-center text-[#F5F5DC] font-bold">
                  1
                </div>
                <p className="text-sm text-[#000000]">Step 1 Graphic</p>
              </div>
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg text-center">
                <div className="w-16 h-20 bg-[#6E0A13] rounded-lg mx-auto mb-3 flex items-center justify-center text-[#F5F5DC] font-bold">
                  2
                </div>
                <p className="text-sm text-[#000000]">Step 2 Graphic</p>
              </div>
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg text-center">
                <div className="w-16 h-20 bg-[#6E0A13] rounded-lg mx-auto mb-3 flex items-center justify-center text-[#F5F5DC] font-bold">
                  3
                </div>
                <p className="text-sm text-[#000000]">Step 3 Graphic</p>
              </div>
            </div>
            
            <div className="bg-[#141F40] bg-opacity-5 p-6 rounded-lg">
              <div className="aspect-video bg-[#141F40] bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <p className="text-[#000000]">📹 Demo Video Placeholder</p>
              </div>
            </div>
            
            <div>
              <Label className="text-lg font-semibold text-[#000000] mb-2 block">
                Thigh - cm
              </Label>
              <Input
                type="number"
                step="0.1"
                value={measurements.thigh}
                onChange={(e) => handleMeasurementChange('thigh', e.target.value)}
                placeholder="Enter thigh measurement in cm (e.g., 24)"
                className={commonInputClass}
              />
            </div>
          </div>
        );
        
      case 5: // Crotch/Rise
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg text-center">
                <div className="w-16 h-20 bg-[#6E0A13] rounded-lg mx-auto mb-3 flex items-center justify-center text-[#F5F5DC] font-bold">
                  1
                </div>
                <p className="text-sm text-[#000000]">Step 1 Graphic</p>
              </div>
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg text-center">
                <div className="w-16 h-20 bg-[#6E0A13] rounded-lg mx-auto mb-3 flex items-center justify-center text-[#F5F5DC] font-bold">
                  2
                </div>
                <p className="text-sm text-[#000000]">Step 2 Graphic</p>
              </div>
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg text-center">
                <div className="w-16 h-20 bg-[#6E0A13] rounded-lg mx-auto mb-3 flex items-center justify-center text-[#F5F5DC] font-bold">
                  3
                </div>
                <p className="text-sm text-[7000000]">Step 3 Graphic</p>
              </div>
            </div>
            
            <div className="bg-[#141F40] bg-opacity-5 p-6 rounded-lg">
              <div className="aspect-video bg-[#141F40] bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <p className="text-[#000000]">📹 Demo Video Placeholder</p>
              </div>
            </div>
            
            <div>
              <Label className="text-lg font-semibold text-[#000000] mb-2 block">
                Crotch / Rise (Front Rise) - cm
              </Label>
              <Input
                type="number"
                step="0.1"
                value={measurements.crotch_rise}
                onChange={(e) => handleMeasurementChange('crotch_rise', e.target.value)}
                placeholder="Enter crotch rise in cm (e.g., 28)"
                className={commonInputClass}
              />
            </div>
          </div>
        );
        
      case 6: // Bottom Opening
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg text-center">
                <div className="w-16 h-20 bg-[#6E0A13] rounded-lg mx-auto mb-3 flex items-center justify-center text-[#F5F5DC] font-bold">
                  1
                </div>
                <p className="text-sm text-[#000000]">Step 1 Graphic</p>
              </div>
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg text-center">
                <div className="w-16 h-20 bg-[#6E0A13] rounded-lg mx-auto mb-3 flex items-center justify-center text-[#F5F5DC] font-bold">
                  2
                </div>
                <p className="text-sm text-[#000000]">Step 2 Graphic</p>
              </div>
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg text-center">
                <div className="w-16 h-20 bg-[#6E0A13] rounded-lg mx-auto mb-3 flex items-center justify-center text-[#F5F5DC] font-bold">
                  3
                </div>
                <p className="text-sm text-[#000000]">Step 3 Graphic</p>
              </div>
            </div>
            
            <div className="bg-[#141F40] bg-opacity-5 p-6 rounded-lg">
              <div className="aspect-video bg-[#141F40] bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <p className="text-[#000000]">📹 Demo Video Placeholder</p>
              </div>
            </div>
            
            <div>
              <Label className="text-lg font-semibold text-[#000000] mb-2 block">
                Bottom Opening / Hem Circumference - cm
              </Label>
              <Input
                type="number"
                step="0.1"
                value={measurements.bottom_opening}
                onChange={(e) => handleMeasurementChange('bottom_opening', e.target.value)}
                placeholder="Enter bottom opening in cm (e.g., 18)"
                className={commonInputClass}
              />
            </div>
          </div>
        );
        
      case 7: // Client Details
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-lg font-semibold text-[#000000] mb-2 block">First Name *</Label>
                <Input
                  value={customerInfo.first_name}
                  onChange={(e) => handleCustomerInfoChange('first_name', e.target.value)}
                  placeholder="Enter your first name"
                  className={commonInputClass}
                  required
                />
              </div>
              <div>
                <Label className="text-lg font-semibold text-[#000000] mb-2 block">Last Name *</Label>
                <Input
                  value={customerInfo.last_name}
                  onChange={(e) => handleCustomerInfoChange('last_name', e.target.value)}
                  placeholder="Enter your last name"
                  className={commonInputClass}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label className="text-lg font-semibold text-[#000000] mb-2 block">Email Address *</Label>
              <Input
                type="email"
                value={customerInfo.email}
                onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                placeholder="your.email@example.com"
                className={commonInputClass}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-lg font-semibold text-[#000000] mb-2 block">Phone Number</Label>
                <Input
                  value={customerInfo.phone}
                  onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                  placeholder="+91 9876543210"
                  className={commonInputClass}
                />
              </div>
              <div>
                <Label className="text-lg font-semibold text-[#000000] mb-2 block">Age</Label>
                <Input
                  type="number"
                  min="18"
                  max="120"
                  value={customerInfo.age}
                  onChange={(e) => handleCustomerInfoChange('age', e.target.value)}
                  placeholder="25"
                  className={commonInputClass}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-lg font-semibold text-[#000000] mb-2 block">Height (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={customerInfo.height}
                  onChange={(e) => handleCustomerInfoChange('height', e.target.value)}
                  placeholder="175"
                  className={commonInputClass}
                />
              </div>
              <div>
                <Label className="text-lg font-semibold text-[#000000] mb-2 block">Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={customerInfo.weight}
                  onChange={(e) => handleCustomerInfoChange('weight', e.target.value)}
                  placeholder="70"
                  className={commonInputClass}
                />
              </div>
            </div>
            
            <div>
              <Label className="text-lg font-semibold text-[#000000] mb-2 block">Body Type</Label>
              <Select value={customerInfo.body_type} onValueChange={(value) => handleCustomerInfoChange('body_type', value)}>
                <SelectTrigger className={commonInputClass}>
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
              <Label className="text-lg font-semibold text-[#000000] mb-2 block">Special Considerations</Label>
              <Textarea
                value={customerInfo.special_considerations}
                onChange={(e) => handleCustomerInfoChange('special_considerations', e.target.value)}
                placeholder="Any special fitting requirements or preferences..."
                rows={4}
                className={commonInputClass}
              />
            </div>
            
            {/* Photo Upload Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#6E0A13]">Optional: Upload Photos for Better Fit</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="border-2 border-dashed border-[#141F40] rounded-lg p-6">
                    {uploadedImages.front_view ? (
                      <img src={uploadedImages.front_view} alt="Front view" className="w-full h-32 object-cover rounded" />
                    ) : (
                      <div className="h-32 flex items-center justify-center">
                        <span className="text-4xl">📸</span>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('front-view-input').click()}
                      className="mt-2 border-[#6E0A13] text-[#6E0A13] hover:bg-[#6E0A13] hover:text-[#F5F5DC]"
                    >
                      Front View
                    </Button>
                    <input
                      id="front-view-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files[0], 'front_view')}
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="border-2 border-dashed border-[#141F40] rounded-lg p-6">
                    {uploadedImages.side_view ? (
                      <img src={uploadedImages.side_view} alt="Side view" className="w-full h-32 object-cover rounded" />
                    ) : (
                      <div className="h-32 flex items-center justify-center">
                        <span className="text-4xl">📸</span>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('side-view-input').click()}
                      className="mt-2 border-[#6E0A13] text-[#6E0A13] hover:bg-[#6E0A13] hover:text-[#F5F5DC]"
                    >
                      Side View
                    </Button>
                    <input
                      id="side-view-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files[0], 'side_view')}
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="border-2 border-dashed border-[#141F40] rounded-lg p-6">
                    {uploadedImages.reference_fit ? (
                      <img src={uploadedImages.reference_fit} alt="Reference fit" className="w-full h-32 object-cover rounded" />
                    ) : (
                      <div className="h-32 flex items-center justify-center">
                        <span className="text-4xl">👔</span>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('reference-fit-input').click()}
                      className="mt-2 border-[#6E0A13] text-[#6E0A13] hover:bg-[#6E0A13] hover:text-[#F5F5DC]"
                    >
                      Reference Fit
                    </Button>
                    <input
                      id="reference-fit-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files[0], 'reference_fit')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 8: // Payment
        return (
          <div className="space-y-8">
            <div className="bg-green-50 border-2 border-green-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-800 mb-2">Measurements Submitted Successfully!</h3>
              <p className="text-green-700">
                Your measurements have been recorded. Complete payment to confirm your bespoke trouser order.
              </p>
              {submissionId && (
                <div className="mt-3">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Order ID: {submissionId.slice(0, 8)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="bg-[#F5F5DC] border-2 border-[#141F40] p-8 rounded-lg">
              <h3 className="text-2xl font-serif font-bold text-[#6E0A13] mb-6">Order Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-[#000000]">Customer:</span>
                  <span className="font-semibold text-[#000000]">{customerInfo.first_name} {customerInfo.last_name}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-[#000000]">Email:</span>
                  <span className="text-[#000000]">{customerInfo.email}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-[#000000]">Product:</span>
                  <span className="text-[#000000]">Bespoke Trousers</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-[#000000]">Quantity:</span>
                  <span className="text-[#000000]">{orderDetails.quantity}</span>
                </div>
                <div className="border-t-2 border-[#141F40] pt-4 mt-4">
                  <div className="flex justify-between text-2xl font-bold">
                    <span className="text-[#000000]">Total:</span>
                    <span className="text-[#6E0A13]">₹{(450 * orderDetails.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <Button
                onClick={initiatePayment}
                disabled={isLoading}
                className="bg-[#6E0A13] hover:bg-[#141F40] text-[#F5F5DC] px-12 py-4 text-xl font-semibold rounded-full w-full transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                {isLoading ? 'Processing...' : 'Complete Payment'}
              </Button>
              
              <div className="border-t pt-4">
                <p className="text-sm text-[#000000] mb-2">Test Mode:</p>
                <Button
                  onClick={async () => {
                    if (!submissionId) return;
                    setIsLoading(true);
                    try {
                      const response = await axios.post(
                        `${process.env.REACT_APP_BACKEND_URL}/api/test-payment-success/${submissionId}`
                      );
                      if (response.data.status === 'success') {
                        toast.success('🎉 Test payment successful! Order confirmed and data pushed to sheets.');
                        setTimeout(() => navigate('/'), 2000);
                      }
                    } catch (error) {
                      toast.error('Test payment failed');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-[#6E0A13] text-[#6E0A13] hover:bg-[#6E0A13] hover:text-[#F5F5DC]"
                >
                  Simulate Payment Success (Test)
                </Button>
              </div>
              
              <p className="text-sm text-[#000000] opacity-70">
                Secure payment powered by Razorpay
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5DC]">
      {/* Header */}
      <header className="bg-[#141F40] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')} 
                className="text-[#F5F5DC] hover:text-[#F5F5DC] hover:bg-[#F5F5DC] hover:bg-opacity-10"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Button>
              
              <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#F5F5DC]">
                Stallion & Co.
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
              <React.Fragment key={step}>
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold
                  transition-all duration-300
                  ${
                    currentStep >= step
                      ? 'bg-[#6E0A13] text-[#F5F5DC]'
                      : 'bg-[#141F40] bg-opacity-20 text-[#000000]'
                  }
                `}>
                  {step}
                </div>
                {step < 8 && (
                  <div className={`
                    w-8 h-1 transition-all duration-300 rounded-full
                    ${
                      currentStep > step
                        ? 'bg-[#6E0A13]'
                        : 'bg-[#141F40] bg-opacity-20'
                    }
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#6E0A13] mb-4">
            {stepTitles[currentStep]}
          </h1>
          {expertTips[currentStep] && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-[#141F40] bg-opacity-10 p-6 rounded-lg border-l-4 border-[#6E0A13]">
                <p className="text-[#000000] italic">
                  <span className="font-semibold text-[#6E0A13]">Stallion & Co Expert Tip:</span> {expertTips[currentStep]}
                </p>
              </div>
            </div>
          )}
        </div>

        <Card className="max-w-4xl mx-auto bg-white border-2 border-[#141F40] shadow-2xl">
          <CardHeader className="bg-[#141F40] bg-opacity-5">
            <CardTitle className="text-2xl font-serif text-[#6E0A13] text-center">
              Step {currentStep} of 8
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        {currentStep < 8 && (
          <div className="flex justify-between mt-8 max-w-4xl mx-auto">
            <Button
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="px-8 py-3 border-[#141F40] text-[#141F40] hover:bg-[#141F40] hover:text-[#F5F5DC]"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Previous
            </Button>
            
            {currentStep === 7 ? (
              <Button
                onClick={submitOrder}
                disabled={isLoading}
                className="bg-[#6E0A13] hover:bg-[#141F40] text-[#F5F5DC] px-8 py-3"
              >
                {isLoading ? 'Submitting...' : 'Submit Measurements'}
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="bg-[#6E0A13] hover:bg-[#141F40] text-[#F5F5DC] px-8 py-3"
              >
                Next Step
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeasurementFlow;