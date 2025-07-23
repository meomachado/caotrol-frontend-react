// src/pages/Tutores/TutorDetailModal.jsx
import React from 'react';
import styles from './TutorDetailModal.module.css';

function TutorDetailModal({ isOpen, onClose, tutor }) {
  if (!isOpen || !tutor) {
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
        <h2>Detalhes do Tutor</h2>
        
        <div className={styles.detailGroup}>
          <label>Nome Completo</label>
          <p>{tutor.nome || 'Não informado'}</p>
        </div>

        <div className={styles.detailGroup}>
          <label>CPF</label>
          <p>{tutor.cpf || 'Não informado'}</p>
        </div>

        <div className={styles.detailGroup}>
          <label>Telefone</label>
          <p>{tutor.telefone || 'Não informado'}</p>
        </div>

        <div className={styles.detailGroup}>
          <label>Data de Nascimento</label>
          <p>{formatDate(tutor.data_nasc)}</p>
        </div>

        <div className={styles.detailGroup}>
          <label>Endereço</label>
          <p>{`${tutor.rua || 'Rua não informada'}, ${tutor.num || 'S/N'} - ${tutor.bairro || 'Bairro não informado'}`}</p>
        </div>

        <div className={styles.detailGroup}>
          <label>CEP</label>
          <p>{tutor.cep || 'Não informado'}</p>
        </div>
        
        <div className={styles.detailGroup}>
          <label>Cidade </label>
          <p>{tutor.cidade || 'Não informado'}</p>
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

export default TutorDetailModal;