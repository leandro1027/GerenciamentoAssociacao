'use client';

import { useState, useEffect } from 'react';

// Tipos para os dados que virão da API do IBGE
interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

interface Cidade {
  id: number;
  nome: string;
}

interface SelecaoLocalizacaoProps {
  onEstadoChange: (estado: string) => void;
  onCidadeChange: (cidade: string) => void;
}

const SelecaoLocalizacao = ({ onEstadoChange, onCidadeChange }: SelecaoLocalizacaoProps) => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedCidade, setSelectedCidade] = useState('');
  const [isLoadingCidades, setIsLoadingCidades] = useState(false);

  // Efeito para buscar a lista de estados da API do IBGE na montagem do componente
  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => res.json())
      .then((data: Estado[]) => {
        setEstados(data);
      });
  }, []);

  // Efeito para buscar as cidades sempre que um estado for selecionado
  useEffect(() => {
    if (!selectedEstado) {
      setCidades([]);
      return;
    }

    setIsLoadingCidades(true);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedEstado}/municipios`)
      .then(res => res.json())
      .then((data: Cidade[]) => {
        setCidades(data);
      })
      .finally(() => {
        setIsLoadingCidades(false);
      });
  }, [selectedEstado]);

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const estadoSigla = e.target.value;
    setSelectedEstado(estadoSigla);
    setSelectedCidade(''); // Reseta a cidade ao trocar de estado
    onEstadoChange(estadoSigla);
    onCidadeChange(''); // Informa o componente pai que a cidade foi resetada
  };

  const handleCidadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cidadeNome = e.target.value;
    setSelectedCidade(cidadeNome);
    onCidadeChange(cidadeNome);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Dropdown de Estado */}
      <div>
        <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
          Estado
        </label>
        <select
          id="estado"
          name="estado"
          value={selectedEstado}
          onChange={handleEstadoChange}
          required
          // ATUALIZADO: Adicionada a classe text-gray-900
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-600 focus:ring-amber-600 text-gray-900"
        >
          <option value="" disabled>Selecione um estado</option>
          {estados.map(estado => (
            <option key={estado.id} value={estado.sigla}>
              {estado.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown de Cidade */}
      <div>
        <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">
          Cidade
        </label>
        <select
          id="cidade"
          name="cidade"
          value={selectedCidade}
          onChange={handleCidadeChange}
          required
          disabled={!selectedEstado || isLoadingCidades}
          // ATUALIZADO: Adicionada a classe text-gray-900
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-600 focus:ring-amber-600 disabled:bg-gray-100 text-gray-900"
        >
          <option value="" disabled>
            {isLoadingCidades ? 'A carregar cidades...' : !selectedEstado ? 'Selecione um estado primeiro' : 'Selecione uma cidade'}
          </option>
          {cidades.map(cidade => (
            <option key={cidade.id} value={cidade.nome}>
              {cidade.nome}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SelecaoLocalizacao;

