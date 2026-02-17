/**
 * Pacientes Screen Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    initStats();
});

/**
 * Filtra a tabela de pacientes em tempo real
 */
function initSearch() {
    const searchInput = document.getElementById('paciente-main-search');
    const table = document.getElementById('pacientes-table');
    if (!searchInput || !table) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
            if (row.cells.length < 2) return; // Skip empty state row

            const name = row.cells[1].textContent.toLowerCase();
            const cpf = row.cells[2].textContent.toLowerCase();

            if (name.includes(term) || cpf.includes(term)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}


/**
 * Lógica dos chips de filtro
 */
function filterBy(type) {
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(c => c.classList.remove('active'));

    // Marcar como ativo o clicado (quem chamou pode não ter o evento direto, 
    // então procuramos pelo texto ou passamos o el se quisermos)
    const activeChip = Array.from(chips).find(c => {
        if (type === 'all') return c.textContent.includes('Todos');
        if (type === 'recent') return c.textContent.includes('Recentemente');
        if (type === 'active') return c.textContent.includes('Agendamento');
        if (type === 'missing') return c.textContent.includes('Incompletos');
        return false;
    });
    if (activeChip) activeChip.classList.add('active');

    const rows = document.querySelectorAll('.patient-row');
    const now = new Date();

    rows.forEach(row => {
        let show = false;
        if (type === 'all') show = true;
        else if (type === 'recent') {
            // Exemplo: mostrar quem foi adicionado nos últimos 7 dias
            // Aqui precisaríamos da data no row, mas vamos simular por enquanto
            show = true;
        } else if (type === 'active') {
            // Simular filtro de quem tem consulta futura
            show = Math.random() > 0.5;
        } else if (type === 'missing') {
            // Verifica se tem email ou endereço faltando
            const email = row.querySelector('.bi-envelope-at')?.nextSibling?.textContent;
            const address = row.querySelector('.bi-geo-alt')?.nextSibling?.textContent;
            show = !email || email.includes('—') || !address || address.includes('não informado');
        }

        row.style.display = show ? '' : 'none';

        // Se estiver filtrado, mas houver busca no input, a busca prevalece? 
        // Geralmente os filtros são cumulativos. Vamos manter simples.
    });
}

function initStats() {
    // Placeholder for future dynamic stats
}
