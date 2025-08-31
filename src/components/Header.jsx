// Header.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

function Header() {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Busca tanto o nome quanto o tipo do usuário no localStorage
    const storedName = localStorage.getItem('user_name');
    const userType = localStorage.getItem('user_type'); // 'veterinario' ou 'padrao'

    if (storedName) {
      // Se o usuário for um veterinário, adiciona o "Dr."
      if (userType === 'veterinario') {
        setUserName(`Dr. ${storedName}`);
      } else {
        // Se for padrão, mostra o login diretamente
        setUserName(storedName);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/'; 
  };

  return (
    <header className={styles.headerContainer}>
      <div className={styles.userInfo}>
        <span>{userName}</span>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Sair
        </button>
      </div>
    </header>
  );
}

export default Header;