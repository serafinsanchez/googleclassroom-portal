import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  disabled, 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'py-2 px-4 rounded-lg font-bold transition-all duration-200';
  
  const variants = {
    primary: 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
    success: 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white',
  };

  const loadingStyles = isLoading ? 'opacity-70 cursor-not-allowed' : '';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${loadingStyles} ${disabledStyles} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-lg p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}; 