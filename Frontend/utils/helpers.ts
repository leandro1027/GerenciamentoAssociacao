/**
 * Constrói a URL pública completa para uma imagem no R2,
 * tratando casos de dados antigos (ex: localhost) no DB.
 */
export const buildImageUrl = (imagePath: string | null | undefined): string => {
  const R2_DOMAIN = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
  const PLACEHOLDER = 'https://via.placeholder.com/400x400/e2e8f0/cbd5e0?text=Sem+Imagem';

  if (!imagePath) {
    return PLACEHOLDER;
  }

  // 1.URL pública do R2?
  if (imagePath.includes('r2.dev')) {
    return imagePath;
  }

  let fileName = imagePath;

  // 2. extrai o nome do arquivo.
  if (imagePath.includes('localhost') || imagePath.includes('render.com')) {
    fileName = imagePath.split('/').pop() || '';
  }

  //Remove barras iniciais
  if (fileName.startsWith('/')) {
    fileName = fileName.substring(1);
  }

  //retorna erro
  if (!R2_DOMAIN) {
     console.error('Variável NEXT_PUBLIC_R2_PUBLIC_DOMAIN não definida.');
     return 'https://via.placeholder.com/400x400/e2e8f0/cbd5e0?text=Erro+Config';
  }

  //Retorna a URL completa
  return `${R2_DOMAIN}/${fileName}`;
};