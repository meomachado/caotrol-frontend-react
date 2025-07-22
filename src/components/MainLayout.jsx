// src/components/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

// Importe o novo arquivo de estilo
import styles from './MainLayout.module.css';

function MainLayout() {
  return (
    // Não precisamos mais do #app-container, o body já serve
    <> 
      <Sidebar /> {/* A sidebar é independente por ser 'fixed' */}
      
      {/* Aplique a classe para o wrapper do conteúdo */}
      <div className={styles.mainContentWrapper}>
        <Header /> {/* O Header agora faz parte deste wrapper */}

        {/* Aplique a classe para a área de conteúdo da página */}
        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default MainLayout;