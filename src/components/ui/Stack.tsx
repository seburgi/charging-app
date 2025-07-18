import React, { memo, forwardRef } from 'react';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'horizontal' | 'vertical';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  children: React.ReactNode;
}

const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ 
    direction = 'vertical', 
    gap = 'md', 
    align = 'stretch', 
    justify = 'start',
    wrap = false,
    children, 
    className = '', 
    ...props 
  }, ref) => {
    const directionStyles = {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    };
    
    const gapStyles = {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
      '2xl': 'gap-12',
    };
    
    const gapClassName = typeof gap === 'string' && !gapStyles[gap as keyof typeof gapStyles] 
      ? gap 
      : gapStyles[gap as keyof typeof gapStyles] || gapStyles.md;
    
    const alignStyles = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    };
    
    const justifyStyles = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    };
    
    const wrapStyles = wrap ? 'flex-wrap' : '';
    
    const combinedClassName = `
      flex
      ${directionStyles[direction]}
      ${gapClassName}
      ${alignStyles[align]}
      ${justifyStyles[justify]}
      ${wrapStyles}
      ${className}
    `;
    
    return (
      <div ref={ref} className={combinedClassName} {...props}>
        {children}
      </div>
    );
  }
);

Stack.displayName = 'Stack';

export default memo(Stack);