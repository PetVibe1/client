import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { cn } from "../../lib/utils";

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onSearch?: (value: string) => void;
  clearable?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "filled";
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      placeholder = "Tìm kiếm...",
      onSearch,
      clearable = true,
      size = "md",
      variant = "default",
      value: propValue,
      onChange: propOnChange,
      ...props
    },
    ref
  ) => {
    // Use controlled or uncontrolled input based on whether a value is provided
    const [localValue, setLocalValue] = useState<string>("");
    const isControlled = propValue !== undefined;
    const value = isControlled ? propValue : localValue;
    
    // Size classes
    const sizeClasses = {
      sm: "py-1.5 pl-8 pr-3 text-sm",
      md: "py-2.5 pl-10 pr-4 text-base",
      lg: "py-3.5 pl-12 pr-5 text-lg",
    };
    
    // Variant classes
    const variantClasses = {
      default: "border-2 border-amber-200 bg-amber-50/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-300 text-slate-800 placeholder:text-slate-500 font-medium",
      outline: "border-2 border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-200 text-slate-800 placeholder:text-slate-400 font-medium",
      filled: "border-none bg-amber-100/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner text-slate-800 placeholder:text-slate-500 font-medium"
    };
    
    // Icon sizes
    const iconSizes = {
      sm: "h-3.5 w-3.5",
      md: "h-4 w-4", 
      lg: "h-5 w-5"
    };
    
    // Icon left padding
    const iconPadding = {
      sm: "pl-2",
      md: "pl-3",
      lg: "pl-4"
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setLocalValue(e.target.value);
      }
      
      if (propOnChange) {
        propOnChange(e);
      }
      
      if (onSearch) {
        onSearch(e.target.value);
      }
    };

    const handleClear = () => {
      if (!isControlled) {
        setLocalValue("");
      }
      
      if (propOnChange) {
        // Create a synthetic event to simulate onChange
        const event = {
          target: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        propOnChange(event);
      }
      
      if (onSearch) {
        onSearch("");
      }
    };

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type="text"
          className={cn(
            "w-full",
            sizeClasses[size],
            variantClasses[variant],
            className
          )}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          {...props}
        />
        <div className={cn("absolute inset-y-0 left-0 flex items-center pointer-events-none", iconPadding[size])}>
          <FontAwesomeIcon icon={faSearch} className={cn("text-amber-500", iconSizes[size])} />
        </div>
        {clearable && value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Clear search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={iconSizes[size]}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput"; 