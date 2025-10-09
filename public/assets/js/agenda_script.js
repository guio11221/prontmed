class UI {
    static info(title, message) {
        return Swal.fire({
            title,
            html: message,
            icon: 'info',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6'
        });
    }

    static success(title, message) {
        return Swal.fire({
            title,
            html: message,
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#198754'
        });
    }

    static error(title, message) {
        return Swal.fire({
            title,
            html: message,
            icon: 'error',
            confirmButtonText: 'Fechar',
            confirmButtonColor: '#d33'
        });
    }

    static confirm(title, message) {
        return Swal.fire({
            title,
            html: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        });
    }

    static loading(title = 'Carregando dados...') {
        return Swal.fire({
            title: title,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            showCancelButton: false,
            timer: 9999999,
            timerProgressBar: true,
            // didOpen: () => {
            //     Swal.showLoading();
            // },
            position: 'top-start',
            toast: true,
            customClass: {
                popup: 'colored-toast'
            }
        });
    }
}


// =========================================================
// CLASSE 4: AGENDA API (Comunicação Backend)
// =========================================================
class AgendaAPI {

    static async handleResponse(response) {
        let result;
        try {
            result = await response.json();
        } catch (e) {
            result = { message: response.statusText || "Erro de conexão ou servidor interno." };
        }

        if (!response.ok) {
            // Usa a mensagem retornada pelo backend se houver, caso contrário, usa a mensagem padrão.
            const errorMessage = result.message || result.error || "Ocorreu um erro na requisição.";
            throw new Error(errorMessage);
        }
        return result;
    }

    /**
     * @description Envolve uma chamada fetch com a exibição e fechamento do loading global.
     * @param {string} url O endpoint da API.
     * @param {object} options As opções do fetch (method, headers, body).
     * @returns {Promise<object>} O resultado da resposta tratada.
     */
    static async wrappedFetch(url, options) {
        try {
           
            const response = await fetch(url, options); // Chama o fetch real
            return await this.handleResponse(response);

        } catch (error) {

            throw error;
        }  
    }
    // --- AGENDA CRUD ---

    static async getAgenda(date) {
        const formattedDate = date.toISOString().split('T')[0];
        try {
            return this.wrappedFetch(`/agenda?date=${formattedDate}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            throw error;
        }
    }
 
    static async getAgendamentoById(id) {
        try {
            return this.wrappedFetch(`/agenda/${id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            throw error;
        }
    }

    static async createAgendamento(data) {
        try {
            UI.loading(); 
            return this.wrappedFetch('/agenda', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
        } catch (error) {
            throw error;
        } finally {
             UI.loading().close()
        }
    }

    static async updateAgendamentoStatus(id, newStatus) {
        try {
            const method = newStatus === 'Cancelado' ? 'DELETE' : 'PUT';
             UI.loading();
            return this.wrappedFetch(`/agenda/${id}`, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (error) {
            throw error;
        } finally {
            UI.loading().close()
        }
    }

    static async getEscalas(medicoId) {
        try {

            return this.wrappedFetch(`/escalas/${medicoId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            throw error;
        }
    }

    static async createEscala(data) {
        try {
            return this.wrappedFetch('/escalas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
        } catch (error) {
            throw error;
        }
    }

    static async updateEscala(id, data) {
        try {
            return this.wrappedFetch(`/escalas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
        } catch (error) {
            throw error;
        }
    }

    static async deleteEscala(id) {
        try {
            return this.wrappedFetch(`/escalas/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            throw error;
        }
    }

    static async searchPacientes(query) {
        if (!query || query.length < 2) {
            return { success: true, pacientes: [] };
        }
        try {
            return this.wrappedFetch(`/pacientes/search?q=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            console.error("Erro na busca de pacientes:", error);
            return { success: false, pacientes: [] };
        }
    }

    static async getHorariosLivres(medicoId, date) {
        const formattedDate = date.toISOString().split('T')[0];
        try {
            return this.wrappedFetch(`/disponibilidade/${medicoId}?date=${formattedDate}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

        } catch (error) {
            console.warn("API de disponibilidade não respondeu. Usando MOCK.");
            return {
                slotsLivres: ["08:30", "09:45", "11:00", "14:00", "15:30"]
            };
        }
    }
}


// =========================================================
// CLASSE 3: ESCALA MANAGER
// =========================================================
class EscalaManager {
    constructor() {
        this.medicoId = typeof medicoId !== 'undefined' ? medicoId : 1;
        this.modal = new bootstrap.Modal(document.getElementById('escalaModal'));
        this.tableBody = document.getElementById('escala-table-body');
        this.addRowButton = document.getElementById('add-escala-row');
        this.saveAllButton = document.getElementById('save-all-escalas-btn');
        this.tasksContainer = document.getElementById('tarefas-do-dia-list');
        this.addTarefaButton = document.getElementById('add-tarefa-btn');
        this.diasDaSemana = {
            1: "Segunda-feira", 2: "Terça-feira", 3: "Quarta-feira", 4: "Quinta-feira",
            5: "Sexta-feira", 6: "Sábado", 7: "Domingo",
        };

        this.addEventListeners();
    

    }

    addEventListeners() {
        if (this.addRowButton) this.addRowButton.addEventListener('click', () => this.addEmptyRow());
        const escalaModalElement = document.getElementById('escalaModal');
        if (escalaModalElement) escalaModalElement.addEventListener('show.bs.modal', () => this.loadEscalas());
        if (this.saveAllButton) this.saveAllButton.addEventListener('click', () => this.handleSaveAll());
        if (this.addTarefaButton) this.addTarefaButton.addEventListener('click', () => this.handleAddTask());
    }

    // --- RENDERIZAÇÃO ---
    getTaskKey(date) {
        return `medico_${this.medicoId}_tasks_${date.toISOString().split('T')[0]}`;
    }

    /**
    * @description Carrega e renderiza as tarefas para o dia atual.
    * @param {Date} date A data para carregar as tarefas.
    */
    loadTasks(date) {
        if (!this.tasksContainer) return;

        const taskKey = this.getTaskKey(date);
        // Simulação de carregamento do banco (via localStorage)
        const storedTasks = JSON.parse(localStorage.getItem(taskKey) || '[]');

        if (storedTasks.length === 0) {
            this.tasksContainer.innerHTML = '<p class="text-muted small mb-0 p-2">Você não possui nenhuma tarefa agendada.</p>';
            return;
        }

        let tasksHTML = '<ul class="list-unstyled mb-0">';
        storedTasks.forEach(task => {
            tasksHTML += this.renderTask(task);
        });
        tasksHTML += '</ul>';

        this.tasksContainer.innerHTML = tasksHTML;
    }

    renderTask(task) {
        const checked = task.concluida ? 'checked' : '';
        const textClass = task.concluida ? 'text-decoration-line-through text-muted' : 'fw-medium';

        return `
            <li class="d-flex align-items-center mb-1 task-item" data-task-id="${task.id}">
                <div class="form-check me-2 flex-shrink-0">
                    <input class="form-check-input task-checkbox" type="checkbox" 
                           ${checked} 
                           onclick="window.AgendaManager.toggleTaskComplete(${task.id}, event)">
                </div>
                <span class="${textClass} small flex-grow-1">${task.descricao}</span>
                <i class="bi bi-x-circle-fill text-danger small ms-2 cursor-pointer" 
                   data-bs-toggle="tooltip" data-bs-title="Remover"
                   onclick="window.AgendaManager.handleDeleteTask(${task.id})"></i>
            </li>
        `;
    }

    /**
     * @description Abre um prompt para adicionar uma nova tarefa.
     */
    async handleAddTask() {
        const result = await Swal.fire({
            title: 'Nova Tarefa',
            input: 'text',
            inputLabel: `Tarefa para ${this.formatDate(this.currentViewDate)}`,
            inputPlaceholder: 'Ex: Ligar para a Dra. Ana sobre o paciente X',
            showCancelButton: true,
            confirmButtonText: 'Adicionar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
        });

        if (result.isConfirmed && result.value) {
            const taskKey = this.getTaskKey(this.currentViewDate);
            const storedTasks = JSON.parse(localStorage.getItem(taskKey) || '[]');

            const newTask = {
                id: Date.now(), // ID simples baseado no timestamp
                descricao: result.value,
                concluida: false
            };

            storedTasks.push(newTask);
            localStorage.setItem(taskKey, JSON.stringify(storedTasks));

            this.loadTasks(this.currentViewDate);
            UI.success('Tarefa Adicionada', 'A nova tarefa foi adicionada à sua lista.');
        }
    }

    /**
     * @description Alterna o status de conclusão de uma tarefa.
     */
    toggleTaskComplete(taskId, event) {
        event.stopPropagation(); // Evita que cliques em elementos filhos afetem a linha
        const taskKey = this.getTaskKey(this.currentViewDate);
        const storedTasks = JSON.parse(localStorage.getItem(taskKey) || '[]');

        const taskIndex = storedTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            storedTasks[taskIndex].concluida = !storedTasks[taskIndex].concluida;
            localStorage.setItem(taskKey, JSON.stringify(storedTasks));
            this.loadTasks(this.currentViewDate); // Recarrega para atualizar a UI
        }
    }

    /**
     * @description Remove uma tarefa da lista.
     */
    async handleDeleteTask(taskId) {
        const confirmation = await UI.confirm('Remover Tarefa', 'Tem certeza que deseja remover esta tarefa da lista?');

        if (confirmation.isConfirmed) {
            const taskKey = this.getTaskKey(this.currentViewDate);
            let storedTasks = JSON.parse(localStorage.getItem(taskKey) || '[]');

            storedTasks = storedTasks.filter(t => t.id !== taskId);
            localStorage.setItem(taskKey, JSON.stringify(storedTasks));

            this.loadTasks(this.currentViewDate);
            UI.success('Removida', 'Tarefa removida com sucesso.');
        }
    }
    renderEscala(escala) {
        const isNew = !escala.id;
        const row = document.createElement('tr');
        row.dataset.escalaId = escala.id || 'new';

        const diaSelect = document.createElement('select');
        diaSelect.className = 'form-select form-select-sm';
        Object.entries(this.diasDaSemana).forEach(([num, nome]) => {
            const option = document.createElement('option');
            option.value = num;
            option.textContent = nome;
            if (escala.diaSemana === parseInt(num)) option.selected = true;
            diaSelect.appendChild(option);
        });
        row.insertCell().appendChild(diaSelect);

        const inputInicio = document.createElement('input');
        inputInicio.type = 'time'; inputInicio.className = 'form-control form-control-sm'; inputInicio.value = escala.horaInicio || '08:00';
        row.insertCell().appendChild(inputInicio);

        const inputFim = document.createElement('input');
        inputFim.type = 'time'; inputFim.className = 'form-control form-control-sm'; inputFim.value = escala.horaFim || '18:00';
        row.insertCell().appendChild(inputFim);

        const inputDuracao = document.createElement('input');
        inputDuracao.type = 'number'; inputDuracao.min = '15'; inputDuracao.step = '5';
        inputDuracao.className = 'form-control form-control-sm'; inputDuracao.value = escala.duracaoConsulta || 30;
        row.insertCell().appendChild(inputDuracao);

        const cellAcoes = row.insertCell();
        cellAcoes.className = 'd-flex justify-content-center';

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-success btn-sm me-1';
        saveBtn.innerHTML = '<i class="bi bi-save"></i>';
        saveBtn.title = isNew ? 'Salvar Novo' : 'Atualizar';
        saveBtn.onclick = () => this.handleSaveOrUpdate(row, isNew);
        cellAcoes.appendChild(saveBtn);

        if (!isNew) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger btn-sm';
            deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
            deleteBtn.title = 'Inativar Escala';
            deleteBtn.onclick = () => this.handleDelete(escala.id, row);
            cellAcoes.appendChild(deleteBtn);
        } else {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-secondary btn-sm';
            cancelBtn.innerHTML = '<i class="bi bi-x-circle"></i>';
            cancelBtn.title = 'Cancelar';
            cancelBtn.onclick = () => row.remove();
            cellAcoes.appendChild(cancelBtn);
        }

        return row;
    }

    addEmptyRow() {
        const existingRows = this.tableBody.querySelectorAll('tr[data-escala-id]');
        const uniqueDays = new Set();

        existingRows.forEach(row => {
            // O dia da semana é o valor do primeiro elemento <select>
            const diaSelect = row.querySelector('select');
            if (diaSelect && diaSelect.value) {
                uniqueDays.add(diaSelect.value);
            }
        });

        // VERIFICAÇÃO DO LIMITE: Impede a adição se 7 dias já estiverem na tabela
        if (uniqueDays.size >= 7) {
            UI.info('Limite Alcançado', 'Você já adicionou regras (ativas ou em edição) para todos os 7 dias da semana.');
            return;
        }

        // Encontra o próximo dia disponível para pré-selecionar (melhoria de UX)
        let nextAvailableDay = 1;
        while (uniqueDays.has(String(nextAvailableDay)) && nextAvailableDay <= 7) {
            nextAvailableDay++;
        }
        const dayToUse = nextAvailableDay <= 7 ? nextAvailableDay : 1;


        const newRow = this.renderEscala({
            diaSemana: dayToUse,
            horaInicio: '08:00',
            horaFim: '18:00',
            duracaoConsulta: 30
        });

        this.tableBody.prepend(newRow);
    }

    // --- CRUD ACTIONS ---
    /**
         * @description Percorre todas as linhas da tabela e salva/atualiza cada escala.
         */
    async handleSaveAll() {
        if (!this.tableBody || this.tableBody.children.length === 0) {
            return UI.info('Nada para salvar', 'A tabela de escalas está vazia.');
        }

        const rows = Array.from(this.tableBody.querySelectorAll('tr[data-escala-id]'));
        let errorsFound = false;
        let successfulSaves = 0;
        const errorMessages = [];

        this.saveAllButton.disabled = true;
        const originalText = this.saveAllButton.innerHTML;
        this.saveAllButton.innerHTML = '<i class="bi bi-arrow-clockwise spin me-2"></i> Processando...';

        rows.forEach(row => row.classList.remove('table-danger'));

        try {
            for (const row of rows) {
                const isNew = row.dataset.escalaId === 'new';

                try {
                    const data = this.collectData(row);

                    if (!data.diaSemana || !data.horaInicio || !data.horaFim) {
                        throw new Error(`[Dia ${this.diasDaSemana[data.diaSemana]}] Campos de hora incompletos.`);
                    }

                    if (isNew) {
                        await AgendaAPI.createEscala(data);
                    } else {
                        const id = parseInt(row.dataset.escalaId);
                        await AgendaAPI.updateEscala(id, data);
                    }
                    successfulSaves++;

                } catch (error) {
                    errorsFound = true;
                    row.classList.add('table-danger');
                    // Limpa a mensagem de erro para o frontend
                    const errorMessageText = error.message.replace(/^Error:\s*/, '');
                    errorMessages.push(`<strong>Dia ${this.diasDaSemana[this.collectData(row).diaSemana]}</strong>: ${errorMessageText}`);
                }
            }

            // CORREÇÃO 1: Adiciona 'await' para garantir que a recarga termine antes do feedback
            await this.loadEscalas();

            if (window.AgendaManager) {
                window.AgendaManager.updateHorariosLivres();
            }

            // CORREÇÃO 2: Força o fechamento de qualquer SweetAlert residual (o loading)
            if (typeof Swal !== 'undefined') {
                Swal.close();
            }

            if (errorsFound) {
                const messageHtml = `
                    <p>Foram salvas ${successfulSaves} escalas com sucesso.</p>
                    <p class="text-danger">As seguintes escalas apresentaram erros e não foram salvas:</p>
                    <ul class="list-unstyled text-start small mt-3">
                        ${errorMessages.map(msg => `<li><i class="bi bi-x-circle-fill me-2"></i>${msg}</li>`).join('')}
                    </ul>
                `;

                UI.error('Concluído com Falhas', messageHtml);
            } else {
                UI.success('Tudo Salvo!', `${successfulSaves} escalas salvas/atualizadas com sucesso.`);
            }

        } catch (globalError) {
            UI.error('Erro Crítico', `O processamento não pôde ser concluído: ${globalError.message}`);
        } finally {
            this.saveAllButton.disabled = false;
            this.saveAllButton.innerHTML = originalText;
        }
    }

    async loadEscalas() {
        if (!this.tableBody) return;

        this.tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-primary"><i class="bi bi-arrow-clockwise spin me-2"></i>Carregando...</td></tr>';

        try {
            const data = await AgendaAPI.getEscalas(this.medicoId);
            this.tableBody.innerHTML = '';

            if (data.escalas && data.escalas.length > 0) {
                data.escalas.forEach(escala => {
                    this.tableBody.appendChild(this.renderEscala(escala));
                });
            } else {
                this.tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhuma escala definida. Adicione uma regra.</td></tr>';
            }
        } catch (error) {
            this.tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Erro ao carregar: ${error.message}</td></tr>`;
        }
    }

    collectData(row) {
        const inputs = row.querySelectorAll('select, input');
        return {
            medicoId: this.medicoId,
            diaSemana: parseInt(inputs[0].value),
            horaInicio: inputs[1].value,
            horaFim: inputs[2].value,
            duracaoConsulta: parseInt(inputs[3].value),
        };
    }

    async handleSaveOrUpdate(row, isNew) {
        const data = this.collectData(row);
        const inputs = row.querySelectorAll('select, input');

        if (!data.diaSemana || !data.horaInicio || !data.horaFim) {
            return UI.info('Campos obrigatórios', 'Preencha todos os campos antes de salvar.');
        }

        try {
            let result;
            if (isNew) {
                result = await AgendaAPI.createEscala(data);
            } else {
                const id = parseInt(row.dataset.escalaId);
                result = await AgendaAPI.updateEscala(id, data);
            }

            // Atualiza a tabela (e garante que a linha nova seja substituída pela linha de dados)
            this.loadEscalas();
            // Atualiza a lista de horários livres, já que a escala mudou
            if (window.AgendaManager) {
                window.AgendaManager.updateHorariosLivres();
            }
            UI.success('Sucesso', 'Escala atualizada com sucesso!');

        } catch (error) {
            return UI.info('Atenção', error.message);
        }
    }

    async handleDelete(id, row) {
        const confirmation = await UI.confirm(
            'Confirmar Inativação',
            'Tem certeza que deseja **inativar** esta escala de horário? Ela não será excluída permanentemente.'
        );

        if (!confirmation.isConfirmed) return;

        try {
            await AgendaAPI.deleteEscala(id);
            row.remove();

            // Atualiza a lista de horários livres, já que a escala mudou
            if (window.AgendaManager) {
                window.AgendaManager.updateHorariosLivres();
            }

            if (this.tableBody.children.length === 0) {
                this.loadEscalas();
            }
            UI.success('Inativada', 'Escala inativada com sucesso.');
        } catch (error) {
            return UI.info('Atenção', error.message);
        }
    }
}


// =========================================================
// CLASSE 2: MINI CALENDÁRIO
// =========================================================
class MiniCalendar {
    constructor() {
        this.today = new Date();
        this.selectedDate = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
        this.calendarBody = document.getElementById('calendar-body');
        this.calendarTitle = document.getElementById('calendar-title');
        this.prevButton = document.getElementById('prev-month-btn');
        this.nextButton = document.getElementById('next-month-btn');

        this.currentViewDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);

        this.addEventListeners();
    }

    formatMonthTitle(date) {
        let title = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        return title.charAt(0).toUpperCase() + title.slice(1);
    }

    fetchAppointmentDays(year, month) {
        // MOCK: Supondo que 6, 15 e 22 de Outubro de 2025 têm agendamentos
        // if (year === 2025 && month === 9) {
        //     return new Set([6, 15, 22]);
        // }
        return new Set();
    }

    render() {
        this.calendarBody.innerHTML = '';

        const year = this.currentViewDate.getFullYear();
        const month = this.currentViewDate.getMonth();
        this.calendarTitle.textContent = this.formatMonthTitle(this.currentViewDate);

        const appointmentDays = this.fetchAppointmentDays(year, month);
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let date = 1;

        for (let i = 0; i < 6; i++) {
            let row = document.createElement('tr');
            let rowHasCurrentMonthDay = false;

            for (let j = 0; j < 7; j++) {
                let cell = document.createElement('td');

                if (i === 0 && j < firstDayOfMonth || date > daysInMonth) {
                    cell.innerHTML = '';
                } else {
                    rowHasCurrentMonthDay = true;
                    let daySpan = document.createElement('span');
                    daySpan.className = 'day-number';
                    daySpan.textContent = date;

                    const isSelected = (date === this.selectedDate.getDate() && month === this.selectedDate.getMonth() && year === this.selectedDate.getFullYear());
                    const hasAppointment = appointmentDays.has(date);

                    if (isSelected) daySpan.classList.add('selected');
                    if (hasAppointment) daySpan.classList.add('has-appointment');

                    daySpan.onclick = this.handleDayClick.bind(this, date, month, year);

                    cell.appendChild(daySpan);
                    date++;
                }
                row.appendChild(cell);
            }

            if (rowHasCurrentMonthDay || i < 4 || (i === 5 && date > daysInMonth + 7)) {
                this.calendarBody.appendChild(row);
            }
            if (date > daysInMonth) break;
        }
    }

    prevMonth() {
        this.currentViewDate.setMonth(this.currentViewDate.getMonth() - 1);
        this.render();
    }

    nextMonth() {
        this.currentViewDate.setMonth(this.currentViewDate.getMonth() + 1);
        this.render();
    }

    handleDayClick(day, month, year) {
        this.selectedDate = new Date(year, month, day);

        if (this.currentViewDate.getMonth() !== month) {
            this.currentViewDate.setFullYear(year, month, 1);
        }

        this.render();
        window.AgendaManager.loadDay(this.selectedDate);
    }

    addEventListeners() {
        if (this.prevButton) this.prevButton.addEventListener('click', this.prevMonth.bind(this));
        if (this.nextButton) this.nextButton.addEventListener('click', this.nextMonth.bind(this));
    }
}


// =========================================================
// CLASSE 1: AGENDA MANAGER (Principal)
// =========================================================
class AgendaManager {
    constructor() {
        this.currentViewDate = new Date();
        this.currentViewDate.setHours(0, 0, 0, 0);
        this.medicoId = medicoId; // MOCK: O ID do médico logado (necessário para Escala e Agenda)

        this.dataAtualElement = document.getElementById('data-atual');
        this.prevDayButton = document.getElementById('prev-day');
        this.nextDayButton = document.getElementById('next-day');
        this.todayButton = document.getElementById('ir-para-hoje');

        // Referências do Modal de Nova Consulta
        this.novaConsultaModal = new bootstrap.Modal(document.getElementById('novaConsultaModal') || {});
        this.formNovaConsulta = document.getElementById('form-nova-consulta');

        this.inputPacienteNome = document.getElementById('paciente-select'); 
        this.datalistPacientes = document.getElementById('pacientes-datalist'); 
        this.inputPacienteCpf = document.getElementById('paciente-cpf');
        this.inputPacienteEndereco = document.getElementById('paciente-endereco');
        this.searchTimeout = null;  

        this.addEventListeners();
        this.initializeTooltips();
        this.updateHeaderDisplay();

        this.loadDay(this.currentViewDate); 
    }
    // --- UTILS ---

    formatDate(date) {
        return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    }

    updateHeaderDisplay() {
        this.dataAtualElement.textContent = this.formatDate(this.currentViewDate);
    }

    initializeTooltips() {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }

    getStatusDetails(status) {
        switch (status) {
            case 'Confirmado': return { class: 'bg-success-subtle text-success border border-success-subtle', icon: 'bi-check-circle-fill' };
            case 'Agendado':
            case 'Pendente': return { class: 'bg-warning-subtle text-warning border border-warning-subtle', icon: 'bi-clock-fill' };
            case 'Cancelado': return { class: 'bg-danger-subtle text-danger border border-danger-subtle', icon: 'bi-x-octagon-fill' };
            case 'Atendido': return { class: 'bg-primary-subtle text-primary border border-primary-subtle', icon: 'bi-check-all' };
            case 'Faltou': return { class: 'bg-secondary-subtle text-secondary border border-secondary-subtle', icon: 'bi-person-x-fill' };
            default: return { class: 'bg-secondary-subtle text-secondary border border-secondary-subtle', icon: 'bi-info-circle-fill' };
        }
    }

    getStatusClass(status) {
        switch (status) {
            case 'Confirmado': return 'bg-success text-white';
            case 'Agendado':
            case 'Pendente': return 'bg-warning text-dark';
            case 'Cancelado': return 'bg-danger text-white';
            case 'Atendido': return 'bg-primary text-white';
            case 'Faltou': return 'bg-secondary text-white';
            default: return 'bg-info text-white';
        }
    }


    // --- NAVEGAÇÃO E CARREGAMENTO DE DADOS ---

    changeDay(days) {
        this.currentViewDate.setDate(this.currentViewDate.getDate() + days);
        this.loadDay(this.currentViewDate);
    }

    async goToToday() {
        this.currentViewDate = new Date();
        this.currentViewDate.setHours(0, 0, 0, 0);
        await this.loadDay(this.currentViewDate);
    }

    async loadDay(date) {
        this.currentViewDate = new Date(date);
        this.currentViewDate.setHours(0, 0, 0, 0);
        this.updateHeaderDisplay();

        const mainArea = document.getElementById('agenda-horarios');
        mainArea.innerHTML = '<div class="text-center p-5 text-muted"><i class="bi bi-arrow-clockwise spin me-2"></i>Carregando agenda...</div>';

        try {
            const agendaData = await AgendaAPI.getAgenda(this.currentViewDate);
            this.renderMainAgenda(agendaData);
            this.renderDaySummary(agendaData);
        } catch (error) {
            mainArea.innerHTML = `<div class="alert alert-danger text-center p-3"><i class="bi bi-x-octagon-fill me-2"></i>Erro ao carregar. ${error.message}</div>`;
        }

        this.updateHorariosLivres();
 
        if (window.miniCalendar) {
            window.miniCalendar.selectedDate = this.currentViewDate;
            window.miniCalendar.currentViewDate = new Date(this.currentViewDate.getFullYear(), this.currentViewDate.getMonth(), 1);
            window.miniCalendar.render();
        }
    }


    /**
    * @description Renderiza uma lista resumida das consultas do dia na barra lateral.
    * @param {Object} data O objeto completo retornado pela AgendaAPI.getAgenda().
    */
    renderDaySummary(data) {
        const container = document.getElementById('resumo-consultas-list');
        if (!container) return;

        const compromissos = data.compromissos || [];

        // 1. Filtra consultas Ativas/Pendente/Confirmadas (exclui Cancelado e Faltou)
        const consultasAtivas = compromissos.filter(c =>
            c.status !== 'Cancelado' && c.status !== 'Faltou'
        );

        if (consultasAtivas.length === 0) {
            container.innerHTML = '<p class="text-muted small mb-0 p-2">Nenhuma consulta ativa para este dia.</p>';
            return;
        }

        let summaryHTML = '<ul class="list-unstyled mb-0">';

        consultasAtivas
            .sort((a, b) => new Date(a.data) - new Date(b.data)) // Ordena por horário
            .forEach(c => {
                const statusDetails = this.getStatusDetails(c.status);

                const dataObj = new Date(c.data);
                const horaParte = `${String(dataObj.getUTCHours()).padStart(2, '0')}:${String(dataObj.getUTCMinutes()).padStart(2, '0')}`;

                summaryHTML += `
                    <li class="d-flex align-items-center mb-2 cursor-pointer" 
                        onclick="window.AgendaManager.openAppointmentDetails(${c.id})">
                        
                        <span class="text-secondary fw-bold small me-2 flex-shrink-0">${horaParte}</span>
                        
                        <div class="flex-grow-1 small text-truncate">
                            <span class="fw-medium">${c.paciente.nome}</span>
                        </div>

                        <i class="bi ${statusDetails.icon} ms-1 small ${statusDetails.class.split(' ')[1]}"></i>
                    </li>
                `;
            });

        summaryHTML += '</ul>';
        container.innerHTML = summaryHTML;
    }

    /**
     * @description Renderiza a tabela principal da agenda, agora mostrando TODOS os agendamentos.
     */
    renderMainAgenda(data) {
        const mainArea = document.getElementById('agenda-horarios');
        const totalAgendamentosEl = document.getElementById('total-agendamentos');
        const compromissosDoDia = data.compromissos || [];
        const compromissosMapeados = {};
        compromissosDoDia.forEach(c => {
            const dateObj = new Date(c.data);
            const hours = dateObj.getUTCHours();
            const minutes = dateObj.getUTCMinutes();

            const timeKey = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            if (!compromissosMapeados[timeKey]) {
                compromissosMapeados[timeKey] = [];
            }
            compromissosMapeados[timeKey].push(c);
        });

        // Atualiza o total com todos os compromissos do dia (incluindo Cancelados/Faltou)
        totalAgendamentosEl.textContent = compromissosDoDia.length;

        let agendaHTML = '<table class="agenda-table">';

        for (let hora = 8; hora <= 18; hora++) {
            for (let min = 0; min < 60; min += 30) {
                const timeSlot = `${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                const slots = compromissosMapeados[timeSlot] || [];
                const occupiedClass = slots.length > 0 ? 'slot-occupied' : '';

                let contentHTML = slots.map(c => {
                    const statusDetails = this.getStatusDetails(c.status);
                    return `
                        <div class="badge ${statusDetails.class} agenda-compromisso" 
                             data-bs-toggle="tooltip" data-bs-placement="top"
                             data-bs-title="${c.paciente.nome} | ${c.tipoConsulta} | Dr. ${c.medico.nome.split(' ')[0]}"
                             data-appointment-id="${c.id}" 
                             onclick="window.AgendaManager.openAppointmentDetails(${c.id})">
                            <i class="bi ${statusDetails.icon} me-1"></i>
                            <span class="fw-medium">${c.paciente.nome}</span>
                        </div>
                    `;
                }).join('');

                agendaHTML += `
                    <tr class="agenda-row ${occupiedClass}" data-time="${timeSlot}">
                        <td class="time-label-cell">${timeSlot}</td>
                        <td class="agenda-content-cell">
                            <div class="agenda-content-area">
                                ${contentHTML}
                            </div>
                        </td>
                    </tr>
                `;
            }
        }

        agendaHTML += '</table>';
        mainArea.innerHTML = agendaHTML;
        this.initializeTooltips();
    }

 
    async updateHorariosLivres() {
        const container = document.getElementById('horarios-livres');
        if (!container) return;

        container.innerHTML = '<p class="text-muted small text-center mt-3" id="loading-horarios">Buscando horários disponíveis...</p>';

        try {
            const data = await AgendaAPI.getHorariosLivres(this.medicoId, this.currentViewDate);

            if (data.slotsLivres && data.slotsLivres.length > 0) {
                let buttonsHTML = data.slotsLivres.map(slot =>
                    `<button class="btn btn-outline-secondary btn-sm horario-btn me-1 mb-1" 
                                 data-time="${slot}" 
                                 onclick="window.AgendaManager.openNewAppointmentModal('${slot}')">
                            ${slot}
                        </button>`
                ).join('');

                container.innerHTML = `<div class="d-flex flex-wrap justify-content-center">${buttonsHTML}</div>` +
                    '<p class="text-muted small text-center mt-3 mb-0">Clique para agendar rápido</p>';
            } else {
                container.innerHTML = '<div class="alert alert-info text-center small p-2 mt-3">Nenhum horário livre encontrado.</div>';
            }
        } catch (error) {
            container.innerHTML = `<div class="alert alert-danger text-center small p-2 mt-3">Erro: ${error.message}</div>`;
        }
    }

    // Abre o modal ao clicar no horário livre

    // Abre o modal ao clicar no horário livre
    openNewAppointmentModal(timeSlot) {
        const fullDate = this.currentViewDate;
        const [hour, minute] = timeSlot.split(':');

        const consultationDate = new Date(fullDate);
        consultationDate.setHours(parseInt(hour), parseInt(minute), 0, 0);

        const dateString = consultationDate.toISOString().split('T')[0];

        // Preenchimento dos campos de Data e Hora
        document.getElementById('data-consulta').value = dateString;
        document.getElementById('hora-consulta').value = timeSlot;

        // Limpar e resetar campos de paciente
        document.getElementById('paciente-select').value = '';
        document.getElementById('paciente-cpf').value = '';
        document.getElementById('paciente-endereco').value = '';
        document.getElementById('tipo-consulta').value = 'Rotina';

        this.novaConsultaModal.show();
    }


    // Coleta os dados do formulário e salva o agendamento
    async handleSaveNewAppointment() {
        const form = this.formNovaConsulta;
        const submitButton = form.querySelector('button[type="submit"]');
        const dataToSend = {
            pacienteNome: document.getElementById('paciente-select').value,
            pacienteCpf: document.getElementById('paciente-cpf').value,
            pacienteEndereco: document.getElementById('paciente-endereco').value,
            data: `${document.getElementById('data-consulta').value}T${document.getElementById('hora-consulta').value}:00.000Z`,
            tipoConsulta: document.getElementById('tipo-consulta').value,
            medicoId: this.medicoId,
            status: 'Agendado'
        };

        if (!dataToSend.pacienteNome || !dataToSend.pacienteCpf || dataToSend.tipoConsulta === 'Selecione...') {
            return UI.info('Campos obrigatórios', 'Por favor, preencha o Nome, CPF e o Tipo de Consulta.');
        }

        const originalHTML = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-arrow-clockwise spin me-2"></i> Salvando...';

        try {
            const result = await AgendaAPI.createAgendamento(dataToSend);
            this.novaConsultaModal.hide();
            form.reset();
            document.getElementById('data-consulta').value = '';
            document.getElementById('hora-consulta').value = '';
            await this.loadDay(this.currentViewDate);
            return UI.success('Agendado com Sucesso', `Agendamento criado para **${result.agendamento.paciente.nome}** às ${document.getElementById('hora-consulta').value}!`);

        } catch (error) {
            return UI.error('Falha ao salvar', error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalHTML;
        }
    }

    /**
     * @description Abre o modal de detalhes do agendamento, ajustando botões de ação com base no status.
     */
    async openAppointmentDetails(id) {

        const modalElement = document.getElementById('pacienteDetailModal');
        const modal = new bootstrap.Modal(modalElement);
        const modalContentArea = document.getElementById('modal-content-area');
        const modalTitle = document.getElementById('pacienteDetailModalLabel');

        // Referências dos botões (IDs definidos no HTML do modal)
        const btnIniciarAtendimento = document.getElementById('btn-iniciar-atendimento');
        const btnCancelarAgendamento = document.getElementById('btn-cancelar-agendamento-footer');
        const btnEditarAgendamento = document.getElementById('btn-editar-agendamento');

        // 1. Estado inicial
        modalTitle.textContent = `Carregando Agendamento #${id}`;
        modalContentArea.innerHTML = '<div class="text-center p-5 text-muted"><i class="bi bi-arrow-clockwise spin me-2"></i>Buscando dados na clínica...</div>';

        // Oculta todos os botões no início
        btnIniciarAtendimento.style.display = 'none';
        btnCancelarAgendamento.style.display = 'none';
        btnEditarAgendamento.style.display = 'none';

        modal.show();

        try {
            // 2. Busca os dados do agendamento
            const data = await AgendaAPI.getAgendamentoById(id);
            const agendamento = data.agenda;

            // ----------------------------------------------------------------------------------
            // --- VERIFICAÇÃO CHAVE PARA AÇÕES (INICIAR/CANCELAR): Não pode estar CANCELADO ou ATENDIDO ---
            const isActionable = agendamento.status === 'Agendado' || agendamento.status === 'Confirmado';
            // ----------------------------------------------------------------------------------

            // 3. Formatação da Data
            const dataObj = new Date(agendamento.data);
            const dataParte = dataObj.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
            const horaParte = `${String(dataObj.getUTCHours()).padStart(2, '0')}:${String(dataObj.getUTCMinutes()).padStart(2, '0')}`;
            const dataConsultaFormatada = `${dataParte} às ${horaParte}`;

            const statusClass = this.getStatusClass(agendamento.status);

            // 4. Injeta o HTML no modalContentArea
            modalContentArea.innerHTML = `
                <div class="row g-0">
                    <div class="col-md-5 p-4 border-end bg-light-subtle">
                        <h5 class="text-primary mb-3">
                            <i class="bi bi-calendar-check me-2"></i> Detalhes da Consulta
                        </h5>
                        
                        <div class="mb-3">
                            <small class="text-muted d-block">STATUS ATUAL</small>
                            <span class="badge fs-6 p-2 ${statusClass}">${agendamento.status}</span>
                        </div>

                        <p class="mb-2"><strong><i class="bi bi-clock me-1"></i> Horário:</strong> ${dataConsultaFormatada}</p>
                        <p class="mb-2"><strong><i class="bi bi-person-badge me-1"></i> Médico:</strong> ${agendamento.medico.nome}</p>
                        <p class="mb-2"><strong><i class="bi bi-tag me-1"></i> Tipo:</strong> ${agendamento.tipoConsulta}</p>
                        <p class="mb-2"><strong><i class="bi bi-hash me-1"></i> ID Agendamento:</strong> ${agendamento.id}</p>
                        
                    </div>

                    <div class="col-md-7 p-4">
                        <h5 class="text-primary mb-3">
                            <i class="bi bi-person-vcard me-2"></i> Dados do Paciente
                        </h5>
                        
                        <div class="row">
                            <div class="col-12 mb-2">
                                <small class="text-muted d-block">Nome Completo</small>
                                <span class="fs-5 fw-bold">${agendamento.paciente.nome}</span>
                            </div>
                            <div class="col-md-6 mb-2">
                                <small class="text-muted d-block">CPF</small>
                                <span>${agendamento.paciente.cpf}</span>
                            </div>
                            <div class="col-md-6 mb-2">
                                <small class="text-muted d-block">Telefone</small>
                                <span>${agendamento.paciente.telefone || 'N/A'}</span>
                            </div>
                            <div class="col-12 mb-2">
                                <small class="text-muted d-block">Email</small>
                                <span>${agendamento.paciente.email || 'N/A'}</span>
                            </div>
                            <div class="col-12 mb-2">
                                <small class="text-muted d-block">Endereço</small>
                                <span>${agendamento.paciente.endereco || 'N/A'}</span>
                            </div>
                        </div>

                        ${agendamento.observacoes ? `
                        <hr class="mt-4 mb-3">
                        <h5 class="text-primary"><i class="bi bi-journal-text me-2"></i> Observações</h5>
                        <div class="alert alert-info bg-info-subtle border-start border-4 border-info py-2 px-3">
                            ${agendamento.observacoes}
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;

            modalTitle.textContent = `Agendamento #${agendamento.id}: ${agendamento.paciente.nome}`;

            // 5. Configuração dos botões do Footer (APENAS SE FOR ACIONÁVEL)
            if (isActionable) {

                // 5.1. Botão "Iniciar Atendimento"
                btnIniciarAtendimento.style.display = 'block';
                // Remove o listener antigo e adiciona o novo (evita duplicidade de eventos)
                btnIniciarAtendimento.replaceWith(btnIniciarAtendimento.cloneNode(true));
                document.getElementById('btn-iniciar-atendimento').addEventListener('click', () => {
                    modal.hide();
                    const novaRota = `/atendimento/iniciar?agendamentoId=${agendamento.id}&pacienteId=${agendamento.paciente.id}`;
                    window.location.href = novaRota;
                });

                // 5.2. Botão "Cancelar Agendamento"
                btnCancelarAgendamento.style.display = 'block';
                // Remove o listener antigo e adiciona o novo
                btnCancelarAgendamento.replaceWith(btnCancelarAgendamento.cloneNode(true));
                document.getElementById('btn-cancelar-agendamento-footer').addEventListener('click', async () => {
                    const confirmation = await UI.confirm(
                        'Confirmar Cancelamento?',
                        `Tem certeza que deseja **cancelar** a consulta de **${agendamento.paciente.nome}** (ID #${agendamento.id})?`
                    );

                    if (confirmation.isConfirmed) {
                        try {
                            // Chama a API para mudar o status para 'Cancelado' (Soft Delete)
                            await AgendaAPI.updateAgendamentoStatus(agendamento.id, 'Cancelado');
                            modal.hide();
                            UI.success('Agendamento Cancelado!', `O agendamento #${agendamento.id} foi cancelado.`);
                            // Recarrega a agenda para que o item Cancelado mude de cor na tabela
                            await this.loadDay(this.currentViewDate);

                        } catch (error) {
                            UI.error('Falha no Cancelamento', `Não foi possível cancelar: ${error.message}`);
                        }
                    }
                });
            }

            // O botão de Editar pode aparecer se o status não for 'Atendido', 'Cancelado' ou 'Faltou'
            if (agendamento.status !== 'Atendido' && agendamento.status !== 'Cancelado' && agendamento.status !== 'Faltou') {
                btnEditarAgendamento.style.display = 'block';
                // Lógica de evento de edição aqui, se necessário
            }


        } catch (error) {
            // 6. Exibe erro
            modalTitle.textContent = 'Erro ao Carregar Detalhes';
            modalContentArea.innerHTML = `
                <div class="alert alert-danger text-center p-4 m-4">
                    <i class="bi bi-bug me-2"></i>Falha ao carregar os detalhes do agendamento.
                    <p class="text-muted small mt-2">${error.message}</p>
                </div>
            `;
            // Garante que os botões de ação fiquem ocultos em caso de erro
            btnIniciarAtendimento.style.display = 'none';
            btnCancelarAgendamento.style.display = 'none';
            btnEditarAgendamento.style.display = 'none';
        }
    }

    // --- EVENT LISTENERS GERAIS ---
    addEventListeners() {
        if (this.prevDayButton) this.prevDayButton.addEventListener('click', () => this.changeDay(-1));
        if (this.nextDayButton) this.nextDayButton.addEventListener('click', () => this.changeDay(1));
        if (this.todayButton) this.todayButton.addEventListener('click', () => this.goToToday());

        // Listener do formulário de nova consulta
        if (this.formNovaConsulta) {
            this.formNovaConsulta.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSaveNewAppointment();
            });
        }

        // Listener de pesquisa de paciente (debounce)
        if (this.inputPacienteNome) {
            this.inputPacienteNome.addEventListener('input', () => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.handlePacienteSearch(this.inputPacienteNome.value);
                }, 300); // 300ms de atraso
            });
        }
    }

    // --- PESQUISA DE PACIENTES ---
    async handlePacienteSearch(query) {
        if (query.length < 2) {
            this.datalistPacientes.innerHTML = '';
            return;
        }

        try {
            const data = await AgendaAPI.searchPacientes(query);
            this.datalistPacientes.innerHTML = '';

            if (data.pacientes && data.pacientes.length > 0) {
                data.pacientes.forEach(p => {
                    const option = document.createElement('option');
                    option.value = p.nome;
                    // Adiciona o CPF para facilitar a identificação
                    option.textContent = `${p.nome} - CPF: ${p.cpf}`;
                    option.dataset.cpf = p.cpf;
                    option.dataset.endereco = p.endereco || '';
                    this.datalistPacientes.appendChild(option);
                });
            }

        } catch (error) {
            // Erro já tratado na API, apenas loga.
            console.error("Erro ao buscar pacientes:", error);
        }
    }
}

// Inicialização das classes (apenas se os elementos HTML existirem)
document.addEventListener('DOMContentLoaded', () => {
    if (typeof medicoId === 'undefined') {
        window.medicoId = 1;
    }

    window.AgendaManager = new AgendaManager();
    window.miniCalendar = new MiniCalendar();
    window.miniCalendar.render();

    // Inicia o EscalaManager
    if (document.getElementById('escalaModal')) {
        window.EscalaManager = new EscalaManager();
    }
});