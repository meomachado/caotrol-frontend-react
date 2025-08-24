import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css'; // Crie um CSS para o seu header se necessário

function Header() {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  // Este efeito busca o nome do usuário no localStorage quando o componente carrega
  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    if (storedName) {
      // Adiciona o "Dr." antes do nome para exibição
      setUserName(` ${storedName}`);
    }
  }, []); // O array vazio [] faz com que este código rode apenas uma vez

  const handleLogout = () => {
    // Limpa o localStorage e redireciona para a página de login
    localStorage.clear();
    window.location.href = '/'; 
  };

  return (
    <header className={styles.headerContainer}>
      {/* Aqui pode ir o seu logo ou outros links */}
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