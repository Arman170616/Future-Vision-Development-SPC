import { Loader2, Zap, Star } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  variant?: 'default' | 'minimal' | 'fancy';
}

const LoadingSpinner = ({ 
  size = 'md', 
  message = 'Loading...', 
  variant = 'default' 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const containerSizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-400`} />
        {message && size !== 'sm' && (
          <span className="ml-2 text-blue-200 text-sm">{message}</span>
        )}
      </div>
    );
  }

  if (variant === 'fancy') {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          {/* Animated Logo/Icon */}
          <div className="relative mb-4">
            <div className="absolute inset-0 animate-ping">
              <Zap className={`${sizeClasses[size]} text-blue-400/50 mx-auto`} />
            </div>
            <Zap className={`${sizeClasses[size]} text-blue-400 mx-auto animate-pulse`} />
          </div>
          
          {/* Loading Text */}
          <div className="flex items-center justify-center space-x-1 mb-2">
            <span className="text-blue-200 font-medium">{message}</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
          
          {/* Floating Stars */}
          <div className="relative">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className="absolute h-3 w-3 text-blue-300/30 animate-pulse"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${Math.sin(i) * 10}px`,
                  animationDelay: `${i * 200}ms`,
                  animationDuration: `${2 + i * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`flex items-center justify-center ${containerSizeClasses[size]}`}>
      <div className="text-center">
        <div className="relative mb-4">
          {/* Outer ring */}
          <div className={`${sizeClasses[size]} border-4 border-blue-400/20 border-t-blue-400 rounded-full animate-spin mx-auto`}></div>
          
          {/* Inner ring */}
          <div 
            className={`absolute inset-2 border-2 border-blue-300/30 border-b-blue-300 rounded-full animate-spin mx-auto`}
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          ></div>
        </div>
        
        {message && (
          <p className="text-blue-200 text-sm font-medium animate-pulse">{message}</p>
        )}
      </div>
    </div>
  );
};

// Full page loading component
export const FullPageLoader = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" message={message} variant="fancy" />
        <div className="mt-8 glass-effect-strong rounded-lg p-4 max-w-md">
          <p className="text-blue-300 text-sm">
            "Innovation is the ability to see change as an opportunity, not a threat."
          </p>
          <p className="text-blue-400 text-xs mt-2">- Future Vision Development</p>
        </div>
      </div>
    </div>
  );
};

// Inline loading component for buttons
export const ButtonLoader = () => {
  return (
    <div className="flex items-center">
      <Loader2 className="h-4 w-4 animate-spin mr-2" />
      <span>Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
