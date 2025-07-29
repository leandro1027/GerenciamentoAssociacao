// Em: src/app/components/common/button.tsx

import React from 'react';

// 1. Definimos os nomes das variantes que o botão pode ter
type ButtonVariant = 'primary' | 'success' | 'danger' | 'outline';

// 2. Adicionamos a prop 'variant' como opcional à interface
type ButtonProps = React.ComponentProps<'button'> & {
  isLoading?: boolean;
  variant?: ButtonVariant;
};

const Button = ({
  children,
  isLoading,
  variant = 'primary', // 3. Definimos 'primary' como o valor padrão
  className,
  ...props
}: ButtonProps) => {
  // Base de estilos que todos os botões compartilham
  const baseClasses =
    'w-full px-4 py-3 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center';

  // Estilos específicos para cada variante
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'text-white bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 disabled:bg-amber-400',
    success: 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 disabled:bg-green-400',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
    outline: 'text-gray-700 bg-transparent border border-gray-400 hover:bg-gray-100 focus:ring-gray-500 disabled:bg-gray-200',
  };

  return (
    <button
      {...props}
      disabled={isLoading}
      // 4. Juntamos as classes: base + a variante escolhida + qualquer outra classe passada via props
      className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Aguarde...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;