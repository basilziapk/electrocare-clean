import { useState } from "react";
import NewNavigation from "@/components/new-navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Headphones } from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "",
        message: "",
      });
      setLoading(false);
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NewNavigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl max-w-3xl mx-auto">
            We're here to help! Get in touch with our support team for any questions about solar solutions, installations, or technical support.
          </p>
        </div>
      </div>

      {/* Contact Information Cards */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:bg-green-50 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600 text-sm">+92 1233218777</p>
              <p className="text-gray-500 text-xs mt-1">Mon-Sat: 9AM-6PM</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:bg-green-50 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 text-sm">info@greentechpk.com</p>
              <p className="text-gray-500 text-xs mt-1">24/7 Support</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:bg-green-50 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-600 text-sm">Opposite Haji Gul Plaza</p>
              <p className="text-gray-500 text-xs mt-1">Mardan, KPK</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:bg-green-50 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Response Time</h3>
              <p className="text-gray-600 text-sm">Within 24 Hours</p>
              <p className="text-gray-500 text-xs mt-1">Priority Support</p>
            </div>
          </div>

          {/* Main Contact Form */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form Section */}
            <div className="bg-white rounded-xl shadow-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-cyan-500 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ahmad Khan"
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="ahmad.khan@example.com"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+92 XXX XXXXXXX"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category}
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="quote">Request Quote</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="installation">Installation Query</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Brief description of your inquiry"
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Please provide detailed information about your inquiry..."
                    rows={6}
                    required
                    className="mt-1"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700"
                  disabled={loading}
                >
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
            
            {/* Support Information */}
            <div className="space-y-6">
              {/* Support Center Card */}
              <div className="bg-gradient-to-br from-cyan-50 to-green-50 rounded-xl p-8 text-center hover:bg-green-50 transition-all">
                <div className="w-20 h-20 bg-gradient-to-br from-green-200 to-cyan-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Headphones className="w-10 h-10 text-green-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Support Center</h3>
                <p className="text-gray-600 mb-6">
                  Get help and submit tickets for quick resolution of your issues.
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Get Support
                </Button>
              </div>
              
              {/* FAQ Section */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:bg-green-50 transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">How long does installation take?</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      Typically, residential installations take 1-3 days depending on system size.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Do you provide warranties?</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      Yes, we offer comprehensive warranties on all panels and installations.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">What financing options are available?</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      We offer flexible payment plans and work with multiple financing partners.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Business Hours */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:bg-green-50 transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Business Hours</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-semibold">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-semibold">9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-semibold">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}