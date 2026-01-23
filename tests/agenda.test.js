import { PrismaClient, StatusAgenda } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/pt_BR';

const prisma = new PrismaClient();

// Constants for testing, mimicking the seeder's fixed IDs
const TEST_MEDICO_ID = 3;
const TEST_CRIADO_POR_ID = 4; // Recepcionista

// Helper to generate a future date for agenda
function generateFutureDateTime() {
    const date = faker.date.future({ years: 1 }); // Within the next year
    date.setHours(faker.helpers.arrayElement([8, 9, 10, 11, 13, 14, 15, 16, 17]), faker.helpers.arrayElement([0, 30]), 0, 0);
    return date;
}

describe('Agenda Model Integration Tests', () => {
    let testPatient; // Patient created for each test
    let testAgenda; // Agenda created for specific tests

    // Before all tests, ensure Prisma client is ready
    beforeAll(async () => {
        // No specific setup needed here beyond Prisma client initialization
    });

    // Before each test, create a unique patient to ensure isolation
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

    // After each test, clean up all agendas and the patient created by that test
    afterEach(async () => {
        await prisma.agenda.deleteMany({
            where: { pacienteId: testPatient.id },
        });
        await prisma.paciente.delete({
            where: { id: testPatient.id },
        });
    });

    // After all tests, disconnect Prisma client
    afterAll(async () => {
        await prisma.$disconnect();
    });

    // --- Test Cases ---

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
        expect(createdAgenda.data.toISOString()).toBe(newAgendaData.data.toISOString()); // Compare ISO strings for Date objects
        expect(createdAgenda.tipoConsulta).toBe(newAgendaData.tipoConsulta);
        expect(createdAgenda.status).toBe(newAgendaData.status);
        expect(createdAgenda.observacoes).toBe(newAgendaData.observacoes);

        // Verify it exists in the database
        const foundAgenda = await prisma.agenda.findUnique({
            where: { id: createdAgenda.id },
        });
        expect(foundAgenda).toEqual(createdAgenda);
    });

    test('should retrieve an existing agenda', async () => {
        // First, create an agenda to retrieve
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
        // First, create an agenda to update
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

        // Verify the update in the database
        const foundAgenda = await prisma.agenda.findUnique({
            where: { id: testAgenda.id },
        });
        expect(foundAgenda.observacoes).toBe(updatedObservacoes);
        expect(foundAgenda.status).toBe(updatedStatus);
    });

    test('should delete an agenda', async () => {
        // First, create an agenda to delete
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

        // Verify it no longer exists in the database
        const foundAgenda = await prisma.agenda.findUnique({
            where: { id: testAgenda.id },
        });
        expect(foundAgenda).toBeNull();
    });

    test('should not retrieve a non-existent agenda', async () => {
        const nonExistentId = 99999; // Assuming this ID does not exist

        const foundAgenda = await prisma.agenda.findUnique({
            where: { id: nonExistentId },
        });

        expect(foundAgenda).toBeNull();
    });
});
