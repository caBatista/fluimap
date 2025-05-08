import { env } from '@/env';
import Questionnaire from '@/models/Questionnaire';
import mongoose from 'mongoose';

type RawWithEscala = {
  titulo: string;
  instrucoes: string;
  escala: Record<string, string>;
  pergunta: string;
  itens: string[];
};
type RawComunicao = {
  titulo: string;
  instrucoes: string;
  pergunta: string; // usa placeholder {nome}
  questoes: Array<{
    question: string;
    options: string[];
  }>;
};

// lista de todos os questionários “brutos”
const rawList: Array<RawWithEscala | RawComunicao> = [
  {
    // 1) Sentido no Trabalho
    titulo: 'Questionário de Sentido no Trabalho',
    instrucoes:
      'Indique conforme a escala abaixo, o quanto está de acordo (ou desacordo) com as afirmações apresentadas. Note que, quanto maior o valor associado a cada afirmação, mais você concorda com ela. Não há respostas certas ou erradas. A melhor resposta é aquela que melhor representa a sua opinião. Evite deixar respostas em branco.',
    escala: {
      '1': 'Discordo Totalmente',
      '2': 'Discordo',
      '3': 'Concordo em parte',
      '4': 'Concordo',
      '5': 'Concordo Totalmente',
    },
    pergunta: 'Quando estou no meu ambiente de trabalho percebo que...',
    itens: [
      'Desenvolvo habilidades que considero importantes',
      'Consigo recompensas importantes para mim',
      'Realizo o meu potencial',
      'Expresso o que há de melhor em mim',
      'Atinjo resultados que valorizo',
      'Realizo atividades que expressam minhas capacidades',
      'Faço o que realmente gosto de fazer',
      'Avanço nas metas que estabeleci para minha vida',
      'Supero desafios',
    ],
  },
  {
    // 2) Comunicação entre Colegas
    titulo: 'Avaliação de Comunicação entre Colegas',
    instrucoes:
      'Responda às questões abaixo sobre sua interação com cada colega indicado. Selecione a alternativa que melhor representa sua vivência com essa pessoa. Não há respostas certas ou erradas.',
    pergunta: 'Sobre {nome}, responda:',
    questoes: [
      {
        question: 'Em uma semana comum, com que frequência você conversa com {nome}?',
        options: [
          'Todos os dias',
          '3/4x na semana',
          '2x na semana',
          '1x por semana',
          '3x por mês',
          '2x por mês',
          '1x por mês',
        ],
      },
      {
        question:
          'Você se identifica como a pessoa que dá informação a {nome} ou que pede uma informação?',
        options: ['Eu recebo a informação', 'Eu passo a informação', 'Nós trocamos informações'],
      },
      {
        question: 'Quando você conversa com {nome}, percebe que a comunicação é clara?',
        options: [
          'Nada clara',
          'Pouco clara',
          'Poderia ser mais clara',
          'É clara o bastante',
          'Muito clara',
        ],
      },
      {
        question: 'Quando você conversa com {nome}, percebe que a comunicação é direta ao ponto?',
        options: [
          'Nada direta',
          'Pouco direta',
          'Poderia ser mais direta',
          'É direta o bastante',
          'Muito direta',
        ],
      },
      {
        question: 'O quão resolutiva é a sua comunicação com {nome}?',
        options: [
          'Nada resolutiva',
          'Pouco resolutiva',
          'Poderia ser mais resolutiva',
          'É resolutiva o bastante',
          'Muito resolutiva',
        ],
      },
    ],
  },
  {
    // 3) Bem-Estar
    titulo: 'Questionário de bem estar',
    instrucoes:
      'Indique conforme a escala abaixo, o quanto você vivência os diferentes afetos descritos no seu local de trabalho. Não há respostas certas ou erradas. A melhor resposta é aquela que melhor representa a sua vivência.',
    escala: {
      '1': 'Nem um pouco',
      '2': 'Um pouco',
      '3': 'Moderadamente',
      '4': 'Bastante',
      '5': 'Extremamente',
    },
    pergunta: 'Quando estou trabalhando me sinto...',
    itens: [
      'Animado(a)',
      'Entusiasmado(a)',
      'Empolgado(a)',
      'Feliz',
      'Alegre',
      'Contente',
      'Disposto(a)',
      'Orgulhoso(a)',
      'Tranquilo(a)',
      'Nervoso(a)',
      'Tenso(a)',
      'Irritado(a)',
      'Chateado(a)',
      'Impaciente',
      'Com raiva',
      'Incomodado(a)',
      'Deprimido(a)',
      'Frustrado(a)',
      'Ansioso(a)',
      'Preocupado(a)',
    ],
  },
];

function transformEscala(raw: RawWithEscala, section: 'jobMeaning' | 'wellBeing') {
  const options = Object.entries(raw.escala).map(([value, label]) => ({ value, label }));
  const questions = raw.itens.map((item, idx) => ({
    _id: new mongoose.Types.ObjectId().toHexString(),
    text: `${raw.pergunta} ${item}`,
    type: 'singleChoice' as const,
    options,
    order: idx + 1,
  }));
  return {
    name: raw.titulo,
    version: '1.0.0',
    section,
    instructions: raw.instrucoes,
    questions,
  };
}

function transformComunicacao(raw: RawComunicao) {
  const questions = raw.questoes.map((q, idx) => ({
    _id: new mongoose.Types.ObjectId().toHexString(),
    text: q.question,
    type: 'singleChoice' as const,
    options: q.options.map((o) => ({ value: o, label: o })),
    order: idx + 1,
  }));
  return {
    name: raw.titulo,
    version: '1.0.0',
    section: 'communicationPeers' as const,
    instructions: raw.instrucoes,
    questions,
  };
}

async function seed() {
  await mongoose.connect(
    'mongodb+srv://admin:Ages2025%21@fluimap.lat3i.mongodb.net/?retryWrites=true&w=majority&appName=FluiMap'
  );

  // Constrói os docs prontos:
  const docs = rawList.map((raw) => {
    if ('escala' in raw) {
      // primeiro e terceiro
      const sect = raw.titulo.includes('bem estar') ? 'wellBeing' : 'jobMeaning';
      return transformEscala(raw as RawWithEscala, sect);
    } else {
      // segundo
      return transformComunicacao(raw as RawComunicao);
    }
  });

  // Insere todos de uma vez
  await Questionnaire.insertMany(docs);

  console.log('Todos os questionários foram inseridos com sucesso!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Erro ao inserir questionnaires:', err);
  process.exit(1);
});
