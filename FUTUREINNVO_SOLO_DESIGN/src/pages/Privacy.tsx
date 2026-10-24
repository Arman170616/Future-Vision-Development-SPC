import { Shield, Lock, Eye, FileText, Mail, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Privacy = () => {
  const { tr, fmtDate } = useLanguage();
  const lastUpdated = "March 1, 2024";

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-slide-in">
            {tr('Privacy Policy & Terms', 'سياسة الخصوصية والشروط')}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto animate-slide-in">
            {tr('Your privacy and trust are important to us. Learn how we protect your data and what terms govern our services.', 'خصوصيتك وثقتك مهمتان لنا. تعرّف على كيفية حماية بياناتك والشروط التي تحكم خدماتنا.')}
          </p>
          <p className="text-blue-200 mt-4">{tr('Last updated:', 'آخر تحديث:')} {fmtDate(lastUpdated)}</p>
        </div>

        {/* Quick Navigation */}
        <div className="glass-effect-strong rounded-xl p-6 mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {tr('Quick Navigation', 'تنقّل سريع')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="#privacy-policy" className="text-blue-300 hover:text-white transition-colors">• {tr('Privacy Policy', 'سياسة الخصوصية')}</a>
            <a href="#terms-of-service" className="text-blue-300 hover:text-white transition-colors">• {tr('Terms of Service', 'شروط الخدمة')}</a>
            <a href="#data-collection" className="text-blue-300 hover:text-white transition-colors">• {tr('Data Collection', 'جمع البيانات')}</a>
            <a href="#cookies" className="text-blue-300 hover:text-white transition-colors">• {tr('Cookie Policy', 'سياسة ملفات تعريف الارتباط')}</a>
            <a href="#user-rights" className="text-blue-300 hover:text-white transition-colors">• {tr('Your Rights', 'حقوقك')}</a>
            <a href="#contact" className="text-blue-300 hover:text-white transition-colors">• {tr('Contact Us', 'تواصل معنا')}</a>
          </div>
        </div>

        {/* Privacy Policy Section */}
        <section id="privacy-policy" className="mb-12">
          <div className="glass-effect-strong rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Shield className="h-6 w-6 mr-3 text-blue-300" />
              {tr('Privacy Policy', 'سياسة الخصوصية')}
            </h2>
            
            <div className="space-y-6 text-blue-100">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">{tr('Our Commitment to Privacy', 'التزامنا بالخصوصية')}</h3>
                <p>
                  {tr('At FUTUREINNVO, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.', 'نلتزم في FUTUREINNVO بحماية خصوصيتك وضمان أمان معلوماتك الشخصية. توضّح سياسة الخصوصية هذه كيفية جمع معلوماتك واستخدامها والإفصاح عنها وحمايتها عند زيارتك لموقعنا أو استخدامك لخدماتنا.')}
                </p>
              </div>

              <div id="data-collection">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  {tr('Information We Collect', 'المعلومات التي نجمعها')}
                </h3>
                <ul className="space-y-2 ml-4">
                  <li>• <strong>{tr('Personal Information:', 'المعلومات الشخصية:')}</strong> {tr('Name, email address, phone number, and other contact details you provide', 'الاسم والبريد الإلكتروني ورقم الهاتف وبيانات التواصل الأخرى التي تقدّمها')}</li>
                  <li>• <strong>{tr('Usage Data:', 'بيانات الاستخدام:')}</strong> {tr('Information about how you interact with our website and services', 'معلومات حول كيفية تفاعلك مع موقعنا وخدماتنا')}</li>
                  <li>• <strong>{tr('Technical Data:', 'البيانات التقنية:')}</strong> {tr('IP address, browser type, device information, and operating system', 'عنوان IP ونوع المتصفح ومعلومات الجهاز ونظام التشغيل')}</li>
                  <li>• <strong>{tr('Communication Data:', 'بيانات المراسلات:')}</strong> {tr('Records of your communications with us', 'سجلات مراسلاتك معنا')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">{tr('How We Use Your Information', 'كيف نستخدم معلوماتك')}</h3>
                <ul className="space-y-2 ml-4">
                  <li>• {tr('To provide and maintain our services', 'لتقديم خدماتنا والحفاظ عليها')}</li>
                  <li>• {tr('To communicate with you about our services', 'للتواصل معك بشأن خدماتنا')}</li>
                  <li>• {tr('To improve our website and user experience', 'لتحسين موقعنا وتجربة المستخدم')}</li>
                  <li>• {tr('To comply with legal obligations', 'للامتثال للالتزامات القانونية')}</li>
                  <li>• {tr('To protect against fraud and security threats', 'للحماية من الاحتيال والتهديدات الأمنية')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  {tr('Data Security', 'أمن البيانات')}
                </h3>
                <p>
                  {tr('We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments.', 'نطبّق تدابير أمنية تقنية وتنظيمية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرّح به أو التعديل أو الإفصاح أو الإتلاف، بما في ذلك التشفير والخوادم الآمنة والتقييمات الأمنية الدورية.')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Terms of Service Section */}
        <section id="terms-of-service" className="mb-12">
          <div className="glass-effect-strong rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FileText className="h-6 w-6 mr-3 text-blue-300" />
              {tr('Terms of Service', 'شروط الخدمة')}
            </h2>
            
            <div className="space-y-6 text-blue-100">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">{tr('Acceptance of Terms', 'قبول الشروط')}</h3>
                <p>
                  {tr('By accessing and using our website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.', 'باستخدامك لموقعنا وخدماتنا، فإنك توافق على الالتزام بشروط وأحكام هذه الاتفاقية. إذا كنت لا توافق على ذلك، يرجى عدم استخدام هذه الخدمة.')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">{tr('Use License', 'ترخيص الاستخدام')}</h3>
                <p>
                  {tr("Permission is granted to temporarily download one copy of the materials on FUTUREINNVO's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:", 'يُسمح بتنزيل نسخة واحدة مؤقتة من المواد المنشورة على موقع FUTUREINNVO للاطلاع الشخصي غير التجاري فقط. ويُعد هذا منحاً لترخيص وليس نقلاً للملكية، ولا يجوز لك بموجب هذا الترخيص:')}
                </p>
                <ul className="space-y-2 ml-4 mt-3">
                  <li>• {tr('Modify or copy the materials', 'تعديل المواد أو نسخها')}</li>
                  <li>• {tr('Use the materials for any commercial purpose or for any public display', 'استخدام المواد لأي غرض تجاري أو لأي عرض عام')}</li>
                  <li>• {tr('Attempt to reverse engineer any software contained on the website', 'محاولة الهندسة العكسية لأي برمجيات على الموقع')}</li>
                  <li>• {tr('Remove any copyright or other proprietary notations from the materials', 'إزالة أي إشعارات لحقوق النشر أو الملكية من المواد')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">{tr('Disclaimer', 'إخلاء المسؤولية')}</h3>
                <p>
                  {tr("The materials on FUTUREINNVO's website are provided on an 'as is' basis. FUTUREINNVO makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.", 'تُقدَّم المواد على موقع FUTUREINNVO «كما هي». ولا تقدّم FUTUREINNVO أي ضمانات صريحة أو ضمنية، وتُخلي مسؤوليتها من جميع الضمانات الأخرى، بما في ذلك على سبيل المثال لا الحصر الضمانات الضمنية أو شروط القابلية للتسويق أو الملاءمة لغرض معين أو عدم انتهاك الملكية الفكرية أو غيرها من الحقوق.')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">{tr('Limitations', 'حدود المسؤولية')}</h3>
                <p>
                  {tr("In no event shall FUTUREINNVO or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on FUTUREINNVO's website, even if FUTUREINNVO or an authorized representative has been notified orally or in writing of the possibility of such damage.", 'لا تتحمل FUTUREINNVO أو مورّدوها بأي حال من الأحوال المسؤولية عن أي أضرار (بما في ذلك على سبيل المثال لا الحصر الأضرار الناتجة عن فقدان البيانات أو الأرباح أو توقف الأعمال) الناشئة عن استخدام المواد على موقع FUTUREINNVO أو عدم القدرة على استخدامها، حتى لو تم إخطار FUTUREINNVO أو ممثل مفوّض عنها شفهياً أو كتابياً بإمكانية حدوث مثل هذه الأضرار.')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cookie Policy Section */}
        <section id="cookies" className="mb-12">
          <div className="glass-effect-strong rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">{tr('Cookie Policy', 'سياسة ملفات تعريف الارتباط')}</h2>
            
            <div className="space-y-6 text-blue-100">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">{tr('What Are Cookies', 'ما هي ملفات تعريف الارتباط')}</h3>
                <p>
                  {tr('Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our site.', 'ملفات تعريف الارتباط هي ملفات نصية صغيرة تُخزَّن على جهازك عند زيارة موقعنا، وتساعدنا على تقديم تجربة أفضل من خلال تذكّر تفضيلاتك وتحليل طريقة استخدامك للموقع.')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">{tr('Types of Cookies We Use', 'أنواع ملفات تعريف الارتباط التي نستخدمها')}</h3>
                <ul className="space-y-2 ml-4">
                  <li>• <strong>{tr('Essential Cookies:', 'ملفات أساسية:')}</strong> {tr('Required for the website to function properly', 'ضرورية لعمل الموقع بشكل صحيح')}</li>
                  <li>• <strong>{tr('Analytics Cookies:', 'ملفات التحليلات:')}</strong> {tr('Help us understand how visitors interact with our website', 'تساعدنا على فهم كيفية تفاعل الزوار مع موقعنا')}</li>
                  <li>• <strong>{tr('Functional Cookies:', 'ملفات وظيفية:')}</strong> {tr('Remember your preferences and settings', 'تتذكّر تفضيلاتك وإعداداتك')}</li>
                  <li>• <strong>{tr('Marketing Cookies:', 'ملفات تسويقية:')}</strong> {tr('Used to deliver relevant advertisements', 'تُستخدم لعرض إعلانات ذات صلة')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">{tr('Managing Cookies', 'إدارة ملفات تعريف الارتباط')}</h3>
                <p>
                  {tr('You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. However, if you do this, you may have to manually adjust some preferences every time you visit a site.', 'يمكنك التحكم في ملفات تعريف الارتباط أو حذفها كما تشاء، ويمكنك حذف جميع الملفات الموجودة على جهازك وضبط معظم المتصفحات لمنع حفظها. لكن قد تحتاج حينها إلى ضبط بعض التفضيلات يدوياً في كل زيارة.')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* User Rights Section */}
        <section id="user-rights" className="mb-12">
          <div className="glass-effect-strong rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">{tr('Your Rights', 'حقوقك')}</h2>
            
            <div className="space-y-4 text-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-900/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">{tr('Right to Access', 'حق الوصول')}</h3>
                  <p className="text-sm">{tr('Request copies of your personal data', 'طلب نسخ من بياناتك الشخصية')}</p>
                </div>
                <div className="bg-blue-900/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">{tr('Right to Rectification', 'حق التصحيح')}</h3>
                  <p className="text-sm">{tr('Request correction of inaccurate data', 'طلب تصحيح البيانات غير الدقيقة')}</p>
                </div>
                <div className="bg-blue-900/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">{tr('Right to Erasure', 'حق الحذف')}</h3>
                  <p className="text-sm">{tr('Request deletion of your personal data', 'طلب حذف بياناتك الشخصية')}</p>
                </div>
                <div className="bg-blue-900/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">{tr('Right to Portability', 'حق نقل البيانات')}</h3>
                  <p className="text-sm">{tr('Request transfer of your data', 'طلب نقل بياناتك')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="mb-12">
          <div className="glass-effect-strong rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">{tr('Questions About Privacy or Terms?', 'لديك أسئلة حول الخصوصية أو الشروط؟')}</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              {tr("If you have any questions about this Privacy Policy or our Terms of Service, please don't hesitate to contact us.", 'إذا كانت لديك أي أسئلة حول سياسة الخصوصية أو شروط الخدمة، فلا تتردد في التواصل معنا.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="mailto:info@futureinnvo.com" className="ltr flex items-center text-blue-100 hover:text-white transition-colors">
                <Mail className="h-5 w-5 mr-2" />
                info@futureinnvo.com
              </a>
              <a href="tel:+96871111040" className="ltr flex items-center text-blue-100 hover:text-white transition-colors">
                <Phone className="h-5 w-5 mr-2" />
                +968 7111 1040
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
