// src/pages/Animais/AnimalDetailModal.jsx
import React from 'react';
import styles from './AnimalDetailModal.module.css';

function AnimalDetailModal({ isOpen, onClose, animal }) {
  if (!isOpen || !animal) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
  };

  const calculateAge = (dateString) => {
    if (!dateString) return 'Não informada';
    const ageInMilliseconds = new Date() - new Date(dateString);
    const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
    const years = Math.floor(ageInYears);
    const months = Math.floor((ageInYears - years) * 12);
    
    if (years > 0) {
      return `${years} ano(s)${months > 0 ? ` e ${months} mes(es)` : ''}`;
    } else {
      return `${months} mes(es)`;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.modalHeader}>
          <h2>Detalhes do Animal</h2>
        </div>

        <div className={styles.modalBody}>
          <h3 className={styles.sectionTitle}>Identificação</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailGroup}>
              <label>Nome do Animal</label>
              <p>{animal.nome || 'Não informado'}</p>
            </div>
            <div className={styles.detailGroup}>
              <label>Tutor</label>
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
          </div>

          <h3 className={styles.sectionTitle} style={{ marginTop: '30px' }}>Características</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailGroup}>
              <label>Sexo</label>
              <p>{animal.sexo === 'M' ? 'Macho' : 'Fêmea'}</p>
            </div>
            <div className={styles.detailGroup}>
              {/* ✅ CORREÇÃO APLICADA AQUI */}
              <label>Idade</label>
              <p>{calculateAge(animal.data_nasc)}</p>
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
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.closeButton}>
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}

export default AnimalDetailModal;
