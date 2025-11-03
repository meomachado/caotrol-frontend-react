// src/pages/Login.jsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";import api from "../services/api";
import logoImage from "../assets/logo_login.png";
import { jwtDecode } from "jwt-decode"; // Importe o decodificador
import { FaQuestionCircle } from "react-icons/fa"; // <-- IMPORTAR ÍCONE
import HelpModal from "./Help/HelpModal";


function Login() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [helpContent, setHelpContent] = useState(null);
  const [helpLoading, setHelpLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      const data = await api.login(login, senha);

      if (data && data.token) {
        // Usa a biblioteca jwt-decode para decodificar o token
        const payload = jwtDecode(data.token);

        localStorage.setItem("jwt_token", data.token);
        localStorage.setItem("user_id", payload.id);
        localStorage.setItem("user_type", payload.tipo);

        // --- MUDANÇA PRINCIPAL AQUI ---
        // Agora, simplesmente pegamos o campo 'nome_exibicao'
        localStorage.setItem("user_name", payload.nome_exibicao);
        
        if (payload.id_veterinario) {
          localStorage.setItem("vet_id", payload.id_veterinario);
        }

        navigate("/dashboard");
      } else {
        setErrorMessage("Resposta de token inválida do servidor.");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setErrorMessage(
        error.message ||
          "Não foi possível conectar ao servidor. Tente novamente."
      );
    }
  };
  
  // ... resto do seu componente JSX ...

  const handleOpenHelp = async () => {
    setHelpLoading(true);
    setErrorMessage(""); // Limpa erros de login
    try {
      // Usando a "pageKey" 'login' que corresponde a 'login.json'
      const data = await api.getHelpContent('login'); 
      setHelpContent(data);
      setIsHelpModalOpen(true);
    } catch (err) {
      setErrorMessage(err.message || "Não foi possível carregar o tópico de ajuda.");
    } finally {
      setHelpLoading(false);
    }
  };


  return (
    <> {/* Adicionado Fragment para o modal */}
      {/* O Modal de Ajuda fica aqui */}
      <HelpModal 
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        content={helpContent}
      />

      <div className="loginPageContainer">
        <div className="login-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <img src={logoImage} alt="Lauro Vet Logo" />
            <p>Faça login para acessar o sistema.</p>
            {/* ... (seus inputs de login e senha) ... */}
            <div className="input-group">
              <label htmlFor="login">Login:</label>
              <input
                type="text"
                id="login"
                name="login"
                required
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="senha">Senha:</label>
              <input
                type="password"
                id="senha"
                name="senha"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            <button type="submit" className="login-button">
              Entrar
            </button>
            <div className="forgot-password-link">
              <Link to="/recuperar-senha">Esqueceu a senha?</Link>
            </div>
            
            {/* --- BOTÃO DE AJUDA ADICIONADO --- */}
            <div className="help-link-container">
              <button 
                type="button" 
                onClick={handleOpenHelp} 
                className="help-button"
                disabled={helpLoading}
              >
                <FaQuestionCircle /> {helpLoading ? "Carregando..." : "Ajuda"}
              </button>
            </div>
            {/* ---------------------------------- */}
            
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;