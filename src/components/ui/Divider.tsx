import React, { memo, forwardRef } from 'react';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  thickness?: 'thin' | 'medium' | 'thick';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'light' | 'medium' | 'dark';
}

const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ 
    orientation = 'horizontal', 
    variant = 'solid', 
    thickness = 'thin',
    spacing = 'md',
    color = 'medium',
    className = '', 
    ...props 
  }, ref) => {
    const orientationStyles = {
      horizontal: 'w-full h-0 border-t',
      vertical: 'h-full w-0 border-l',
    };
    
    const variantStyles = {
      solid: 'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
    };
    
    const thicknessStyles = {
      thin: 'border-t-1',
      medium: 'border-t-2',
      thick: 'border-t-4',
    };
    
    const spacingStyles = {
      none: '',
      sm: orientation === 'horizontal' ? 'my-2' : 'mx-2',
      md: orientation === 'horizontal' ? 'my-4' : 'mx-4',
      lg: orientation === 'horizontal' ? 'my-6' : 'mx-6',
      xl: orientation === 'horizontal' ? 'my-8' : 'mx-8',
    };
    
    const colorStyles = {
      light: 'border-gray-100 dark:border-gray-800',
      medium: 'border-gray-200 dark:border-gray-700',
      dark: 'border-gray-300 dark:border-gray-600',
    };
    
    const combinedClassName = `
      ${orientationStyles[orientation]}
      ${variantStyles[variant]}
      ${thicknessStyles[thickness]}
      ${spacingStyles[spacing]}
      ${colorStyles[color]}
      ${className}
    `;
    
    return (
      <div ref={ref} className={combinedClassName} {...props} />
    );
  }
);

Divider.displayName = 'Divider';

export default memo(Divider);