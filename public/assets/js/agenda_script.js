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
            result = { message: response.statusText || "Erro de conexão ou servidor interno." };
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

    static async savePreferences(prefs) {
        try {
            return this.wrappedFetch('/medicos/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferences: JSON.stringify(prefs) }),
            });
        } catch (error) {
            console.error("Erro ao salvar preferências:", error);
            throw error;
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
        let title = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
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

        // Novos campos de endereço
        this.inputPacienteCep = document.getElementById('paciente-cep');
        this.inputPacienteLogradouro = document.getElementById('paciente-logradouro');
        this.inputPacienteNumero = document.getElementById('paciente-numero');
        this.inputPacienteComplemento = document.getElementById('paciente-complemento');
        this.inputPacienteBairro = document.getElementById('paciente-bairro');
        this.inputPacienteCidade = document.getElementById('paciente-cidade');
        this.inputPacienteEstado = document.getElementById('paciente-estado');

        this.selectedPacienteId = null;
        this.selectedPacienteOriginalName = null;
        this.editingAppointmentId = null;
        this.searchTimeout = null;
        this.cpfCheckTimeout = null;

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
        return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
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
        if (!value) return false;
        const cpf = value.replace(/\D/g, '');
        if (cpf.length !== 11) return false;
        if (/^(\d)\1+$/.test(cpf)) return false;

        let sum = 0;
        let remainder;

        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    }

    setCpfFieldValidity(input, isValid) {
        if (!input) return;
        if (isValid || input.value.length === 0) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        } else {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
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
            if (backBtn) {
                backBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
                backBtn.disabled = currentStep === 1;
            }
            if (nextBtn) {
                nextBtn.style.display = currentStep === totalSteps ? 'none' : 'inline-flex';
                nextBtn.disabled = !isStepValid(currentStep);
            }
            if (submitBtn) {
                submitBtn.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
                submitBtn.disabled = !isStepValid(totalSteps - 1) || !isStepValid(totalSteps);
            }
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
                console.log('Next button clicked, currentStep:', currentStep);
                if (isStepValid(currentStep)) {
                    console.log('Step is valid, going to:', currentStep + 1);
                    showStep(currentStep + 1);
                } else {
                    console.warn('Step is NOT valid');
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

            // Endereço formatado no review
            const addr = [
                byId('#paciente-logradouro')?.value,
                byId('#paciente-numero')?.value,
                byId('#paciente-bairro')?.value,
                byId('#paciente-cidade')?.value
            ].filter(Boolean).join(', ');
            setText('#review-endereco', addr || '—');

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
                const isValidFormat = this.isValidCPF(cpfInput.value);
                this.setCpfFieldValidity(cpfInput, isValidFormat || cpfInput.value.length === 0);

                // Real-time duplicate check
                clearTimeout(this.cpfCheckTimeout);
                if (isValidFormat && !this.selectedPacienteId) {
                    this.cpfCheckTimeout = setTimeout(async () => {
                        const cleanCpf = cpfInput.value.replace(/\D/g, '');
                        const data = await AgendaAPI.searchPacientes(cleanCpf);
                        const existing = (data.pacientes || []).find(p => p.cpf.replace(/\D/g, '') === cleanCpf);
                        if (existing) {
                            cpfInput.classList.add('is-invalid');
                            UI.info('Atenção', `Este CPF já pertence a **${existing.nome}**. <br> Selecione-o na busca de nomes.`);
                        }
                    }, 800);
                }

                updateCompleted();
            });
            cpfInput.addEventListener('blur', () => {
                const valid = this.isValidCPF(cpfInput.value);
                this.setCpfFieldValidity(cpfInput, valid);
            });
        }

        modal.addEventListener('show.bs.modal', () => {
            currentStep = 1;
            this.selectedPacienteId = null;
            showStep(1);
            updateCompleted();
            form.querySelectorAll('.is-valid, .is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
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
        return nowMinutes >= slotMinutes && nowMinutes < (slotMinutes + 15);
    }

    updateCurrentTimeIndicator() {
        const mainArea = document.getElementById('agenda-horarios');
        if (!mainArea) return;

        const isToday = this.isSameDay(this.currentViewDate, new Date());
        const rows = mainArea.querySelectorAll('.agenda-row');
        rows.forEach(r => r.classList.remove('current-time'));

        if (!isToday) return;

        const now = new Date();
        const roundedMinutes = Math.floor(now.getMinutes() / 15) * 15;
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
                return { class: 'bg-warning-subtle text-warning border border-warning-subtle', icon: 'bi-clock-fill' };
            case 'Cancelado':
                return { class: 'bg-danger-subtle text-danger border border-danger-subtle', icon: 'bi-x-octagon-fill' };
            case 'Atendido':
                return { class: 'bg-primary-subtle text-primary border border-primary-subtle', icon: 'bi-check-all' };
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

    getStatusDetails(status) {
        switch (status) {
            case 'Confirmado':
                return { class: 'status-confirmado', icon: 'bi-check-circle-fill' };
            case 'Agendado':
            case 'Pendente':
                return { class: 'status-agendado', icon: 'bi-clock-history' };
            case 'Cancelado':
                return { class: 'status-cancelado', icon: 'bi-x-circle-fill' };
            case 'Atendido':
                return { class: 'status-atendido', icon: 'bi-person-check-fill' };
            case 'Faltou':
                return { class: 'status-faltou', icon: 'bi-person-x-fill' };
            default:
                return { class: 'status-default', icon: 'bi-info-circle-fill' };
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

                const patientPhoto = c.paciente.foto
                    ? `<img src="${c.paciente.foto}" class="avatar-agenda-list">`
                    : `<div class="avatar-agenda-list">${c.paciente.nome.charAt(0).toUpperCase()}</div>`;

                summaryHTML += `
                    <li class="d-flex align-items-center mb-3 cursor-pointer p-2 rounded-3 hover-bg-light transition-all" 
                        onclick="window.AgendaManager.openAppointmentDetails(${c.id})">
                        
                        <div class="position-relative">
                            ${patientPhoto}
                            <div class="position-absolute bottom-0 end-0 border border-white border-2 rounded-circle" 
                                 style="width: 12px; height: 12px; background: var(--${statusDetails.class === 'status-confirmado' ? 'prontmed-green-success' : (statusDetails.class === 'status-agendado' ? 'prontmed-blue-primary' : 'prontmed-text-secondary')});">
                            </div>
                        </div>
                        <div class="ms-3 flex-grow-1">
                            <div class="fw-bold text-dark small mb-0">${c.paciente.nome}</div>
                            <div class="d-flex align-items-center gap-2 text-muted" style="font-size: 0.7rem;">
                                <span><i class="bi bi-clock me-1"></i>${horaParte}</span>
                                <span class="opacity-50">•</span>
                                <span>${c.tipoConsulta}</span>
                            </div>
                        </div>
                        <i class="bi bi-chevron-right text-muted opacity-25 ms-2"></i>
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

        for (let hora = 8; hora <= 19; hora++) {
            for (let min = 0; min < 60; min += 15) {
                const timeSlot = `${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                const slots = compromissosMapeados[timeSlot] || [];
                // Um slot só é considerado ocupado se houver compromissos NÃO cancelados
                const hasActiveSlots = slots.some(c => c.status !== 'Cancelado');
                const occupiedClass = hasActiveSlots ? 'slot-occupied' : '';
                const isToday = this.isSameDay(this.currentViewDate, new Date());
                const isCurrentTime = isToday && this.isCurrentTimeSlot(timeSlot);

                let contentHTML = slots.map(c => {
                    const sd = this.getStatusDetails(c.status);
                    const patientPhoto = c.paciente.foto
                        ? `<img src="${c.paciente.foto}" class="avatar-agenda-tiny">`
                        : `<div class="avatar-agenda-tiny">${c.paciente.nome.charAt(0).toUpperCase()}</div>`;

                    return `
                        <div class="agenda-compromisso ${sd.class}" 
                             data-bs-toggle="tooltip" data-bs-title="${c.paciente.nome} | ${c.tipoConsulta}"
                             onclick="window.AgendaManager.openAppointmentDetails(${c.id})">
                            <div class="d-flex align-items-center gap-2 w-100">
                                ${patientPhoto}
                                <div class="flex-grow-1 text-truncate">
                                    <div class="fw-bold" style="font-size: 0.8rem;">${c.paciente.nome}</div>
                                    <div class="opacity-75" style="font-size: 0.65rem;">${c.tipoConsulta}</div>
                                </div>
                                <i class="bi ${sd.icon} ms-auto" style="font-size: 0.75rem;"></i>
                            </div>
                        </div>
                    `;
                }).join('');

                agendaHTML += `
                    <tr class="agenda-row ${occupiedClass} ${isCurrentTime ? 'current-time' : ''}" data-time="${timeSlot}">
                        <td class="time-label-cell">${timeSlot}</td>
                        <td class="agenda-content-cell" onclick="window.AgendaManager.handleSlotClick('${timeSlot}', event)">
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

        // Trigger staggered entry animations
        setTimeout(() => {
            const cards = mainArea.querySelectorAll('.agenda-compromisso');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) scale(1)';
                }, index * 40);
            });
        }, 10);
    }

    handleSlotClick(timeSlot, event) {
        if (event.target.closest('.agenda-compromisso')) {
            return;
        }
        const isToday = this.isSameDay(this.currentViewDate, new Date());
        const [hour, minute] = timeSlot.split(':');
        const slotDate = new Date(this.currentViewDate);
        slotDate.setHours(parseInt(hour), parseInt(minute), 0, 0);

        if (isToday && slotDate < new Date()) {
            UI.info('Horário Passado', 'Não é possível agendar em horários que já passaram.');
            return;
        }
        this.openNewAppointmentModal(timeSlot);
    }

    async updateHorariosLivres() {
        const containerHoje = document.getElementById('horarios-hoje');
        const containerAmanha = document.getElementById('horarios-amanha');
        if (!containerHoje || !containerAmanha) return;

        try {
            // Horários de Hoje (currentViewDate)
            const agendaHoje = await AgendaAPI.getAgenda(this.currentViewDate);
            this.renderSlotsInContainer(containerHoje, this.currentViewDate, agendaHoje.compromissos);

            // Horários de Amanhã
            const amanha = new Date(this.currentViewDate);
            amanha.setDate(amanha.getDate() + 1);
            const agendaAmanha = await AgendaAPI.getAgenda(amanha);
            this.renderSlotsInContainer(containerAmanha, amanha, agendaAmanha.compromissos);

        } catch (error) {
            console.error("Erro ao carregar próximos horários:", error);
        }
    }

    renderSlotsInContainer(container, date, compromissos, limit = 9) {
        const compromissosMapeados = new Set();
        (compromissos || []).forEach(c => {
            // Se a consulta foi cancelada, o horário volta a ficar livre no mapeamento
            if (c.status === 'Cancelado') return;

            const d = new Date(c.data);
            const timeKey = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
            compromissosMapeados.add(timeKey);
        });

        const now = new Date();
        const slotsLivres = [];

        for (let h = 8; h <= 18; h++) {
            for (let m = 0; m < 60; m += 15) {
                const timeSlot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

                // Verificar se o slot já passou (se for hoje)
                const slotDate = new Date(date);
                slotDate.setHours(h, m, 0, 0);

                if (date.toDateString() === now.toDateString() && slotDate < now) continue;
                if (!compromissosMapeados.has(timeSlot)) {
                    slotsLivres.push(timeSlot);
                }
                if (slotsLivres.length >= limit) break;
            }
            if (slotsLivres.length >= limit) break;
        }

        if (slotsLivres.length === 0) {
            container.innerHTML = '<p class="text-muted small mb-0 p-2">Sem horários livres.</p>';
            return;
        }

        container.innerHTML = slotsLivres.map(slot => `
            <button class="horario-btn" onclick="window.AgendaManager.handleSidebarSlotClick('${date.toISOString().split('T')[0]}', '${slot}')">
                ${slot}
            </button>
        `).join('');
    }

    handleSidebarSlotClick(dateStr, timeSlot) {
        // Mudar a data da agenda se necessário
        const targetDate = new Date(dateStr + 'T00:00:00');
        if (targetDate.toDateString() !== this.currentViewDate.toDateString()) {
            this.currentViewDate = targetDate;
            this.loadDay(this.currentViewDate);
        }

        // Pequeno delay para garantir que o modal abra com a data certa carregada (opcional, mas seguro)
        setTimeout(() => {
            this.openNewAppointmentModal(timeSlot);
        }, 50);
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
        document.getElementById('paciente-select').readOnly = false;
        document.getElementById('paciente-cpf').value = '';

        // Reset campos endereço
        if (this.inputPacienteCep) this.inputPacienteCep.value = '';
        if (this.inputPacienteLogradouro) this.inputPacienteLogradouro.value = '';
        if (this.inputPacienteNumero) this.inputPacienteNumero.value = '';
        if (this.inputPacienteComplemento) this.inputPacienteComplemento.value = '';
        if (this.inputPacienteBairro) this.inputPacienteBairro.value = '';
        if (this.inputPacienteCidade) this.inputPacienteCidade.value = '';
        if (this.inputPacienteEstado) this.inputPacienteEstado.value = '';

        document.getElementById('tipo-consulta').value = 'Rotina';
        this.selectedPacienteId = null;
        this.selectedPacienteOriginalName = null;
        this.editingAppointmentId = null;

        const clearBtn = document.getElementById('clear-paciente');
        if (clearBtn) clearBtn.style.display = 'none';

        this.novaConsultaModal.show();
    }


    /**
     * @description Valida se um determinado horário está disponível para agendamento.
     * Verifica se o horário não está ocupado e se está dentro da escala do médico.
     * @param {string} dateString A data selecionada no formato 'YYYY-MM-DD'.
     * @param {string} dateString A data selecionada no formato 'YYYY-MM-DD'.
     * @param {string} timeString A hora selecionada no formato 'HH:MM'.
     * @param {string} pacienteCpf O CPF do paciente para verificar duplicidade no dia.
     * @param {number|null} excludeId O ID do agendamento atual (para ignorar em edições).
     * @returns {Promise<boolean>} True se o horário for válido, False caso contrário.
     */
    async validateAppointmentTime(dateString, timeString, silent = false, pacienteCpf = null, excludeId = null) {
        if (!dateString || !timeString) {
            return true;
        }

        const selectedDateTime = new Date(`${dateString}T${timeString}:00`);
        const selectedDate = new Date(selectedDateTime.getFullYear(), selectedDateTime.getMonth(), selectedDateTime.getDate());
        const now = new Date();

        if (selectedDateTime < now) {
            if (!silent) {
                UI.info('Horário inválido', 'Você não pode agendar em um horário que já passaram. Por favor, escolha um horário futuro.');
            }
            return false;
        }

        try {
            const agendaDoDia = await AgendaAPI.getAgenda(selectedDate);
            const compromissos = (agendaDoDia.compromissos || []).filter(c => c.id !== excludeId && c.status !== 'Cancelado');

            // 1. Verificar se o HORÁRIO está ocupado
            const ocupado = compromissos.some(c => {
                const dataCompromisso = new Date(c.data);
                const horaCompromisso = `${String(dataCompromisso.getUTCHours()).padStart(2, '0')}:${String(dataCompromisso.getUTCMinutes()).padStart(2, '0')}`;
                return horaCompromisso === timeString;
            });

            if (ocupado) {
                if (!silent) {
                    UI.info('Horário Ocupado', 'Já existe um agendamento para este horário. Por favor, escolha outro.');
                }
                return false;
            }

            // 2. Verificar se o PACIENTE já tem consulta no dia (Nova Regra)
            if (pacienteCpf) {
                const cleanCpf = pacienteCpf.replace(/\D/g, '');

                // --- NOVA VALIDAÇÃO: CPF GLOBAL ---
                // Se NÃO temos um pacienteId selecionado (ou seja, o usuário digitou um nome novo),
                // precisamos garantir que esse CPF não pertença a outro paciente já cadastrado.
                const searchData = await AgendaAPI.searchPacientes(cleanCpf);
                const existingPatient = (searchData.pacientes || []).find(p => p.cpf.replace(/\D/g, '') === cleanCpf);

                // Se o CPF existe mas o usuário NÃO selecionou esse paciente na lista (selectedPacienteId está vazio ou diferente)
                if (existingPatient) {
                    // Se for um NOVO agendamento e o usuário não selecionou o paciente da lista
                    if (!this.selectedPacienteId || this.selectedPacienteId !== existingPatient.id) {
                        if (!silent) {
                            UI.info('CPF já cadastrado', `Este CPF já pertence ao paciente **${existingPatient.nome}**. <br><br> Por favor, selecione-o na busca de nomes em vez de criar um novo.`);
                        }
                        return false;
                    }
                }

                // --- MANTER VALIDAÇÃO DE DUPLICIDADE NO DIA ---
                const jaAgendadoNoDia = compromissos.find(c => {
                    const cpfC = (c.paciente?.cpf || '').replace(/\D/g, '');
                    return cpfC === cleanCpf;
                });

                if (jaAgendadoNoDia) {
                    if (!silent) {
                        UI.info('Paciente duplicado', `Este paciente já possui um agendamento (${jaAgendadoNoDia.status}) às **${new Date(jaAgendadoNoDia.data).getUTCHours()}:${String(new Date(jaAgendadoNoDia.data).getUTCMinutes()).padStart(2, '0')}** neste mesmo dia.`);
                    }
                    return false;
                }
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
            pacienteId: this.selectedPacienteId,
            pacienteNome: document.getElementById('paciente-select').value,
            pacienteCpf: document.getElementById('paciente-cpf').value,
            cep: document.getElementById('paciente-cep').value,
            logradouro: document.getElementById('paciente-logradouro').value,
            numero: document.getElementById('paciente-numero').value,
            complemento: document.getElementById('paciente-complemento').value,
            bairro: document.getElementById('paciente-bairro').value,
            cidade: document.getElementById('paciente-cidade').value,
            estado: document.getElementById('paciente-estado').value,
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

        const isValid = await this.validateAppointmentTime(
            dataConsultaInput,
            horaConsultaInput,
            false,
            dataToSend.pacienteCpf,
            this.editingAppointmentId // Pass handle for edit cases
        );
        if (!isValid) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalHTML;
            return;
        }

        // Since we have a Review step in the modal (Step 4), we can skip the extra SweetAlert confirmation
        // to make the flow faster and more professional.

        try {
            submitButton.innerHTML = '<i class="bi bi-arrow-clockwise spin me-2"></i> Salvando...';
            const result = await AgendaAPI.createAgendamento(dataToSend);
            this.novaConsultaModal.hide();
            form.reset();
            document.getElementById('data-consulta').value = '';
            document.getElementById('hora-consulta').value = '';
            await this.loadDay(this.currentViewDate);
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
            const dataFormatada = dataObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
            const hora = `${String(dataObj.getUTCHours()).padStart(2, '0')}:${String(dataObj.getUTCMinutes()).padStart(2, '0')}`;
            const statusDetails = this.getStatusDetails(agendamento.status);

            const patientPhoto = agendamento.paciente.foto
                ? `<img src="${agendamento.paciente.foto}" class="avatar-agenda-detail">`
                : `<div class="avatar-agenda-detail">${agendamento.paciente.nome.charAt(0).toUpperCase()}</div>`;

            modalContentArea.innerHTML = `
                <div class="appointment-detail-premium">
                    <div class="detail-header p-4 text-white d-flex justify-content-between align-items-center" style="background: linear-gradient(135deg, #003b67 0%, #002544 100%);">
                        <div class="d-flex align-items-center gap-3">
                            ${patientPhoto}
                            <div>
                                <span class="badge ${statusDetails.class} mb-2 fs-6">
                                    <i class="bi ${statusDetails.icon} me-1"></i> ${agendamento.status}
                                </span>
                                <h3 class="mb-0 fw-bold">${agendamento.paciente.nome}</h3>
                                <p class="mb-0 opacity-75 small">ID Agendamento: #${agendamento.id} | CPF: ${agendamento.paciente.cpf}</p>
                            </div>
                        </div>
                        <div class="text-end">
                            <div class="detail-time-block bg-white bg-opacity-10 p-2 rounded">
                                <i class="bi bi-calendar3 me-2"></i>${dataFormatada}
                                <div class="fs-4 fw-bold"><i class="bi bi-clock me-2"></i>${hora}</div>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 bg-light">
                        <div class="row g-4">
                            <div class="col-md-6">
                                <div class="card h-100 border-0 shadow-sm rounded-4">
                                    <div class="card-body p-4">
                                        <h5 class="card-title text-primary mb-4 d-flex align-items-center">
                                            <i class="bi bi-person-vcard me-2"></i> Dados do Paciente
                                        </h5>
                                        <div class="detail-grid">
                                            <div class="detail-item mb-3">
                                                <label class="text-muted small d-block mb-1">CPF</label>
                                                <span class="fw-medium">${agendamento.paciente.cpf}</span>
                                            </div>
                                            <div class="detail-item mb-3">
                                                <label class="text-muted small d-block mb-1">CONTATO / EMAIL</label>
                                                <span class="fw-medium">${agendamento.paciente.email || 'N/A'}</span>
                                            </div>
                                            <div class="detail-item mb-0">
                                                <label class="text-muted small d-block mb-1">ENDEREÇO</label>
                                                <span class="fw-medium text-break">${agendamento.paciente.endereco || 'Não informado'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card h-100 border-0 shadow-sm rounded-4">
                                    <div class="card-body p-4">
                                        <h5 class="card-title text-primary mb-4 d-flex align-items-center">
                                            <i class="bi bi-clipboard-pulse me-2"></i> Informações da Consulta
                                        </h5>
                                        <div class="detail-grid">
                                            <div class="detail-item mb-3">
                                                <label class="text-muted small d-block mb-1">MÉDICO RESPONSÁVEL</label>
                                                <span class="fw-medium"><i class="bi bi-person-badge me-1"></i>Dr. ${agendamento.medico.nome}</span>
                                            </div>
                                            <div class="detail-item mb-3">
                                                <label class="text-muted small d-block mb-1">TIPO DE ATENDIMENTO</label>
                                                <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle px-3 py-2">
                                                    ${agendamento.tipoConsulta}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            ${agendamento.observacoes ? `
                            <div class="col-12">
                                <div class="card border-0 shadow-sm rounded-4 bg-info-subtle">
                                    <div class="card-body p-3">
                                        <h6 class="fw-bold mb-2"><i class="bi bi-info-circle me-2"></i>Observações Internas</h6>
                                        <p class="mb-0 small">${agendamento.observacoes}</p>
                                    </div>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;

            modalTitle.textContent = `Agendamento #${agendamento.id}: ${agendamento.paciente.nome} `;

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
                            UI.error('Falha no Cancelamento', `Não foi possível cancelar: ${error.message} `);
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
                btnEditarAgendamento.replaceWith(btnEditarAgendamento.cloneNode(true));
                document.getElementById('btn-editar-agendamento').addEventListener('click', () => {
                    modal.hide();
                    const timeStr = `${String(dataObj.getUTCHours()).padStart(2, '0')}:${String(dataObj.getUTCMinutes()).padStart(2, '0')}`;
                    this.openNewAppointmentModal(timeStr);

                    // Preencher campos com dados existentes
                    setTimeout(() => {
                        document.getElementById('paciente-select').value = agendamento.paciente.nome;
                        document.getElementById('paciente-cpf').value = agendamento.paciente.cpf;

                        if (this.inputPacienteCep) this.inputPacienteCep.value = agendamento.paciente.cep || '';
                        if (this.inputPacienteLogradouro) this.inputPacienteLogradouro.value = agendamento.paciente.logradouro || '';
                        if (this.inputPacienteNumero) this.inputPacienteNumero.value = agendamento.paciente.numero || '';
                        if (this.inputPacienteComplemento) this.inputPacienteComplemento.value = agendamento.paciente.complemento || '';
                        if (this.inputPacienteBairro) this.inputPacienteBairro.value = agendamento.paciente.bairro || '';
                        if (this.inputPacienteCidade) this.inputPacienteCidade.value = agendamento.paciente.cidade || '';
                        if (this.inputPacienteEstado) this.inputPacienteEstado.value = agendamento.paciente.estado || '';

                        document.getElementById('tipo-consulta').value = agendamento.tipoConsulta;
                        document.getElementById('data-consulta').value = agendamento.data.split('T')[0];
                        this.selectedPacienteId = agendamento.pacienteId;
                        this.editingAppointmentId = agendamento.id; // Mark as editing
                    }, 200);
                });

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
                                    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                this.inputChanged(); // Better check for manual changes
                clearTimeout(this.searchTimeout);

                const val = this.inputPacienteNome.value;
                if (!val) {
                    this.closeSuggestions();
                    return;
                }

                this.searchTimeout = setTimeout(() => {
                    this.handlePacienteSearch(val);
                }, 300);
            });

            // Fechar sugestões ao clicar fora
            document.addEventListener('click', (e) => {
                if (!e.target.closest('#paciente-search-container')) {
                    this.closeSuggestions();
                }
            });

            const clearBtn = document.getElementById('clear-paciente');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    this.inputPacienteNome.value = '';
                    this.inputPacienteNome.readOnly = false;
                    this.inputPacienteCpf.value = '';

                    if (this.inputPacienteCep) this.inputPacienteCep.value = '';
                    if (this.inputPacienteLogradouro) this.inputPacienteLogradouro.value = '';
                    if (this.inputPacienteNumero) this.inputPacienteNumero.value = '';
                    if (this.inputPacienteComplemento) this.inputPacienteComplemento.value = '';
                    if (this.inputPacienteBairro) this.inputPacienteBairro.value = '';
                    if (this.inputPacienteCidade) this.inputPacienteCidade.value = '';
                    if (this.inputPacienteEstado) this.inputPacienteEstado.value = '';

                    this.selectedPacienteId = null;
                    this.selectedPacienteOriginalName = null;
                    clearBtn.style.display = 'none';
                    this.inputPacienteNome.focus();
                });
            }
        }

        // Lógica de CEP no Agendamento
        const btnCep = document.getElementById('btn-consulta-cep-agenda');
        if (btnCep) {
            btnCep.addEventListener('click', async () => {
                const cepInput = document.getElementById('paciente-cep');
                let cep = (cepInput?.value || '').replace(/\D/g, '');

                if (cep.length !== 8) {
                    return UI.info('CEP Inválido', 'Por favor, informe um CEP com 8 dígitos.');
                }

                btnCep.disabled = true;
                const originalHtml = btnCep.innerHTML;
                btnCep.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();

                    if (data.erro) {
                        UI.error('CEP não encontrado', 'Verifique o número digitado.');
                    } else {
                        document.getElementById('paciente-logradouro').value = data.logradouro || '';
                        document.getElementById('paciente-bairro').value = data.bairro || '';
                        document.getElementById('paciente-cidade').value = data.localidade || '';
                        document.getElementById('paciente-estado').value = data.uf || '';
                        document.getElementById('paciente-numero').focus();
                    }
                } catch (e) {
                    UI.error('Erro de conexão', 'Não foi possível consultar o CEP.');
                } finally {
                    btnCep.disabled = false;
                    btnCep.innerHTML = originalHtml;
                }
            });
        }
    }

    closeSuggestions() {
        const resultsContainer = document.getElementById('paciente-search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
            resultsContainer.classList.remove('show');
        }
    }

    async handlePacienteSearch(query) {
        const resultsContainer = document.getElementById('paciente-search-results');
        if (!resultsContainer) return;

        if (query.length < 2) {
            this.closeSuggestions();
            return;
        }

        try {
            const data = await AgendaAPI.searchPacientes(query);
            resultsContainer.innerHTML = '';

            if (data.pacientes && data.pacientes.length > 0) {
                resultsContainer.classList.add('show');
                data.pacientes.forEach(p => {
                    const item = document.createElement('div');
                    item.className = 'paciente-suggestion-item p-3 border-bottom cursor-pointer d-flex align-items-center gap-3';

                    const patientPhoto = p.foto
                        ? `<img src="${p.foto}" class="avatar-agenda-search">`
                        : `<div class="avatar-agenda-search">${p.nome.charAt(0).toUpperCase()}</div>`;

                    item.innerHTML = `
                        ${patientPhoto}
                        <div class="flex-grow-1">
                            <div class="name fw-bold text-dark">${p.nome}</div>
                            <div class="details small text-muted">CPF: ${p.cpf} ${p.email ? ' | ' + p.email : ''}</div>
                        </div>
                        <i class="bi bi-plus-circle text-primary opacity-50"></i>
                    `;
                    item.onclick = () => this.selectPaciente(p);
                    resultsContainer.appendChild(item);
                });
            } else {
                resultsContainer.innerHTML = '<div class="p-3 text-center text-muted small">Nenhum paciente encontrado.</div>';
                resultsContainer.classList.add('show');
            }
        } catch (error) {
            console.error("Erro ao buscar pacientes:", error);
        }
    }

    inputChanged() {
        // Se o nome foi alterado manualmente e não bate com o original selecionado, limpamos o ID
        if (this.selectedPacienteId && this.inputPacienteNome && this.inputPacienteNome.value !== this.selectedPacienteOriginalName) {
            this.selectedPacienteId = null;
            this.selectedPacienteOriginalName = null;
        }
    }

    selectPaciente(p) {
        if (this.inputPacienteNome) {
            this.inputPacienteNome.value = p.nome;
            this.inputPacienteNome.readOnly = true;
            this.selectedPacienteOriginalName = p.nome;
            const clearBtn = document.getElementById('clear-paciente');
            if (clearBtn) clearBtn.style.display = 'inline-block';
        }
        if (this.inputPacienteCpf) {
            this.inputPacienteCpf.value = p.cpf || '';
            const event = new Event('input', { bubbles: true });
            this.inputPacienteCpf.dispatchEvent(event);
        }

        if (this.inputPacienteCep) this.inputPacienteCep.value = p.cep || '';
        if (this.inputPacienteLogradouro) this.inputPacienteLogradouro.value = p.logradouro || '';
        if (this.inputPacienteNumero) this.inputPacienteNumero.value = p.numero || '';
        if (this.inputPacienteComplemento) this.inputPacienteComplemento.value = p.complemento || '';
        if (this.inputPacienteBairro) this.inputPacienteBairro.value = p.bairro || '';
        if (this.inputPacienteCidade) this.inputPacienteCidade.value = p.cidade || '';
        if (this.inputPacienteEstado) this.inputPacienteEstado.value = p.estado || '';

        this.selectedPacienteId = p.id;
        this.closeSuggestions();
    }
}

// =========================================================
// CLASSE: MONITORING & INNOVATION ENGINE
// =========================================================
class MonitoringEngine {
    constructor(agendaManager) {
        this.am = agendaManager;
        this.init();
        this.loadPreferences();
    }

    init() {
        // Inicializar botões do painel lateral
        const btnOpen = document.getElementById('btn-open-config');
        const btnClose = document.getElementById('btn-close-config');
        const panel = document.getElementById('config-panel');

        if (btnOpen) btnOpen.onclick = () => panel.classList.add('open');
        if (btnClose) btnClose.onclick = () => panel.classList.remove('open');

        // Escutar cliques fora do painel para fechar
        document.addEventListener('mousedown', (e) => {
            if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== btnOpen) {
                panel.classList.remove('open');
            }
        });

        // Configurar Toggles de Tema
        document.querySelectorAll('.theme-blob').forEach(blob => {
            blob.addEventListener('click', () => {
                document.querySelectorAll('.theme-blob').forEach(b => b.classList.remove('active'));
                blob.classList.add('active');
                this.applyTheme(blob.dataset.theme);
            });
        });

        // Configurar Botão de Salvar
        const btnSave = document.getElementById('btn-save-preferences');
        if (btnSave) btnSave.onclick = () => this.saveCurrentPrefs();
    }

    loadPreferences() {
        const prefs = window.userPreferences || {};
        if (prefs.theme) {
            this.applyTheme(prefs.theme);
            // Atualizar UI do seletor
            document.querySelectorAll('.theme-blob').forEach(b => {
                b.classList.toggle('active', b.dataset.theme === prefs.theme);
            });
        }
        if (prefs.widgets) {
            this.applyWidgetVisibility(prefs.widgets);
            // Atualizar UI dos switches
            document.querySelectorAll('.widget-toggle').forEach(toggle => {
                const wid = toggle.dataset.wid;
                const input = toggle.querySelector('.form-check-input');
                if (input) input.checked = prefs.widgets.includes(wid);
            });
        }
    }

    applyTheme(theme) {
        document.body.className = ''; // Limpar classes
        if (theme === 'dark') {
            document.body.classList.add('theme-dark-mode');
        } else if (theme === 'zen') {
            document.body.classList.add('theme-zen-mode'); // Você pode adicionar CSS zen depois
        }
        // 'serious' é o padrão, não precisa de classe extra se o CSS base for ele
    }

    async saveCurrentPrefs() {
        const theme = document.querySelector('.theme-blob.active')?.dataset.theme || 'serious';
        const widgets = [];
        document.querySelectorAll('.widget-toggle .form-check-input').forEach(input => {
            if (input.checked) {
                widgets.push(input.closest('.widget-toggle').dataset.wid);
            }
        });

        const prefs = { theme, widgets };

        try {
            UI.loading('Sincronizando com o motor de preferências...');
            await AgendaAPI.savePreferences(prefs);
            UI.loading().close();
            UI.success('Preferências Salvas', 'O painel foi adaptado com sucesso para o seu perfil profissional.');

            // Re-aplicar widgets
            this.applyWidgetVisibility(widgets);
        } catch (e) {
            UI.error('Erro ao salvar', 'Não foi possível sincronizar suas preferências.');
        }
    }

    applyWidgetVisibility(widgets) {
        document.querySelectorAll('.monitor-card').forEach(card => {
            const wid = card.dataset.widget;
            card.style.display = widgets.includes(wid) ? 'block' : 'none';
        });
    }

    /**
     * @description Atualiza as métricas avançadas do Command Center com base nos dados reais da agenda
     */
    updateMetrics(data) {
        const compromissos = data.compromissos || [];
        const now = new Date();
        const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // 1. Próximo Paciente
        const futuros = compromissos
            .filter(c => c.status !== 'Cancelado' && c.status !== 'Atendido')
            .sort((a, b) => new Date(a.data) - new Date(b.data));

        const next = futuros[0];
        const nextEl = document.getElementById('monitor-next-patient');
        const nextTimeEl = document.getElementById('monitor-next-time');

        if (next) {
            nextEl.textContent = next.paciente.nome;
            const d = new Date(next.data);
            nextTimeEl.textContent = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
        } else {
            nextEl.textContent = 'Sem agendamentos';
            nextTimeEl.textContent = '--:--';
        }

        // 2. Eficiência (Atendidos / Total Ativos)
        const totaisAtivos = compromissos.filter(c => c.status !== 'Cancelado').length;
        const atendidos = compromissos.filter(c => c.status === 'Atendido').length;
        const eff = totaisAtivos > 0 ? Math.round((atendidos / totaisAtivos) * 100) : 0;
        document.getElementById('monitor-eff').textContent = `${eff}%`;

        // 3. Sala de Espera (Confirmados mas não Atendidos)
        const waiting = compromissos.filter(c => c.status === 'Confirmado').length;
        document.getElementById('monitor-waiting').textContent = waiting;

        // 4. Atendidos Real
        document.getElementById('monitor-attained').textContent = atendidos;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    if (typeof medicoId === 'undefined') {
        window.medicoId = 1;
    }

    window.AgendaManager = new AgendaManager();
    window.miniCalendar = new MiniCalendar();
    window.miniCalendar.render();


    // Iniciar Motor Avançado de Monitoramento (caso queira metrics ocultas)
    window.MonitoringEngine = new MonitoringEngine(window.AgendaManager);

    // Sobrescrever o loadDay do AgendaManager para atualizar as métricas avançadas
    const originalLoadDay = window.AgendaManager.loadDay.bind(window.AgendaManager);
    window.AgendaManager.loadDay = async function (date) {
        const res = await originalLoadDay(date);
        // Os dados são carregados via API dentro do loadDay, então precisamos buscar novamente ou emitir evento
        // Mas como AgendaAPI.getAgenda é chamado lá, podemos atualizar o Command Center
        try {
            const data = await AgendaAPI.getAgenda(date);
            window.MonitoringEngine.updateMetrics(data);
        } catch (e) { }
        return res;
    };
});
