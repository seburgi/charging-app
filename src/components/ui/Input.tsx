import { memo, forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, startIcon, endIcon, className = '', ...props }, ref) => {
    
    const baseStyles = `
      w-full px-3 py-2 border rounded-md
      transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed
      ${startIcon ? 'pl-10' : ''}
      ${endIcon ? 'pr-10' : ''}
    `;
    
    const variantStyles = error
      ? `
        border-red-300 focus:border-red-500 focus:ring-red-500
        dark:border-red-600 dark:focus:border-red-500
      `
      : `
        border-gray-300 focus:border-blue-500 focus:ring-blue-500
        dark:border-gray-600 dark:focus:border-blue-500
      `;
    
    const backgroundStyles = `
      bg-white dark:bg-gray-800
      text-gray-900 dark:text-gray-100
      placeholder-gray-500 dark:placeholder-gray-400
    `;
    
    const combinedClassName = `
      ${baseStyles}
      ${variantStyles}
      ${backgroundStyles}
      ${className}
    `;
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400 dark:text-gray-500">
                {startIcon}
              </div>
            </div>
          )}
          <input
            ref={ref}
            className={combinedClassName}
            {...props}
          />
          {endIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400 dark:text-gray-500">
                {endIcon}
              </div>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default memo(Input);