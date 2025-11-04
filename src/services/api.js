// src/services/api.js

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = {
    /**
     * Função principal que realiza todas as requisições.
     */
    request: async (
        endpoint,
        method = "GET",
        body = null,
        requiresAuth = true,
        responseType = "json"
    ) => {
        const headers = {};

        if (requiresAuth) {
            const token = localStorage.getItem("jwt_token");
            if (!token) {
                console.error("Token JWT não encontrado. Redirecionando para login.");
                window.location.href = "/";
                throw new Error("Não autorizado: Token não encontrado.");
            }
            headers["Authorization"] = `Bearer ${token}`;
        }

        const config = { method, headers };

        if (body) {
            if (!(body instanceof FormData)) {
                headers["Content-Type"] = "application/json";
                config.body = JSON.stringify(body);
            } else {
                config.body = body;
            }
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

            if (response.status === 401 && requiresAuth) {
                localStorage.clear();
                alert("Sessão expirada. Faça login novamente.");
                window.location.href = "/";
                return;
            }

            if (response.status === 204) return null;

            if (responseType === "blob") {
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({
                        message: "Erro ao ler a resposta de erro como JSON.",
                    }));
                    throw new Error(
                        errorData.message || `Erro na requisição do arquivo: ${response.status}`
                    );
                }
                return response.blob();
            }

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `Erro na requisição: ${response.status}`);
            }
            return data;
        } catch (error) {
            console.error("Erro na requisição da API:", error);
            throw error;
        }
    },

    getHelpContent: (pageKey) => {
        // A rota de ajuda é pública, então passamos 'false' para 'requiresAuth'
        return api.get(`/help/${pageKey}`, false);
    },

    get: (endpoint, requiresAuth = true, responseType = "json") =>
        api.request(endpoint, "GET", null, requiresAuth, responseType),
    post: (endpoint, body, requiresAuth = true, responseType = "json") =>
        api.request(endpoint, "POST", body, requiresAuth, responseType),
    put: (endpoint, body, requiresAuth = true, responseType = "json") =>
        api.request(endpoint, "PUT", body, requiresAuth, responseType),
    delete: (endpoint, requiresAuth = true, responseType = "json") =>
        api.request(endpoint, "DELETE", null, requiresAuth, responseType),
    patch: (endpoint, body, requiresAuth = true, responseType = "json") =>
        api.request(endpoint, "PATCH", body, requiresAuth, responseType),

    // --- SEÇÃO DE AUTENTICAÇÃO ---
    login: (login, senha) => api.post('/auth/login', { login, senha }, false),
    requestPasswordReset: (email) => api.post('/auth/forgot-password', { email }, false),
    resetPassword: (token, novaSenha) => api.post('/auth/reset-password', { token, novaSenha }, false),
    verifyEmail: (token) => api.get(`/auth/verify-email/${token}`, false),

    // --- Tutores ---
    getTutores: (params) => api.get(`/tutores?${params}`),
    getTutorById: (id) => api.get(`/tutores/${id}`),
    searchTutores: (termo) => api.get(`/tutores/search?termo=${termo}`),
    createTutor: (tutorData) => api.post("/tutores", tutorData),
    updateTutor: (id, tutorData) => api.put(`/tutores/${id}`, tutorData),
    deleteTutor: (id) => api.delete(`/tutores/${id}`),
    getAnimaisByTutor: (idTutor) => api.get(`/tutores/${idTutor}/animais`),

    // --- Animais ---
    getAnimais: (params) => api.get(`/animais?${params}`),
    getAnimalById: (id) => api.get(`/animais/${id}`),
    createAnimal: (animalData) => api.post("/animais", animalData),
    updateAnimal: (id, animalData) => api.put(`/animais/${id}`, animalData),
    deleteAnimal: (id) => api.delete(`/animais/${id}`),
    getConsultasByAnimal: (idAnimal) => api.get(`/animais/${idAnimal}/consultas`),
    getPrescricoesByAnimal: (idAnimal) => api.get(`/animais/${idAnimal}/prescricoes`),
    getExamesByAnimal: (idAnimal) => api.get(`/animais/${idAnimal}/exames`),
    getVacinasByAnimal: (idAnimal) => api.get(`/animais/${idAnimal}/vacinas`),
    getAnamnesesByAnimal: (idAnimal) => api.get(`/animais/${idAnimal}/anamneses`),

    // --- Exames ---
    updateExame: (idExame, data) => api.patch(`/exames/${idExame}`, data),

    // --- Consultas ---
    getConsultas: (params) => api.get(`/consultas?${params}`),
    getConsultaById: (id) => api.get(`/consultas/${id}`),
    createConsulta: (consultaData) => api.post("/consultas", consultaData),
    createConsultaFromAgendamento: (idAgendamento, consultaData) =>
        api.post(`/agendamentos/${idAgendamento}/consulta`, consultaData),

    // --- Veterinários ---
    getVeterinarios: (params) => api.get(`/veterinarios?${params}`),
    createVeterinario: (data) => api.post("/veterinarios", data),
    getVeterinarioById: (id) => api.get(`/veterinarios/${id}`),
    updateVeterinario: (id, data) => api.put(`/veterinarios/${id}`, data),
    deleteVeterinario: (id) => api.delete(`/veterinarios/${id}`),

    // --- Usuários ---
    getUsuarios: (params) => api.get(`/usuarios?${params}`),
    registrarUsuario: (data) => api.post("/usuarios/registrar", data),
    updateUsuario: (id, data) => api.patch(`/usuarios/${id}`, data),
    deleteUsuario: (id) => api.delete(`/usuarios/${id}`),

    // --- Raças e Espécies ---
    getEspecies: () => api.get("/especies"),
    getRacas: () => api.get("/racas"),

    // --- Endereço (ViaCEP) ---
    getEnderecoByCep: (cep) => api.get(`/enderecos/cep/${cep}`),

    // --- Estados e Cidades ---
    getEstados: () => api.get("/estados"),
    getCidadesByEstado: (idEstado) => api.get(`/estados/${idEstado}/cidades`),

    // --- Agendamentos ---
    getAgendamentos: (params) => api.get(`/agendamentos?${params}`),
    getHorariosDisponiveis: (params) => api.get(`/agendamentos/horarios-disponiveis?${params}`),
    createAgendamento: (agendamentoData) => api.post("/agendamentos", agendamentoData),
    confirmarAgendamento: (id) => api.patch(`/agendamentos/${id}/confirmar`),
    cancelarAgendamento: (id) => api.patch(`/agendamentos/${id}/cancelar`),
    marcarFaltaAgendamento: (id) => api.patch(`/agendamentos/${id}/marcar-falta`),

    // --- Dashboard ---
    getDashboardData: (params) => api.get(`/dashboard?${params}`),

    // --- Documentos (PDFs) ---
    gerarPrescricaoPreview: (data) => api.post("/documentos/prescricao/visualizar", data, true, "blob"),
    gerarExamePreview: (data) => api.post("/documentos/exame/visualizar", data, true, "blob"),
    imprimirPrescricao: (id) => api.get(`/prescricoes/${id}/imprimir`, true, "blob"),
    imprimirExame: (id) => api.get(`/exames/${id}/imprimir`, true, "blob"),

    // --- Vacinas ---
    registrarVacina: (idAnimal, vacinaData) => api.post(`/animais/${idAnimal}/vacinas`, vacinaData),
};

export default api;