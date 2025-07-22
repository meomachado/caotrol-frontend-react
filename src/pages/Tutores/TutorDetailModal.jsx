// src/pages/Tutores/TutorDetailModal.jsx
import React from 'react';
import styles from './TutorDetailModal.module.css';

function TutorDetailModal({ isOpen, onClose, tutor }) {
  // Se o modal não estiver aberto ou não houver um tutor, não renderiza nada
  if (!isOpen || !tutor) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Detalhes do Tutor</h2>
        
        <div className={styles.detailGroup}>
          <label>Nome Completo</label>
          <p>{tutor.nome}</p>
        </div>

        <div className={styles.detailGroup}>
          <label>CPF</label>
          <p>{tutor.cpf}</p>
        </div>

        <div className={styles.detailGroup}>
          <label>Telefone</label>
          <p>{tutor.telefone}</p>
        </div>

        {/* Adicione outros campos que queira exibir aqui */}
        {/* Exemplo:
        <div className={styles.detailGroup}>
          <label>Endereço</label>
          <p>{`${tutor.rua || ''}, ${tutor.num || ''} - ${tutor.bairro || ''}`}</p>
        </div> 
        */}

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