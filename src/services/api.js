// src/services/api.js

const API_BASE_URL = 'http://localhost:3000/api'; // URL base do seu backend

const api = {
    // Função genérica para fazer requisições à API
    request: async (endpoint, method = 'GET', body = null, requiresAuth = true) => {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (requiresAuth) {
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                console.error('Token JWT não encontrado. Redirecionando para login.');
                window.location.href = '/'; 
                throw new Error('Não autorizado: Token não encontrado. Por favor, faça login.');
            }
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers: headers
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

            if (response.status === 401 && requiresAuth) {
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('user_id');
                localStorage.removeItem('user_type');
                localStorage.removeItem('user_name');
                console.error('Token JWT inválido ou expirado. Deslogando...');
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '/'; 
                return;
            }

            if (response.status === 204) { 
                return null;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.erro || `Erro na requisição: ${response.status} ${response.statusText}`);
            }

            return data;

        } catch (error) {
            console.error('Erro na requisição da API:', error);
            throw error; 
        }
    },

    // Métodos genéricos (wrapper para api.request)
    get: (endpoint, requiresAuth = true) => api.request(endpoint, 'GET', null, requiresAuth),
    post: (endpoint, body, requiresAuth = true) => api.request(endpoint, 'POST', body, requiresAuth),
    put: (endpoint, body, requiresAuth = true) => api.request(endpoint, 'PUT', body, requiresAuth),
    delete: (endpoint, requiresAuth = true) => api.request(endpoint, 'DELETE', null, requiresAuth),
    patch: (endpoint, body, requiresAuth = true) => api.request(endpoint, 'PATCH', body, requiresAuth),

    // --- Endpoints Específicos do Projeto ---
    login: (login, senha) => api.request('/auth/login', 'POST', { login, senha }, false),
    
    // Para o Header (obter dados do veterinário logado)
    getVeterinarioById: (id) => api.request(`/veterinarios/${id}`, 'GET'), 

    // Para o Dashboard - Resumo Diário (Backend precisa criar este endpoint)
    getDashboardSummary: async (date) => {
        // Exemplo de como a API real seria. Por enquanto, dados mockados.
        // const data = await api.get(`/dashboard/summary?date=${date}`);
        // return data;
        return new Promise(resolve => setTimeout(() => resolve({
            totalAgendados: 5,
            totalConfirmados: 3,
            totalAtendidos: 1,
            totalFaltaram: 0,
        }), 500));
    },

    // Para o Dashboard - Próximas Consultas (Backend precisa criar este endpoint)
    getDailyAppointments: async (date, idVeterinario = null, showAll = true) => {
        let url = `/agendamentos/do-dia?dia=${date}`;
        if (!showAll && idVeterinario) {
            url += `&id_veterinario=${idVeterinario}`;
        }
        // Exemplo de como a API real seria. Por enquanto, dados mockados.
        // const data = await api.get(url);
        // return data;
        return new Promise(resolve => setTimeout(() => resolve([
            { horario: "09:00", animal: "Thor", tutor: "João da Silva", veterinario: "José Lauro Gomes", status: "confirmado" },
            { horario: "10:00", animal: "Nina", tutor: "Maria Clara Souza", veterinario: "José Lauro Gomes", status: "agendada" },
            { horario: "14:30", animal: "Melissa", tutor: "Marilene Burack", veterinario: "José Lauro Gomes", status: "pendente" }
        ]), 700));
    },
};

export default api;