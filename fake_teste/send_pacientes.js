// seed_laura_melo_2025.js

import { PrismaClient, StatusAgenda, UserRole } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/pt_BR';

const prisma = new PrismaClient();
const NUM_AGENDAMENTOS_TOTAIS = 60; 

// IDs fixos (baseados no seu seed anterior)
const MEDICO_ID = 3;
const CRIADO_POR_ID = 4; // Recepcionista

// Slots de horário FORNECIDOS + 21:30 ADICIONADO
const SLOTS_LIVRES = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", 
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
    "17:00", "17:30", "21:30" // NOVO SLOT
];

// Define o último dia do ano para limitação
const END_OF_YEAR = new Date(2025, 11, 31, 23, 59, 59);

// =========================================================
// Funções Auxiliares
// =========================================================

/**
 * Cria ou encontra o paciente "Laura Melo".
 * @returns {number} O ID da paciente.
 */
async function findOrCreateLauraMelo() {
    const paciente = await prisma.paciente.upsert({
        where: { cpf: '000.000.000-99' }, // CPF único para fins de upsert
        update: {},
        create: {
            nome: 'Laura Melo',
            cpf: '000.000.000-99',
            nascimento: new Date('1990-05-15T00:00:00.000Z'),
            telefone: '(11) 98765-4321',
            endereco: 'Rua de Teste, 100',
            email: 'laura.melo@teste.com',
        }
    });
    console.log(`-> Paciente Laura Melo (ID ${paciente.id}) pronta.`);
    return paciente.id;
}

/**
 * Gera uma data e hora de agendamento estritamente no futuro,
 * respeitando os SLOTS_LIVRES e o limite do ano de 2025.
 * @returns {Date} Data e hora futura dentro de 2025.
 */
function generateFutureDateTimeStrict() {
    const today = new Date();
    let candidateDate;
    let isFutureAndInYear = false;
    let refDate = today; 

    while (!isFutureAndInYear) {
        // Gera uma data futura aleatória a partir da data de referência
        candidateDate = faker.date.future({ days: 100, refDate: refDate });
        
        if (candidateDate.getTime() > END_OF_YEAR.getTime()) {
            refDate = new Date(today.getTime() + 86400000); 
            continue; 
        }

        // Seleciona um slot de horário aleatório (incluindo 21:30)
        const randomSlot = faker.helpers.arrayElement(SLOTS_LIVRES);
        const [hour, minute] = randomSlot.split(':').map(Number);
        
        candidateDate.setHours(hour, minute, 0, 0);

        // Verifica se a data é estritamente futura e dentro do ano
        if (candidateDate.getTime() > today.getTime() && candidateDate.getTime() <= END_OF_YEAR.getTime()) {
            isFutureAndInYear = true;
        } else {
            refDate = new Date(candidateDate.getTime() + 86400000); 
        }
    }

    return candidateDate;
}


// =========================================================
// Função Principal de Seeding
// =========================================================

async function seedLauraMeloAgendas() {
    console.log('-------------------------------------------');
    console.log(`Iniciando Seeding para o Médico ID ${MEDICO_ID}`);
    console.log('-------------------------------------------');

    // 1. Garante que a paciente Laura Melo exista
    const lauraMeloId = await findOrCreateLauraMelo();
    
    // 2. Criar todas as 60 agendas
    const agendasParaCriar = Array.from({ length: NUM_AGENDAMENTOS_TOTAIS }, () => ({
        // Todas as agendas serão para a Laura Melo
        pacienteId: lauraMeloId, 
        
        // Todas as agendas para o Médico ID 3
        medicoId: MEDICO_ID, 
        
        criadoPor: CRIADO_POR_ID, 
        
        // Data e Hora GARANTIDAS COMO FUTURAS (em 2025 e nos slots)
        data: generateFutureDateTimeStrict(), 
        
        tipoConsulta: faker.helpers.arrayElement(['Retorno', 'Primeira Consulta']),
        status: faker.helpers.arrayElement([StatusAgenda.Agendado, StatusAgenda.Confirmado]),
        observacoes: faker.lorem.sentence({ min: 5, max: 15 }),
    }));
    
    console.log(`Criando ${NUM_AGENDAMENTOS_TOTAIS} agendamentos para Laura Melo...`);

    const result = await prisma.agenda.createMany({
        data: agendasParaCriar,
    });

    console.log('-------------------------------------------');
    console.log(`Seeding de Agendas concluído com sucesso!`);
    console.log(`Total de Agendas Criadas: ${result.count}.`);
    console.log(`Verifique a agenda do Médico ID ${MEDICO_ID} para os horários, incluindo 21:30.`);
    console.log('-------------------------------------------');
}

seedLauraMeloAgendas()
    .catch((e) => {
        console.error("Erro fatal durante o seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });