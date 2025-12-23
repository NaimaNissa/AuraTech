import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sendContactEmail } from '@/lib/contactEmailService';
import { 
  Mail, 
  Send, 
  CheckCircle,
  ArrowLeft,
  Instagram
} from 'lucide-react';

export default function ContactPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Send email using the email service
      await sendContactEmail({
        name: formData.name,
        email: formData.email,
        subject: formData.subject || 'Contact from AuraTech Website',
        message: formData.message
      });
      
      // Show success message
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
    } catch (err) {
      console.error('Contact form error:', err);
      setError('Failed to send message. Please try again or contact us directly at auratechs30@gmail.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('home')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Message Sent!</h1>
              <p className="text-gray-600 mb-6">
                Your email client should have opened with your message. If not, please send your message directly to:
              </p>
              <p className="text-lg font-semibold text-blue-600 mb-6">auratechs30@gmail.com</p>
              <p className="text-gray-600 mb-8">
                We'll get back to you as soon as possible!
              </p>
              <div className="space-y-3">
                <Button onClick={() => setIsSubmitted(false)} size="lg">
                  Send Another Message
                </Button>
                <div>
                  <Button variant="outline" onClick={() => onNavigate('home')}>
                    Back to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('home')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have a question or want to get in touch? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">auratechs30@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <a
                    href="https://www.instagram.com/auratech_5/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-700 hover:text-pink-600 transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl">
                      <Instagram className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold">Instagram</span>
                  </a>
                </div>

                <div className="flex items-center space-x-4">
                  <a
                    href="https://au.pinterest.com/auratechs30/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl overflow-hidden">
                      <img 
                        src="/pinterest.webp" 
                        alt="Pinterest" 
                        className="h-10 w-10 object-contain"
                        style={{
                          transform: 'scale(1.8)'
                        }}
                      />
                    </div>
                    <span className="font-semibold">Pinterest</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What is this about?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>

                  <p className="text-sm text-gray-500 text-center">
                    By sending this message, you agree to our terms of service and privacy policy.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}





