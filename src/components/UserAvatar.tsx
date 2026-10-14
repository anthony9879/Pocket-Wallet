import React, { useState } from 'react';

interface UserAvatarProps {
  name: string;
  avatar?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const AVATAR_GRADIENTS = [
  'from-emerald-500 to-teal-700 text-white',
  'from-blue-500 to-indigo-700 text-white',
  'from-violet-500 to-purple-700 text-white',
  'from-amber-500 to-orange-700 text-white',
  'from-rose-500 to-pink-700 text-white',
  'from-cyan-500 to-blue-700 text-white',
  'from-slate-700 to-slate-900 text-white',
];

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatar,
  className = '',
  size = 'md',
}) => {
  const [hasError, setHasError] = useState(false);

  // Compute initials
  const initials = (name || 'User')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Consistent gradient based on name hash
  const hash = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradient = AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }[size];

  if (!avatar || hasError) {
    return (
      <div
        className={`inline-flex items-center justify-center font-bold tracking-tight rounded-2xl bg-gradient-to-tr ${gradient} shrink-0 select-none shadow-xs ${sizeClasses} ${className}`}
        aria-label={name}
      >
        <span>{initials || 'U'}</span>
      </div>
    );
  }

  return (
    <img
      src={avatar}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`rounded-2xl object-cover shrink-0 select-none ring-1 ring-black/5 ${sizeClasses} ${className}`}
    />
  );
};
