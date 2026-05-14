/**
 * Abraxas AI - Main Logic
 * Includes: ROI Calculator, Chat Widget, AI Ideation Assistant
 */

// --- ROI Calculator ---
const roiCalculator = {
    mandyAnnualCost: 12000,

    elements: {
        employees: document.getElementById('employees'),
        hourlyRate: document.getElementById('hourlyRate'),
        manualHours: document.getElementById('manualHours'),
        efficiencyGain: document.getElementById('efficiencyGain'),

        annualSavings: document.getElementById('annualSavings'),
        roiPercentage: document.getElementById('roiPercentage')
    },

    init() {
        if (!this.elements.employees) return; // Guard clause

        // Add event listeners to all inputs
        ['employees', 'hourlyRate', 'manualHours', 'efficiencyGain'].forEach(id => {
            this.elements[id].addEventListener('input', () => this.calculateROI());
        });

        // Initial calculation
        this.calculateROI();
    },

    calculateROI() {
        const employees = parseInt(this.elements.employees.value) || 0;
        const hourlyRate = parseFloat(this.elements.hourlyRate.value) || 0;
        const manualHours = parseInt(this.elements.manualHours.value) || 0;
        const efficiencyGain = parseFloat(this.elements.efficiencyGain.value) || 0;

        // Weekly cost of manual work that can be saved
        const weeklyManualCost = employees * hourlyRate * manualHours;
        const weeklySavings = weeklyManualCost * (efficiencyGain / 100);

        const annualSavings = weeklySavings * 52;
        const netSavings = annualSavings - this.mandyAnnualCost;
        const roiPercentage = this.mandyAnnualCost > 0 ? (netSavings / this.mandyAnnualCost) * 100 : 0;

        this.updateDisplay({
            annualSavings: Math.round(annualSavings),
            roiPercentage: Math.round(roiPercentage)
        });
    },

    updateDisplay(data) {
        this.elements.annualSavings.textContent = `$${data.annualSavings.toLocaleString()}`;
        this.elements.roiPercentage.textContent = `${data.roiPercentage}%`;

        // Color coding for ROI
        if (data.roiPercentage > 0) {
            this.elements.roiPercentage.style.color = 'var(--accent-cyan)';
        } else {
            this.elements.roiPercentage.style.color = 'var(--text-muted)';
        }
    }
};

// --- Chat Widget ---
const chatWidget = {
    keywords: {
        'n8n': '🚀 Ofrecemos servicios completos de automatización con n8n: integración de sistemas, workflows personalizados y más.',
        'ia': '🤖 Nuestros agentes de IA pueden actuar como asistentes virtuales, analizar documentos y atender clientes 24/7.',
        'precio': '💰 Nuestros proyectos suelen tener un ROI del 300% en el primer año. Usa la calculadora para estimar tu caso.',
        'contacto': '📞 Puedes llenar el formulario en esta página o agendar una demo directa.',
        'default': '👋 Gracias por tu mensaje. Un especialista de Abraxas revisará tu consulta. ¿Te gustaría saber más sobre n8n o nuestros Agentes IA?'
    },

    send(message) {
        if (!message.trim()) return;

        this.addMessage(message, 'user');
        document.getElementById('chatInput').value = '';

        // Simulate typing
        setTimeout(() => {
            const response = this.getResponse(message);
            this.addMessage(response, 'bot');
        }, 1000);
    },

    getResponse(message) {
        const lowerMsg = message.toLowerCase();
        for (const [key, value] of Object.entries(this.keywords)) {
            if (lowerMsg.includes(key)) return value;
        }
        return this.keywords.default;
    },

    addMessage(text, sender) {
        const chatBody = document.getElementById('chatBody');
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.textContent = text;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
};

// Global function for onclick
window.sendChatMessage = () => chatWidget.send(document.getElementById('chatInput').value);


// --- AI Ideation Assistant ---
const aiAssistant = {
    currentStep: 0,
    responses: {},
    isActive: false,

    questions: [
        {
            id: 'processes',
            text: '¿Qué procesos manuales realizas actualmente que te gustaría automatizar?',
            options: [
                'Gestión de leads y ventas',
                'Reportes y análisis de datos',
                'Comunicación con clientes',
                'Gestión de inventarios',
                'Procesos contables',
                'Otro'
            ]
        },
        {
            id: 'tools',
            text: '¿Con qué herramientas trabajas actualmente?',
            options: [
                'CRM (Salesforce, HubSpot, Pipedrive)',
                'ERP (SAP, Oracle, QuickBooks)',
                'Email Marketing (Mailchimp, SendGrid)',
                'Base de datos (Excel, MySQL, MongoDB)',
                'Otros sistemas'
            ]
        },
        {
            id: 'objectives',
            text: '¿Cuál es tu principal objetivo?',
            options: [
                'Reducir tiempo en tareas repetitivas',
                'Mejorar la precisión de procesos',
                'Escalar operaciones sin contratar personal',
                'Integrar sistemas desconectados',
                'Mejorar la experiencia del cliente'
            ]
        },
        {
            id: 'volume',
            text: '¿Qué volumen manejas aproximadamente?',
            options: [
                '1-10 transacciones/procesos por día',
                '11-50 transacciones/procesos por día',
                '51-200 transacciones/procesos por día',
                '200+ transacciones/procesos por día'
            ]
        },
        {
            id: 'timeline',
            text: '¿Tienes algún deadline específico?',
            options: [
                'Urgente (1-2 semanas)',
                'Corto plazo (1-2 meses)',
                'Medio plazo (3-6 meses)',
                'Flexible'
            ]
        }
    ],

    startAssistance() {
        this.isActive = true;
        this.currentStep = 0;
        this.responses = {}; // Reset responses
        this.showQuestion(0);

        const modal = document.getElementById('aiAssistantModal');
        modal.classList.add('active');
    },

    showQuestion(step) {
        const question = this.questions[step];
        const modal = document.getElementById('aiAssistantModal');
        const content = modal.querySelector('.ai-question-content');

        content.innerHTML = `
            <div class="question-header">
                <h3>${question.text}</h3>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${((step + 1) / this.questions.length) * 100}%"></div>
                </div>
                <p class="step-counter">Pregunta ${step + 1} de ${this.questions.length}</p>
            </div>
            <div class="question-options">
                ${question.options.map((option, index) => `
                    <div class="option-card" onclick="aiAssistant.selectOption('${question.id}', '${option}', ${index})">
                        <span>${option}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    selectOption(questionId, option, index) {
        this.responses[questionId] = option;

        // Visual feedback
        const options = document.querySelectorAll('.option-card');
        options.forEach(opt => opt.classList.remove('selected'));
        options[index].classList.add('selected');

        // Delay for better UX
        setTimeout(() => {
            if (this.currentStep < this.questions.length - 1) {
                this.currentStep++;
                this.showQuestion(this.currentStep);
            } else {
                this.generateDescription();
            }
        }, 400);
    },

    generateDescription() {
        const description = `**PROYECTO DE AUTOMATIZACIÓN (Generado por IA)**

**Procesos Principales:**
• ${this.responses.processes || 'No especificado'}

**Herramientas Actuales:**
• ${this.responses.tools || 'No especificado'}

**Objetivo Principal:**
• ${this.responses.objectives || 'No especificado'}

**Volumen:**
• ${this.responses.volume || 'No especificado'}

**Timeline:**
• ${this.responses.timeline || 'No especificado'}

---
¿Este resumen refleja correctamente tu proyecto?`;

        // Fill form
        const descriptionField = document.getElementById('description');
        if (descriptionField) {
            descriptionField.value = description;
            // Scroll to form to show user
            descriptionField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        this.closeModal();
    },

    closeModal() {
        this.isActive = false;
        const modal = document.getElementById('aiAssistantModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    roiCalculator.init();

    // Bind AI Assistant Button
    const aiBtns = document.querySelectorAll('.ai-btn');
    aiBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default if it's a link or form submit
            aiAssistant.startAssistance();
        });
    });
});
