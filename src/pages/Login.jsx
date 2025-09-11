// src/pages/Login.jsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";import api from "../services/api";
import logoImage from "../assets/logo_login.png";
import { jwtDecode } from "jwt-decode"; // Importe o decodificador

function Login() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

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
  return (
    <div className="loginPageContainer">
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <img src={logoImage} alt="Lauro Vet Logo" />
          <p>Faça login para acessar o sistema.</p>
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
           {/* ADICIONE ESTA PARTE */}
           <div className="forgot-password-link">
          <Link to="/recuperar-senha">Esqueceu a senha?</Link>
        </div>
          {/* FIM DA PARTE ADICIONADA */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;