import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, RefreshCw, Zap, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const NotFound = () => {
  const { tr } = useLanguage();
  const [glitchActive, setGlitchActive] = useState(false);
  const [floatingElements, setFloatingElements] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Create floating elements
    const elements = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setFloatingElements(elements);

    // Glitch effect interval
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-blue-800/20">
        {/* Floating Elements */}
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.delay}s`,
              animation: `float 6s ease-in-out infinite ${element.delay}s`
            }}
          />
        ))}
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 gap-4 h-full">
            {Array.from({ length: 144 }, (_, i) => (
              <div
                key={i}
                className="border border-blue-400/20 animate-pulse"
                style={{ animationDelay: `${(i * 0.1) % 3}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Animated 404 */}
        <div className="mb-8">
          <h1 
            className={`text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 animate-pulse ${
              glitchActive ? 'animate-bounce' : ''
            }`}
            style={{
              textShadow: glitchActive ? '2px 2px 0px #ff0000, -2px -2px 0px #00ff00' : 'none',
              filter: glitchActive ? 'hue-rotate(180deg)' : 'none'
            }}
          >
            404
          </h1>
          
          {/* Glitch Lines */}
          {glitchActive && (
            <>
              <div className="absolute inset-0 bg-red-500/20 h-2 animate-ping" style={{ top: '40%' }} />
              <div className="absolute inset-0 bg-green-500/20 h-1 animate-ping" style={{ top: '60%' }} />
              <div className="absolute inset-0 bg-blue-500/20 h-3 animate-ping" style={{ top: '50%' }} />
            </>
          )}
        </div>

        {/* Error Message */}
        <div className="glass-effect-strong rounded-2xl p-8 mb-8 animate-slide-in">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-12 w-12 text-yellow-400 animate-bounce mr-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {tr('Oops! Page Not Found', 'عذراً! الصفحة غير موجودة')}
            </h2>
            <Zap className="h-12 w-12 text-yellow-400 animate-bounce ml-4" />
          </div>
          
          <p className="text-xl text-blue-100 mb-6 leading-relaxed">
            {tr("The page you're looking for seems to have vanished into the digital void. Don't worry, even the best explorers sometimes take a wrong turn!", 'يبدو أن الصفحة التي تبحث عنها قد اختفت في الفضاء الرقمي. لا تقلق، حتى أمهر المستكشفين يضلّون الطريق أحياناً!')}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-2 text-blue-200 mb-6">
            <Star className="h-4 w-4 animate-spin" />
            <span>{tr('Error Code: 404', 'رمز الخطأ: 404')}</span>
            <Star className="h-4 w-4 animate-spin" style={{ animationDirection: 'reverse' }} />
            <span>•</span>
            <span>{tr('Page Not Found', 'الصفحة غير موجودة')}</span>
            <Star className="h-4 w-4 animate-spin" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Go Home */}
          <Link
            to="/"
            className="glass-effect hover:bg-blue-500/30 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center group animate-float"
          >
            <Home className="h-5 w-5 mr-2 group-hover:animate-bounce" />
            {tr('Go Home', 'الصفحة الرئيسية')}
          </Link>

          {/* Go Back */}
          <button
            onClick={() => window.history.back()}
            className="glass-effect hover:bg-purple-500/30 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center group animate-float"
            style={{ animationDelay: '0.2s' }}
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:animate-bounce" />
            {tr('Go Back', 'العودة للخلف')}
          </button>

          {/* Search */}
          <Link
            to="/projects"
            className="glass-effect hover:bg-green-500/30 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center group animate-float"
            style={{ animationDelay: '0.4s' }}
          >
            <Search className="h-5 w-5 mr-2 group-hover:animate-bounce" />
            {tr('Explore Projects', 'استكشف المشاريع')}
          </Link>
        </div>

        {/* Quick Links */}
        <div className="glass-effect-strong rounded-xl p-6 animate-slide-in" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            {tr('Quick Navigation', 'تنقّل سريع')}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/projects"
              className="text-blue-300 hover:text-blue-200 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-500/20 text-center"
            >
              <div className="font-medium">{tr('Projects', 'المشاريع')}</div>
              <div className="text-sm text-blue-400">{tr('Our Work', 'أعمالنا')}</div>
            </Link>
            
            <Link
              to="/team"
              className="text-blue-300 hover:text-blue-200 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-500/20 text-center"
            >
              <div className="font-medium">{tr('Team', 'الفريق')}</div>
              <div className="text-sm text-blue-400">{tr('Meet Us', 'تعرّف علينا')}</div>
            </Link>
            
            <Link
              to="/blog"
              className="text-blue-300 hover:text-blue-200 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-500/20 text-center"
            >
              <div className="font-medium">{tr('Blog', 'المدونة')}</div>
              <div className="text-sm text-blue-400">{tr('Latest Posts', 'أحدث المقالات')}</div>
            </Link>
            
            <Link
              to="/jobs"
              className="text-blue-300 hover:text-blue-200 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-500/20 text-center"
            >
              <div className="font-medium">{tr('Careers', 'الوظائف')}</div>
              <div className="text-sm text-blue-400">{tr('Join Us', 'انضم إلينا')}</div>
            </Link>
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-8 text-center animate-pulse">
          <p className="text-blue-300 text-sm">
            {tr('"In the world of innovation, every wrong turn leads to a new discovery." - FUTUREINNVO', '«في عالم الابتكار، كل منعطف خاطئ يقود إلى اكتشاف جديد.» - FUTUREINNVO')}
          </p>
        </div>
      </div>

    </div>
  );
};

export default NotFound;
