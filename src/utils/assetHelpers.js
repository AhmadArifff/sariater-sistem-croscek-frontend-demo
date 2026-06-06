// Asset Utilities & Helpers
// Location: src/utils/assetHelpers.js

import React from 'react';
import { ASSET_PATHS } from '../config/assets';

/**
 * Get asset path dengan fallback
 * @param {string} assetType - Tipe asset (illustration, icon, pattern)
 * @param {string} category - Kategori asset
 * @param {string} name - Nama asset
 * @returns {string} Asset path
 */
export const getAssetPath = (assetType, category, name) => {
  try {
    const path = ASSET_PATHS[assetType]?.[category]?.[name];
    return path || getDefaultAsset(assetType);
  } catch {
    console.warn(`Asset not found: ${assetType}/${category}/${name}`);
    return getDefaultAsset(assetType);
  }
};

/**
 * Get default/fallback asset
 */
const getDefaultAsset = (assetType) => {
  const defaults = {
    illustration: '📄',
    icon: '✨',
    pattern: '🎨',
  };
  return defaults[assetType] || '📦';
};

/**
 * Preload asset untuk performance
 */
export const preloadAsset = (path) => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = path;
    document.head.appendChild(link);
  }
};

/**
 * Lazy load image dengan intersection observer
 */
export const createLazyImageObserver = (element, imagePath) => {
  if (!('IntersectionObserver' in window)) {
    element.src = imagePath;
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.src = imagePath;
        observer.unobserve(entry.target);
      }
    });
  });

  observer.observe(element);
  return observer;
};

/**
 * Optimize image size berdasarkan viewport
 */
export const getResponsiveImageSize = (baseSize = 100) => {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    if (width < 640) return baseSize * 0.75;
    if (width < 1024) return baseSize * 0.9;
    return baseSize;
  }
  return baseSize;
};

/**
 * Image with loading state hook
 */
export const useImageLoad = () => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleLoad = () => setIsLoaded(true);
  const handleError = (e) => setError(e);

  return { isLoaded, error, handleLoad, handleError };
};

export default {
  getAssetPath,
  preloadAsset,
  createLazyImageObserver,
  getResponsiveImageSize,
  useImageLoad,
};
