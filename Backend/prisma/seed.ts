import { PrismaClient } from '@prisma/client';

// Inicializa o Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('A iniciar o script de seed...');

  // --- DEFINIÇÃO DAS CONQUISTAS ---
  const conquistas = [
    {
      nome: 'Primeiro Apoiador',
      descricao: 'Realizou a sua primeira doação para a nossa causa. Muito obrigado!',
      icone: 'primeiro-apoiador.png',
      pontosBonus: 50,
    },
    {
      nome: 'Coração Voluntário',
      descricao: 'A sua candidatura para voluntariado foi aprovada. Bem-vindo à equipa!',
      icone: 'coracao-voluntario.png',
      pontosBonus: 100,
    },
    {
      nome: 'Herói dos Peludos',
      descricao: 'Deu um lar a um dos nossos animais. Uma nova vida começou graças a si!',
      icone: 'heroi-dos-peludos.png',
      pontosBonus: 500,
    },
    {
      nome: 'Voz dos Sem Voz',
      descricao: 'A sua divulgação ajudou a listar um novo animal para adoção.',
      icone: 'voz-dos-sem-voz.png',
      pontosBonus: 150,
    },
    {
      nome: 'Anjo da Guarda',
      descricao: 'Atingiu um total de R$ 200 em doações. O seu apoio contínuo é fundamental!',
      icone: 'anjo-da-guarda.png',
      pontosBonus: 200,
    },
  ];

  // --- INSERÇÃO DAS CONQUISTAS NO BANCO DE DADOS ---
  console.log('A popular a tabela de Conquistas...');
  for (const conquista of conquistas) {
    await prisma.conquista.upsert({
      where: { nome: conquista.nome },
      update: {},
      create: conquista,
    });
  }

  // --- INICIALIZAÇÃO DA CONFIGURAÇÃO DO SISTEMA ---
  console.log('A garantir que a configuração padrão existe...');
  await prisma.configuracao.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      gamificacaoAtiva: true, // A gamificação começa LIGADA por padrão
    },
  });

  console.log('Seed script concluído com sucesso!');
}

// Executa a função principal e garante que a conexão com o banco é fechada no final.
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  