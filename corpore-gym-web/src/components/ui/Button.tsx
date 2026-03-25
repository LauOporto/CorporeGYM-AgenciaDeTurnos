import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95";
    
    const variants = {
      primary: "bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 focus:ring-emerald-500 shadow-md",
      secondary: "bg-purple-600 text-white hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-600/30 hover:-translate-y-0.5 focus:ring-purple-600 shadow-md",
      outline: "border-2 border-gray-200/60 bg-white/50 backdrop-blur-sm hover:bg-white hover:shadow-md hover:-translate-y-0.5 text-gray-700",
      ghost: "bg-transparent hover:bg-purple-50 hover:text-purple-700 text-gray-600",
      danger: "bg-red-400 text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 focus:ring-red-400 shadow-md",
      success: "bg-emerald-400 text-white hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 focus:ring-emerald-400 shadow-md",
      warning: "bg-amber-400 text-white hover:bg-amber-500 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 focus:ring-amber-400 shadow-md"
    };
    
    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-12 px-6 text-base",
      lg: "h-14 px-8 text-lg"
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        <span>{children}</span>
      </button>
    );
  }
);
Button.displayName = 'Button';
