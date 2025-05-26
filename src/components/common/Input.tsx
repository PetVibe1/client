import React, { InputHTMLAttributes, forwardRef } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, showPasswordToggle = false, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputType = props.type === 'password' && showPassword ? 'text' : props.type;
    
    return (
      <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label 
            htmlFor={props.id || props.name} 
            className="block text-sm font-medium text-gray-700 uppercase tracking-wide mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm
              text-navy-800 font-medium
              placeholder-navy-600 
              focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${error ? 'border-red-300' : 'border-gray-300'}
              ${className}
            `}
            {...props}
            type={inputType}
          />
          {showPasswordToggle && props.type === 'password' && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 