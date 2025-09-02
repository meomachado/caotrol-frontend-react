// src/services/api.js

const API_BASE_URL = 'http://localhost:3000/api';

const api = {
  // ✅ 1. FUNÇÃO DE REQUISIÇÃO MELHORADA: Agora aceita um 'responseType'
  request: async (endpoint, method = 'GET', body = null, requiresAuth = true, responseType = 'json') => {
    const headers = {}; // Content-Type será definido dinamicamente

    if (requiresAuth) {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        console.error('Token JWT não encontrado. Redirecionando para login.');
        window.location.href = '/';
        throw new Error('Não autorizado: Token não encontrado.');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
    };

    if (body) {
      // Apenas define Content-Type se o corpo não for um FormData (upload de arquivo)
      if (!(body instanceof FormData)) {
          headers['Content-Type'] = 'application/json';
          config.body = JSON.stringify(body);
      } else {
          config.body = body; // Para uploads, o browser define o Content-Type
      }
    }

    try {
      console.log("a")
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (response.status === 401 && requiresAuth) {
        // ... (seu código de logout)
        localStorage.clear();
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = '/';
        return;
      }

      if (response.status === 204) {
        return null;
      }

      // ✅ 2. LÓGICA PRINCIPAL DA CORREÇÃO
      // Se a resposta esperada for um arquivo (blob), retorna o blob
      if (responseType === 'blob') {
          if (!response.ok) {
              // Tenta ler o erro como JSON mesmo em caso de falha de blob
              const errorData = await response.json();
              throw new Error(errorData.message || `Erro na requisição do arquivo: ${response.status}`);
          }
          return response.blob(); // Retorna o arquivo diretamente
      }

      // Se não for blob, continua tratando como JSON
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erro na requisição: ${response.status}`);
      }
      
      return data;

    } catch (error) {
      console.error('Erro na requisição da API:', error);
      throw error;
    }
  },

  // Métodos wrapper (sem alterações visíveis, mas agora usam a função melhorada)
  get: (endpoint, requiresAuth = true) => api.request(endpoint, 'GET', null, requiresAuth),
  post: (endpoint, body, requiresAuth = true) => api.request(endpoint, 'POST', body, requiresAuth),
  put: (endpoint, body, requiresAuth = true) => api.request(endpoint, 'PUT', body, requiresAuth),
  delete: (endpoint, requiresAuth = true) => api.request(endpoint, 'DELETE', null, requiresAuth),
  patch: (endpoint, body, requiresAuth = true) => api.request(endpoint, 'PATCH', body, requiresAuth),

  // ✅ 3. NOVO MÉTODO ESPECIALIZADO PARA PDFs/BLOBS
  // Usaremos este método no NovaConsultaModal
  postAndGetBlob: (endpoint, body, requiresAuth = true) => {
    return api.request(endpoint, 'POST', body, requiresAuth, 'blob'); // Passa 'blob' como responseType
  },

  // --- Seus Endpoints Específicos ---
  login: (login, senha) => api.request('/auth/login', 'POST', { login, senha }, false),
  getVeterinarioById: (id) => api.get(`/veterinarios/${id}`),
  // ... (seus outros endpoints específicos)
};

export default api;