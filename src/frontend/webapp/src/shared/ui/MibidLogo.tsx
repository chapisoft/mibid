'use client';

import React from 'react';

/**
 * Logo Thương Hiệu MIBID chuẩn 100% không viền thừa, to rõ và tự động thích ứng Sáng/Tối
 */
export function MibidLogo({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const heightClass =
    size === 'sm'
      ? 'h-7 sm:h-8'
      : size === 'lg'
      ? 'h-10 sm:h-11'
      : size === 'xl'
      ? 'h-12 sm:h-14'
      : 'h-9 sm:h-10';

  return (
    <div className={`inline-flex items-center select-none cursor-pointer ${className}`}>
      <img
        src="/mibid_logo_brand.png"
        alt="mibid"
        className={`${heightClass} w-auto object-contain transition-all dark:brightness-0 dark:invert`}
      />
    </div>
  );
}

/**
 * Icon Ứng dụng MIBID
 */
export function MibidAppIcon({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClass =
    size === 'sm'
      ? 'w-7 h-7'
      : size === 'lg'
      ? 'w-12 h-12'
      : size === 'xl'
      ? 'w-16 h-16'
      : 'w-9 h-9';

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src="/mibid_app_icon.png"
        alt="MIBID Icon"
        className={`${sizeClass} object-contain`}
      />
    </div>
  );
}
