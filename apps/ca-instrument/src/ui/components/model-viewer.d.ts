import type { JSX } from 'preact';

interface ModelViewerAttributes extends JSX.HTMLAttributes<HTMLElement> {
  src?: string;
  poster?: string;
  alt?: string;
  ar?: boolean;
  'auto-rotate'?: boolean;
  'rotation-per-second'?: string;
  'camera-controls'?: boolean;
  'touch-action'?: string;
  'disable-zoom'?: boolean;
  'interaction-prompt'?: 'auto' | 'none';
  'shadow-intensity'?: string | number;
  exposure?: string | number;
  reveal?: 'auto' | 'interaction' | 'manual';
  loading?: 'auto' | 'lazy' | 'eager';
}

declare module 'preact' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttributes;
    }
  }
}
