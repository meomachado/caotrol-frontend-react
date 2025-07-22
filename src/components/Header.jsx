// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Importa a biblioteca
import styles from './Header.module.css'; // Nosso novo arquivo de estilos

function Header() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Dr. Usuário'); // Valor padrão

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Assumindo que o nome do usuário está no campo 'nome' do payload do token
        setUserName(decodedToken.nome || 'Dr. Usuário'); 
      } catch (error) {
        console.error("Erro ao decodificar o token:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    navigate('/login');
  };

  return (
    <div className={styles.headerContainer}>
      <div className={styles.userInfo}>
        <span>{userName}</span>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Sair
        </button>
      </div>
    </div>
  );
}

export default Header;