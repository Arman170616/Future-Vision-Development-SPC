import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { useLanguage } from '../context/LanguageContext';

const Contact = () => {
  const { tr } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Initialize EmailJS
  const initEmailJS = () => {
    emailjs.init({
      publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY, // Your public key from .env
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setSubmitStatus('error');
      setStatusMessage(tr('Please enter your name.', 'يرجى إدخال اسمك.'));
      return false;
    }
    if (!formData.email.trim()) {
      setSubmitStatus('error');
      setStatusMessage(tr('Please enter your email address.', 'يرجى إدخال بريدك الإلكتروني.'));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setSubmitStatus('error');
      setStatusMessage(tr('Please enter a valid email address.', 'يرجى إدخال بريد إلكتروني صحيح.'));
      return false;
    }
    if (!formData.subject.trim()) {
      setSubmitStatus('error');
      setStatusMessage(tr('Please enter a subject.', 'يرجى اختيار الموضوع.'));
      return false;
    }
    if (!formData.message.trim()) {
      setSubmitStatus('error');
      setStatusMessage(tr('Please enter your message.', 'يرجى كتابة رسالتك.'));
      return false;
    }
    if (formData.message.trim().length < 10) {
      setSubmitStatus('error');
      setStatusMessage(tr('Please enter a message with at least 10 characters.', 'يرجى كتابة رسالة لا تقل عن 10 أحرف.'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');
    setStatusMessage('');

    // Validate form
    if (!validateForm()) {
      setTimeout(() => {
        setSubmitStatus('idle');
        setStatusMessage('');
      }, 5000);
      return;
    }

    setIsSubmitting(true);

    try {
      // Initialize EmailJS
      initEmailJS();

      // Debug: Log configuration
      console.log('EmailJS Configuration:', {
        serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
        templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? 'Present' : 'Missing'
      });

      // Prepare template parameters matching EmailJS expected format
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        company: formData.company || 'Not specified',
        subject: formData.subject,
        message: formData.message,
        to_name: 'FUTUREINNVO Team',
        to_email: 'info@futureinnvo.com', // Add explicit recipient email
        reply_to: formData.email,
        timestamp: new Date().toLocaleString(),
      };

      console.log('Sending email with parameters:', templateParams);

      // Send email using EmailJS with correct service and template IDs
      const response = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID, // Your service ID from .env
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID, // Template ID from .env
        templateParams
      );

      console.log('EmailJS Response:', response);

      if (response.status === 200) {
        setSubmitStatus('success');
        setStatusMessage(tr('Message sent successfully! We will get back to you soon.', 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.'));
        setFormData({
          name: '',
          email: '',
          company: '',
          subject: '',
          message: '',
        });
      }
    } catch (error: any) {
      console.error('EmailJS Error:', error);

      setSubmitStatus('error');

      // Check for specific EmailJS errors
      if (error.text) {
        if (error.text.includes('Invalid public key')) {
          setStatusMessage(tr('Email service configuration error. Please contact us directly at info@futureinnvo.com', 'خطأ في إعدادات خدمة البريد. يرجى مراسلتنا مباشرة على info@futureinnvo.com'));
        } else if (error.text.includes('Template not found')) {
          setStatusMessage(tr('Email template error. Please contact us directly at info@futureinnvo.com', 'خطأ في قالب البريد. يرجى مراسلتنا مباشرة على info@futureinnvo.com'));
        } else if (error.text.includes('Service not found')) {
          setStatusMessage(tr('Email service error. Please contact us directly at info@futureinnvo.com', 'خطأ في خدمة البريد. يرجى مراسلتنا مباشرة على info@futureinnvo.com'));
        } else {
          setStatusMessage(tr(`Failed to send message: ${error.text}. Please try again or contact us directly.`, `تعذّر إرسال الرسالة: ${error.text}. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.`));
        }
      } else {
        setStatusMessage(tr('Failed to send message. Please check your internet connection and try again.', 'تعذّر إرسال الرسالة. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.'));
      }

      // Create a mailto link as fallback
      const mailtoLink = `mailto:info@futureinnvo.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.company || 'Not specified'}\n\nMessage:\n${formData.message}`
      )}`;

      // Show mailto option after a delay
      setTimeout(() => {
        if (confirm(tr('Would you like to open your email client to send the message directly?', 'هل تريد فتح تطبيق البريد لإرسال الرسالة مباشرة؟'))) {
          window.open(mailtoLink, '_blank');
        }
      }, 3000);

    } finally {
      setIsSubmitting(false);
      // Clear status message after 10 seconds for error messages
      setTimeout(() => {
        setSubmitStatus('idle');
        setStatusMessage('');
      }, 10000);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-slide-in">
            {tr('Get In Touch', 'تواصل معنا')}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto animate-slide-in">
            {tr("Ready to start your next project? We'd love to hear from you. Send us a message and we'll respond as soon as possible.", 'هل أنت مستعد لبدء مشروعك القادم؟ يسعدنا أن نسمع منك. أرسل لنا رسالة وسنرد عليك في أقرب وقت ممكن.')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="glass-effect-strong rounded-2xl p-8 h-fit animate-float">
              <h2 className="text-2xl font-bold text-white mb-6">{tr('Contact Information', 'معلومات التواصل')}</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500/30 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{tr('Phone', 'الهاتف')}</h3>
                    <p className="text-blue-100 ltr">+968 7111 1040</p>
                    
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-500/30 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{tr('Email', 'البريد الإلكتروني')}</h3>
                    <a href="mailto:info@futureinnvo.com" className="text-blue-100 hover:text-white ltr">info@futureinnvo.com</a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-500/30 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{tr('Address', 'العنوان')}</h3>
                    <p className="text-blue-100">
                      {tr('Al Shadaah City Mall', 'مجمع الشدح سيتي مول')}<br />
                      {tr('Salalah, Oman', 'صلالة، سلطنة عُمان')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-orange-500/30 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{tr('Business Hours', 'ساعات العمل')}</h3>
                    <p className="text-blue-100">
                      {tr('Sunday - Thursday: 8:00 AM - 6:00 PM', 'الأحد - الخميس: 8:00 ص - 6:00 م')}<br />
                      {tr('Friday - Saturday: Closed', 'الجمعة - السبت: مغلق')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-blue-400/30">
                <h3 className="font-semibold text-white mb-4">{tr('Follow Us', 'تابعنا')}</h3>
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center text-blue-200 font-bold border border-blue-400/30 hover:bg-blue-500/50 transition-all duration-200">
                    Li
                  </div>
                  <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center text-blue-200 font-bold border border-blue-400/30 hover:bg-blue-500/50 transition-all duration-200">
                    Tw
                  </div>
                  <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center text-blue-200 font-bold border border-blue-400/30 hover:bg-blue-500/50 transition-all duration-200">
                    Fb
                  </div>
                  <div className="w-10 h-10 bg-red-500/30 rounded-lg flex items-center justify-center text-red-200 font-bold border border-red-400/30 hover:bg-red-500/50 transition-all duration-200">
                    In
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="glass-effect-strong rounded-2xl p-8 animate-float" style={{ animationDelay: '1s' }}>
              <h2 className="text-2xl font-bold text-white mb-6">{tr('Send us a Message', 'أرسل لنا رسالة')}</h2>

              {/* Status Message */}
              {submitStatus !== 'idle' && (
                <div className={`mb-6 p-4 rounded-lg flex items-center ${
                  submitStatus === 'success'
                    ? 'bg-green-500/20 border border-green-400/30 text-green-200'
                    : 'bg-red-500/20 border border-red-400/30 text-red-200'
                }`}>
                  {submitStatus === 'success' ? (
                    <CheckCircle className="h-5 w-5 mr-3" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-3" />
                  )}
                  {statusMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                      {tr('Full Name *', 'الاسم الكامل *')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      className="w-full px-4 py-3 bg-blue-500/20 border border-blue-400/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white placeholder-blue-200"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      {tr('Email Address *', 'البريد الإلكتروني *')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      className="w-full px-4 py-3 bg-blue-500/20 border border-blue-400/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white placeholder-blue-200"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-white mb-2">
                      {tr('Company', 'الشركة')}
                    </label>
                    <input
                      type="text"
                      id="company"
                      className="w-full px-4 py-3 bg-blue-500/20 border border-blue-400/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white placeholder-blue-200"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                      {tr('Subject *', 'الموضوع *')}
                    </label>
                    <select
                      id="subject"
                      required
                      className="w-full px-4 py-3 bg-blue-500/20 border border-blue-400/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="" className="bg-blue-900 text-blue-200">{tr('Select a subject', 'اختر الموضوع')}</option>
                      <option value="general" className="bg-blue-900 text-white">{tr('General Inquiry', 'استفسار عام')}</option>
                      <option value="project" className="bg-blue-900 text-white">{tr('Project Discussion', 'مناقشة مشروع')}</option>
                      <option value="partnership" className="bg-blue-900 text-white">{tr('Partnership', 'شراكة')}</option>
                      <option value="support" className="bg-blue-900 text-white">{tr('Technical Support', 'الدعم الفني')}</option>
                      <option value="career" className="bg-blue-900 text-white">{tr('Career Opportunity', 'فرصة وظيفية')}</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                    {tr('Message *', 'الرسالة *')}
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    required
                    className="w-full px-4 py-3 bg-blue-500/20 border border-blue-400/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white placeholder-blue-200"
                    placeholder={tr('Tell us about your project or inquiry...', 'أخبرنا عن مشروعك أو استفسارك...')}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>
                
                <div className="mt-8 space-y-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full md:w-auto px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center ${
                      isSubmitting
                        ? 'bg-blue-500/50 cursor-not-allowed text-blue-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {tr('Sending...', 'جارٍ الإرسال...')}
                      </>
                    ) : (
                      <>
                        {tr('Send Message', 'إرسال الرسالة')}
                        <Send className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>

                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <div className="glass-effect-strong rounded-2xl overflow-hidden animate-slide-in">
            <div className="p-6 bg-gradient-to-br from-blue-500/30 to-purple-500/30">
              <div className="text-center text-white mb-6">
                <MapPin className="h-12 w-12 mx-auto mb-4 animate-pulse-glow" />
                <h3 className="text-2xl font-bold mb-2">{tr('Visit Our Office', 'زُر مكتبنا')}</h3>
                <p className="text-blue-100 mb-4">{tr('Al Shadaah City Mall, Salalah, Oman', 'مجمع الشدح سيتي مول، صلالة، سلطنة عُمان')}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://maps.app.goo.gl/cnZvoUm5Qhb12VVG7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 glass-effect-strong text-white font-semibold rounded-lg hover:bg-blue-500/30 transition-all duration-200 animate-pulse-glow"
                  >
                    <MapPin className="mr-2 h-5 w-5" />
                    {tr('Open in Google Maps', 'فتح في خرائط Google')}
                  </a>
                  <button
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const { latitude, longitude } = position.coords;
                            const destination = "17.0194,54.0924"; // Al Shadaah City Mall coordinates
                            const url = `https://www.google.com/maps/dir/${latitude},${longitude}/${destination}`;
                            window.open(url, '_blank');
                          },
                          () => {
                            // Fallback if geolocation fails
                            window.open("https://maps.app.goo.gl/cnZvoUm5Qhb12VVG7", '_blank');
                          }
                        );
                      } else {
                        window.open("https://maps.app.goo.gl/cnZvoUm5Qhb12VVG7", '_blank');
                      }
                    }}
                    className="inline-flex items-center px-6 py-3 glass-effect text-white font-semibold rounded-lg border border-blue-400/30 hover:bg-blue-500/20 transition-all duration-200"
                  >
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    {tr('Get Directions', 'الاتجاهات')}
                  </button>
                </div>
              </div>

              {/* Embedded Google Map */}
              <div className="relative h-96 rounded-xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3827.8234567890123!2d54.0924!3d17.0194!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDAxJzA5LjgiTiA1NMKwMDUnMzIuNiJF!5e0!3m2!1sen!2som!4v1234567890123!5m2!1sen!2som"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-xl"
                  title="Al Shadaah City Mall Location"
                ></iframe>

                {/* Overlay for better integration */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-blue-900/20 to-transparent rounded-xl"></div>
              </div>

              {/* Additional Location Info */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="glass-effect p-4 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-300 mx-auto mb-2" />
                  <h4 className="font-semibold text-white mb-1">{tr('Business Hours', 'ساعات العمل')}</h4>
                  <p className="text-blue-100 text-sm">{tr('Sun-Thu: 9AM-7PM', 'الأحد - الخميس: 9 ص - 7 م')}</p>
                </div>
                <div className="glass-effect p-4 rounded-lg">
                  <Phone className="h-6 w-6 text-green-300 mx-auto mb-2" />
                  <h4 className="font-semibold text-white mb-1">{tr('Call Us', 'اتصل بنا')}</h4>
                  <p className="text-blue-100 text-sm ltr">+968 7111 1040</p>
                </div>
                <div className="glass-effect p-4 rounded-lg">
                  <MapPin className="h-6 w-6 text-purple-300 mx-auto mb-2" />
                  <h4 className="font-semibold text-white mb-1">{tr('Parking', 'مواقف السيارات')}</h4>
                  <p className="text-blue-100 text-sm">{tr('Free parking available', 'مواقف مجانية متاحة')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;