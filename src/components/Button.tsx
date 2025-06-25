import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline' | 'link' | 'pill' | 'black';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

export default function Button({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  title,
  ...props
}: ButtonProps) {
  
  // Base styles
  const baseStyles = `font-semibold ${variant === 'pill' ? 'rounded-full' : 'rounded-lg'} transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 inline-flex items-center justify-center gap-2 cursor-pointer`;
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-white/20 hover:bg-white/30 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'text-white hover:text-white/80',
    outline: 'border border-white/30 text-white hover:bg-white/10',
    link: 'text-blue-300 hover:text-blue-200 underline',
    pill: 'text-white/60 hover:text-white hover:bg-white/10 border border-white/30 hover:border-white/50 transition-all duration-200',
    black: 'bg-slate-700 hover:bg-slate-900 text-white',
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-2',
    lg: 'px-6 py-3',
    xl: 'px-8 py-4 text-lg font-bold',
    icon: 'p-3'
  };
  
  // Disabled styles
  const disabledStyles = disabled ? 'disabled:bg-gray-500 disabled:cursor-not-allowed opacity-50' : '';
  
  // Full width styles
  const fullWidthStyles = fullWidth ? 'w-full' : '';
  
  // Combine all styles
  const buttonClasses = variant !== 'ghost' ? `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${disabledStyles}
    ${fullWidthStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ') : `
    ${baseStyles}
    ${variantStyles[variant]}
    ${disabledStyles}
    ${fullWidthStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
    icon: 'w-6 h-6'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
      title={title}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          {children}
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={iconSize[size]} />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className={iconSize[size]} />
          )}
        </>
      )}
    </button>
  );
} 