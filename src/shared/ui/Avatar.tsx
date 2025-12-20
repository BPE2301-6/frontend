import { HTMLAttributes } from 'react';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'small' | 'default' | 'large';
  className?: string;
}

function Avatar({ size = 'default', className = '', ...props }: AvatarProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-figma-avatar-size h-figma-avatar-size',
    large: 'w-12 h-12',
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-figma-white rounded-full flex items-center justify-center ${className}`}
      {...props}
    >
      <div className="w-6 h-6 border-4 border-figma-user-border rounded-full"></div>
    </div>
  );
}

export default Avatar;

