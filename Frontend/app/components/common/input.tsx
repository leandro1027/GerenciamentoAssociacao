import React from 'react';

type InputProps = React.ComponentProps<'input'> & {
  icon?: React.ReactNode;
  onIconClick?: () => void;
};

const Input = ({ icon, onIconClick, ...props }: InputProps) => {
  return (
    <div className="relative w-full">
      <input
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
  );
};

export default Input;
