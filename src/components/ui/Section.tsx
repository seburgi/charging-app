import React, { memo, forwardRef } from 'react';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  headerSpacing?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ 
    title, 
    subtitle, 
    spacing = 'lg', 
    headerSpacing = 'md',
    children, 
    className = '', 
    ...props 
  }, ref) => {
    const spacingStyles = {
      none: '',
      sm: 'py-4',
      md: 'py-6',
      lg: 'py-8',
      xl: 'py-12',
    };
    
    const headerSpacingStyles = {
      none: '',
      sm: 'mb-2',
      md: 'mb-4',
      lg: 'mb-6',
    };
    
    const combinedClassName = `
      ${spacingStyles[spacing]}
      ${className}
    `;
    
    return (
      <section ref={ref} className={combinedClassName} {...props}>
        {(title || subtitle) && (
          <header className={headerSpacingStyles[headerSpacing]}>
            {title && (
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                {subtitle}
              </p>
            )}
          </header>
        )}
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';

export default memo(Section);