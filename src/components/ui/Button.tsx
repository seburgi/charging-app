import { memo, forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, children, className = '', ...props }, ref) => {
    
    const baseStyles = `
      inline-flex items-center justify-center
      font-medium transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${isLoading ? 'cursor-wait' : ''}
    `;
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-6 py-3 text-base rounded-lg',
    };
    
    const variantStyles = {
      primary: `
        bg-blue-600 hover:bg-blue-700 text-white
        focus:ring-blue-500 shadow-sm
        dark:bg-blue-500 dark:hover:bg-blue-600
      `,
      secondary: `
        bg-green-600 hover:bg-green-700 text-white
        focus:ring-green-500 shadow-sm
        dark:bg-green-500 dark:hover:bg-green-600
      `,
      outline: `
        border border-gray-300 bg-white hover:bg-gray-50 text-gray-700
        focus:ring-blue-500 shadow-sm
        dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200
      `,
      ghost: `
        hover:bg-gray-100 text-gray-700
        focus:ring-blue-500
        dark:hover:bg-gray-800 dark:text-gray-200
      `,
    };
    
    const combinedClassName = `
      ${baseStyles}
      ${sizeStyles[size]}
      ${variantStyles[variant]}
      ${className}
    `;
    
    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default memo(Button);