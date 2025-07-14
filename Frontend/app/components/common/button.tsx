// components/common/Button.tsx
import React from 'react';

// Aceita todas as propriedades de um botão HTML padrão
type ButtonProps = React.ComponentProps<'button'> & {
  isLoading?: boolean;
};

const Button = ({ children, isLoading, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      disabled={isLoading}
      className={`w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed ${props.className}`}
    >
      {isLoading ? 'Aguarde...' : children}
    </button>
  );
};

export default Button;
