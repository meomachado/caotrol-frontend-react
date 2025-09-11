import React, { useState } from 'react';
import api from '../services/api'; // Você precisará criar a função na api
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css'; // Criaremos este arquivo de estilo

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      // Esta é a chamada para a sua API no backend
      await api.requestPasswordReset(email);
      setMessage('Se existir uma conta com este e-mail, um link para redefinição de senha foi enviado.');
    } catch (err) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <h2>Recuperar Senha</h2>
        <p>Digite seu e-mail para receber um link de redefinição.</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Enviar Link</button>
        </form>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <button onClick={() => navigate('/login')} className="back-to-login">Voltar para o Login</button>
      </div>
    </div>
  );
}

export default ForgotPassword;