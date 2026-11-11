import { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle, AlertCircle, MessageCircle, Building2 } from 'lucide-react';
import { contactApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { CONTACT } from '../data/company';

const WHATSAPP_NUMBER = CONTACT.phones[0];
const WHATSAPP_URL = CONTACT.whatsapp;

const Contact = () => {
  const { tr } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });

  const [honeypot, setHoneypot] = useState('');
  const [formIncomplete, setFormIncomplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

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
    const valid = validateForm();
    setFormIncomplete(!valid);
    if (!valid) {
      setTimeout(() => {
        setSubmitStatus('idle');
        setStatusMessage('');
      }, 5000);
      return;
    }

    setIsSubmitting(true);

    try {
      await contactApi.sendMessage({ ...formData, website: honeypot });
      setSubmitStatus('success');
      setStatusMessage(tr('Message sent successfully! We will get back to you soon.', 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.'));
      setFormData({ name: '', email: '', company: '', subject: '', message: '' });
      setTimeout(() => {
        setSubmitStatus('idle');
        setStatusMessage('');
      }, 10000);
    } catch {
      // Stays on screen with the WhatsApp link; the typed message is kept
      setSubmitStatus('error');
      setStatusMessage(tr('Your message could not be sent. Please try again in a minute, or reach us on WhatsApp.', 'تعذّر إرسال رسالتك. يرجى المحاولة بعد دقيقة، أو التواصل معنا عبر واتساب.'));
    } finally {
      setIsSubmitting(false);
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
            {tr('Have a claim to report, a survey to arrange or a question about a policy? Reach your adjusters directly — by phone, WhatsApp, email or the form below.', 'لديك مطالبة للإبلاغ عنها، أو معاينة تريد ترتيبها، أو سؤال حول وثيقة تأمين؟ تواصل مع المسوّين مباشرة — عبر الهاتف أو واتساب أو البريد الإلكتروني أو النموذج أدناه.')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="glass-effect-strong rounded-2xl p-8 h-fit animate-float">
              <h2 className="text-2xl font-bold text-white mb-6">{tr('Contact Information', 'معلومات التواصل')}</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500/30 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{tr('Phone', 'الهاتف')}</h3>
                    {CONTACT.phones.map((phone, i) => (
                      <a key={phone} href={CONTACT.phoneLinks[i]} className="block text-blue-100 hover:text-white ltr">{phone}</a>
                    ))}
                  </div>
                </div>

                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                  <div className="bg-green-500/30 p-3 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{tr('WhatsApp Us', 'تواصل عبر واتساب')}</h3>
                    <span className="text-blue-100 group-hover:text-white ltr">{WHATSAPP_NUMBER}</span>
                  </div>
                </a>

                <div className="flex items-start gap-4">
                  <div className="bg-green-500/30 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-green-300" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white">{tr('Email', 'البريد الإلكتروني')}</h3>
                    <a href={`mailto:${CONTACT.email}`} className="text-blue-100 hover:text-white ltr break-all">{CONTACT.email}</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-500/30 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{tr('Postal Address', 'العنوان البريدي')}</h3>
                    <p className="text-blue-100">{tr(...CONTACT.address)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-blue-400/30">
                <h3 className="font-semibold text-white mb-3">{tr('Our Divisions', 'فروعنا')}</h3>
                <div className="flex flex-wrap gap-2">
                  {[tr('Muscat', 'مسقط'), tr('Salalah', 'صلالة')].map(d => (
                    <span key={d} className="glass-effect rounded-full px-4 py-1.5 text-sm text-white inline-flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-blue-300" />{d}
                    </span>
                  ))}
                </div>
                <p className="text-blue-100 text-sm mt-3">
                  {tr('Engineers available for inspections anywhere in the Sultanate, as per instruction.', 'مهندسون متاحون للمعاينات في أي مكان بالسلطنة حسب التكليف.')}
                </p>
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
                  <span>
                    {statusMessage}
                    {submitStatus === 'error' && !formIncomplete && (
                      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="ms-2 inline-flex items-center gap-1 font-semibold underline">
                        <MessageCircle className="h-4 w-4" /> <span className="ltr">{WHATSAPP_NUMBER}</span>
                      </a>
                    )}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Honeypot: hidden from people, bots fill it in */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={e => setHoneypot(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
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
                      {tr('Company / Insurer', 'الشركة / شركة التأمين')}
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
                      <option value="claim" className="bg-blue-900 text-white">{tr('Report a Claim', 'الإبلاغ عن مطالبة')}</option>
                      <option value="survey" className="bg-blue-900 text-white">{tr('Survey / Inspection Request', 'طلب معاينة / مسح')}</option>
                      <option value="valuation" className="bg-blue-900 text-white">{tr('Valuation', 'تقييم')}</option>
                      <option value="risk" className="bg-blue-900 text-white">{tr('Risk Assessment', 'تقييم المخاطر')}</option>
                      <option value="general" className="bg-blue-900 text-white">{tr('General Inquiry', 'استفسار عام')}</option>
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
                    placeholder={tr('Tell us about the claim or inquiry: type of loss, location, date, policy / insurer...', 'أخبرنا عن المطالبة أو الاستفسار: نوع الخسارة، الموقع، التاريخ، الوثيقة / شركة التأمين...')}
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

      </div>
    </div>
  );
};

export default Contact;