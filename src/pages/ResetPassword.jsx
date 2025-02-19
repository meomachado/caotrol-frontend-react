import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; // Você precisará criar a função na api
import './ForgotPassword.css'; // Reutilizaremos o mesmo CSS

function ResetPassword() {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams(); // Pega o token da URL
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem!');
      return;
    }

    try {
      // Esta é a chamada para a sua API no backend
      await api.resetPassword(token, senha);
      setMessage('Sua senha foi redefinida com sucesso!');
      setMessage('Você sera redirecionado para a página de login.');
      setTimeout(() => navigate('/login'), 3000); // Redireciona para o login após 3s
    } catch (err) {
      setError(err.message || 'Token inválido ou expirado. Tente novamente.');
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <h2>Redefinir Senha</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="senha">Nova Senha:</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirmarSenha">Confirmar Nova Senha:</label>
            <input
              type="password"
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Redefinir</button>
        </form>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default ResetPassword;