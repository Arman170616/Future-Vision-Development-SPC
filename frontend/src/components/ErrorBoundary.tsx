import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    // Rendered outside LanguageProvider, so read the language LanguageProvider wrote to <html lang>
    const ar = document.documentElement.lang === 'ar';
    const tr = (en: string, arText: string) => (ar ? arText : en);
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-orange-900/20 to-red-800/20">
            {/* Floating Error Icons */}
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                <Bug className="h-4 w-4 text-red-400/30" />
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Error Icon */}
            <div className="mb-8 animate-pulse">
              <AlertTriangle className="h-24 w-24 text-red-400 mx-auto animate-bounce" />
            </div>

            {/* Error Message */}
            <div className="glass-effect-strong rounded-2xl p-8 mb-8 animate-slide-in">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {tr('Oops! Something Went Wrong', 'عذراً! حدث خطأ ما')}
              </h1>
              
              <p className="text-xl text-red-100 mb-6 leading-relaxed">
                {tr("We encountered an unexpected error. Our team has been notified and we're working to fix it.", 'واجهنا خطأً غير متوقع. تم إبلاغ فريقنا ونعمل على إصلاحه.')}
              </p>

              {/* Error Details (Development Mode) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-900/30 border border-red-400/30 rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-lg font-semibold text-red-300 mb-2">Error Details:</h3>
                  <pre className="text-sm text-red-200 overflow-auto max-h-40">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <details className="mt-4">
                      <summary className="text-red-300 cursor-pointer hover:text-red-200">
                        Component Stack
                      </summary>
                      <pre className="text-xs text-red-200 mt-2 overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2 text-red-200">
                <span>{tr('Error Type: JavaScript Runtime Error', 'نوع الخطأ: خطأ أثناء التشغيل')}</span>
                <span>•</span>
                <span>{tr('Status: Caught by Error Boundary', 'الحالة: تم احتواء الخطأ')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Reload Page */}
              <button
                onClick={this.handleReload}
                className="glass-effect hover:bg-blue-500/30 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center group animate-float"
              >
                <RefreshCw className="h-5 w-5 mr-2 group-hover:animate-spin" />
                {tr('Reload Page', 'إعادة تحميل الصفحة')}
              </button>

              {/* Go Home */}
              <button
                onClick={this.handleGoHome}
                className="glass-effect hover:bg-green-500/30 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center group animate-float"
                style={{ animationDelay: '0.2s' }}
              >
                <Home className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                {tr('Go Home', 'الصفحة الرئيسية')}
              </button>
            </div>

            {/* Help Text */}
            <div className="glass-effect-strong rounded-xl p-6 animate-slide-in" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-xl font-bold text-white mb-4">{tr('What can you do?', 'ماذا يمكنك أن تفعل؟')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="font-medium text-white">{tr('Reload the Page', 'أعد تحميل الصفحة')}</div>
                  <div className="text-blue-300">{tr('Sometimes a simple refresh fixes the issue', 'أحياناً يكفي التحديث لحل المشكلة')}</div>
                </div>
                
                <div className="text-center">
                  <Home className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="font-medium text-white">{tr('Go to Homepage', 'اذهب إلى الصفحة الرئيسية')}</div>
                  <div className="text-blue-300">{tr('Start fresh from our main page', 'ابدأ من جديد من صفحتنا الرئيسية')}</div>
                </div>
                
                <div className="text-center">
                  <Bug className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <div className="font-medium text-white">{tr('Report the Issue', 'أبلغ عن المشكلة')}</div>
                  <div className="text-blue-300">{tr('Help us improve by reporting bugs', 'ساعدنا على التحسين بالإبلاغ عن الأخطاء')}</div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-8 text-center">
              <p className="text-blue-300 text-sm">
                {tr('If the problem persists, please contact our support team at', 'إذا استمرت المشكلة، يرجى التواصل مع فريق الدعم على')}{' '}
                <a 
                  href="mailto:info.futurevisiondev@gmail.com" 
                  className="text-blue-200 hover:text-blue-100 underline"
                >
                  info.futurevisiondev@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
