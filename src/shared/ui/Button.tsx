import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'error' | 'outline';
  size?: 'small' | 'default';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

function Button({
  children = '+',
  variant = 'primary',
  size = 'default',
  disabled = false,
  onClick = () => {},
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'font-montserrat font-bold flex items-center justify-center transition-all duration-200';

  const sizeClasses = {
    small: 'w-figma-button-size h-figma-button-size rounded-full text-figma-plus leading-[55px]',
    default:
      'w-figma-input-width h-figma-input-height rounded-figma-button text-figma-input-text leading-[59px]',
  };

  const variantClasses = {
    primary: 'bg-figma-orange text-figma-white hover:bg-orange-600',
    secondary: 'bg-figma-blue text-figma-white hover:bg-blue-600',
    error:
      'bg-transparent border border-figma-red text-figma-red hover:bg-figma-red hover:text-figma-white',
    outline:
      'bg-transparent border border-figma-white text-figma-white hover:bg-figma-white hover:text-figma-bg',
  };

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;

