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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VirtualFitting = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    fittingType: 'virtual_consultation',
    notes: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const submissionData = {
        customer_info: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        fitting_type: formData.fittingType,
        notes: formData.notes
      };

      const response = await axios.post(`${API}/virtual-fitting`, submissionData);
      
      if (response.data.status === 'success') {
        toast.success('Virtual fitting consultation booked successfully!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error booking virtual fitting:', error);
      toast.error('Failed to book consultation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

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
                onClick={() => navigate('/product')}
                variant="outline"
                className="px-6 py-2 border-2 transition-all duration-300"
                style={{
                  borderColor: '#6F0914',
                  color: '#6F0914',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#6F0914';
                  e.target.style.color = '#F7F2DE';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#6F0914';
                }}
              >
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-maroon-600 to-maroon-800 text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="font-serif text-4xl lg:text-6xl font-bold mb-6">
            Virtual Fitting
            <br />
            <span className="text-accent-gold">Consultation</span>
          </h1>
          <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed">
            Experience personalized fitting guidance from our master tailors.
            <br />
            Get expert advice on measurements, fabric selection, and styling.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="py-16 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Booking Form */}
            <Card className="luxury-card" data-testid="virtual-fitting-form">
              <CardHeader>
                <CardTitle className="font-serif text-3xl text-maroon-600">
                  Book Your Consultation
                </CardTitle>
                <p className="text-text-light">
                  Schedule a personalized virtual fitting session with our expert tailors
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="preferredDate" className="text-maroon-600 font-semibold">Preferred Date</Label>
                      <Input
                        id="preferredDate"
                        type="date"
                        data-testid="preferred-date-input"
                        value={formData.preferredDate}
                        onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                        className="measurement-input"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="preferredTime" className="text-maroon-600 font-semibold">Preferred Time</Label>
                      <Select onValueChange={(value) => handleInputChange('preferredTime', value)}>
                        <SelectTrigger data-testid="preferred-time-select">
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="fittingType" className="text-maroon-600 font-semibold">Consultation Type</Label>
                    <Select onValueChange={(value) => handleInputChange('fittingType', value)} defaultValue="virtual_consultation">
                      <SelectTrigger data-testid="fitting-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="virtual_consultation">Virtual Consultation</SelectItem>
                        <SelectItem value="measurement_guidance">Measurement Guidance</SelectItem>
                        <SelectItem value="fabric_selection">Fabric Selection Help</SelectItem>
                        <SelectItem value="styling_advice">Styling Advice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes" className="text-maroon-600 font-semibold">Notes & Preferences</Label>
                    <Textarea
                      id="notes"
                      data-testid="notes-input"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Tell us about your specific needs, preferences, or questions..."
                      className="measurement-input min-h-[120px]"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={!formData.firstName || !formData.lastName || !formData.email || isLoading}
                    className="w-full py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105"
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
                    data-testid="book-consultation-btn"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="loading-spinner"></div>
                        <span>Booking...</span>
                      </div>
                    ) : (
                      'Book Consultation'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Benefits & Information */}
            <div className="space-y-8">
              <Card className="luxury-card">
                <CardHeader>
                  <CardTitle className="font-serif text-2xl text-maroon-600">
                    What to Expect
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-maroon-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-maroon-600 mb-2">Personal Consultation</h4>
                        <p className="text-text-light">One-on-one session with our master tailor via video call</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-accent-gold rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13H14a1 1 0 01-1-1z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-maroon-600 mb-2">Measurement Guidance</h4>
                        <p className="text-text-light">Step-by-step guidance on taking accurate measurements</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-maroon-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-maroon-600 mb-2">Fabric & Style Advice</h4>
                        <p className="text-text-light">Expert recommendations on fabrics and styling options</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-accent-gold rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-maroon-600 mb-2">45-Minute Session</h4>
                        <p className="text-text-light">Comprehensive consultation covering all your tailoring needs</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="luxury-card bg-maroon-50">
                <CardContent className="p-6">
                  <h4 className="font-serif text-xl font-bold text-maroon-600 mb-4">
                    Preparation Tips
                  </h4>
                  <ul className="space-y-3 text-text-dark">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent-gold rounded-full mt-2 flex-shrink-0"></div>
                      <span>Have a measuring tape ready (we'll guide you through using it)</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent-gold rounded-full mt-2 flex-shrink-0"></div>
                      <span>Wear well-fitted clothing similar to your desired style</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent-gold rounded-full mt-2 flex-shrink-0"></div>
                      <span>Prepare any specific questions about fit or styling</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent-gold rounded-full mt-2 flex-shrink-0"></div>
                      <span>Ensure good lighting and a stable internet connection</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="luxury-card">
                <CardContent className="p-6 text-center">
                  <h4 className="font-serif text-xl font-bold text-maroon-600 mb-2">
                    Complimentary Service
                  </h4>
                  <p className="text-text-light mb-4">
                    Virtual fitting consultations are complimentary for all Stallion & Co. customers
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() => navigate('/product')}
                      className="px-6 py-2 rounded-lg transition-all duration-300"
                      style={{ 
                        backgroundColor: '#6F0914',
                        color: '#F7F2DE'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#5A0710';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#6F0914';
                      }}
                    >
                      Shop Collection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualFitting;
