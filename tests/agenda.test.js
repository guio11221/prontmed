import { PrismaClient, StatusAgenda } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/pt_BR';

const prisma = new PrismaClient();

const TEST_MEDICO_ID = 3;
const TEST_CRIADO_POR_ID = 4; 

function generateFutureDateTime() {
    const date = faker.date.future({ years: 1 }); 
    date.setHours(faker.helpers.arrayElement([8, 9, 10, 11, 13, 14, 15, 16, 17]), faker.helpers.arrayElement([0, 30]), 0, 0);
    return date;
}

describe('Agenda Model Integration Tests', () => {
    let testPatient; 
    let testAgenda; 

    beforeAll(async () => {
    });

    beforeEach(async () => {
        testPatient = await prisma.paciente.create({
            data: {
                nome: faker.person.fullName(),
                cpf: faker.string.numeric(11),
                nascimento: faker.date.past({ years: 30 }),
                telefone: faker.phone.number('###########'),
                endereco: faker.location.streetAddress(),
                email: faker.internet.email(),
            },
        });
    });

    afterEach(async () => {
        await prisma.agenda.deleteMany({
            where: { pacienteId: testPatient.id },
        });
        await prisma.paciente.delete({
            where: { id: testPatient.id },
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test('should create a new agenda successfully', async () => {
        const newAgendaData = {
            pacienteId: testPatient.id,
            medicoId: TEST_MEDICO_ID,
            criadoPor: TEST_CRIADO_POR_ID,
            data: generateFutureDateTime(),
            tipoConsulta: faker.helpers.arrayElement(['Retorno', 'Primeira Consulta']),
            status: StatusAgenda.Agendado,
            observacoes: faker.lorem.sentence(),
        };

        const createdAgenda = await prisma.agenda.create({
            data: newAgendaData,
        });

        expect(createdAgenda).toBeDefined();
        expect(createdAgenda.id).toBeDefined();
        expect(createdAgenda.pacienteId).toBe(newAgendaData.pacienteId);
        expect(createdAgenda.medicoId).toBe(newAgendaData.medicoId);
        expect(createdAgenda.criadoPor).toBe(newAgendaData.criadoPor);
        expect(createdAgenda.data.toISOString()).toBe(newAgendaData.data.toISOString()); 
        expect(createdAgenda.tipoConsulta).toBe(newAgendaData.tipoConsulta);
        expect(createdAgenda.status).toBe(newAgendaData.status);
        expect(createdAgenda.observacoes).toBe(newAgendaData.observacoes);

        const foundAgenda = await prisma.agenda.findUnique({
            where: { id: createdAgenda.id },
        });
        expect(foundAgenda).toEqual(createdAgenda);
    });

    test('should retrieve an existing agenda', async () => {
        const newAgendaData = {
            pacienteId: testPatient.id,
            medicoId: TEST_MEDICO_ID,
            criadoPor: TEST_CRIADO_POR_ID,
            data: generateFutureDateTime(),
            tipoConsulta: 'Retorno',
            status: StatusAgenda.Confirmado,
            observacoes: 'Agenda para teste de leitura',
        };
        testAgenda = await prisma.agenda.create({ data: newAgendaData });

        const retrievedAgenda = await prisma.agenda.findUnique({
            where: { id: testAgenda.id },
        });

        expect(retrievedAgenda).toBeDefined();
        expect(retrievedAgenda.id).toBe(testAgenda.id);
        expect(retrievedAgenda.pacienteId).toBe(testPatient.id);
        expect(retrievedAgenda.tipoConsulta).toBe('Retorno');
    });

    test('should update an existing agenda', async () => {
        const newAgendaData = {
            pacienteId: testPatient.id,
            medicoId: TEST_MEDICO_ID,
            criadoPor: TEST_CRIADO_POR_ID,
            data: generateFutureDateTime(),
            tipoConsulta: 'Primeira Consulta',
            status: StatusAgenda.Agendado,
            observacoes: 'Observacao inicial',
        };
        testAgenda = await prisma.agenda.create({ data: newAgendaData });

        const updatedObservacoes = 'Observacao atualizada para o teste';
        const updatedStatus = StatusAgenda.Cancelado;

        const updatedAgenda = await prisma.agenda.update({
            where: { id: testAgenda.id },
            data: {
                observacoes: updatedObservacoes,
                status: updatedStatus,
            },
        });

        expect(updatedAgenda).toBeDefined();
        expect(updatedAgenda.id).toBe(testAgenda.id);
        expect(updatedAgenda.observacoes).toBe(updatedObservacoes);
        expect(updatedAgenda.status).toBe(updatedStatus);

        const foundAgenda = await prisma.agenda.findUnique({
            where: { id: testAgenda.id },
        });
        expect(foundAgenda.observacoes).toBe(updatedObservacoes);
        expect(foundAgenda.status).toBe(updatedStatus);
    });

    test('should delete an agenda', async () => {
        const newAgendaData = {
            pacienteId: testPatient.id,
            medicoId: TEST_MEDICO_ID,
            criadoPor: TEST_CRIADO_POR_ID,
            data: generateFutureDateTime(),
            tipoConsulta: 'Retorno',
            status: StatusAgenda.Agendado,
            observacoes: 'Agenda para ser deletada',
        };
        testAgenda = await prisma.agenda.create({ data: newAgendaData });

        const deletedAgenda = await prisma.agenda.delete({
            where: { id: testAgenda.id },
        });

        expect(deletedAgenda).toBeDefined();
        expect(deletedAgenda.id).toBe(testAgenda.id);

        const foundAgenda = await prisma.agenda.findUnique({
            where: { id: testAgenda.id },
        });
        expect(foundAgenda).toBeNull();
    });

    test('should not retrieve a non-existent agenda', async () => {
        const nonExistentId = 99999;

        const foundAgenda = await prisma.agenda.findUnique({
            where: { id: nonExistentId },
        });

        expect(foundAgenda).toBeNull();
    });
});
