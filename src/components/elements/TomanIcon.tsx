import React from 'react';
import TomanSvg from '@/assets/images/Toman.svg?react';
import RialSvg from '@/assets/images/rial.svg?react';

interface IconProps {
  size?: number | string; // Accepts number (pixels) or string (e.g., '2rem')
  fill?: string; // Accepts color string (e.g., 'red', '#000')
  className?: string;
  style?: React.CSSProperties;
}

export const TomanIcon: React.FC<IconProps> = ({
  size = 24,
  fill = 'var(--text-primary)',
  className,
  style,
  ...rest
}) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;

  return (
    <TomanSvg
      style={{
        width: dimension,
        height: dimension,
        aspectRatio: '1 / 1',
        display: 'inline-block',
        fill,
        ...style,
      }}
      className={className}
      {...rest}
    />
  );
};

export const RialIcon: React.FC<IconProps> = ({
  size = 44,
  fill = 'var(--text-primary)',
  className,
  style,
  ...rest
}) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;

  return (
    <RialSvg
      style={{
        width: dimension,
        height: dimension,
        aspectRatio: '1 / 1',
        display: 'inline-block',
        fill,
        ...style,
      }}
      className={className}
      {...rest}
    />
  );
};
