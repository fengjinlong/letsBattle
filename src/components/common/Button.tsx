import React from 'react';
import { sound } from '../../sound';

export type ButtonVariant = 'primary' | 'secondary' | 'weak' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  className = '',
  disabled = false,
  onClick,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#FF8C42] text-white shadow-hard-orange hover:bg-[#FF9B58]';
      case 'secondary':
        return 'bg-[#4FB6E8] text-white shadow-hard-blue hover:bg-[#68C3EE]';
      case 'success':
        return 'bg-[#56C93F] text-white shadow-hard-green hover:bg-[#68D952]';
      case 'danger':
        return 'bg-[#E8432E] text-white shadow-[0_4px_0_#B82816] active:shadow-[0_2px_0_#B82816] hover:bg-[#F25743]';
      case 'weak':
        return 'bg-[#8A7A6D] text-white shadow-hard-brown hover:bg-[#9B8C7F]';
      case 'ghost':
        return 'bg-[#FFFBF2] text-[#4A3323] border-2 border-[#EEDCC4] shadow-[0_3px_0_#E0CCA9] active:shadow-[0_1px_0_#E0CCA9] hover:bg-[#FDF6E7]';
      default:
        return 'bg-[#FF8C42] text-white shadow-hard-orange';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'py-1.5 px-3.5 text-sm min-h-[36px]';
      case 'lg':
        return 'py-3.5 px-7 text-lg font-bold min-h-[52px] tracking-wide';
      case 'md':
      default:
        return 'py-2.5 px-5 text-base font-semibold min-h-[44px]';
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    sound.playButton();
    onClick?.(e);
  };

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center gap-2 rounded-full cursor-pointer
        select-none transition-all duration-100 font-cartoon whitespace-nowrap
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed transform-none shadow-none pointer-events-none' : 'active:translate-y-[2px]'}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
