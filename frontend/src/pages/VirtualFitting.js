import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';

const VirtualFitting = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    preferred_date: '',
    preferred_time: '',
    fitting_type: 'virtual_consultation',
    notes: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const requestData = {
        customer_info: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone
        },
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time,
        fitting_type: formData.fitting_type,
        notes: formData.notes
      };
      
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/virtual-fitting`,
        requestData
      );
      
      if (response.data.status === 'success') {
        toast.success('Virtual fitting consultation booked successfully!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
      
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book consultation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-maroon-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.75 6.75L12 3l-3.75 3.75L12 10.5l3.75-3.75zM12 21l-3.75-3.75L12 13.5l3.75 3.75L12 21z"/>
            </svg>
          </div>
          <h1 className="font-serif text-4xl font-bold text-maroon-600 mb-3" data-testid="page-title">
            Virtual Fitting Consultation
          </h1>
          <p className="text-xl text-text-light max-w-2xl mx-auto">
            Schedule a one-on-one virtual consultation with our master tailors to discuss your requirements and preferences.
          </p>
        </div>

        <Card className="luxury-card max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-maroon-600 text-center">Book Your Consultation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl font-semibold text-maroon-600 mb-4">
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" data-testid="first-name-label">First Name *</Label>
                    <Input
                      id="firstName"
                      data-testid="first-name-input"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" data-testid="last-name-label">Last Name *</Label>
                    <Input
                      id="lastName"
                      data-testid="last-name-input"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
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
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone" data-testid="phone-label">Phone Number</Label>
                  <Input
                    id="phone"
                    data-testid="phone-input"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              {/* Appointment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Preferred Appointment</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredDate" data-testid="preferred-date-label">Preferred Date</Label>
                    <Input
                      id="preferredDate"
                      data-testid="preferred-date-input"
                      type="date"
                      min={getMinDate()}
                      value={formData.preferred_date}
                      onChange={(e) => handleInputChange('preferred_date', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="preferredTime" data-testid="preferred-time-label">Preferred Time</Label>
                    <Select value={formData.preferred_time} onValueChange={(value) => handleInputChange('preferred_time', value)}>
                      <SelectTrigger data-testid="preferred-time-select">
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{time}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="consultationType" data-testid="consultation-type-label">Consultation Type</Label>
                  <Select value={formData.fitting_type} onValueChange={(value) => handleInputChange('fitting_type', value)}>
                    <SelectTrigger data-testid="consultation-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="virtual_consultation">Virtual Consultation (Video Call)</SelectItem>
                      <SelectItem value="measurement_guidance">Measurement Guidance</SelectItem>
                      <SelectItem value="style_consultation">Style & Fabric Consultation</SelectItem>
                      <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <Label htmlFor="notes" data-testid="notes-label">Additional Notes</Label>
                <Textarea
                  id="notes"
                  data-testid="notes-input"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Tell us about your requirements, style preferences, or any questions you have..."
                  rows={4}
                />
              </div>

              {/* Information Box */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">What to Expect</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• 30-minute one-on-one consultation with our master tailor</li>
                  <li>• Personalized style and fabric recommendations</li>
                  <li>• Professional measurement guidance</li>
                  <li>• Discussion of your specific requirements and preferences</li>
                  <li>• No commitment required - completely free consultation</li>
                </ul>
              </div>

              <Button
                data-testid="book-consultation-btn"
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                {isLoading ? 'Booking...' : 'Book Free Consultation'}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                We'll contact you within 24 hours to confirm your appointment details.
              </p>
            </form>
          </CardContent>
        </Card>
        
        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="text-center p-6">
            <Video className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">Video Consultation</h3>
            <p className="text-sm text-slate-600">Face-to-face discussion with our expert tailors from the comfort of your home.</p>
          </Card>
          
          <Card className="text-center p-6">
            <Calendar className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">Flexible Scheduling</h3>
            <p className="text-sm text-slate-600">Choose a time that works for you with our flexible appointment system.</p>
          </Card>
          
          <Card className="text-center p-6">
            <Scissors className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">Expert Guidance</h3>
            <p className="text-sm text-slate-600">Get professional advice on measurements, fabrics, and styling options.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VirtualFitting;