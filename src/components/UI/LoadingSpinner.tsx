import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  progress?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md',
  progress,
  className,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center p-8', className)}>
      <div className="relative">
        <Loader2
          className={clsx(
            'animate-spin text-primary-600',
            sizeClasses[size]
          )}
        />
        
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={clsx('text-xs font-medium text-primary-600')}>
              {Math.round(progress)}%
            </div>
          </div>
        )}
      </div>
      
      {message && (
        <div className="mt-4 text-center">
          <p className={clsx('text-gray-600 font-medium', textSizeClasses[size])}>
            {message}
          </p>
          
          {progress !== undefined && (
            <div className="mt-2 w-48 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner; 