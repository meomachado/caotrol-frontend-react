// src/pages/Consultas/ConsultaDetailModal.jsx

import React from 'react';
import styles from './ConsultaDetailModal.module.css';

function ConsultaDetailModal({ isOpen, onClose, consulta }) {
  if (!isOpen || !consulta) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Detalhes da Consulta</h2>
        </div>
        <div className={styles.modalBody}>
          {/* Seção de Informações Gerais */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Informações Gerais</h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <label>Data / Hora</label>
                <p>{formatDate(consulta.data)}</p>
              </div>
              <div className={styles.detailItem}>
                <label>Veterinário</label>
                <p>{consulta.veterinario?.nome || 'N/A'}</p>
              </div>
              <div className={styles.detailItem}>
                <label>Animal</label>
                <p>{consulta.animal?.nome || 'N/A'}</p>
              </div>
              <div className={styles.detailItem}>
                <label>Tutor</label>
                <p>{consulta.animal?.tutor?.nome || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Seção de Anamnese */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Anamnese</h3>
            <div className={styles.detailGrid}>
              <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                <label>Queixa Principal</label>
                <p>{consulta.queixa || 'Nenhuma queixa registrada.'}</p>
              </div>
              <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                <label>Diagnóstico</label>
                <p>{consulta.diagnostico || 'Nenhum diagnóstico registrado.'}</p>
              </div>
              <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                <label>Tratamento</label>
                <p>{consulta.tratamento || 'Nenhum tratamento registrado.'}</p>
              </div>
            </div>
          </div>

          {/* Seção de Prescrição (se houver) */}
          {consulta.prescricao && consulta.prescricao.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Prescrição</h3>
              <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                <p>{consulta.prescricao[0].descricao}</p>
              </div>
            </div>
          )}
        </div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.closeButton}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

export default ConsultaDetailModal;