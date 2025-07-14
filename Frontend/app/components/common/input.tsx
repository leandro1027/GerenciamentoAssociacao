// components/common/Input.tsx
import React from 'react';

// Aceita todas as propriedades de um input HTML padrão
type InputProps = React.ComponentProps<'input'>;

const Input = (props: InputProps) => {
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors duration-200 ${props.className}`}
    />
  );
};

export default Input;
