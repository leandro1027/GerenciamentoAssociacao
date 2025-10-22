import React, { useId } from 'react';

type InputProps = React.ComponentProps<'input'> & {
  label?: string;
  icon?: React.ReactNode;
  onIconClick?: () => void;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, onIconClick, ...props }, ref) => {
 
    const inputId = useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative w-full">
          <input
            id={inputId}
            ref={ref}
            {...props}
            className={`w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors duration-200 placeholder:text-gray-500 text-gray-800 font-semibold ${icon ? 'pr-10' : ''} ${props.className}`}
          />
          {icon && (
            <div 
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-gray-700"
              onClick={onIconClick}
            >
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;