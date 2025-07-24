// src/pages/Animais/AnimalDetailModal.jsx
import React from 'react';
import styles from './AnimalDetailModal.module.css'; // Vamos criar este CSS a seguir

function AnimalDetailModal({ isOpen, onClose, animal }) {
  if (!isOpen || !animal) {
    return null;
  }

  // Função para formatar a data para o padrão brasileiro (DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Detalhes do Animal</h2>
        
        <div className={styles.detailGroup}>
          <label>Nome do Animal</label>
          <p>{animal.nome || 'Não informado'}</p>
        </div>

        <div className={styles.detailGroup}>
          <label>Tutor</label>
          {/* Usamos '?' para acessar com segurança, caso tutor seja nulo */}
          <p>{animal.tutor?.nome || 'Não informado'}</p>
        </div>

        <div className={styles.detailGroup}>
          <label>Espécie</label>
          <p>{animal.raca?.especie?.nome || 'Não informado'}</p>
        </div>

        <div className={styles.detailGroup}>
          <label>Raça</label>
          <p>{animal.raca?.nome || 'Não informado'}</p>
        </div>

        <div className={styles.detailGroup}>
          <label>Sexo</label>
          <p>{animal.sexo === 'M' ? 'Macho' : 'Fêmea'}</p>
        </div>

        <div className={styles.detailGroup}>
          <label>Data de Nascimento</label>
          <p>{formatDate(animal.data_nasc)}</p>
        </div>

        <div className={styles.detailGroup}>
          <label>Porte</label>
          <p>{animal.porte || 'Não informado'}</p>
        </div>

        <div className={styles.detailGroup}>
          <label>Temperamento</label>
          <p>{animal.temperamento || 'Não informado'}</p>
        </div>

        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.closeButton}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AnimalDetailModal;