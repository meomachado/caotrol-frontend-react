import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ForgotPassword.css';

function VerifyEmail() {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Verificando seu e-mail...');
  const { token } = useParams();
  const navigate = useNavigate();

  // Usamos useRef para garantir que a verificação seja chamada apenas uma vez
  const hasAttemptedVerification = useRef(false);

  useEffect(() => {
    // Se já tentamos verificar ou não há token, não fazemos nada
    if (hasAttemptedVerification.current || !token) {
      return;
    }
    hasAttemptedVerification.current = true;

    const verify = async () => {
      try {
        await api.verifyEmail(token);
        // Caminho feliz: a primeira requisição foi bem-sucedida
        setStatus('success');
        setMessage('E-mail verificado com sucesso! Você será redirecionado para a página de login em 5 segundos.');
        setTimeout(() => {
          navigate('/login');
        }, 5000);

      } catch (err) {
        // --- INÍCIO DA LÓGICA DE CORREÇÃO ---
        // Verificamos se o erro é o esperado de "token já usado"
        if (err.message && err.message.includes('inválido ou expirado')) {
          // Se for, assumimos que a primeira requisição (oculta) funcionou.
          // Mostramos sucesso para o usuário!
          setStatus('success');
          setMessage('Seu e-mail já foi verificado! Redirecionando para o login...');
          setTimeout(() => {
            navigate('/login');
          }, 5000);
        } else {
          // Se for qualquer outro erro, mostramos o erro real.
          setStatus('error');
          setMessage(err.message || 'Ocorreu um erro desconhecido.');
        }
        // --- FIM DA LÓGICA DE CORREÇÃO ---
      }
    };

    verify();
  }, [token, navigate]);

  const getStatusIcon = () => {
    if (status === 'verifying') {
      return <i className="fas fa-spinner fa-spin" style={{ fontSize: '2em' }}></i>;
    }
    if (status === 'success') {
      return <i className="fas fa-check-circle" style={{ fontSize: '2em', color: '#28a745' }}></i>;
    }
    return <i className="fas fa-times-circle" style={{ fontSize: '2em', color: '#e74c3c' }}></i>;
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <h2>Confirmação de Cadastro</h2>
        <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          {getStatusIcon()}
          <p className={status === 'success' ? 'success-message' : 'error-message'}>
            {message}
          </p>
        </div>
        {status !== 'verifying' && (
          <button onClick={() => navigate('/login')} className="back-to-login">
            Ir para o Login
          </button>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;