import { memo } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo = memo(({ size = 'md', showText = true }: LogoProps) => {
  
  const sizeStyles = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  const textSizeStyles = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };
  
  return (
    <div className="flex items-center space-x-2">
      {/* Electric car charging icon */}
      <div className={`${sizeStyles[size]} flex items-center justify-center`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-full h-full"
        >
          {/* Car body */}
          <path
            d="M5 11L6.5 6.5C6.66 6.08 7.08 6 7.5 6H16.5C16.92 6 17.34 6.08 17.5 6.5L19 11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-600 dark:text-primary-400"
          />
          
          {/* Car base */}
          <path
            d="M2 11H22V16C22 16.55 21.55 17 21 17H19C18.45 17 18 16.55 18 16V15H6V16C6 16.55 5.55 17 5 17H3C2.45 17 2 16.55 2 16V11Z"
            fill="currentColor"
            className="text-primary-600 dark:text-primary-400"
          />
          
          {/* Wheels */}
          <circle
            cx="7"
            cy="17"
            r="2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-gray-600 dark:text-gray-400"
          />
          <circle
            cx="17"
            cy="17"
            r="2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-gray-600 dark:text-gray-400"
          />
          
          {/* Charging cable */}
          <path
            d="M12 11V8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-secondary-600 dark:text-secondary-400"
          />
          
          {/* Charging plug */}
          <circle
            cx="12"
            cy="6"
            r="1.5"
            fill="currentColor"
            className="text-secondary-600 dark:text-secondary-400"
          />
          
          {/* Electric bolt */}
          <path
            d="M10.5 13L11.5 12H10.5L11.5 11L12.5 12H11.5L10.5 13Z"
            fill="currentColor"
            className="text-yellow-500 dark:text-yellow-400"
          />
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${textSizeStyles[size]} text-gray-900 dark:text-white`}>
            ChargeOptimal
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
            Smart EV Charging
          </span>
        </div>
      )}
    </div>
  );
});

Logo.displayName = 'Logo';

export default Logo;