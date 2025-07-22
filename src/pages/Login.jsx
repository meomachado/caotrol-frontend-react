// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Garanta que esta linha está presente
import api from '../services/api'; 
import logoImage from "../assets/logo_login.png"; // Importe a imagem do logo

function Login() {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // <--- ESTA LINHA É CRÍTICA! GARANTA QUE ELA ESTÁ AQUI

  const handleSubmit = async (event) => {
    event.preventDefault();
    
   

    console.log("SUBMIT ACIONADO! Tentando fazer login..."); // <-- ADICIONE ESTA LINHA


    try {
      const data = await api.login(login, senha);

      if (data && data.token) {
        // Decodificar o token e armazenar no localStorage (código já existente)
        const base64Url = data.token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));

        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('user_id', payload.id);
        localStorage.setItem('user_type', payload.tipo);
        localStorage.setItem('user_name', payload.nome_veterinario || payload.login);

     //   alert('Login bem-sucedido!');
        navigate('/dashboard'); // Esta linha agora deverá funcionar
      } else {
        setErrorMessage('Resposta de token inválida do servidor.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setErrorMessage(error.message || 'Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    }
  };

  return (
    
        // 👇 Adicione este container em volta do seu formulário
        <div className="loginPageContainer"> 
        
          <div className="login-container"> {/* Seu formulário de login existente */}
          <form className="login-form" onSubmit={handleSubmit}>
        {/* <h2>Bem-vindo à PetCare</h2> */}
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
        <button type="submit" className="login-button">Entrar</button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        </form>
      </div>
      
    </div>
  );
}

export default Login;