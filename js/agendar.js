const API = "http://localhost:3000/api";
const WHATSAPP_LINK = "https://wa.me/557381823074"; 

const Booking = {
    state: {
        service: null,
        day: null,
        hour: null,
        name: null,
        phone: null
    },

    init() {
        this.bindServiceSelection();
        this.bindForm();
    },

    goToStep(stepId) {
        document.querySelectorAll('.booking__step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById(stepId).classList.add('active');
    },

    // ==========================================
    // ETAPA 1: Serviço
    // ==========================================
    bindServiceSelection() {
        document.querySelectorAll('.booking__card').forEach(card => {
            card.addEventListener('click', () => {
                this.state.service = card.querySelector('.booking__card-title').textContent.trim();
                this.goToStep('step-date');
                this.loadAvailableDays();
            });
        });
    },

    // ==========================================
    // ETAPA 2: Datas
    // ==========================================
    async loadAvailableDays() {
        const container = document.getElementById('calendar-container');
        container.innerHTML = '<p style="color: var(--text-secondary); width: 100%; grid-column: 1 / -1; text-align: center;">Carregando dias...</p>';

        try {
            const availableDays = await this.getDays();
            const date = new Date();
            const currentYear = date.getFullYear();
            const currentMonth = date.getMonth();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const today = date.getDate();

            container.innerHTML = '';

            for (let i = 1; i <= daysInMonth; i++) {
                const btn = document.createElement('button');
                btn.className = 'date-btn';
                btn.textContent = String(i).padStart(2, '0');

                // Habilita apenas se o dia voltou na API e não é do passado
                if (availableDays.includes(i) && i >= today) {
                    btn.onclick = () => {
                        this.state.day = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                        this.goToStep('step-time');
                        this.loadAvailableHours();
                    };
                } else {
                    btn.disabled = true;
                }

                container.appendChild(btn);
            }
        } catch (error) {
            container.innerHTML = `<p style="color: #ff4c4c; width: 100%; grid-column: 1 / -1; text-align: center;">${error.message}</p>`;
        }
    },

    // ==========================================
    // ETAPA 3: Horários
    // ==========================================
    async loadAvailableHours() {
        const container = document.getElementById('time-container');
        container.innerHTML = '<p style="color: var(--text-secondary); width: 100%; grid-column: 1 / -1; text-align: center;">Carregando horários...</p>';

        try {
            const availableHours = await this.getHours();

            container.innerHTML = '';
            
            if (!availableHours || availableHours.length === 0) {
                container.innerHTML = '<p style="color: var(--text-secondary); width: 100%; grid-column: 1 / -1; text-align: center;">Nenhum horário disponível para este dia.</p>';
                return;
            }

            availableHours.forEach(hour => {
                const btn = document.createElement('button');
                btn.className = 'time-btn';
                btn.textContent = hour;
                
                btn.onclick = () => {
                    this.state.hour = hour;
                    this.goToStep('step-confirmation');
                };

                container.appendChild(btn);
            });
        } catch (error) {
            container.innerHTML = `<p style="color: #ff4c4c; width: 100%; grid-column: 1 / -1; text-align: center;">${error.message}</p>`;
        }
    },

    // ==========================================
    // ETAPA 4: Formulário
    // ==========================================
    bindForm() {
        const form = document.getElementById('booking-form');
        const phoneInput = document.getElementById('telefone');

        // Máscara de Telefone: (00) 00000-0000
        phoneInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 11) val = val.slice(0, 11);
            
            if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
            if (val.length > 10) val = `${val.slice(0, 10)}-${val.slice(10)}`;
            
            e.target.value = val;
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('nome').value.trim();
            const rawPhone = phoneInput.value.replace(/\D/g, '');

            if (nameInput.length < 2) return alert("O nome deve ter no mínimo 2 caracteres.");
            if (rawPhone.length < 10) return alert("Telefone inválido.");

            this.state.name = nameInput;
            this.state.phone = phoneInput.value;

            const submitBtn = document.querySelector('.booking__submit-btn');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Carregando...';
            submitBtn.disabled = true;

            try {
                await this.createBooking();
                this.renderSuccessPanel();
            } catch (error) {
                if (error.message === "409") {
                    alert("Este horário acabou de ser reservado.\nEscolha outro horário.");
                    this.goToStep('step-time');
                    this.loadAvailableHours(); // Recarrega para mostrar os corretos
                } else {
                    alert(error.message);
                }
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    },

    renderSuccessPanel() {
        const container = document.querySelector('.booking__content--form');
        container.innerHTML = `
            <div style="text-align: center; animation: fadeIn 0.5s ease;">
                <h2 style="color: var(--color-primary); margin-bottom: 1rem; font-size: 1.5rem;">Agendamento realizado com sucesso!</h2>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">Caso precise cancelar ou remarcar, entre em contato diretamente pelo WhatsApp.</p>
                <a href="${WHATSAPP_LINK}" target="_blank" class="booking__submit-btn" style="display: inline-block; text-decoration: none; width: 100%;">Ir para WhatsApp</a>
            </div>
        `;
    },

    // ==========================================
    // API Requests
    // ==========================================
    async getDays() {
        try {
            const response = await fetch(`${API}/dias`);
            if (!response.ok) throw new Error("Falha na rede");
            return await response.json();
        } catch {
            throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
        }
    },

    async getHours() {
        try {
            const { service, day } = this.state;
            const response = await fetch(`${API}/horarios?servico=${encodeURIComponent(service)}&dia=${encodeURIComponent(day)}`);
            if (!response.ok) throw new Error("Falha na rede");
            return await response.json();
        } catch {
            throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
        }
    },

    async createBooking() {
        try {
            const response = await fetch(`${API}/agendar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: this.state.name,
                    telefone: this.state.phone,
                    servico: this.state.service,
                    dia: this.state.day,
                    hora: this.state.hour
                })
            });

            if (response.status === 409) throw new Error("409");
            if (!response.ok) throw new Error("Falha na rede");
            
            return await response.json();
        } catch (error) {
            if (error.message === "409") throw error;
            throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
        }
    }
};

// Inicializa o agendamento apenas se o painel existir na página
document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector('.booking__panel')) {
        Booking.init();
    }
});