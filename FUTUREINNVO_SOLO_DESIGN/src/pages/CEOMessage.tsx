import React from 'react';
import { Quote, Award, TrendingUp, Globe, Users, Lightbulb, Target, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CEOMessage = () => {
  const { tr } = useLanguage();
  const achievements = [
    {
      icon: TrendingUp,
      title: tr('300% Growth', 'نمو بنسبة 300%'),
      description: tr('Year-over-year revenue growth', 'نمو سنوي في الإيرادات'),
      color: 'text-green-300'
    },
    {
      icon: Users,
      title: tr('50+ Clients', '+50 عميلاً'),
      description: tr('Successful partnerships globally', 'شراكات ناجحة حول العالم'),
      color: 'text-blue-300'
    },
    {
      icon: Award,
      title: tr('15+ Awards', '+15 جائزة'),
      description: tr('Industry recognition and accolades', 'تقدير وجوائز من القطاع'),
      color: 'text-purple-300'
    },
    {
      icon: Globe,
      title: tr('12 Countries', '12 دولة'),
      description: tr('International project delivery', 'تنفيذ مشاريع دولية'),
      color: 'text-orange-300'
    }
  ];

  const visionPoints = [
    {
      icon: Lightbulb,
      title: tr('Innovation Leadership', 'ريادة الابتكار'),
      description: tr('Leading the charge in AI and digital transformation across the Middle East and beyond.', 'نقود مسيرة الذكاء الاصطناعي والتحول الرقمي في الشرق الأوسط وخارجه.'),
      color: 'text-yellow-300'
    },
    {
      icon: Target,
      title: tr('Client Success', 'نجاح العملاء'),
      description: tr('Delivering measurable results that transform businesses and create lasting value.', 'نحقق نتائج ملموسة تحوّل الأعمال وتصنع قيمة مستدامة.'),
      color: 'text-red-300'
    },
    {
      icon: Users,
      title: tr('Team Excellence', 'تميّز الفريق'),
      description: tr('Building a world-class team of innovators, creators, and problem solvers.', 'نبني فريقاً عالمي المستوى من المبتكرين والمبدعين وصنّاع الحلول.'),
      color: 'text-green-300'
    },
    {
      icon: Globe,
      title: tr('Global Impact', 'أثر عالمي'),
      description: tr('Creating solutions that make a positive difference in communities worldwide.', 'نصنع حلولاً تُحدث فرقاً إيجابياً في المجتمعات حول العالم.'),
      color: 'text-blue-300'
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-slide-in">
            {tr('Message from our ', 'كلمة ')}<span className="text-blue-300 animate-pulse-glow">{tr('CEO', 'الرئيس التنفيذي')}</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto animate-slide-in">
            {tr('A personal note from our leadership on our vision, values, and commitment to innovation.', 'رسالة شخصية من قيادتنا حول رؤيتنا وقيمنا والتزامنا بالابتكار.')}
          </p>
        </div>

        {/* CEO Profile Section */}
        <section className="mb-16">
          <div className="glass-effect-strong rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* CEO Image */}
              <div className="relative">
                <img
                  src="https://i.ibb.co/v4RYptLv/ceo-photo.png"
                  alt="CEO, FUTUREINNVO"
                  className="w-full h-96 lg:h-full object-cover"
                  onError={(e) => {
                    // Fallback to a professional placeholder if the image is not found
                    e.currentTarget.src = "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent"></div>
                <div className="absolute bottom-6 start-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">{tr('CEO & Founder', 'الرئيسة التنفيذية والمؤسِّسة')}</h2>
                  <p className="text-blue-200">FUTUREINNVO</p>
                  <p className="text-blue-300 text-sm mt-1">{tr('Leading Innovation in Oman', 'ريادة الابتكار في عُمان')}</p>
                </div>
              </div>
              
              {/* CEO Info */}
              <div className="p-8 lg:p-12">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-4">{tr('Visionary Leadership', 'قيادة ذات رؤية')}</h3>
                  <p className="text-blue-200 leading-relaxed">
                    {tr("A distinguished leader in technology and innovation, our CEO brings extensive experience in digital transformation and business development. Her vision for the future of AI and technology solutions continues to drive FUTUREINNVO's mission to transform businesses across the Middle East and beyond.", 'قائدة متميزة في مجال التقنية والابتكار، تمتلك رئيستنا التنفيذية خبرة واسعة في التحول الرقمي وتطوير الأعمال. وتواصل رؤيتها لمستقبل الذكاء الاصطناعي والحلول التقنية قيادة رسالة FUTUREINNVO في تحويل الأعمال في الشرق الأوسط وخارجه.')}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="glass-effect p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-300 mb-1">15+</div>
                    <div className="text-blue-200 text-sm">{tr('Years Experience', 'سنوات من الخبرة')}</div>
                  </div>
                  <div className="glass-effect p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-300 mb-1">100+</div>
                    <div className="text-blue-200 text-sm">{tr('Projects Led', 'مشروع تحت قيادتها')}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-blue-200">
                    <Award className="h-5 w-5 text-purple-300 mr-3" />
                    <span>{tr('Innovation & Technology Leader', 'رائدة في الابتكار والتقنية')}</span>
                  </div>
                  <div className="flex items-center text-blue-200">
                    <Award className="h-5 w-5 text-purple-300 mr-3" />
                    <span>{tr('Digital Transformation Strategist', 'خبيرة استراتيجيات التحول الرقمي')}</span>
                  </div>
                  <div className="flex items-center text-blue-200">
                    <Award className="h-5 w-5 text-purple-300 mr-3" />
                    <span>{tr('Business Development Expert', 'خبيرة في تطوير الأعمال')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CEO Message */}
        <section className="mb-16">
          <div className="glass-effect-strong rounded-2xl p-8 lg:p-12">
            <div className="flex items-center mb-8">
              <Quote className="h-12 w-12 text-blue-300 mr-4 animate-pulse-glow" />
              <h2 className="text-3xl font-bold text-white">{tr('A Personal Message', 'رسالة شخصية')}</h2>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <div className="text-blue-100 leading-relaxed space-y-6 text-lg">
                <p className="animate-slide-in">
                  <strong className="text-white">{tr('Dear Partners, Clients, and Team Members,', 'شركاءنا وعملاءنا وأعضاء فريقنا الأعزاء،')}</strong>
                </p>

                <p className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
                  {tr('When we founded ', 'عندما أسّسنا ')}<span className="text-blue-300 font-semibold">FUTUREINNVO</span>{tr(", we had a simple yet ambitious vision: to bridge the gap between cutting-edge technology and real-world business challenges. Today, as I reflect on our journey, I'm incredibly proud of how far we've come and excited about the future we're building together.", '، كانت لدينا رؤية بسيطة وطموحة في آنٍ واحد: سدّ الفجوة بين التقنيات المتقدمة وتحديات الأعمال الواقعية. واليوم، وأنا أتأمل مسيرتنا، أشعر بفخر كبير بما وصلنا إليه وبحماس للمستقبل الذي نبنيه معاً.')}
                </p>
                
                <p className="animate-slide-in" style={{ animationDelay: '0.4s' }}>
                  <span className="text-blue-300 font-semibold">{tr('Artificial Intelligence and Digital Transformation', 'الذكاء الاصطناعي والتحول الرقمي')}</span>{tr(' are not just buzzwords for us – they represent the core of our mission to create meaningful change. Every project we undertake, every solution we develop, and every partnership we forge is guided by our commitment to innovation that makes a real difference.', ' ليسا مجرد شعارات بالنسبة لنا، بل هما جوهر رسالتنا في إحداث تغيير حقيقي. فكل مشروع ننفذه، وكل حل نطوّره، وكل شراكة نعقدها، يقودها التزامنا بابتكار يصنع فرقاً حقيقياً.')}
                </p>
                
                <p className="animate-slide-in" style={{ animationDelay: '0.6s' }}>
                  {tr("What sets us apart is not just our technical expertise, but our deep understanding that technology should serve humanity. We don't just build systems; we create solutions that empower businesses, enhance communities, and improve lives. Our team of brilliant minds works tirelessly to ensure that every line of code, every algorithm, and every digital transformation initiative contributes to a better future.", 'ما يميّزنا ليس خبرتنا التقنية فحسب، بل إيماننا العميق بأن التقنية يجب أن تخدم الإنسان. نحن لا نبني أنظمة فقط، بل نصنع حلولاً تمكّن الأعمال وتنهض بالمجتمعات وتحسّن حياة الناس. ويعمل فريقنا من العقول المبدعة بلا كلل لضمان أن يُسهم كل سطر برمجي وكل خوارزمية وكل مبادرة للتحول الرقمي في بناء مستقبل أفضل.')}
                </p>
                
                <p className="animate-slide-in" style={{ animationDelay: '0.8s' }}>
                  {tr('As we look ahead, I see unprecedented opportunities in the convergence of AI, cloud computing, and digital innovation. The challenges facing businesses today – from operational efficiency to customer engagement – require solutions that are not just technologically advanced, but also strategically sound and ethically responsible.', 'وحين ننظر إلى المستقبل، أرى فرصاً غير مسبوقة في تلاقي الذكاء الاصطناعي والحوسبة السحابية والابتكار الرقمي. فالتحديات التي تواجه الأعمال اليوم، من الكفاءة التشغيلية إلى التفاعل مع العملاء، تتطلب حلولاً متقدمة تقنياً وسليمة استراتيجياً ومسؤولة أخلاقياً.')}
                </p>
                
                <p className="animate-slide-in" style={{ animationDelay: '1s' }}>
                  <span className="text-green-300 font-semibold">{tr('To our clients:', 'إلى عملائنا:')}</span> {tr('Thank you for trusting us with your digital transformation journey. Your success is our success, and we remain committed to delivering solutions that exceed your expectations.', 'شكراً لثقتكم بنا في رحلة تحولكم الرقمي. نجاحكم هو نجاحنا، وسنبقى ملتزمين بتقديم حلول تفوق توقعاتكم.')}
                </p>
                
                <p className="animate-slide-in" style={{ animationDelay: '1.2s' }}>
                  <span className="text-purple-300 font-semibold">{tr('To our team:', 'إلى فريقنا:')}</span> {tr("Your passion, creativity, and dedication are the driving forces behind our achievements. Together, we're not just building a company – we're shaping the future of technology.", 'شغفكم وإبداعكم وتفانيكم هي القوة الدافعة وراء إنجازاتنا. معاً، لا نبني شركة فحسب، بل نصنع مستقبل التقنية.')}
                </p>
                
                <p className="animate-slide-in" style={{ animationDelay: '1.4s' }}>
                  <span className="text-orange-300 font-semibold">{tr('To our partners:', 'إلى شركائنا:')}</span> {tr("Your collaboration and shared vision enable us to tackle challenges that no single organization could solve alone. Together, we're creating an ecosystem of innovation.", 'تعاونكم ورؤيتكم المشتركة يمكّناننا من مواجهة تحديات لا تستطيع مؤسسة واحدة حلّها بمفردها. معاً، نبني منظومة متكاملة للابتكار.')}
                </p>
                
                <p className="animate-slide-in" style={{ animationDelay: '1.6s' }}>
                  {tr("The future belongs to those who dare to innovate, who embrace change, and who never stop learning. At FUTUREINNVO, we're not just preparing for the future – ", 'المستقبل لمن يجرؤ على الابتكار، ويتقبّل التغيير، ولا يتوقف عن التعلّم. في FUTUREINNVO، لا نستعد للمستقبل فحسب، ')}<span className="text-blue-300 font-semibold">{tr("we're creating it", 'بل نصنعه')}</span>.
                </p>

                <p className="animate-slide-in" style={{ animationDelay: '1.8s' }}>
                  <strong className="text-white">
                    {tr('Thank you for being part of our journey. The best is yet to come.', 'شكراً لكونكم جزءاً من رحلتنا. والأفضل لم يأتِ بعد.')}
                  </strong>
                </p>

                <div className="mt-8 animate-slide-in" style={{ animationDelay: '2s' }}>
                  <p className="text-white font-semibold">{tr('CEO & Founder', 'الرئيسة التنفيذية والمؤسِّسة')}</p>
                  <p className="text-blue-300">{tr('Chief Executive Officer', 'الرئيسة التنفيذية')}</p>
                  <p className="text-blue-200">FUTUREINNVO</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Achievements */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center animate-slide-in">{tr('Our Achievements', 'إنجازاتنا')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <div 
                  key={index}
                  className="glass-effect-strong p-6 rounded-xl text-center hover:bg-blue-500/20 transition-all duration-300 animate-float"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <IconComponent className={`h-12 w-12 ${achievement.color} mx-auto mb-4 animate-pulse-glow`} />
                  <h3 className="text-xl font-bold text-white mb-2">{achievement.title}</h3>
                  <p className="text-blue-200">{achievement.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Vision & Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center animate-slide-in">{tr('Our Vision in Action', 'رؤيتنا على أرض الواقع')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {visionPoints.map((point, index) => {
              const IconComponent = point.icon;
              return (
                <div 
                  key={index}
                  className="glass-effect-strong p-8 rounded-xl hover:bg-blue-500/20 transition-all duration-300 animate-slide-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="glass-effect p-3 rounded-lg">
                      <IconComponent className={`h-8 w-8 ${point.color} animate-pulse-glow`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">{point.title}</h3>
                      <p className="text-blue-200 leading-relaxed">{point.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Call to Action */}
        <section>
          <div className="glass-effect-strong animate-gradient bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4 animate-slide-in">{tr('Ready to Shape the Future Together?', 'هل أنت مستعد لنصنع المستقبل معاً؟')}</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto animate-slide-in">
              {tr("Whether you're looking to transform your business or join our mission, we'd love to hear from you.", 'سواء كنت تتطلع إلى تحويل أعمالك أو الانضمام إلى رسالتنا، يسعدنا أن نسمع منك.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="glass-effect-strong text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-500/30 transition-all duration-200 animate-pulse-glow flex items-center justify-center">
                {tr('Start Your Project', 'ابدأ مشروعك')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="glass-effect text-white px-8 py-3 rounded-lg font-semibold border border-blue-400/30 hover:glass-effect-strong transition-all duration-200">
                {tr('Join Our Team', 'انضم إلى فريقنا')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CEOMessage;