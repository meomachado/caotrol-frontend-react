// src/pages/Dashboard.jsx
import React from 'react';
import styles from './Dashboard.module.css'; // Nosso novo arquivo de estilos

function Dashboard() {
  // Função para pegar a data atual formatada
  const getCurrentDate = () => {
    const today = new Date();
    // Use Intl.DateTimeFormat para uma formatação de data mais robusta e localizada
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(today);
  };

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.pageHeader}>
        <i className="fas fa-calendar-alt"></i>
        <span>{getCurrentDate()}</span>
      </div>

      <h2 className={styles.sectionTitle}>Resumo Diário</h2>
      {/* Aqui virão os cards de resumo */}

      <h2 className={styles.sectionTitle}>Próximas Consultas do Dia</h2>
      {/* Aqui virá a tabela de consultas */}
    </div>
  );
}

export default Dashboard;