import React, { memo, forwardRef } from 'react';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
  children: React.ReactNode;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ maxWidth = 'none', padding = 'md', center = false, children, className = '', ...props }, ref) => {
    const maxWidthStyles = {
      none: '',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
      full: 'max-w-full',
    };
    
    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-4 md:p-6',
      lg: 'p-4 md:p-6 lg:p-8',
      xl: 'p-4 md:p-8 lg:p-12',
    };
    
    const centerStyles = center ? 'mx-auto' : '';
    
    const combinedClassName = `
      ${maxWidthStyles[maxWidth]}
      ${paddingStyles[padding]}
      ${centerStyles}
      ${className}
    `;
    
    return (
      <div ref={ref} className={combinedClassName} {...props}>
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export default memo(Container);