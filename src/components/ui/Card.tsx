import React, { memo, forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', children, className = '', ...props }, ref) => {
    
    const baseStyles = `
      rounded-lg transition-all duration-200
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
    `;
    
    const variantStyles = {
      default: '',
      outlined: 'border-2',
      elevated: 'shadow-md hover:shadow-lg',
    };
    
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    };
    
    const combinedClassName = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${paddingStyles[padding]}
      ${className}
    `;
    
    return (
      <div ref={ref} className={combinedClassName} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default memo(Card);