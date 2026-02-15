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
            result = {message: response.statusText || "Erro de conexão ou servidor interno."};
        }

        if (!response.ok) {
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

            const response = await fetch(url, options);
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
                headers: {'Content-Type': 'application/json'},
            });
        } catch (error) {
            throw error;
        }
    }

    static async getAgendamentoById(id) {
        try {
            return this.wrappedFetch(`/agenda/${id}`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
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
                headers: {'Content-Type': 'application/json'},
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
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({status: newStatus}),
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
                headers: {'Content-Type': 'application/json'},
            });
        } catch (error) {
            throw error;
        }
    }

    static async createEscala(data) {
        try {
            return this.wrappedFetch('/escalas', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
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
                headers: {'Content-Type': 'application/json'},
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
                headers: {'Content-Type': 'application/json'},
            });
        } catch (error) {
            throw error;
        }
    }

    static async searchPacientes(query) {
        if (!query || query.length < 2) {
            return {success: true, pacientes: []};
        }
        try {
            return this.wrappedFetch(`/pacientes/search?q=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
            });
        } catch (error) {
            console.error("Erro na busca de pacientes:", error);
            return {success: false, pacientes: []};
        }
    }

    static async getHorariosLivres(medicoId, date) {
        const formattedDate = date.toISOString().split('T')[0];
        try {
            return this.wrappedFetch(`/disponibilidade/${medicoId}?date=${formattedDate}`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
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
        this.summaryContainer = document.getElementById('escala-dia-summary');
        this.summaryLabel = document.getElementById('escala-dia-label');
        this.escalas = [];
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
                id: Date.now(),
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
        event.stopPropagation();
        const taskKey = this.getTaskKey(this.currentViewDate);
        const storedTasks = JSON.parse(localStorage.getItem(taskKey) || '[]');

        const taskIndex = storedTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            storedTasks[taskIndex].concluida = !storedTasks[taskIndex].concluida;
            localStorage.setItem(taskKey, JSON.stringify(storedTasks));
            this.loadTasks(this.currentViewDate);
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
        inputInicio.type = 'time';
        inputInicio.className = 'form-control form-control-sm';
        inputInicio.value = escala.horaInicio || '08:00';
        row.insertCell().appendChild(inputInicio);

        const inputFim = document.createElement('input');
        inputFim.type = 'time';
        inputFim.className = 'form-control form-control-sm';
        inputFim.value = escala.horaFim || '18:00';
        row.insertCell().appendChild(inputFim);

        const inputDuracao = document.createElement('input');
        inputDuracao.type = 'number';
        inputDuracao.min = '15';
        inputDuracao.step = '5';
        inputDuracao.className = 'form-control form-control-sm';
        inputDuracao.value = escala.duracaoConsulta || 30;
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
            const diaSelect = row.querySelector('select');
            if (diaSelect && diaSelect.value) {
                uniqueDays.add(diaSelect.value);
            }
        });

        if (uniqueDays.size >= 7) {
            UI.info('Limite Alcançado', 'Você já adicionou regras (ativas ou em edição) para todos os 7 dias da semana.');
            return;
        }

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
                    const errorMessageText = error.message.replace(/^Error:\s*/, '');
                    errorMessages.push(`<strong>Dia ${this.diasDaSemana[this.collectData(row).diaSemana]}</strong>: ${errorMessageText}`);
                }
            }

            await this.loadEscalas();

            if (window.AgendaManager) {
                window.AgendaManager.updateHorariosLivres();
            }

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
            this.escalas = data.escalas || [];

            if (this.escalas.length > 0) {
                this.escalas.forEach(escala => {
                    this.tableBody.appendChild(this.renderEscala(escala));
                });
            } else {
                this.tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhuma escala definida. Adicione uma regra.</td></tr>';
            }
            const refDate = window.AgendaManager?.currentViewDate || new Date();
            this.renderDaySchedule(refDate);
        } catch (error) {
            this.tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Erro ao carregar: ${error.message}</td></tr>`;
        }
    }

    async ensureEscalasLoaded() {
        if (this.escalas.length > 0) return;
        try {
            const data = await AgendaAPI.getEscalas(this.medicoId);
            this.escalas = data.escalas || [];
        } catch (error) {
            this.escalas = [];
        }
    }

    async renderDaySchedule(date) {
        if (!this.summaryContainer) return;
        await this.ensureEscalasLoaded();

        const jsDay = date.getDay();
        const diaSemana = jsDay === 0 ? 7 : jsDay;
        const diaLabel = this.diasDaSemana[diaSemana] || 'Dia';

        if (this.summaryLabel) {
            this.summaryLabel.textContent = `Escala de ${diaLabel}`;
        }

        const escalasDoDia = this.escalas
            .filter(e => e.diaSemana === diaSemana)
            .sort((a, b) => (a.horaInicio || '').localeCompare(b.horaInicio || ''));

        if (escalasDoDia.length === 0) {
            this.summaryContainer.innerHTML = `
                <div class="escala-empty">
                    <i class="bi bi-exclamation-circle me-1"></i>
                    Sem escala definida para este dia.
                </div>
            `;
            return;
        }

        const toMinutes = (time) => {
            if (!time) return 0;
            const [h, m] = time.split(':').map(v => parseInt(v, 10));
            return (h * 60) + (m || 0);
        };

        const totalMinutes = escalasDoDia.reduce((sum, e) => {
            const start = toMinutes(e.horaInicio);
            const end = toMinutes(e.horaFim);
            return end > start ? sum + (end - start) : sum;
        }, 0);

        const totalHours = Math.floor(totalMinutes / 60);
        const totalMins = totalMinutes % 60;

        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        let nextSlot = null;
        const isToday = (date.toDateString() === new Date().toDateString());
        if (isToday) {
            nextSlot = escalasDoDia.find(e => toMinutes(e.horaInicio) > nowMinutes);
        }
        const isInSchedule = isToday && escalasDoDia.some(e => {
            const start = toMinutes(e.horaInicio);
            const end = toMinutes(e.horaFim);
            return nowMinutes >= start && nowMinutes < end;
        });

        const itemsHtml = escalasDoDia.map(e => `
            <div class="escala-item">
                <div class="escala-time">
                    <span>${e.horaInicio || '--:--'}</span>
                    <span class="sep">→</span>
                    <span>${e.horaFim || '--:--'}</span>
                </div>
                <div class="escala-meta">
                    <i class="bi bi-stopwatch me-1"></i>${e.duracaoConsulta || 30} min
                </div>
            </div>
        `).join('');

        const summaryHtml = `
            <div class="escala-stats">
                <div class="escala-stat ${isInSchedule ? 'active' : ''}">
                    <span class="label">Status agora</span>
                    <span class="value">${isToday ? (isInSchedule ? 'Em escala' : 'Fora da escala') : '—'}</span>
                </div>
                <div class="escala-stat">
                    <span class="label">Total do dia</span>
                    <span class="value">${totalHours}h ${totalMins}m</span>
                </div>
                <div class="escala-stat">
                    <span class="label">Próximo início</span>
                    <span class="value">${isToday ? (nextSlot ? nextSlot.horaInicio : '—') : '—'}</span>
                </div>
            </div>
            <div class="escala-list">${itemsHtml}</div>
        `;

        this.summaryContainer.innerHTML = summaryHtml;
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

            this.loadEscalas();
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
        let title = date.toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'});
        return title.charAt(0).toUpperCase() + title.slice(1);
    }

    fetchAppointmentDays(year, month) {
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
                    const isToday = (date === this.today.getDate() && month === this.today.getMonth() && year === this.today.getFullYear());
                    const hasAppointment = appointmentDays.has(date);

                    if (isSelected) daySpan.classList.add('selected');
                    if (isToday) daySpan.classList.add('today');
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
        this.medicoId = medicoId;
        this.currentTimeInterval = null;

        this.dataAtualElement = document.getElementById('data-atual');
        this.prevDayButton = document.getElementById('prev-day');
        this.nextDayButton = document.getElementById('next-day');
        this.todayButton = document.getElementById('ir-para-hoje');

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
        this.initModalStepper();

        this.loadDay(this.currentViewDate);
        this.currentTimeInterval = setInterval(() => {
            this.updateCurrentTimeIndicator();
        }, 60000);
    }

    // --- UTILS ---

    formatDate(date) {
        return date.toLocaleDateString('pt-BR', {weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'});
    }

    updateHeaderDisplay() {
        this.dataAtualElement.textContent = this.formatDate(this.currentViewDate);
    }

    initializeTooltips() {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }

    maskCPF(value) {
        const digits = (value || '').replace(/\D/g, '').slice(0, 11);
        const part1 = digits.slice(0, 3);
        const part2 = digits.slice(3, 6);
        const part3 = digits.slice(6, 9);
        const part4 = digits.slice(9, 11);
        let result = part1;
        if (part2) result += `.${part2}`;
        if (part3) result += `.${part3}`;
        if (part4) result += `-${part4}`;
        return result;
    }

    isValidCPF(value) {
        const cpf = (value || '').replace(/\D/g, '');
        if (cpf.length !== 11) return false;
        if (/^(\d)\1+$/.test(cpf)) return false;

        const calc = (base) => {
            let sum = 0;
            for (let i = 0; i < base.length; i++) {
                sum += parseInt(base[i], 10) * (base.length + 1 - i);
            }
            const mod = (sum * 10) % 11;
            return mod === 10 ? 0 : mod;
        };

        const d1 = calc(cpf.slice(0, 9));
        const d2 = calc(cpf.slice(0, 9) + d1);
        return cpf === (cpf.slice(0, 9) + d1 + d2);
    }

    setCpfFieldValidity(input, isValid) {
        if (!input) return;
        input.classList.toggle('is-invalid', !isValid);
        let feedback = input.parentElement.querySelector('.invalid-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.textContent = 'CPF inválido. Verifique os dígitos.';
            input.parentElement.appendChild(feedback);
        }
    }

    initModalStepper() {
        const modal = document.getElementById('novaConsultaModal');
        if (!modal) return;

        const steps = Array.from(modal.querySelectorAll('.modal-steps .step'));
        const groups = Array.from(modal.querySelectorAll('.step-group'));
        const backBtn = modal.querySelector('#step-back-btn');
        const nextBtn = modal.querySelector('#step-next-btn');
        const typeSelect = modal.querySelector('#tipo-consulta');
        const typeBadge = modal.querySelector('#step-type-badge');
        const form = modal.querySelector('#form-nova-consulta');
        const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
        if (steps.length === 0 || groups.length === 0) return;
        let currentStep = 1;
        const totalSteps = groups.length;

        const setActive = (stepNum) => {
            steps.forEach((s, i) => s.classList.toggle('active', i === stepNum - 1));
        };

        const isStepValid = (stepNum) => {
            const group = groups.find(g => parseInt(g.dataset.step, 10) === stepNum);
            if (!group) return true;
            const required = Array.from(group.querySelectorAll('input[required], select[required]'));
            const allFilled = required.every(el => !!el.value);
            if (!allFilled) return false;
            if (stepNum === 1) {
                const cpfInput = modal.querySelector('#paciente-cpf');
                return this.isValidCPF(cpfInput?.value || '');
            }
            return true;
        };

        const showStep = (stepNum) => {
            currentStep = Math.max(1, Math.min(stepNum, totalSteps));
            groups.forEach(g => g.classList.toggle('active', parseInt(g.dataset.step, 10) === currentStep));
            setActive(currentStep);
            if (currentStep === 4) fillReview();
            updateNav();
        };

        const updateNav = () => {
            if (backBtn) backBtn.disabled = currentStep === 1;
            if (nextBtn) nextBtn.style.display = currentStep === totalSteps ? 'none' : 'inline-flex';
            if (submitBtn) submitBtn.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
            if (nextBtn) nextBtn.disabled = !isStepValid(currentStep);
        };

        const updateCompleted = () => {
            steps.forEach((s, i) => {
                const group = groups[i];
                const required = Array.from(group.querySelectorAll('input[required], select[required]'));
                const filled = required.every(el => !!el.value);
                s.classList.toggle('completed', filled);
            });
            updateNav();
        };

        groups.forEach(group => {
            group.addEventListener('focusin', (e) => {
                const stepNum = parseInt(group.dataset.step, 10) || 1;
                showStep(stepNum);
            });
            group.addEventListener('input', updateCompleted);
            group.addEventListener('change', updateCompleted);
        });

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                showStep(currentStep - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (isStepValid(currentStep)) {
                    showStep(currentStep + 1);
                }
            });
        }

        const fillReview = () => {
            const byId = (id) => modal.querySelector(id);
            const setText = (id, value) => {
                const el = byId(id);
                if (el) el.textContent = value || '—';
            };
            setText('#review-paciente', byId('#paciente-select')?.value);
            setText('#review-cpf', byId('#paciente-cpf')?.value);
            setText('#review-endereco', byId('#paciente-endereco')?.value);
            setText('#review-data', byId('#data-consulta')?.value);
            setText('#review-hora', byId('#hora-consulta')?.value);
            setText('#review-tipo', byId('#tipo-consulta')?.value);
        };

        if (typeSelect && typeBadge) {
            const updateBadge = () => {
                const value = typeSelect.value;
                if (!value) {
                    typeBadge.textContent = '';
                    typeBadge.classList.remove('visible');
                    return;
                }
                typeBadge.textContent = value;
                typeBadge.classList.add('visible');
            };
            typeSelect.addEventListener('change', updateBadge);
            updateBadge();
        }

        const cpfInput = modal.querySelector('#paciente-cpf');
        if (cpfInput) {
            cpfInput.addEventListener('input', () => {
                cpfInput.value = this.maskCPF(cpfInput.value);
                this.setCpfFieldValidity(cpfInput, this.isValidCPF(cpfInput.value) || cpfInput.value.length === 0);
                updateCompleted();
            });
            cpfInput.addEventListener('blur', () => {
                const valid = this.isValidCPF(cpfInput.value);
                this.setCpfFieldValidity(cpfInput, valid);
            });
        }

        modal.addEventListener('show.bs.modal', () => {
            showStep(1);
            updateCompleted();
        });

        steps.forEach((step, index) => {
            step.addEventListener('click', () => {
                const targetStep = index + 1;
                if (targetStep <= currentStep || isStepValid(currentStep)) {
                    showStep(targetStep);
                }
            });
        });
    }

    isSameDay(a, b) {
        return a.getFullYear() === b.getFullYear()
            && a.getMonth() === b.getMonth()
            && a.getDate() === b.getDate();
    }

    isCurrentTimeSlot(timeSlot) {
        const now = new Date();
        const [hour, minute] = timeSlot.split(':').map(v => parseInt(v, 10));
        const slotMinutes = (hour * 60) + minute;
        const nowMinutes = (now.getHours() * 60) + now.getMinutes();
        return nowMinutes >= slotMinutes && nowMinutes < (slotMinutes + 30);
    }

    updateCurrentTimeIndicator() {
        const mainArea = document.getElementById('agenda-horarios');
        if (!mainArea) return;

        const isToday = this.isSameDay(this.currentViewDate, new Date());
        const rows = mainArea.querySelectorAll('.agenda-row');
        rows.forEach(r => r.classList.remove('current-time'));

        if (!isToday) return;

        const now = new Date();
        const roundedMinutes = Math.floor(now.getMinutes() / 30) * 30;
        const timeKey = `${String(now.getHours()).padStart(2, '0')}:${String(roundedMinutes).padStart(2, '0')}`;
        const currentRow = mainArea.querySelector(`.agenda-row[data-time="${timeKey}"]`);
        if (currentRow) currentRow.classList.add('current-time');
    }

    getStatusDetails(status) {
        switch (status) {
            case 'Confirmado':
                return {
                    class: 'bg-success-subtle text-success border border-success-subtle',
                    icon: 'bi-check-circle-fill'
                };
            case 'Agendado':
            case 'Pendente':
                return {class: 'bg-warning-subtle text-warning border border-warning-subtle', icon: 'bi-clock-fill'};
            case 'Cancelado':
                return {class: 'bg-danger-subtle text-danger border border-danger-subtle', icon: 'bi-x-octagon-fill'};
            case 'Atendido':
                return {class: 'bg-primary-subtle text-primary border border-primary-subtle', icon: 'bi-check-all'};
            case 'Faltou':
                return {
                    class: 'bg-secondary-subtle text-secondary border border-secondary-subtle',
                    icon: 'bi-person-x-fill'
                };
            default:
                return {
                    class: 'bg-secondary-subtle text-secondary border border-secondary-subtle',
                    icon: 'bi-info-circle-fill'
                };
        }
    }

    getStatusClass(status) {
        switch (status) {
            case 'Confirmado':
                return 'bg-success text-white';
            case 'Agendado':
            case 'Pendente':
                return 'bg-warning text-dark';
            case 'Cancelado':
                return 'bg-danger text-white';
            case 'Atendido':
                return 'bg-primary text-white';
            case 'Faltou':
                return 'bg-secondary text-white';
            default:
                return 'bg-info text-white';
        }
    }

    // --- NAVEGAÇÃO E CARREGAMENTO DE DATA ---

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

        if (window.EscalaManager) {
            window.EscalaManager.renderDaySchedule(this.currentViewDate);
        }

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

        const consultasAtivas = compromissos.filter(c =>
            c.status !== 'Cancelado' && c.status !== 'Faltou'
        );

        if (consultasAtivas.length === 0) {
            container.innerHTML = '<p class="text-muted small mb-0 p-2">Nenhuma consulta ativa para este dia.</p>';
            return;
        }

        let summaryHTML = '<ul class="list-unstyled mb-0">';

        consultasAtivas
            .sort((a, b) => new Date(a.data) - new Date(b.data))
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
        const metricTotal = document.getElementById('metric-total');
        const metricAgendadas = document.getElementById('metric-agendadas');
        const metricConfirmadas = document.getElementById('metric-confirmadas');
        const metricCanceladas = document.getElementById('metric-canceladas');
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

        totalAgendamentosEl.textContent = compromissosDoDia.length;
        if (metricTotal) metricTotal.textContent = compromissosDoDia.length;
        if (metricAgendadas) metricAgendadas.textContent = compromissosDoDia.filter(c => c.status === 'Agendado').length;
        if (metricConfirmadas) metricConfirmadas.textContent = compromissosDoDia.filter(c => c.status === 'Confirmado').length;
        if (metricCanceladas) metricCanceladas.textContent = compromissosDoDia.filter(c => c.status === 'Cancelado').length;

        let agendaHTML = '<table class="agenda-table">';

        for (let hora = 8; hora <= 18; hora++) {
            for (let min = 0; min < 60; min += 30) {
                const timeSlot = `${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                const slots = compromissosMapeados[timeSlot] || [];
                const occupiedClass = slots.length > 0 ? 'slot-occupied' : '';
                const isToday = this.isSameDay(this.currentViewDate, new Date());
                const isCurrentTime = isToday && this.isCurrentTimeSlot(timeSlot);

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
                    <tr class="agenda-row ${occupiedClass} ${isCurrentTime ? 'current-time' : ''}" data-time="${timeSlot}">
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
        this.updateCurrentTimeIndicator();
    }


    async updateHorariosLivres() {
        const container = document.getElementById('horarios-livres');
        if (!container) return;

        container.innerHTML = '<p class="text-muted small text-center mt-3" id="loading-horarios">Buscando horários disponíveis...</p>';

        try {
            const data = await AgendaAPI.getHorariosLivres(this.medicoId, this.currentViewDate);

            if (data.slotsLivres && data.slotsLivres.length > 0) {
                let buttonsHTML = data.slotsLivres.map(slot => {
                    const [hour, minute] = slot.split(':');
                    const slotDate = new Date(this.currentViewDate);
                    slotDate.setHours(parseInt(hour), parseInt(minute), 0, 0);
                    const isPast = slotDate < new Date();

                    return `
                        <button class="btn btn-outline-secondary btn-sm horario-btn me-1 mb-1 ${isPast ? 'disabled' : ''}"
                                data-time="${slot}"
                                ${isPast ? 'disabled data-bs-toggle="tooltip" data-bs-title="Horário já passou"' : `onclick="window.AgendaManager.openNewAppointmentModal('${slot}')"`}>
                            ${slot}
                        </button>
                    `;
                }).join('');

                container.innerHTML = `<div class="d-flex flex-wrap justify-content-center">${buttonsHTML}</div>` +
                    '<p class="text-muted small text-center mt-3 mb-0">Clique para agendar rápido</p>';
                this.initializeTooltips();
            } else {
                container.innerHTML = '<div class="alert alert-info text-center small p-2 mt-3">Nenhum horário livre encontrado.</div>';
            }
        } catch (error) {
            container.innerHTML = `<div class="alert alert-danger text-center small p-2 mt-3">Erro: ${error.message}</div>`;
        }
    }

    openNewAppointmentModal(timeSlot) {
        const fullDate = this.currentViewDate;
        const [hour, minute] = timeSlot.split(':');

        const consultationDate = new Date(fullDate);
        consultationDate.setHours(parseInt(hour), parseInt(minute), 0, 0);

        const dateString = consultationDate.toISOString().split('T')[0];

        document.getElementById('data-consulta').value = dateString;
        document.getElementById('hora-consulta').value = timeSlot;

        document.getElementById('paciente-select').value = '';
        document.getElementById('paciente-cpf').value = '';
        document.getElementById('paciente-endereco').value = '';
        document.getElementById('tipo-consulta').value = 'Rotina';

        this.novaConsultaModal.show();
    }


    /**
     * @description Valida se um determinado horário está disponível para agendamento.
     * Verifica se o horário não está ocupado e se está dentro da escala do médico.
     * @param {string} dateString A data selecionada no formato 'YYYY-MM-DD'.
     * @param {string} timeString A hora selecionada no formato 'HH:MM'.
     * @returns {Promise<boolean>} True se o horário for válido, False caso contrário.
     */
    async validateAppointmentTime(dateString, timeString, silent = false) {
        if (!dateString || !timeString) {
            return true;
        }

        const selectedDateTime = new Date(`${dateString}T${timeString}:00`);
        const selectedDate = new Date(selectedDateTime.getFullYear(), selectedDateTime.getMonth(), selectedDateTime.getDate());
        const now = new Date();

        if (selectedDateTime < now) {
            if (!silent) {
                UI.info('Horário inválido', 'Você não pode agendar em um horário que já passou. Por favor, escolha um horário futuro.');
            }
            return false;
        }

        try {
            const agendaDoDia = await AgendaAPI.getAgenda(selectedDate);
            const compromissosNoHorario = agendaDoDia.compromissos.filter(c => {
                const dataCompromisso = new Date(c.data);
                const horaCompromisso = `${String(dataCompromisso.getUTCHours()).padStart(2, '0')}:${String(dataCompromisso.getUTCMinutes()).padStart(2, '0')}`;
                return horaCompromisso === timeString;
            });

            if (compromissosNoHorario.length > 0) {
                if (!silent) {
                    UI.info('Horário Ocupado', 'Já existe um agendamento para este horário. Por favor, escolha outro.');
                }
                return false;
            }

            const horariosLivres = await AgendaAPI.getHorariosLivres(this.medicoId, selectedDate);
            if (!horariosLivres.slotsLivres.includes(timeString)) {
                if (!silent) {
                    UI.info('Horário Inválido', 'O horário selecionado não está disponível na escala de trabalho do médico ou já foi preenchido. Por favor, escolha um horário válido.');
                }
                return false;
            }

            return true;
        } catch (error) {
            if (!silent) {
                UI.error('Erro de Validação', `Não foi possível validar o horário: ${error.message}`);
            }
            return false;
        }
    }


    async handleSaveNewAppointment() {
        const form = this.formNovaConsulta;
        const submitButton = form.querySelector('button[type="submit"]');
        const dataConsultaInput = document.getElementById('data-consulta').value;
        const horaConsultaInput = document.getElementById('hora-consulta').value;

        const dataToSend = {
            pacienteNome: document.getElementById('paciente-select').value,
            pacienteCpf: document.getElementById('paciente-cpf').value,
            pacienteEndereco: document.getElementById('paciente-endereco').value,
            data: `${dataConsultaInput}T${horaConsultaInput}:00.000Z`,
            tipoConsulta: document.getElementById('tipo-consulta').value,
            medicoId: this.medicoId,
            status: 'Agendado'
        };

        if (!dataToSend.pacienteNome || !dataToSend.pacienteCpf || dataToSend.tipoConsulta === 'Selecione...') {
            return UI.info('Campos obrigatórios', 'Por favor, preencha o Nome, CPF e o Tipo de Consulta.');
        }

        const originalHTML = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-arrow-clockwise spin me-2"></i> Verificando...';

        const isValid = await this.validateAppointmentTime(dataConsultaInput, horaConsultaInput, false);
        if (!isValid) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalHTML;
            return;
        }

        const confirmHtml = `
            <div class="text-start">
                <p class="mb-2"><strong>Paciente:</strong> ${dataToSend.pacienteNome || '-'}</p>
                <p class="mb-2"><strong>CPF:</strong> ${dataToSend.pacienteCpf || '-'}</p>
                <p class="mb-2"><strong>Endereço:</strong> ${dataToSend.pacienteEndereco || '-'}</p>
                <p class="mb-2"><strong>Data:</strong> ${dataConsultaInput || '-'}</p>
                <p class="mb-0"><strong>Hora:</strong> ${horaConsultaInput || '-'}</p>
                <hr class="my-2">
                <p class="mb-0"><strong>Tipo:</strong> ${dataToSend.tipoConsulta || '-'}</p>
            </div>
        `;

        const confirmation = await UI.confirm('Confirmar Agendamento?', confirmHtml);
        if (!confirmation.isConfirmed) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalHTML;
            return;
        }

        try {
            submitButton.innerHTML = '<i class="bi bi-arrow-clockwise spin me-2"></i> Salvando...';
            const result = await AgendaAPI.createAgendamento(dataToSend);
            this.novaConsultaModal.hide();
            form.reset();
            document.getElementById('data-consulta').value = '';
            document.getElementById('hora-consulta').value = '';
            await this.loadDay(this.currentViewDate);
            return UI.success('Agendado com Sucesso', `Agendamento criado para **${result.agendamento.paciente.nome}** às ${horaConsultaInput}!`);

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

        const btnIniciarAtendimento = document.getElementById('btn-iniciar-atendimento');
        const btnCancelarAgendamento = document.getElementById('btn-cancelar-agendamento-footer');
        const btnEditarAgendamento = document.getElementById('btn-editar-agendamento');

        btnIniciarAtendimento.style.display = 'none';
        btnCancelarAgendamento.style.display = 'none';
        btnEditarAgendamento.style.display = 'none';

        modal.show();

        try {
            const data = await AgendaAPI.getAgendamentoById(id);
            const agendamento = data.agenda;

            const isActionable = agendamento.status === 'Agendado' || agendamento.status === 'Confirmado';

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

            modalContentArea.innerHTML = `
                <div class="detail-status-bar">
                    <div class="status-left">
                        <span class="badge fs-6 p-2 ${statusClass}">
                            <i class="bi bi-info-circle me-1"></i>${agendamento.status}
                        </span>
                        <span class="status-meta">
                            <i class="bi bi-clock me-1"></i>${dataConsultaFormatada}
                        </span>
                    </div>
                    <div class="status-right">
                        <span class="status-id">ID #${agendamento.id}</span>
                        <span class="status-doctor"><i class="bi bi-person-badge me-1"></i>${agendamento.medico.nome}</span>
                        <div class="status-actions">
                            <button class="btn btn-sm btn-success" id="detail-action-start"><i class="bi bi-play-circle me-1"></i>Iniciar</button>
                            <button class="btn btn-sm btn-danger" id="detail-action-cancel"><i class="bi bi-x-octagon me-1"></i>Cancelar</button>
                            <button class="btn btn-sm btn-info" id="detail-action-edit"><i class="bi bi-pencil-square me-1"></i>Editar</button>
                        </div>
                    </div>
                </div>
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

            const actionStart = document.getElementById('detail-action-start');
            const actionCancel = document.getElementById('detail-action-cancel');
            const actionEdit = document.getElementById('detail-action-edit');

            if (actionStart) actionStart.style.display = 'none';
            if (actionCancel) actionCancel.style.display = 'none';
            if (actionEdit) actionEdit.style.display = 'none';

            if (isActionable) {

                btnIniciarAtendimento.style.display = 'block';
                btnIniciarAtendimento.replaceWith(btnIniciarAtendimento.cloneNode(true));
                document.getElementById('btn-iniciar-atendimento').addEventListener('click', () => {
                    modal.hide();
                    const novaRota = `/atendimento?pacienteId=${agendamento.pacienteId}&dataAtendimento=${agendamento.data}`;
                    window.open(novaRota, '_blank');
                });

                btnCancelarAgendamento.style.display = 'block';
                btnCancelarAgendamento.replaceWith(btnCancelarAgendamento.cloneNode(true));
                document.getElementById('btn-cancelar-agendamento-footer').addEventListener('click', async () => {
                    const confirmation = await UI.confirm(
                        'Confirmar Cancelamento?',
                        `Tem certeza que deseja **cancelar** a consulta de **${agendamento.paciente.nome}** (ID #${agendamento.id})?`
                    );

                    if (confirmation.isConfirmed) {
                        try {
                            await AgendaAPI.updateAgendamentoStatus(agendamento.id, 'Cancelado');
                            modal.hide();
                            UI.success('Agendamento Cancelado!', `O agendamento #${agendamento.id} foi cancelado.`);
                            await this.loadDay(this.currentViewDate);

                        } catch (error) {
                            UI.error('Falha no Cancelamento', `Não foi possível cancelar: ${error.message}`);
                        }
                    }
                });

                if (actionStart) {
                    actionStart.style.display = 'inline-flex';
                    actionStart.onclick = () => document.getElementById('btn-iniciar-atendimento').click();
                }
                if (actionCancel) {
                    actionCancel.style.display = 'inline-flex';
                    actionCancel.onclick = () => document.getElementById('btn-cancelar-agendamento-footer').click();
                }
            }

            if (agendamento.status !== 'Atendido' && agendamento.status !== 'Cancelado' && agendamento.status !== 'Faltou') {
                btnEditarAgendamento.style.display = 'block';
                if (actionEdit) {
                    actionEdit.style.display = 'inline-flex';
                    actionEdit.onclick = () => document.getElementById('btn-editar-agendamento').click();
                }
            }


        } catch (error) {
            modalTitle.textContent = 'Erro ao Carregar Detalhes';
            modalContentArea.innerHTML = `
                <div class="alert alert-danger text-center p-4 m-4">
                    <i class="bi bi-bug me-2"></i>Falha ao carregar os detalhes do agendamento.
                    <p class="text-muted small mt-2">${error.message}</p>
                </div>
            `;
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

        if (this.formNovaConsulta) {
            this.formNovaConsulta.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSaveNewAppointment();
            });

            const dataConsultaEl = document.getElementById('data-consulta');
            const horaConsultaEl = document.getElementById('hora-consulta');

            if (dataConsultaEl && horaConsultaEl) {
                // Validação será feita apenas no avanço/salvar para evitar alertas durante digitação.
                const validateSilently = async () => {
                    if (!dataConsultaEl.value) return;
                    if (!horaConsultaEl.value || horaConsultaEl.value.length < 5) {
                        horaConsultaEl.classList.remove('is-invalid');
                        const fb = horaConsultaEl.parentElement.querySelector('.hora-feedback');
                        if (fb) fb.remove();
                        return;
                    }
                    const ok = await this.validateAppointmentTime(dataConsultaEl.value, horaConsultaEl.value, true);
                    horaConsultaEl.classList.toggle('is-invalid', !ok);

                    let fb = horaConsultaEl.parentElement.querySelector('.hora-feedback');
                    if (!ok) {
                        if (!fb) {
                            fb = document.createElement('div');
                            fb.className = 'hora-feedback';
                            fb.textContent = 'Esse horário não está disponível. Tente outro horário.';
                            const link = document.createElement('button');
                            link.type = 'button';
                            link.className = 'hora-feedback-link';
                            link.textContent = 'Ver horários livres';
                            link.addEventListener('click', () => {
                                const card = document.getElementById('horarios-livres-card');
                                if (card) {
                                    card.scrollIntoView({behavior: 'smooth', block: 'start'});
                                    card.classList.add('highlight-card');
                                    setTimeout(() => card.classList.remove('highlight-card'), 1200);
                                }
                            });
                            fb.setAttribute('role', 'status');
                            fb.setAttribute('aria-live', 'polite');
                            fb.appendChild(link);
                            horaConsultaEl.parentElement.appendChild(fb);
                        }
                    } else if (fb) {
                        fb.remove();
                    }
                };

                dataConsultaEl.addEventListener('change', validateSilently);
                horaConsultaEl.addEventListener('blur', validateSilently);
            }
        }

        if (this.inputPacienteNome) {
            this.inputPacienteNome.addEventListener('input', () => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.handlePacienteSearch(this.inputPacienteNome.value);
                }, 300);
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
                    option.textContent = `${p.nome} - CPF: ${p.cpf}`;
                    option.dataset.cpf = p.cpf;
                    option.dataset.endereco = p.endereco || '';
                    this.datalistPacientes.appendChild(option);
                });
            }

        } catch (error) {
            console.error("Erro ao buscar pacientes:", error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof medicoId === 'undefined') {
        window.medicoId = 1;
    }

    window.AgendaManager = new AgendaManager();
    window.miniCalendar = new MiniCalendar();
    window.miniCalendar.render();

    if (document.getElementById('escalaModal')) {
        window.EscalaManager = new EscalaManager();
    }
});
